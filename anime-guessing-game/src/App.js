import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AnimeCard from './Components/AnimeCard';
import ScoreDisplay from './Components/ScoreDisplay';
import ResultModal from './Components/ResultModal';
import './App.css';

const JIKAN_API_URL = 'https://api.jikan.moe/v4';

const App = () => {
  const [anime1, setAnime1] = useState(null);
  const [anime2, setAnime2] = useState(null);
  const [newAnime1, setNewAnime1] = useState(null);
  const [newAnime2, setNewAnime2] = useState(null);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);
  const [backgroundImages, setBackgroundImages] = useState({
    current: '', // Background for the current anime
    next: '', // Background for the next anime
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const backgroundRef = useRef(null);

  // Fetch a random anime
  const fetchRandomAnime = async () => {
    try {
      let animeScore, animePopularity, response;
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

  // Preload an image
  const preloadImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(url);
    });
  };

  // Start the first round
  const startFirstRound = async () => {
    
    const anime1 = await fetchRandomAnime();
    const anime2 = await fetchRandomAnime();
    const newAnime1 = await fetchRandomAnime();
    const newAnime2 = await fetchRandomAnime();
    setAnime1(anime1);
    setAnime2(anime2);
    setNewAnime1(newAnime1);
    setNewAnime2(newAnime2);
    setResult(null);

    // Preload the current and next background images
    const currentBG1 = anime1.images.jpg.image_url;
    const currentBG2 = anime2.images.jpg.image_url;
    const nextBG1 = newAnime1.images.jpg.image_url;
    const nextBG2 = newAnime2.images.jpg.image_url;
    await preloadImage(currentBG1);
    await preloadImage(currentBG2);

    console.log('CurrentBG1:', currentBG1);
    console.log('CurrentBG2:', currentBG2);

    await preloadImage(nextBG1);
    await preloadImage(nextBG2);

    console.log('NextBG1:', nextBG1);
    console.log('NextBG2:', nextBG2);

    // Set the current and next backgrounds
    setBackgroundImages({
      current: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${currentBG1}), url(${currentBG2})`,
      next: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${nextBG1}), url(${nextBG2})`,
    });
  };

  const startNewRound = async (sentAnime1, sentAnime2) => {
    setResult(null); // Clear the result
    setIsTransitioning(true); // Start fade-out transition
    
    // Wait for fade-out to complete before changing anime & background
    setTimeout(async () => {
        setAnime1(sentAnime1);
        setAnime2(sentAnime2);
        
        const newAnime1 = await fetchRandomAnime();
        const newAnime2 = await fetchRandomAnime();
        setNewAnime1(newAnime1);
        setNewAnime2(newAnime2);
        setResult(null);

        // Preload next round's background images
        const nextBG1 = newAnime1.images.jpg.image_url;
        const nextBG2 = newAnime2.images.jpg.image_url;
        await preloadImage(nextBG1);
        await preloadImage(nextBG2);

        // Update background AFTER previous round is completely hidden
        setBackgroundImages((prev) => ({
            current: prev.next, // Move "next" to "current"
            next: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${nextBG1}), url(${nextBG2})`,
        }));

        // Allow fade-in transition
        setTimeout(() => {
            setIsTransitioning(false);
        }, 500); // Matches CSS transition duration
    }, 500); // Wait for fade-out transition before swapping
};


  // Handle user guess
  const handleGuess = (selectedAnime, otherAnime) => {
    if (selectedAnime.score > otherAnime.score) {
      setScore(score + 1);
      setResult('correct');
    } else {
      setResult('wrong');
    }
    setTimeout(() => startNewRound(newAnime1, newAnime2), 1000); // Start a new round after 1 second
  };

  // Start the first round on component mount
  useEffect(() => {
    startFirstRound();
  }, []);

  return (
    <div className="App">
      {/* Background layers for crossfade effect */}
      <div
        className="background-layer"
        style={{ backgroundImage: backgroundImages.current }}
      />
      <div
        className={`background-layer ${isTransitioning ? 'fade-in' : 'fade-out'}`}
        style={{ backgroundImage: backgroundImages.next }}
        ref={backgroundRef}
      />

      {/* Game content */}
      <h1>Anime Rating Guessing Game</h1>
      <ScoreDisplay score={score} />
      <div className="anime-container">
        {anime1 && (
          <AnimeCard
            anime={anime1}
            onSelect={() => handleGuess(anime1, anime2)}
          />
        )}
        {anime2 && (
          <AnimeCard
            anime={anime2}
            onSelect={() => handleGuess(anime2, anime1)}
          />
        )}
      </div>
      {result && <ResultModal result={result} />}
    </div>
  );
};

export default App;