import React, { memo } from "react";
import { SUIT_SYMBOLS, RANK_DISPLAY, RED_SUITS } from "../utils/constants";

const Card = memo(
  ({
    card,
    selected = false,
    clickable = true,
    isDragging = false,
    animationType = null,
    animationDelay = 0,
  }) => {
    if (!card) return null;

    const { suit, rank, faceUp } = card;

    // Build class names
    const animationClass = animationType ? `animate-${animationType}` : "";

    // Build style - only add delay if there's an animation
    const style =
      animationType && animationDelay > 0
        ? { animationDelay: `${animationDelay}ms` }
        : undefined;

    // Face-down card
    if (!faceUp) {
      return (
        <div
          className={`card card-back ${isDragging ? "dragging" : ""} ${animationClass}`}
          style={style}
        >
          <div className="card-back-pattern">
            <div className="pattern-inner"></div>
          </div>
        </div>
      );
    }

    // Face-up card
    const suitSymbol = SUIT_SYMBOLS[suit];
    const rankDisplay = RANK_DISPLAY[rank] || rank.toString();
    const colorClass = RED_SUITS.includes(suit) ? "red" : "black";

    return (
      <div
        className={`card card-face ${colorClass} ${selected ? "selected" : ""} ${
          clickable ? "clickable" : ""
        } ${isDragging ? "dragging" : ""} ${animationClass}`}
        style={style}
        role="button"
        aria-label={`${rankDisplay} of ${suit}`}
      >
        <div className="card-corner top-left">
          <div className="card-rank">{rankDisplay}</div>
          <div className="card-suit">{suitSymbol}</div>
        </div>
        <div className="card-center">
          <span className="center-suit">{suitSymbol}</span>
        </div>
        <div className="card-corner bottom-right">
          <div className="card-rank">{rankDisplay}</div>
          <div className="card-suit">{suitSymbol}</div>
        </div>
      </div>
    );
  },
);

Card.displayName = "Card";

export default Card;
