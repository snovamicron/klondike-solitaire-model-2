import React from "react";
import Card from "./Card";

const TableauPile = ({
  pile,
  pileIndex,
  cardOffset,
  isSelected,
  isMobile,
  touchDrag,
  isValidDrop,
  onTableauClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onTouchStart,
  getAnimationProps,
}) => {
  const source = `tableau-${pileIndex}`;

  const handleEmptyClick = () => {
    onTableauClick(pileIndex, null);
  };

  // Check if this is a valid drop zone
  const validDropClass =
    isValidDrop && isValidDrop("tableau", pileIndex) ? "valid-drop" : "";

  return (
    <div className="tableau-pile-container">
      <div className="pile-label">{pileIndex + 1}</div>
      <div
        className={`tableau-pile ${pile.length === 0 ? "empty" : ""} ${validDropClass}`}
        data-drop-target="tableau"
        data-index={pileIndex}
        onClick={pile.length === 0 ? handleEmptyClick : undefined}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, pileIndex)}
      >
        {pile.map((card, cardIndex) => {
          const isBeingDragged =
            touchDrag?.moved &&
            touchDrag?.source === source &&
            cardIndex >= touchDrag?.cardIndex;

          const animationProps = getAnimationProps
            ? getAnimationProps(card.id)
            : {};

          return (
            <div
              key={card.id}
              className={`tableau-card-wrapper ${
                isSelected(source, cardIndex) ? "selected-wrapper" : ""
              }`}
              style={{
                top: `${cardIndex * cardOffset}px`,
                zIndex: cardIndex,
                opacity: isBeingDragged ? 0.3 : 1,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onTableauClick(pileIndex, cardIndex);
              }}
              draggable={!isMobile && card.faceUp}
              onDragStart={(e) =>
                card.faceUp && onDragStart(e, source, cardIndex)
              }
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, pileIndex)}
              onTouchStart={(e) =>
                card.faceUp && onTouchStart(e, source, cardIndex)
              }
            >
              <Card
                card={card}
                selected={isSelected(source, cardIndex)}
                clickable={card.faceUp}
                {...animationProps}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableauPile;
