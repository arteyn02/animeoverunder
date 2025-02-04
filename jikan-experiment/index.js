const axios = require('axios');

// Jikan API base URL
const JIKAN_API_URL = 'https://api.jikan.moe/v4';

// Function to fetch anime details by ID
async function fetchAnimeById(animeId) {
  try {
    const response = await axios.get(`${JIKAN_API_URL}/anime/${animeId}`);
    const score = response.data.data.score; // Access the score
    const animePopularity = response.data.data.popularity;
    console.log('Anime Score:', score);
    const thumbnail = response.data.data.images.jpg.image_url;
    console.log('Anime Thumbnail:', thumbnail);
    console.log('English Title:', response.data.data.title_english);
    console.log('Japanese Title:', response.data.data.title_japanese);
    console.log('title:', response.data.data.title);
    console.log('Popularity:', animePopularity);
    return response.data;
  } catch (error) {
    console.error('Error fetching anime:', error.message);
    return null;
  }
}

async function fetchRandomAnime() {

    try {

        let animeTitle, animeScore, animePopularity;
        do {

            const response = await axios.get(`${JIKAN_API_URL}/random/anime`);
            animeTitle = response.data.data.title;
            animeScore = response.data.data.score;
            animePopularity = response.data.data.popularity;
        } while ( animePopularity > 5000 || animeScore == null);
    } catch {

        console.error('Error fetching random anime');
        return null;
    }
}

// Function to search anime by name
async function searchAnime(query) {
  try {
    const response = await axios.get(`${JIKAN_API_URL}/anime`, {
      params: {
        q: query, // Search query
        limit: 5, // Limit results to 5
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching anime:', error.message);
    return null;
  }
}

// Main function to test the API
async function main() {
  // Fetch anime by ID (e.g., Cowboy Bebop has ID 1)
//   const animeId = 56701;
//   const animeDetails = await fetchAnimeById(animeId);
//   console.log('Anime Details:', animeDetails);

fetchRandomAnime();

  // Search anime by name
//   const searchQuery = 'Rakuen Tsuihou';
//   const searchResults = await searchAnime(searchQuery);
//   console.log('Search Results:', searchResults);
}

// Run the main function
main();