import { generateString } from "./random.js";

// Spotify API base URL
const spotifyAPIBase = "https://api.spotify.com/v1";

// Function to fetch all shows
export async function fetchAllShows() {
  try {
    const response = await fetch("http://localhost:3000/allshows");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all shows", error);
    return [];
  }
}

// Function to fetch 6 random recommended shows from your backend
export async function fetchRandomRecommendedShows() {
  try {
    const response = await fetch("http://localhost:3000/recommendations"); // Change the URL
    const data = await response.json();
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
  const response = await fetch(
    `${spotifyAPIBase}/shows/${showId}/episodes?limit=50`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    console.error("Error fetching episodes:", response.statusText);
    return null; // Handle the error case appropriately
  }

  const epData = await response.json();
  return epData;
}

// Subscribe to a show
export async function subscribeToShow(showId, accessToken) {
  try {
    const response = await fetch(`${spotifyAPIBase}/me/shows`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: [showId],
      }),
    });

    if (!response.ok) {
      console.error("Error subscribing to show:", response.statusText);
      console.error(response);
      return false;
    }

    console.log("Subscribed to show successfully.");
    return true;
  } catch (error) {
    console.error("Error subscribing to show:", error);
    return false;
  }
}

// Unsubscribe from a show
export async function unsubscribeFromShow(showId, accessToken) {
  try {
    const response = await fetch(`${spotifyAPIBase}/me/shows`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: [showId],
      }),
    });

    if (!response.ok) {
      console.error("Error unsubscribing from show:", response.statusText);
      console.error(response);
      return false;
    }

    console.log("Unsubscribed from show successfully.");
    return true;
  } catch (error) {
    console.error("Error unsubscribing from show:", error);
    return false;
  }
}
