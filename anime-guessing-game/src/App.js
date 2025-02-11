import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AnimeCard from './Components/AnimeCard';
import ScoreDisplay from './Components/ScoreDisplay';
import ResultModal from './Components/ResultModal';
import './App.css';
import EndScreen from './Components/EndScreen';

const JIKAN_API_URL = 'https://api.jikan.moe/v4';

const App = () => {
  const [animeQueue, setAnimeQueue] = useState([]); // Queue of preloaded anime pairs
  const [currentAnime, setCurrentAnime] = useState(null);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);


  // Start the game
  const startGame = () => {
    setIsPlaying(true);
  };

  const restartGame = async () => {
    setScore(0);
    setGameOver(false);
    setResult(null);
    setAnimeQueue([]); 
    setAnimeQueue((prevQueue) => prevQueue.slice(2));
    setCurrentAnime(animeQueue[0]); 
  };  

  // Fetch a random anime
  const fetchRandomAnime = async () => {
    try {
      let response, animeScore, animePopularity, animeType;
      do {
        console.log('fetching random anime...');

        response = await axios.get(`${JIKAN_API_URL}/random/anime`);
        animeScore = response.data.data.score;
        animePopularity = response.data.data.popularity;
        animeType = response.data.data.type;

        console.log('fetched anime:', response.data.data.title);
      } while (!(animePopularity <= 5000 && (animeType === 'TV' || animeType === 'Movie' || animeType === 'ONA') && animeScore != null));

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
      if (anime && !(preloadedQueue.includes(anime))) {
        console.log('valid anime found for preload:', anime.title);
        preloadedQueue.push(anime);
        console.log('queue length: ', preloadedQueue.length);
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
      setCurrentAnime(passedAnime); // Set the passed anime as current
      setAnimeQueue((prevQueue) => prevQueue.slice(1)); // Remove first pair and move to the next

      // Fetch a new anime pair to replenish the queue
      const newAnime = await fetchRandomAnime(); // Directly fetch new anime here
      setAnimeQueue((prevQueue) => [...prevQueue, newAnime]); // Add the new anime to the queue
    }
  };

  // Handle user guess
  const handleGuess = (guess) => {
    if ( guess === 'higher') {
      if (currentAnime.score < animeQueue[0].score) {
        setResult('correct');
        setScore((prevScore) => prevScore + 1);
      } else {
        setResult('incorrect');
        setTimeout(() => {setGameOver(true);}, 3000); // Delay before ending
      }
    } else {
      if (currentAnime.score > animeQueue[0].score) {
        setResult('correct');
        setScore((prevScore) => prevScore + 1);
      } else {
        setResult('incorrect');
        setTimeout(() => {setGameOver(true);}, 3000);
      }
    }

    setTimeout(() => {startNewRound(animeQueue[0]);}, 3000); // Delay before starting new round 
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
      {!isPlaying ? (
        <div className="homepage">
          <h1>Welcome to the Anime Rating Game</h1>
          <button onClick={startGame}>Play</button>
        </div>
      ) : gameOver ? ( 
        <EndScreen score={score} onRestart={restartGame} />
      ) : (
        <>
          <h1>Anime Rating Guessing Game</h1>
          <ScoreDisplay score={score} />
          <div className="anime-container">
            {currentAnime && animeQueue.length > 0 && (
              <>
                <AnimeCard anime={currentAnime} />
                <AnimeCard anime={animeQueue[0]} />
              </>
            )}

            <div className="controls">
            <button onClick={() => handleGuess('higher')}>Higher</button>
            <button onClick={() => handleGuess('lower')}>Lower</button>
            </div>
          </div>
          
          {result && <ResultModal result={result} />}
        </>
      )}
    </div>
  );
};

export default App;
