import { useState, useCallback } from "react";

export const useSelection = () => {
  const [selection, setSelection] = useState(null);

  const selectCards = useCallback((source, cardIndex) => {
    setSelection({ source, cardIndex });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  const isSelected = useCallback(
    (source, cardIndex) => {
      if (!selection) return false;
      if (selection.source !== source) return false;

      // For tableau, all cards from selected index onwards are selected
      if (source.startsWith("tableau-")) {
        return cardIndex >= selection.cardIndex;
      }

      return selection.cardIndex === cardIndex;
    },
    [selection],
  );

  const toggleSelection = useCallback(
    (source, cardIndex) => {
      if (
        selection &&
        selection.source === source &&
        selection.cardIndex === cardIndex
      ) {
        clearSelection();
        return false; // Was deselected
      }
      selectCards(source, cardIndex);
      return true; // Was selected
    },
    [selection, selectCards, clearSelection],
  );

  return {
    selection,
    selectCards,
    clearSelection,
    isSelected,
    toggleSelection,
  };
};
