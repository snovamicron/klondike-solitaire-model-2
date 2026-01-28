import React from "react";
import Card from "./Card";
import { FOUNDATION_SYMBOLS } from "../utils/constants";

const Foundation = ({
  foundation,
  index,
  isSelected,
  isMobile,
  touchDrag,
  onClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onTouchStart,
}) => {
  const topCard =
    foundation.length > 0 ? foundation[foundation.length - 1] : null;
  const cardIndex = foundation.length - 1;
  const source = `foundation-${index}`;
  const isDragging = touchDrag?.source === source && touchDrag?.moved;

  return (
    <div className="pile-container">
      <div className="pile-label">{FOUNDATION_SYMBOLS[index]}</div>
      <div
        className={`pile foundation-pile ${foundation.length === 0 ? "empty" : ""}`}
        data-drop-target="foundation"
        data-index={index}
        onClick={() => onClick(index)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, index)}
      >
        {topCard && (
          <div
            draggable={!isMobile}
            onDragStart={(e) => onDragStart(e, source, cardIndex)}
            onDragEnd={onDragEnd}
            onTouchStart={(e) => onTouchStart(e, source, cardIndex)}
            onClick={(e) => {
              e.stopPropagation();
              onClick(index);
            }}
          >
            <Card
              card={topCard}
              selected={isSelected(source, cardIndex)}
              isDragging={isDragging}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Foundation;
