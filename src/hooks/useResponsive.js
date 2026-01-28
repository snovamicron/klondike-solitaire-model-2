import { useState, useEffect } from "react";

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [cardOffset, setCardOffset] = useState(25);

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

  return { isMobile, cardOffset };
};
