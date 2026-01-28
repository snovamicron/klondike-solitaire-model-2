import React, { useState, useCallback, useEffect } from "react";

// Components
import LandingPage from "./components/LandingPage";
import ControlBar from "./components/ControlBar";
import GameBoard from "./components/GameBoard";
import ThemeToggle from "./components/ThemeToggle";

// Hooks
import { useGameState } from "./hooks/useGameState";
import { useSelection } from "./hooks/useSelection";
import { useResponsive } from "./hooks/useResponsive";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useTouchDrag } from "./hooks/useTouchDrag";
import { useTheme } from "./hooks/useTheme";

// Utils
import { checkWin } from "./utils/gameLogic";

function App() {
  const [showGame, setShowGame] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Theme hook
  const { theme, toggleTheme, isDark } = useTheme();

  // Custom hooks
  const { isMobile, cardOffset } = useResponsive();

  const {
    gameState,
    history,
    startNewGame,
    handleUndo: undoMove,
    handleStockClick,
    handleRedeal,
    tryMove,
  } = useGameState();

  const { selection, selectCards, clearSelection, isSelected } = useSelection();

  const {
    handleDragStart,
    handleDragOver,
    handleDropOnTableau,
    handleDropOnFoundation,
    handleDragEnd,
  } = useDragAndDrop(gameState, tryMove, selectCards, clearSelection, isMobile);

  const { touchDrag, dragPosition, handleTouchStart, getDraggingCards } =
    useTouchDrag(gameState, tryMove, selectCards, clearSelection);

  // ============ GAME ACTIONS ============

  const handlePlay = useCallback(() => {
    startNewGame();
    setShowGame(true);
    setHasWon(false);
  }, [startNewGame]);

  const handleUndo = useCallback(() => {
    undoMove();
    clearSelection();
  }, [undoMove, clearSelection]);

  const handleNewGame = useCallback(() => {
    startNewGame();
    clearSelection();
    setHasWon(false);
  }, [startNewGame, clearSelection]);

  const handleWasteClick = useCallback(() => {
    if (!gameState || gameState.waste.length === 0) return;

    if (selection?.source === "waste") {
      clearSelection();
      return;
    }

    selectCards("waste", gameState.waste.length - 1);
  }, [gameState, selection, selectCards, clearSelection]);

  const handleTableauClick = useCallback(
    (pileIndex, cardIndex) => {
      if (!gameState) return;

      const pile = gameState.tableau[pileIndex];

      // Empty pile - try to move selection here
      if (pile.length === 0) {
        if (selection) {
          if (tryMove(selection, "tableau", pileIndex)) {
            clearSelection();
          }
        }
        return;
      }

      // Default to top card if no specific card clicked
      if (cardIndex === null) {
        cardIndex = pile.length - 1;
      }

      const clickedCard = pile[cardIndex];

      // Can't interact with face-down cards
      if (!clickedCard.faceUp) return;

      // If we have a selection
      if (selection) {
        // Clicked same card - deselect
        if (
          selection.source === `tableau-${pileIndex}` &&
          selection.cardIndex === cardIndex
        ) {
          clearSelection();
          return;
        }

        // Try to move to this pile
        if (tryMove(selection, "tableau", pileIndex)) {
          clearSelection();
          return;
        }
      }

      // Select this card
      selectCards(`tableau-${pileIndex}`, cardIndex);
    },
    [gameState, selection, tryMove, selectCards, clearSelection],
  );

  const handleFoundationClick = useCallback(
    (foundIndex) => {
      if (!gameState) return;

      const foundation = gameState.foundations[foundIndex];

      // If we have a selection, try to move it here
      if (selection) {
        if (tryMove(selection, "foundation", foundIndex)) {
          clearSelection();
          return;
        }
      }

      // Select/deselect foundation top card
      if (foundation.length > 0) {
        const source = `foundation-${foundIndex}`;
        if (selection?.source === source) {
          clearSelection();
        } else {
          selectCards(source, foundation.length - 1);
        }
      }
    },
    [gameState, selection, tryMove, selectCards, clearSelection],
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

      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }

      // Escape to clear selection
      if (e.key === "Escape") {
        clearSelection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showGame, handleUndo, clearSelection]);

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
        }}
      >
        {/* Theme Toggle in Control Bar */}
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      </ControlBar>

      {/* Instructions */}
      <div className="instructions">
        {isMobile
          ? "Tap to select, tap destination to move. Or drag cards."
          : "Click to select, then click destination. Or drag and drop. (Ctrl+Z to undo)"}
      </div>

      {gameState && (
        <GameBoard
          gameState={gameState}
          cardOffset={cardOffset}
          isMobile={isMobile}
          isSelected={isSelected}
          touchDrag={touchDrag}
          dragPosition={dragPosition}
          draggingCards={getDraggingCards()}
          // Handlers
          onStockClick={() => {
            handleStockClick();
            clearSelection();
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

      {/* Win Modal */}
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

      {/* Footer */}
      <div className="footer">
        <button className="back-link" onClick={() => setShowGame(false)}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default App;
