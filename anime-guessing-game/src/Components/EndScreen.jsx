import React from 'react';

const EndScreen = ({ score, onRestart }) => {
  return (
    <div className="end-screen">
    <h2>Game Over</h2>
    <p>Your Score: {score}</p>
    <button onClick={onRestart}>Play Again</button>
  </div>
  );
};

export default EndScreen;