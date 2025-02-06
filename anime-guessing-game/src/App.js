import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AnimeCard from './Components/AnimeCard';
import ScoreDisplay from './Components/ScoreDisplay';
import ResultModal from './Components/ResultModal';
import './App.css';

const JIKAN_API_URL = 'https://api.jikan.moe/v4';

const App = () => {
  const [animeQueue, setAnimeQueue] = useState([]); // Queue of preloaded anime pairs
  const [currentAnime, setCurrentAnime] = useState(null);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);

  // Fetch a random anime
  const fetchRandomAnime = async () => {
    try {
      let response, animeScore, animePopularity;
      do {
        response = await axios.get(`${JIKAN_API_URL}/random/anime`);
        animeScore = response.data.data.score;
        animePopularity = response.data.data.popularity;
      } while (animePopularity > 5000 || animeScore == null);

      return response.data.data;
    } catch (error) {
      console.error('Error fetching random anime:', error.message);
      return null;
    }
  };

  // Preload multiple pairs at the start
  const preloadAnime = async () => {
    const preloadedQueue = [];
    for (let i = 0; i < 10; i++) {
      const anime = await fetchRandomAnime();
      if (anime) {
        preloadedQueue.push(anime);
      }
    }
    setAnimeQueue(preloadedQueue);
  };

  const startFirstRound = async () => {
    await preloadAnime(); // Preload anime queue
    if (animeQueue.length >= 2) {
      setCurrentAnime(animeQueue[0]); // First anime becomes current
      setAnimeQueue((prevQueue) => prevQueue.slice(1)); // Remove it from queue
    }
  };

  // Start a new round
  const startNewRound = async (passedAnime) => {
    if (animeQueue.length > 2) {
      setResult(null); // Clear result
      setCurrentAnime(passedAnime)
      setAnimeQueue((prevQueue) => prevQueue.slice(1)); // Remove first pair and move to the next

      // Fetch a new anime pair to replenish the queue
      const newAnime = await fetchRandomAnime(); // Directly fetch new anime here
      setAnimeQueue((prevQueue) => [...prevQueue, newAnime]); // Add the new anime to the queue
    }
  };

  // Handle user guess
  const handleGuess = (selectedAnime, otherAnime) => {
    if (selectedAnime.score > otherAnime.score) {
      setScore((prevScore) => prevScore + 1);
      setResult('correct');
      setTimeout(() => startNewRound(selectedAnime), 3000);
    } else {
      setResult('wrong');
      setTimeout(() => startNewRound(otherAnime), 3000);
    }
  };

  // Load initial anime pairs when component mounts
  useEffect(() => {
    const initializeGame = async () => {
      await startFirstRound();
    };
    initializeGame();
  }, []); // Only run once on mount

  // Re-render when animeQueue is updated and it's ready for the game to start
  useEffect(() => {
    if (animeQueue.length >= 2 && !currentAnime) {
      // If animeQueue is populated and currentAnime is null, start the first round
      setCurrentAnime(animeQueue[0]);
      setAnimeQueue((prevQueue) => prevQueue.slice(1)); // Remove first anime from queue
    }
  }, [animeQueue, currentAnime]); // Trigger this effect when animeQueue or currentAnime changes

  return (
    <div className="App">
      <h1>Anime Rating Guessing Game</h1>
      <ScoreDisplay score={score} />
      <div className="anime-container">
        {currentAnime && animeQueue.length > 0 && (
          <>
            <AnimeCard anime={currentAnime} onSelect={() => handleGuess(currentAnime, animeQueue[0])} />
            <AnimeCard anime={animeQueue[0]} onSelect={() => handleGuess(animeQueue[0], currentAnime)} />
          </>
        )}
      </div>
      {result && <ResultModal result={result} />}
    </div>
  );
};

export default App;
