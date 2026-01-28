import React from "react";

const ControlBar = ({
  canUndo,
  canRedeal,
  onUndo,
  onNewGame,
  onRedeal,
  children,
}) => {
  return (
    <div className="control-bar">
      <h2>Klondike Solitaire</h2>
      <div className="controls">
        <button onClick={onUndo} disabled={!canUndo} className="control-button">
          ↶ Undo
        </button>
        <button onClick={onNewGame} className="control-button">
          🔄 New Game
        </button>
        <button
          onClick={onRedeal}
          disabled={!canRedeal}
          className="control-button"
        >
          ♻ Redeal
        </button>
        {children}
      </div>
    </div>
  );
};

export default ControlBar;
