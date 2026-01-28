import React from "react";
import ThemeToggle from "./ThemeToggle";

const LandingPage = ({ onPlay, isDark, onThemeToggle }) => {
  return (
    <div className="landing">
      {/* Theme Toggle on Landing Page */}
      <div className="landing-theme-toggle">
        <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
      </div>

      <div className="landing-content">
        <div className="landing-cards">
          <div className="landing-card card-1">♠</div>
          <div className="landing-card card-2">♥</div>
          <div className="landing-card card-3">♣</div>
          <div className="landing-card card-4">♦</div>
        </div>
        <h1>Klondike Solitaire</h1>
        <p>The classic card game</p>
        <button className="play-button" onClick={onPlay}>
          Play Now
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
