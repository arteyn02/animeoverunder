import React from 'react';

const ResultModal = ({ result }) => {
  if (!result) return null;

  return (
    <div className={`result-modal ${result}`}>
      <h2>{result === 'correct' ? 'Correct!' : 'Wrong!'}</h2>
    </div>
  );
};

export default ResultModal;