import { useState, useCallback } from "react";
import {
  dealNewGame,
  cloneState,
  autoFlipTableau,
  getCardsFromSource,
  removeFromSource,
  canMoveToTableau,
  canMoveToFoundation,
} from "../utils/gameLogic";

export const useGameState = () => {
  const [gameState, setGameState] = useState(null);
  const [history, setHistory] = useState([]);

  // Save current state to history (for undo)
  const saveHistory = useCallback((currentState) => {
    setHistory((prev) => [...prev, cloneState(currentState)]);
  }, []);

  // Start a new game
  const startNewGame = useCallback(() => {
    const newState = dealNewGame();
    setGameState(newState);
    setHistory([]);
  }, []);

  // Undo last move
  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setGameState(previousState);
      setHistory((prev) => prev.slice(0, -1));
      return true;
    }
    return false;
  }, [history]);

  // Draw card from stock
  const handleStockClick = useCallback(() => {
    if (!gameState) return;

    if (gameState.stock.length > 0) {
      saveHistory(gameState);
      const newStock = [...gameState.stock];
      const card = { ...newStock.pop(), faceUp: true };
      setGameState((prev) => ({
        ...prev,
        stock: newStock,
        waste: [...prev.waste, card],
      }));
    } else if (gameState.waste.length > 0) {
      // Redeal
      saveHistory(gameState);
      const newStock = [...gameState.waste]
        .reverse()
        .map((c) => ({ ...c, faceUp: false }));
      setGameState((prev) => ({
        ...prev,
        stock: newStock,
        waste: [],
      }));
    }
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

        newState = autoFlipTableau(newState);
        setGameState(newState);
        return true;
      }

      return false;
    },
    [gameState, saveHistory],
  );

  return {
    gameState,
    history,
    startNewGame,
    handleUndo,
    handleStockClick,
    handleRedeal,
    tryMove,
    saveHistory,
  };
};
