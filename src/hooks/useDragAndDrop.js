import { useState, useCallback } from "react";
import { getCardsFromSource } from "../utils/gameLogic";

export const useDragAndDrop = (
  gameState,
  tryMove,
  selectCards,
  clearSelection,
  isMobile,
  calculateValidDrops,
  clearValidDrops,
) => {
  const [dragData, setDragData] = useState(null);

  const handleDragStart = useCallback(
    (e, source, cardIndex) => {
      if (!gameState || isMobile) return;

      const cards = getCardsFromSource(source, cardIndex, gameState);
      if (cards.length === 0 || !cards[0].faceUp) {
        e.preventDefault();
        return;
      }

      setDragData({ source, cardIndex });
      selectCards(source, cardIndex);

      // Calculate and show valid drop zones
      if (calculateValidDrops) {
        calculateValidDrops(source, cardIndex);
      }

      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", "");
    },
    [gameState, isMobile, selectCards, calculateValidDrops],
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
      clearSelection();

      if (clearValidDrops) {
        clearValidDrops();
      }
    },
    [dragData, tryMove, clearSelection, clearValidDrops],
  );

  const handleDropOnFoundation = useCallback(
    (e, foundIndex) => {
      e.preventDefault();
      if (!dragData) return;

      tryMove(dragData, "foundation", foundIndex);
      setDragData(null);
      clearSelection();

      if (clearValidDrops) {
        clearValidDrops();
      }
    },
    [dragData, tryMove, clearSelection, clearValidDrops],
  );

  const handleDragEnd = useCallback(() => {
    setDragData(null);
    clearSelection();

    if (clearValidDrops) {
      clearValidDrops();
    }
  }, [clearSelection, clearValidDrops]);

  return {
    dragData,
    handleDragStart,
    handleDragOver,
    handleDropOnTableau,
    handleDropOnFoundation,
    handleDragEnd,
  };
};
