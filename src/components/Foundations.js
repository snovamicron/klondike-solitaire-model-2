import React from "react";
import Foundation from "./Foundation";

const Foundations = ({
  foundations,
  isSelected,
  isMobile,
  touchDrag,
  onFoundationClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDropOnFoundation,
  onTouchStart,
}) => {
  return (
    <>
      {foundations.map((foundation, index) => (
        <Foundation
          key={`foundation-${index}`}
          foundation={foundation}
          index={index}
          isSelected={isSelected}
          isMobile={isMobile}
          touchDrag={touchDrag}
          onClick={onFoundationClick}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDrop={onDropOnFoundation}
          onTouchStart={onTouchStart}
        />
      ))}
    </>
  );
};

export default Foundations;
