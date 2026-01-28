import React from "react";
import Stock from "./Stock";
import Waste from "./Waste";
import Foundations from "./Foundations";
import Tableau from "./Tableau";
import DragGhost from "./DragGhost";

const GameBoard = ({
  gameState,
  cardOffset,
  isMobile,
  isSelected,
  touchDrag,
  dragPosition,
  draggingCards,
  getAnimationProps,
  isValidDrop,
  // Handlers
  onStockClick,
  onWasteClick,
  onTableauClick,
  onFoundationClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDropOnTableau,
  onDropOnFoundation,
  onTouchStart,
}) => {
  return (
    <div className="game-board">
      {/* Top Row */}
      <div className="top-row">
        <Stock
          stock={gameState.stock}
          wasteLength={gameState.waste.length}
          onStockClick={onStockClick}
          touchDrag={touchDrag}
        />

        <Waste
          waste={gameState.waste}
          isSelected={isSelected}
          isMobile={isMobile}
          touchDrag={touchDrag}
          onWasteClick={onWasteClick}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onTouchStart={onTouchStart}
          getAnimationProps={getAnimationProps}
        />

        <div className="spacer"></div>

        <Foundations
          foundations={gameState.foundations}
          isSelected={isSelected}
          isMobile={isMobile}
          touchDrag={touchDrag}
          isValidDrop={isValidDrop}
          onFoundationClick={onFoundationClick}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDropOnFoundation={onDropOnFoundation}
          onTouchStart={onTouchStart}
          getAnimationProps={getAnimationProps}
        />
      </div>

      {/* Tableau */}
      <Tableau
        tableau={gameState.tableau}
        cardOffset={cardOffset}
        isSelected={isSelected}
        isMobile={isMobile}
        touchDrag={touchDrag}
        isValidDrop={isValidDrop}
        onTableauClick={onTableauClick}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDropOnTableau={onDropOnTableau}
        onTouchStart={onTouchStart}
        getAnimationProps={getAnimationProps}
      />

      {/* Touch Drag Ghost */}
      {touchDrag && touchDrag.moved && draggingCards.length > 0 && (
        <DragGhost
          cards={draggingCards}
          position={dragPosition}
          offset={{ x: touchDrag.offsetX, y: touchDrag.offsetY }}
          cardOffset={cardOffset}
        />
      )}
    </div>
  );
};

export default GameBoard;
