import React from "react";

const LandingPage = ({ onPlay }) => {
  return (
    <div className="landing">
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
