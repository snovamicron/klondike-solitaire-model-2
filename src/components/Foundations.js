import React from "react";
import Foundation from "./Foundation";

const Foundations = ({
  foundations,
  isSelected,
  isMobile,
  touchDrag,
  isValidDrop,
  onFoundationClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDropOnFoundation,
  onTouchStart,
  getAnimationProps,
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
          isValidDrop={isValidDrop}
          onClick={onFoundationClick}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDrop={onDropOnFoundation}
          onTouchStart={onTouchStart}
          getAnimationProps={getAnimationProps}
        />
      ))}
    </>
  );
};

export default Foundations;
