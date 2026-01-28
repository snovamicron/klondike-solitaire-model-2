import React from "react";

const HintsToggle = ({ enabled, onToggle }) => {
  return (
    <button
      className={`hints-toggle ${enabled ? "enabled" : "disabled"}`}
      onClick={onToggle}
      aria-label={enabled ? "Disable move hints" : "Enable move hints"}
      title={
        enabled
          ? "Hints: ON (click to disable)"
          : "Hints: OFF (click to enable)"
      }
    >
      <span className="hints-toggle-icon">{enabled ? "💡" : "🔦"}</span>
      <span className="hints-toggle-label">{enabled ? "Hints" : "Hints"}</span>
    </button>
  );
};

export default HintsToggle;
