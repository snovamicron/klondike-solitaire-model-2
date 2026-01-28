import React from "react";
import TableauPile from "./TableauPile";

const Tableau = ({
  tableau,
  cardOffset,
  isSelected,
  isMobile,
  touchDrag,
  isValidDrop,
  onTableauClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDropOnTableau,
  onTouchStart,
  getAnimationProps,
}) => {
  return (
    <div className="tableau-row">
      {tableau.map((pile, pileIndex) => (
        <TableauPile
          key={`tableau-${pileIndex}`}
          pile={pile}
          pileIndex={pileIndex}
          cardOffset={cardOffset}
          isSelected={isSelected}
          isMobile={isMobile}
          touchDrag={touchDrag}
          isValidDrop={isValidDrop}
          onTableauClick={onTableauClick}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDrop={onDropOnTableau}
          onTouchStart={onTouchStart}
          getAnimationProps={getAnimationProps}
        />
      ))}
    </div>
  );
};

export default Tableau;
