import React, { useState, useCallback, useEffect, useRef } from "react";

// Components
import LandingPage from "./components/LandingPage";
import ControlBar from "./components/ControlBar";
import GameBoard from "./components/GameBoard";
import ThemeToggle from "./components/ThemeToggle";
import HintsToggle from "./components/HintsToggle";

// Hooks
import { useGameState } from "./hooks/useGameState";
import { useSelection } from "./hooks/useSelection";
import { useResponsive } from "./hooks/useResponsive";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useTouchDrag } from "./hooks/useTouchDrag";
import { useTheme } from "./hooks/useTheme";
import { useCardAnimation } from "./hooks/useCardAnimation";
import { useDropZones } from "./hooks/useDropZones";
import { useSettings } from "./hooks/useSettings";

// Utils
import { checkWin } from "./utils/gameLogic";

function App() {
  const [showGame, setShowGame] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const isNewGameRef = useRef(false);

  // Theme hook
  const { toggleTheme, isDark } = useTheme();

  // Settings hook
  const { showHints, toggleHints } = useSettings();

  // Animation hook
  const {
    animatePlace,
    animateFlip,
    animateDraw,
    animateFoundation,
    startDealAnimation,
    getAnimationProps,
    clearAnimations,
  } = useCardAnimation();

  // Custom hooks
  const { isMobile, cardOffset } = useResponsive();

  const {
    gameState,
    history,
    lastFlippedCard,
    lastMovedCards,
    lastMoveType,
    startNewGame,
    handleUndo: undoMove,
    handleStockClick,
    handleRedeal,
    tryMove,
  } = useGameState();

  const { selection, selectCards, clearSelection, isSelected } = useSelection();

  // Drop zones hook - pass showHints
  const { calculateValidDrops, clearValidDrops, isValidDrop } = useDropZones(
    gameState,
    showHints,
  );

  const {
    handleDragStart,
    handleDragOver,
    handleDropOnTableau,
    handleDropOnFoundation,
    handleDragEnd,
  } = useDragAndDrop(
    gameState,
    tryMove,
    selectCards,
    clearSelection,
    isMobile,
    calculateValidDrops,
    clearValidDrops,
  );

  const { touchDrag, dragPosition, handleTouchStart, getDraggingCards } =
    useTouchDrag(
      gameState,
      tryMove,
      selectCards,
      clearSelection,
      calculateValidDrops,
      clearValidDrops,
    );

  // ============ DEAL ANIMATION ON NEW GAME ============

  useEffect(() => {
    if (isNewGameRef.current && gameState) {
      isNewGameRef.current = false;

      const dealCardIds = [];
      gameState.tableau.forEach((pile) => {
        pile.forEach((card) => {
          dealCardIds.push(card.id);
        });
      });

      startDealAnimation(dealCardIds);
    }
  }, [gameKey, gameState, startDealAnimation]);

  // ============ MOVE ANIMATION TRIGGERS ============

  useEffect(() => {
    if (lastMovedCards.length > 0 && lastMoveType) {
      if (lastMoveType === "foundation") {
        animateFoundation(lastMovedCards[0]);
      } else if (lastMoveType === "draw") {
        animateDraw(lastMovedCards[0]);
      } else if (lastMoveType === "place") {
        animatePlace(lastMovedCards);
      }
    }
  }, [
    lastMovedCards,
    lastMoveType,
    animateFoundation,
    animateDraw,
    animatePlace,
  ]);

  useEffect(() => {
    if (lastFlippedCard) {
      animateFlip(lastFlippedCard);
    }
  }, [lastFlippedCard, animateFlip]);

  // ============ CLEAR HINTS WHEN SETTING CHANGES ============

  useEffect(() => {
    if (!showHints) {
      clearValidDrops();
    }
  }, [showHints, clearValidDrops]);

  // ============ GAME ACTIONS ============

  const handlePlay = useCallback(() => {
    clearAnimations();
    isNewGameRef.current = true;
    startNewGame();
    setGameKey((prev) => prev + 1);
    setShowGame(true);
    setHasWon(false);
  }, [startNewGame, clearAnimations]);

  const handleUndo = useCallback(() => {
    undoMove();
    clearSelection();
    clearValidDrops();
  }, [undoMove, clearSelection, clearValidDrops]);

  const handleNewGame = useCallback(() => {
    clearAnimations();
    clearSelection();
    clearValidDrops();
    setHasWon(false);
    isNewGameRef.current = true;
    startNewGame();
    setGameKey((prev) => prev + 1);
  }, [startNewGame, clearSelection, clearAnimations, clearValidDrops]);

  const handleWasteClick = useCallback(() => {
    if (!gameState || gameState.waste.length === 0) return;

    if (selection?.source === "waste") {
      clearSelection();
      clearValidDrops();
      return;
    }

    selectCards("waste", gameState.waste.length - 1);
    calculateValidDrops("waste", gameState.waste.length - 1);
  }, [
    gameState,
    selection,
    selectCards,
    clearSelection,
    calculateValidDrops,
    clearValidDrops,
  ]);

  const handleTableauClick = useCallback(
    (pileIndex, cardIndex) => {
      if (!gameState) return;

      const pile = gameState.tableau[pileIndex];

      if (pile.length === 0) {
        if (selection) {
          if (tryMove(selection, "tableau", pileIndex)) {
            clearSelection();
            clearValidDrops();
          }
        }
        return;
      }

      if (cardIndex === null) {
        cardIndex = pile.length - 1;
      }

      const clickedCard = pile[cardIndex];

      if (!clickedCard.faceUp) return;

      if (selection) {
        if (
          selection.source === `tableau-${pileIndex}` &&
          selection.cardIndex === cardIndex
        ) {
          clearSelection();
          clearValidDrops();
          return;
        }

        if (tryMove(selection, "tableau", pileIndex)) {
          clearSelection();
          clearValidDrops();
          return;
        }
      }

      selectCards(`tableau-${pileIndex}`, cardIndex);
      calculateValidDrops(`tableau-${pileIndex}`, cardIndex);
    },
    [
      gameState,
      selection,
      tryMove,
      selectCards,
      clearSelection,
      calculateValidDrops,
      clearValidDrops,
    ],
  );

  const handleFoundationClick = useCallback(
    (foundIndex) => {
      if (!gameState) return;

      const foundation = gameState.foundations[foundIndex];

      if (selection) {
        if (tryMove(selection, "foundation", foundIndex)) {
          clearSelection();
          clearValidDrops();
          return;
        }
      }

      if (foundation.length > 0) {
        const source = `foundation-${foundIndex}`;
        if (selection?.source === source) {
          clearSelection();
          clearValidDrops();
        } else {
          selectCards(source, foundation.length - 1);
          calculateValidDrops(source, foundation.length - 1);
        }
      }
    },
    [
      gameState,
      selection,
      tryMove,
      selectCards,
      clearSelection,
      calculateValidDrops,
      clearValidDrops,
    ],
  );

  // ============ WIN DETECTION ============

  useEffect(() => {
    if (gameState && checkWin(gameState) && !hasWon) {
      setHasWon(true);
    }
  }, [gameState, hasWon]);

  // ============ KEYBOARD SHORTCUTS ============

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showGame) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }

      if (e.key === "Escape") {
        clearSelection();
        clearValidDrops();
      }

      // Toggle hints with 'H' key
      if (e.key === "h" || e.key === "H") {
        toggleHints();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showGame, handleUndo, clearSelection, clearValidDrops, toggleHints]);

  // ============ RENDER ============

  if (!showGame) {
    return (
      <LandingPage
        onPlay={handlePlay}
        isDark={isDark}
        onThemeToggle={toggleTheme}
      />
    );
  }

  return (
    <div className="app">
      <ControlBar
        canUndo={history.length > 0}
        canRedeal={gameState?.waste.length > 0}
        onUndo={handleUndo}
        onNewGame={handleNewGame}
        onRedeal={() => {
          handleRedeal();
          clearSelection();
          clearValidDrops();
        }}
      >
        <HintsToggle enabled={showHints} onToggle={toggleHints} />
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      </ControlBar>

      <div className="instructions">
        {isMobile
          ? "Tap to select, tap destination to move. Or drag cards."
          : "Click to select, then click destination. Or drag and drop. (Ctrl+Z to undo, H for hints)"}
      </div>

      {gameState && (
        <GameBoard
          key={gameKey}
          gameState={gameState}
          cardOffset={cardOffset}
          isMobile={isMobile}
          isSelected={isSelected}
          touchDrag={touchDrag}
          dragPosition={dragPosition}
          draggingCards={getDraggingCards()}
          getAnimationProps={getAnimationProps}
          isValidDrop={isValidDrop}
          onStockClick={() => {
            handleStockClick();
            clearSelection();
            clearValidDrops();
          }}
          onWasteClick={handleWasteClick}
          onTableauClick={handleTableauClick}
          onFoundationClick={handleFoundationClick}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDropOnTableau={handleDropOnTableau}
          onDropOnFoundation={handleDropOnFoundation}
          onTouchStart={handleTouchStart}
        />
      )}

      {hasWon && (
        <div className="win-overlay">
          <div className="win-modal">
            <h2>🎉 Congratulations!</h2>
            <p>You won the game!</p>
            <button className="play-button" onClick={handleNewGame}>
              Play Again
            </button>
          </div>
        </div>
      )}

      <div className="footer">
        <button className="back-link" onClick={() => setShowGame(false)}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default App;
