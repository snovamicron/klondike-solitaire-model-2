import React, { useState, useCallback, useRef, useEffect } from "react";
import Card from "./components/Card";

// ============ GAME UTILITIES ============

const SUITS = ["hearts", "diamonds", "clubs", "spades"];
const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const createDeck = () => {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        faceUp: false,
      });
    }
  }
  return deck;
};

const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getCardColor = (suit) => {
  return ["hearts", "diamonds"].includes(suit) ? "red" : "black";
};

const dealNewGame = () => {
  const deck = shuffleDeck(createDeck());
  const tableau = [[], [], [], [], [], [], []];
  let deckIndex = 0;

  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = {
        ...deck[deckIndex],
        faceUp: row === col,
      };
      tableau[col].push(card);
      deckIndex++;
    }
  }

  const stock = deck
    .slice(deckIndex)
    .map((card) => ({ ...card, faceUp: false }));

  return {
    stock,
    waste: [],
    foundations: [[], [], [], []],
    tableau,
  };
};

const canMoveToTableau = (cards, targetPile) => {
  if (!cards || cards.length === 0) return false;

  const movingCard = cards[0];

  if (targetPile.length === 0) {
    return movingCard.rank === 13;
  }

  const topCard = targetPile[targetPile.length - 1];
  if (!topCard.faceUp) return false;

  const movingColor = getCardColor(movingCard.suit);
  const targetColor = getCardColor(topCard.suit);

  return movingCard.rank === topCard.rank - 1 && movingColor !== targetColor;
};

const canMoveToFoundation = (card, foundationPile) => {
  if (!card) return false;

  if (foundationPile.length === 0) {
    return card.rank === 1;
  }

  const topCard = foundationPile[foundationPile.length - 1];
  return card.suit === topCard.suit && card.rank === topCard.rank + 1;
};

const cloneState = (state) => {
  return {
    stock: state.stock.map((c) => ({ ...c })),
    waste: state.waste.map((c) => ({ ...c })),
    foundations: state.foundations.map((f) => f.map((c) => ({ ...c }))),
    tableau: state.tableau.map((t) => t.map((c) => ({ ...c }))),
  };
};

// ============ MAIN APP COMPONENT ============

function App() {
  const [showGame, setShowGame] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [history, setHistory] = useState([]);
  const [selection, setSelection] = useState(null);
  const [dragData, setDragData] = useState(null);
  const [cardOffset, setCardOffset] = useState(25);
  const [isMobile, setIsMobile] = useState(false);

  // Touch drag state
  const [touchDrag, setTouchDrag] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  const gameRef = useRef(null);
  const dragGhostRef = useRef(null);

  // Detect mobile and calculate card offset
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
    };

    const calculateOffset = () => {
      const vh = window.innerHeight;
      if (vh >= 800) {
        setCardOffset(30);
      } else if (vh >= 700) {
        setCardOffset(25);
      } else if (vh >= 600) {
        setCardOffset(20);
      } else {
        setCardOffset(16);
      }
    };

    checkMobile();
    calculateOffset();
    window.addEventListener("resize", calculateOffset);
    return () => window.removeEventListener("resize", calculateOffset);
  }, []);

  const startNewGame = useCallback(() => {
    const newState = dealNewGame();
    setGameState(newState);
    setHistory([]);
    setSelection(null);
    setDragData(null);
    setTouchDrag(null);
  }, []);

  const handlePlay = () => {
    startNewGame();
    setShowGame(true);
  };

  const saveHistory = useCallback((currentState) => {
    setHistory((prev) => [...prev, cloneState(currentState)]);
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setGameState(previousState);
      setHistory((prev) => prev.slice(0, -1));
      setSelection(null);
    }
  }, [history]);

  const autoFlip = useCallback((state) => {
    const newTableau = state.tableau.map((pile) => {
      if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
        const newPile = [...pile];
        newPile[newPile.length - 1] = {
          ...newPile[newPile.length - 1],
          faceUp: true,
        };
        return newPile;
      }
      return pile;
    });
    return { ...state, tableau: newTableau };
  }, []);

  const handleStockClick = useCallback(() => {
    if (!gameState) return;
    setSelection(null);

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
    setSelection(null);
  }, [gameState, saveHistory]);

  const getCardsFromSource = useCallback((source, cardIndex, state) => {
    if (source === "waste" && state.waste.length > 0) {
      return [state.waste[state.waste.length - 1]];
    }
    if (source.startsWith("foundation-")) {
      const idx = parseInt(source.split("-")[1]);
      if (state.foundations[idx].length > 0) {
        return [state.foundations[idx][state.foundations[idx].length - 1]];
      }
    }
    if (source.startsWith("tableau-")) {
      const idx = parseInt(source.split("-")[1]);
      return state.tableau[idx].slice(cardIndex);
    }
    return [];
  }, []);

  const removeFromSource = useCallback((source, cardIndex, state) => {
    const newState = cloneState(state);

    if (source === "waste") {
      newState.waste.pop();
    } else if (source.startsWith("foundation-")) {
      const idx = parseInt(source.split("-")[1]);
      newState.foundations[idx].pop();
    } else if (source.startsWith("tableau-")) {
      const idx = parseInt(source.split("-")[1]);
      newState.tableau[idx] = newState.tableau[idx].slice(0, cardIndex);
    }

    return newState;
  }, []);

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

        newState = autoFlip(newState);
        setGameState(newState);
        setSelection(null);
        return true;
      }

      return false;
    },
    [gameState, getCardsFromSource, removeFromSource, saveHistory, autoFlip],
  );

  const handleWasteClick = useCallback(() => {
    if (!gameState || gameState.waste.length === 0) return;

    if (selection && selection.source === "waste") {
      setSelection(null);
      return;
    }

    setSelection({ source: "waste", cardIndex: gameState.waste.length - 1 });
  }, [gameState, selection]);

  const handleTableauClick = useCallback(
    (pileIndex, cardIndex = null) => {
      if (!gameState) return;

      const pile = gameState.tableau[pileIndex];

      if (pile.length === 0) {
        if (selection) {
          tryMove(selection, "tableau", pileIndex);
        }
        return;
      }

      if (cardIndex === null) {
        cardIndex = pile.length - 1;
      }

      const clickedCard = pile[cardIndex];

      if (!clickedCard.faceUp) {
        return;
      }

      if (selection) {
        if (
          selection.source === `tableau-${pileIndex}` &&
          selection.cardIndex === cardIndex
        ) {
          setSelection(null);
          return;
        }

        if (tryMove(selection, "tableau", pileIndex)) {
          return;
        }
      }

      setSelection({ source: `tableau-${pileIndex}`, cardIndex });
    },
    [gameState, selection, tryMove],
  );

  const handleFoundationClick = useCallback(
    (foundIndex) => {
      if (!gameState) return;

      const foundation = gameState.foundations[foundIndex];

      if (selection) {
        if (tryMove(selection, "foundation", foundIndex)) {
          return;
        }
      }

      if (foundation.length > 0) {
        if (selection && selection.source === `foundation-${foundIndex}`) {
          setSelection(null);
        } else {
          setSelection({
            source: `foundation-${foundIndex}`,
            cardIndex: foundation.length - 1,
          });
        }
      }
    },
    [gameState, selection, tryMove],
  );

  // ============ DESKTOP DRAG AND DROP ============

  const handleDragStart = useCallback(
    (e, source, cardIndex) => {
      if (!gameState || isMobile) return;

      const cards = getCardsFromSource(source, cardIndex, gameState);
      if (cards.length === 0 || !cards[0].faceUp) {
        e.preventDefault();
        return;
      }

      setDragData({ source, cardIndex });
      setSelection({ source, cardIndex });

      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", "");
    },
    [gameState, getCardsFromSource, isMobile],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDropOnTableau = useCallback(
    (e, pileIndex) => {
      e.preventDefault();
      if (!dragData) return;

      tryMove(dragData, "tableau", pileIndex);
      setDragData(null);
    },
    [dragData, tryMove],
  );

  const handleDropOnFoundation = useCallback(
    (e, foundIndex) => {
      e.preventDefault();
      if (!dragData) return;

      tryMove(dragData, "foundation", foundIndex);
      setDragData(null);
    },
    [dragData, tryMove],
  );

  const handleDragEnd = useCallback(() => {
    setDragData(null);
    setSelection(null);
  }, []);

  // ============ MOBILE TOUCH HANDLERS ============

  // FIXED: More reliable drop target detection using data attributes
  const findDropTarget = useCallback((x, y) => {
    const elements = document.elementsFromPoint(x, y);

    for (const el of elements) {
      // Check for elements with data-drop-target attribute
      const dropTarget = el.closest("[data-drop-target]");
      if (dropTarget) {
        const targetType = dropTarget.getAttribute("data-drop-target");
        const targetIndex = parseInt(dropTarget.getAttribute("data-index"), 10);

        if (targetType && !isNaN(targetIndex)) {
          return { type: targetType, index: targetIndex };
        }
      }
    }

    return null;
  }, []);

  const handleTouchStart = useCallback(
    (e, source, cardIndex) => {
      if (!gameState) return;

      const cards = getCardsFromSource(source, cardIndex, gameState);
      if (cards.length === 0 || !cards[0].faceUp) {
        return;
      }

      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();

      setTouchDrag({
        source,
        cardIndex,
        cards,
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top,
        startX: touch.clientX,
        startY: touch.clientY,
        moved: false,
      });

      setDragPosition({ x: touch.clientX, y: touch.clientY });
      setSelection({ source, cardIndex });
    },
    [gameState, getCardsFromSource],
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!touchDrag) return;

      const touch = e.touches[0];

      const dx = Math.abs(touch.clientX - touchDrag.startX);
      const dy = Math.abs(touch.clientY - touchDrag.startY);

      if (dx > 10 || dy > 10) {
        setTouchDrag((prev) => ({ ...prev, moved: true }));
      }

      setDragPosition({ x: touch.clientX, y: touch.clientY });
    },
    [touchDrag],
  );

  const handleTouchEnd = useCallback(
    (e) => {
      if (!touchDrag) return;

      if (touchDrag.moved) {
        // Find drop target
        const touch = e.changedTouches[0];
        const target = findDropTarget(touch.clientX, touch.clientY);

        if (target) {
          const moveSuccess = tryMove(
            { source: touchDrag.source, cardIndex: touchDrag.cardIndex },
            target.type,
            target.index,
          );

          if (moveSuccess) {
            setTouchDrag(null);
            setSelection(null);
            return;
          }
        }
      }

      setTouchDrag(null);
      setSelection(null);
    },
    [touchDrag, findDropTarget, tryMove],
  );

  // Global touch move/end handlers
  useEffect(() => {
    if (touchDrag) {
      const handleGlobalTouchMove = (e) => {
        if (touchDrag.moved) {
          e.preventDefault();
        }
        handleTouchMove(e);
      };

      const handleGlobalTouchEnd = (e) => {
        handleTouchEnd(e);
      };

      document.addEventListener("touchmove", handleGlobalTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleGlobalTouchEnd);

      return () => {
        document.removeEventListener("touchmove", handleGlobalTouchMove);
        document.removeEventListener("touchend", handleGlobalTouchEnd);
      };
    }
  }, [touchDrag, handleTouchMove, handleTouchEnd]);

  const isSelected = useCallback(
    (source, cardIndex) => {
      if (!selection) return false;
      if (selection.source !== source) return false;

      if (source.startsWith("tableau-")) {
        return cardIndex >= selection.cardIndex;
      }
      return selection.cardIndex === cardIndex;
    },
    [selection],
  );

  // Get dragging cards for ghost
  const getDraggingCards = useCallback(() => {
    if (!touchDrag || !gameState) return [];
    return getCardsFromSource(touchDrag.source, touchDrag.cardIndex, gameState);
  }, [touchDrag, gameState, getCardsFromSource]);

  // ============ RENDER ============

  if (!showGame) {
    return (
      <div className="landing">
        <div className="landing-content">
          <div className="landing-cards">
            <div className="landing-card card-1">♠</div>
            <div className="landing-card card-2">♥</div>
            <div className="landing-card card-3">♣</div>
            <div className="landing-card card-4">♦</div>
          </div>
          <h1>Klondike Solitaire</h1>
          <p>The classic card game</p>
          <button className="play-button" onClick={handlePlay}>
            Play Now
          </button>
        </div>
      </div>
    );
  }

  const draggingCards = getDraggingCards();

  return (
    <div className="app" ref={gameRef}>
      {/* Control Bar */}
      <div className="control-bar">
        <h2>Klondike Solitaire</h2>
        <div className="controls">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="control-button"
          >
            ↶ Undo
          </button>
          <button onClick={startNewGame} className="control-button">
            🔄 New Game
          </button>
          <button
            onClick={handleRedeal}
            disabled={!gameState || gameState.waste.length === 0}
            className="control-button"
          >
            ♻ Redeal
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="instructions">
        {isMobile
          ? "Tap to select, tap destination to move. Or drag cards."
          : "Click to select, then click destination. Or drag and drop."}
      </div>

      {gameState && (
        <div className="game-board">
          {/* Top Row */}
          <div className="top-row">
            {/* Stock */}
            <div className="pile-container">
              <div className="pile-label">Stock</div>
              <div
                className={`pile stock-pile ${gameState.stock.length === 0 ? "empty" : ""}`}
                onClick={handleStockClick}
                onTouchEnd={(e) => {
                  if (!touchDrag) {
                    e.preventDefault();
                    handleStockClick();
                  }
                }}
              >
                {gameState.stock.length > 0 ? (
                  <Card card={{ faceUp: false }} />
                ) : gameState.waste.length > 0 ? (
                  <div className="redeal-icon">↻</div>
                ) : null}
                {gameState.stock.length > 0 && (
                  <div className="stock-count">{gameState.stock.length}</div>
                )}
              </div>
            </div>

            {/* Waste */}
            <div className="pile-container">
              <div className="pile-label">Waste</div>
              <div
                className={`pile waste-pile ${gameState.waste.length === 0 ? "empty" : ""}`}
                onClick={handleWasteClick}
              >
                {gameState.waste.length > 0 && (
                  <div
                    draggable={!isMobile}
                    onDragStart={(e) =>
                      handleDragStart(e, "waste", gameState.waste.length - 1)
                    }
                    onDragEnd={handleDragEnd}
                    onTouchStart={(e) =>
                      handleTouchStart(e, "waste", gameState.waste.length - 1)
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWasteClick();
                    }}
                  >
                    <Card
                      card={gameState.waste[gameState.waste.length - 1]}
                      selected={isSelected("waste", gameState.waste.length - 1)}
                      isDragging={
                        touchDrag?.source === "waste" && touchDrag?.moved
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="spacer"></div>

            {/* Foundations - FIXED: Added data attributes for drop detection */}
            {gameState.foundations.map((foundation, index) => (
              <div key={`foundation-${index}`} className="pile-container">
                <div className="pile-label">{["♠", "♥", "♣", "♦"][index]}</div>
                <div
                  className={`pile foundation-pile ${foundation.length === 0 ? "empty" : ""}`}
                  data-drop-target="foundation"
                  data-index={index}
                  onClick={() => handleFoundationClick(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnFoundation(e, index)}
                >
                  {foundation.length > 0 && (
                    <div
                      draggable={!isMobile}
                      onDragStart={(e) =>
                        handleDragStart(
                          e,
                          `foundation-${index}`,
                          foundation.length - 1,
                        )
                      }
                      onDragEnd={handleDragEnd}
                      onTouchStart={(e) =>
                        handleTouchStart(
                          e,
                          `foundation-${index}`,
                          foundation.length - 1,
                        )
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFoundationClick(index);
                      }}
                    >
                      <Card
                        card={foundation[foundation.length - 1]}
                        selected={isSelected(
                          `foundation-${index}`,
                          foundation.length - 1,
                        )}
                        isDragging={
                          touchDrag?.source === `foundation-${index}` &&
                          touchDrag?.moved
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tableau - FIXED: Added data attributes for drop detection */}
          <div className="tableau-row">
            {gameState.tableau.map((pile, pileIndex) => (
              <div
                key={`tableau-${pileIndex}`}
                className="tableau-pile-container"
              >
                <div className="pile-label">{pileIndex + 1}</div>
                <div
                  className={`tableau-pile ${pile.length === 0 ? "empty" : ""}`}
                  data-drop-target="tableau"
                  data-index={pileIndex}
                  onClick={() =>
                    pile.length === 0 && handleTableauClick(pileIndex)
                  }
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnTableau(e, pileIndex)}
                >
                  {pile.map((card, cardIndex) => {
                    const isBeingDragged =
                      touchDrag?.moved &&
                      touchDrag?.source === `tableau-${pileIndex}` &&
                      cardIndex >= touchDrag?.cardIndex;

                    return (
                      <div
                        key={card.id}
                        className={`tableau-card-wrapper ${isSelected(`tableau-${pileIndex}`, cardIndex) ? "selected-wrapper" : ""}`}
                        style={{
                          top: `${cardIndex * cardOffset}px`,
                          zIndex: cardIndex,
                          opacity: isBeingDragged ? 0.3 : 1,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTableauClick(pileIndex, cardIndex);
                        }}
                        draggable={!isMobile && card.faceUp}
                        onDragStart={(e) =>
                          card.faceUp &&
                          handleDragStart(e, `tableau-${pileIndex}`, cardIndex)
                        }
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropOnTableau(e, pileIndex)}
                        onTouchStart={(e) =>
                          card.faceUp &&
                          handleTouchStart(e, `tableau-${pileIndex}`, cardIndex)
                        }
                      >
                        <Card
                          card={card}
                          selected={isSelected(
                            `tableau-${pileIndex}`,
                            cardIndex,
                          )}
                          clickable={card.faceUp}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Touch Drag Ghost */}
      {touchDrag && touchDrag.moved && draggingCards.length > 0 && (
        <div
          className="drag-ghost"
          ref={dragGhostRef}
          style={{
            position: "fixed",
            left: dragPosition.x - (touchDrag.offsetX || 30),
            top: dragPosition.y - (touchDrag.offsetY || 30),
            pointerEvents: "none",
            zIndex: 10000,
          }}
        >
          {draggingCards.map((card, index) => (
            <div
              key={card.id}
              style={{
                position: "absolute",
                top: index * cardOffset,
                left: 0,
              }}
            >
              <Card card={card} selected={false} clickable={false} />
            </div>
          ))}
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
