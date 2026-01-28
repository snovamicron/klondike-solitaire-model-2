import React from "react";
import Card from "./Card";

const Stock = ({ stock, wasteLength, onStockClick, onTouchEnd, touchDrag }) => {
  const handleTouchEnd = (e) => {
    if (!touchDrag) {
      e.preventDefault();
      onStockClick();
    }
  };

  return (
    <div className="pile-container">
      <div className="pile-label">Stock</div>
      <div
        className={`pile stock-pile ${stock.length === 0 ? "empty" : ""}`}
        onClick={onStockClick}
        onTouchEnd={handleTouchEnd}
      >
        {stock.length > 0 ? (
          <Card card={{ faceUp: false }} />
        ) : wasteLength > 0 ? (
          <div className="redeal-icon">↻</div>
        ) : null}
        {stock.length > 0 && <div className="stock-count">{stock.length}</div>}
      </div>
    </div>
  );
};

export default Stock;
