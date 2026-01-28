import React from "react";
import TableauPile from "./TableauPile";

const Tableau = ({
  tableau,
  cardOffset,
  isSelected,
  isMobile,
  touchDrag,
  onTableauClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDropOnTableau,
  onTouchStart,
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
          onTableauClick={onTableauClick}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDrop={onDropOnTableau}
          onTouchStart={onTouchStart}
        />
      ))}
    </div>
  );
};

export default Tableau;
