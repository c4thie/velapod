import { generateString } from "./random.js";

// Spotify API base URL
const spotifyAPIBase = "https://api.spotify.com/v1";

export async function fetchAllShows(accessToken) {
  for (let i = 0, limit = 30; i < limit; i++) {
    var showArray = [];
    var showId = generateString(22);
    const response = await fetch(`${spotifyAPIBase}/shows/${showId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error("Error fetching all shows:", response.statusText);
      console.error(response);
    } else {
      showData = response.json();
      showArray.push(showData);
    }
  }

  let a = "38bS44xjbVVZ3No3ByF1dJ";
  let b = "4rOoJ6Egrf8K2IrywzwOMk";

  //   const allShowData = await response.json();
  //   console.log(allShowData);
  console.log(showArray);
  return showArray;
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
