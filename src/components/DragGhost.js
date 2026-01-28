import React from "react";
import Card from "./Card";

const DragGhost = ({ cards, position, offset, cardOffset }) => {
  if (!cards || cards.length === 0) return null;

  return (
    <div
      className="drag-ghost"
      style={{
        position: "fixed",
        left: position.x - (offset.x || 30),
        top: position.y - (offset.y || 30),
        pointerEvents: "none",
        zIndex: 10000,
      }}
    >
      {cards.map((card, index) => (
        <div
          key={card.id}
          style={{
            position: "absolute",
            top: index * cardOffset,
            left: 0,
          }}
        >
          <Card card={card} selected={false} clickable={false} />
        </div>
      ))}
    </div>
  );
};

export default DragGhost;
