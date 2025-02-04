import React from 'react';

const AnimeCard = ({ anime, onSelect }) => {
  return (
    <div className="anime-card" onClick={onSelect}>
      <img src={anime.images.jpg.image_url} alt={anime.title} />
      <h3>{anime.title}</h3>
    </div>
  );
};

export default AnimeCard;