import { generateString } from "./random.js";

// Spotify API base URL
const spotifyAPIBase = "https://api.spotify.com/v1";

// Function to fetch 6 random recommended shows from your backend
export async function fetchRandomRecommendedShows() {
  try {
    const response = await fetch("http://localhost:3000/recommendations"); // Change the URL
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching random recommended shows:", error);
    return []; // Return an empty array or handle the error case appropriately
  }
}

export async function fetchSubscribedShows(accessToken) {
  const response = await fetch(`${spotifyAPIBase}/me/shows`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("Error fetching subscribed shows:", response.statusText);
    console.error(response);
    console.log(response);
    return "error";
  }

  const showData = await response.json();
  console.log(showData);
  return showData.items;
}

// Fetch episodes for a show
export async function fetchEpisodes(showId, accessToken) {
  const response = await fetch(`${spotifyAPIBase}/shows/${showId}/episodes`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("Error fetching episodes:", response.statusText);
    return null; // Handle the error case appropriately
  }

  const epData = await response.json();
  return epData;
}
