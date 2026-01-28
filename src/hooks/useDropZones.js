import { useState, useCallback } from "react";
import {
  canMoveToTableau,
  canMoveToFoundation,
  getCardsFromSource,
} from "../utils/gameLogic";

export const useDropZones = (gameState, showHints = true) => {
  const [validDropZones, setValidDropZones] = useState({
    tableau: [],
    foundation: [],
  });

  // Calculate valid drop zones based on dragged cards
  const calculateValidDrops = useCallback(
    (source, cardIndex) => {
      // If hints are disabled, don't calculate
      if (!showHints) {
        setValidDropZones({ tableau: [], foundation: [] });
        return;
      }

      if (!gameState || !source) {
        setValidDropZones({ tableau: [], foundation: [] });
        return;
      }

      const cards = getCardsFromSource(source, cardIndex, gameState);
      if (cards.length === 0) {
        setValidDropZones({ tableau: [], foundation: [] });
        return;
      }

      const validTableau = [];
      const validFoundation = [];

      // Check each tableau pile
      gameState.tableau.forEach((pile, index) => {
        // Don't highlight the source pile
        if (source === `tableau-${index}`) return;

        if (canMoveToTableau(cards, pile)) {
          validTableau.push(index);
        }
      });

      // Check each foundation pile (only for single cards)
      if (cards.length === 1) {
        gameState.foundations.forEach((pile, index) => {
          // Don't highlight the source pile
          if (source === `foundation-${index}`) return;

          if (canMoveToFoundation(cards[0], pile)) {
            validFoundation.push(index);
          }
        });
      }

      setValidDropZones({
        tableau: validTableau,
        foundation: validFoundation,
      });
    },
    [gameState, showHints],
  );

  // Clear valid drop zones
  const clearValidDrops = useCallback(() => {
    setValidDropZones({ tableau: [], foundation: [] });
  }, []);

  // Check if a specific zone is valid
  const isValidDrop = useCallback(
    (type, index) => {
      // If hints are disabled, always return false
      if (!showHints) return false;

      if (type === "tableau") {
        return validDropZones.tableau.includes(index);
      }
      if (type === "foundation") {
        return validDropZones.foundation.includes(index);
      }
      return false;
    },
    [validDropZones, showHints],
  );

  return {
    validDropZones,
    calculateValidDrops,
    clearValidDrops,
    isValidDrop,
  };
};
