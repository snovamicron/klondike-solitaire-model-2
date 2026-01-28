import { useState, useCallback, useEffect } from "react";
import { getCardsFromSource } from "../utils/gameLogic";

export const useTouchDrag = (
  gameState,
  tryMove,
  selectCards,
  clearSelection,
  calculateValidDrops,
  clearValidDrops,
) => {
  const [touchDrag, setTouchDrag] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  // Find drop target at given coordinates
  const findDropTarget = useCallback((x, y) => {
    const elements = document.elementsFromPoint(x, y);

    for (const el of elements) {
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
      selectCards(source, cardIndex);

      // Calculate valid drop zones
      if (calculateValidDrops) {
        calculateValidDrops(source, cardIndex);
      }
    },
    [gameState, selectCards, calculateValidDrops],
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
            clearSelection();
            if (clearValidDrops) {
              clearValidDrops();
            }
            return;
          }
        }
      }

      setTouchDrag(null);
      clearSelection();
      if (clearValidDrops) {
        clearValidDrops();
      }
    },
    [touchDrag, findDropTarget, tryMove, clearSelection, clearValidDrops],
  );

  // Global touch event listeners
  useEffect(() => {
    if (!touchDrag) return;

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
  }, [touchDrag, handleTouchMove, handleTouchEnd]);

  // Get cards being dragged
  const getDraggingCards = useCallback(() => {
    if (!touchDrag || !gameState) return [];
    return getCardsFromSource(touchDrag.source, touchDrag.cardIndex, gameState);
  }, [touchDrag, gameState]);

  return {
    touchDrag,
    dragPosition,
    handleTouchStart,
    getDraggingCards,
  };
};
