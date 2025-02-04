import React from 'react';

const ScoreDisplay = ({ score }) => {
  return (
    <div className="score-display">
      <h2>Score: {score}</h2>
    </div>
  );
};

export default ScoreDisplay;