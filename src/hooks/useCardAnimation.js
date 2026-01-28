import { useState, useCallback, useRef, useEffect } from "react";

// Animation types
export const ANIMATION_TYPES = {
  PLACE: "place",
  FLIP: "flip",
  DRAW: "draw",
  FOUNDATION: "foundation",
  STACK: "stack",
  DEAL: "deal",
};

export const useCardAnimation = () => {
  const [animations, setAnimations] = useState({});
  const animationIdRef = useRef(0);
  const timeoutsRef = useRef([]);

  // Clear all pending timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

  // Generic animation trigger
  const triggerAnimation = useCallback(
    (cardIds, type, staggerDelay = 0, duration = 400) => {
      if (!cardIds || cardIds.length === 0) return;

      const animationId = ++animationIdRef.current;

      // Set animations with delays
      const newAnimations = {};
      cardIds.forEach((cardId, index) => {
        newAnimations[cardId] = {
          type,
          delay: index * staggerDelay,
          id: animationId,
        };
      });

      setAnimations((prev) => ({ ...prev, ...newAnimations }));

      // Clear after animation completes
      const totalTime = cardIds.length * staggerDelay + duration + 100;
      const timerId = setTimeout(() => {
        setAnimations((prev) => {
          const updated = { ...prev };
          cardIds.forEach((cardId) => {
            if (updated[cardId]?.id === animationId) {
              delete updated[cardId];
            }
          });
          return updated;
        });
      }, totalTime);

      timeoutsRef.current.push(timerId);
    },
    [],
  );

  // Trigger place animation
  const animatePlace = useCallback(
    (cardIds) => {
      const ids = Array.isArray(cardIds) ? cardIds : [cardIds];
      triggerAnimation(ids, ANIMATION_TYPES.PLACE, 40, 350);
    },
    [triggerAnimation],
  );

  // Trigger flip animation
  const animateFlip = useCallback(
    (cardId) => {
      triggerAnimation([cardId], ANIMATION_TYPES.FLIP, 0, 450);
    },
    [triggerAnimation],
  );

  // Trigger draw animation
  const animateDraw = useCallback(
    (cardId) => {
      triggerAnimation([cardId], ANIMATION_TYPES.DRAW, 0, 300);
    },
    [triggerAnimation],
  );

  // Trigger foundation animation
  const animateFoundation = useCallback(
    (cardId) => {
      triggerAnimation([cardId], ANIMATION_TYPES.FOUNDATION, 0, 400);
    },
    [triggerAnimation],
  );

  // Trigger stack animation
  const animateStack = useCallback(
    (cardIds) => {
      triggerAnimation(cardIds, ANIMATION_TYPES.STACK, 30, 300);
    },
    [triggerAnimation],
  );

  // Trigger deal animation - uses CSS backwards fill mode
  const startDealAnimation = useCallback(
    (cardIds) => {
      if (!cardIds || cardIds.length === 0) return;

      clearAllTimeouts();

      const animationId = ++animationIdRef.current;
      const staggerDelay = 50; // ms between each card

      // Set all animations at once with staggered delays
      const newAnimations = {};
      cardIds.forEach((cardId, index) => {
        newAnimations[cardId] = {
          type: ANIMATION_TYPES.DEAL,
          delay: index * staggerDelay,
          id: animationId,
        };
      });

      setAnimations(newAnimations);

      // Clear after all animations complete
      const totalTime = cardIds.length * staggerDelay + 500;
      const timerId = setTimeout(() => {
        setAnimations((prev) => {
          const updated = { ...prev };
          cardIds.forEach((cardId) => {
            if (updated[cardId]?.id === animationId) {
              delete updated[cardId];
            }
          });
          return updated;
        });
      }, totalTime);

      timeoutsRef.current.push(timerId);
    },
    [clearAllTimeouts],
  );

  // Get animation props for a card
  const getAnimationProps = useCallback(
    (cardId) => {
      const animation = animations[cardId];

      if (!animation) {
        return {
          animationType: null,
          animationDelay: 0,
        };
      }

      return {
        animationType: animation.type,
        animationDelay: animation.delay,
      };
    },
    [animations],
  );

  // Clear all animations
  const clearAnimations = useCallback(() => {
    clearAllTimeouts();
    animationIdRef.current++;
    setAnimations({});
  }, [clearAllTimeouts]);

  return {
    animatePlace,
    animateFlip,
    animateDraw,
    animateFoundation,
    animateStack,
    startDealAnimation,
    getAnimationProps,
    clearAnimations,
  };
};
