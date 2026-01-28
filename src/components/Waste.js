import React from "react";
import Card from "./Card";

const Waste = ({
  waste,
  isSelected,
  isMobile,
  touchDrag,
  onWasteClick,
  onDragStart,
  onDragEnd,
  onTouchStart,
}) => {
  if (waste.length === 0) {
    return (
      <div className="pile-container">
        <div className="pile-label">Waste</div>
        <div className="pile waste-pile empty" onClick={onWasteClick}></div>
      </div>
    );
  }

  const topCard = waste[waste.length - 1];
  const cardIndex = waste.length - 1;
  const isDragging = touchDrag?.source === "waste" && touchDrag?.moved;

  return (
    <div className="pile-container">
      <div className="pile-label">Waste</div>
      <div className="pile waste-pile" onClick={onWasteClick}>
        <div
          draggable={!isMobile}
          onDragStart={(e) => onDragStart(e, "waste", cardIndex)}
          onDragEnd={onDragEnd}
          onTouchStart={(e) => onTouchStart(e, "waste", cardIndex)}
          onClick={(e) => {
            e.stopPropagation();
            onWasteClick();
          }}
        >
          <Card
            card={topCard}
            selected={isSelected("waste", cardIndex)}
            isDragging={isDragging}
          />
        </div>
      </div>
    </div>
  );
};

export default Waste;
