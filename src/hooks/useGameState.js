import { useState, useCallback } from "react";
import {
  dealNewGame,
  cloneState,
  getCardsFromSource,
  removeFromSource,
  canMoveToTableau,
  canMoveToFoundation,
} from "../utils/gameLogic";

export const useGameState = () => {
  const [gameState, setGameState] = useState(null);
  const [history, setHistory] = useState([]);
  const [lastFlippedCard, setLastFlippedCard] = useState(null);
  const [lastMovedCards, setLastMovedCards] = useState([]);
  const [lastMoveType, setLastMoveType] = useState(null);

  // Save current state to history (for undo)
  const saveHistory = useCallback((currentState) => {
    setHistory((prev) => [...prev, cloneState(currentState)]);
  }, []);

  // Auto flip and track flipped card
  const autoFlipWithTracking = useCallback((state) => {
    let flippedCardId = null;

    const newTableau = state.tableau.map((pile) => {
      if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
        const newPile = [...pile];
        const flippedCard = {
          ...newPile[newPile.length - 1],
          faceUp: true,
        };
        flippedCardId = flippedCard.id;
        newPile[newPile.length - 1] = flippedCard;
        return newPile;
      }
      return pile;
    });

    setLastFlippedCard(flippedCardId);
    return { ...state, tableau: newTableau };
  }, []);

  // Start a new game
  const startNewGame = useCallback(() => {
    const newState = dealNewGame();
    setGameState(newState);
    setHistory([]);
    setLastFlippedCard(null);
    setLastMovedCards([]);
    setLastMoveType(null);

    // Collect all card IDs for deal animation (in order)
    const dealCardIds = [];

    // Add tableau cards in deal order (column by column, row by row)
    for (let col = 0; col < 7; col++) {
      newState.tableau[col].forEach((card) => {
        dealCardIds.push(card.id);
      });
    }

    return dealCardIds;
  }, []);

  // Undo last move
  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setGameState(previousState);
      setHistory((prev) => prev.slice(0, -1));
      setLastFlippedCard(null);
      setLastMovedCards([]);
      setLastMoveType(null);
      return true;
    }
    return false;
  }, [history]);

  // Draw card from stock
  const handleStockClick = useCallback(() => {
    if (!gameState) return null;

    if (gameState.stock.length > 0) {
      saveHistory(gameState);
      const newStock = [...gameState.stock];
      const card = { ...newStock.pop(), faceUp: true };

      setGameState((prev) => ({
        ...prev,
        stock: newStock,
        waste: [...prev.waste, card],
      }));

      setLastMovedCards([card.id]);
      setLastMoveType("draw");
      setLastFlippedCard(null);
      return card.id;
    } else if (gameState.waste.length > 0) {
      saveHistory(gameState);
      const newStock = [...gameState.waste]
        .reverse()
        .map((c) => ({ ...c, faceUp: false }));

      setGameState((prev) => ({
        ...prev,
        stock: newStock,
        waste: [],
      }));

      setLastMovedCards([]);
      setLastMoveType("redeal");
      setLastFlippedCard(null);
      return null;
    }
    return null;
  }, [gameState, saveHistory]);

  // Redeal waste to stock
  const handleRedeal = useCallback(() => {
    if (!gameState || gameState.waste.length === 0) return;

    saveHistory(gameState);
    const newStock = [...gameState.waste]
      .reverse()
      .map((c) => ({ ...c, faceUp: false }));

    setGameState((prev) => ({
      ...prev,
      stock: newStock,
      waste: [],
    }));

    setLastMovedCards([]);
    setLastMoveType("redeal");
    setLastFlippedCard(null);
  }, [gameState, saveHistory]);

  // Try to make a move
  const tryMove = useCallback(
    (sourceInfo, destType, destIndex) => {
      if (!gameState || !sourceInfo) return false;

      const { source, cardIndex } = sourceInfo;
      const cards = getCardsFromSource(source, cardIndex, gameState);

      if (cards.length === 0) return false;

      let canMove = false;

      if (destType === "tableau") {
        canMove = canMoveToTableau(cards, gameState.tableau[destIndex]);
      } else if (destType === "foundation") {
        canMove =
          cards.length === 1 &&
          canMoveToFoundation(cards[0], gameState.foundations[destIndex]);
      }

      if (canMove) {
        saveHistory(gameState);
        let newState = removeFromSource(source, cardIndex, gameState);

        if (destType === "tableau") {
          newState.tableau[destIndex] = [
            ...newState.tableau[destIndex],
            ...cards,
          ];
        } else if (destType === "foundation") {
          newState.foundations[destIndex] = [
            ...newState.foundations[destIndex],
            ...cards,
          ];
        }

        newState = autoFlipWithTracking(newState);
        setGameState(newState);

        // Track moved cards and move type
        const movedCardIds = cards.map((c) => c.id);
        setLastMovedCards(movedCardIds);
        setLastMoveType(destType === "foundation" ? "foundation" : "place");

        return true;
      }

      return false;
    },
    [gameState, saveHistory, autoFlipWithTracking],
  );

  return {
    gameState,
    history,
    lastFlippedCard,
    lastMovedCards,
    lastMoveType,
    startNewGame,
    handleUndo,
    handleStockClick,
    handleRedeal,
    tryMove,
    saveHistory,
  };
};
