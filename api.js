import { generateString } from "./random.js";

// Spotify API base URL
const spotifyAPIBase = "https://api.spotify.com/v1";

async function fetchShowById(accessToken, showId) {
  console.log("fetchshowbyid", showId);
  const response = await fetch(`https://api.spotify.com/v1/shows/${showId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("Error fetching show by ID:", response.statusText);
    console.error(response);
    return null;
  }

  const showData = await response.json();
  return showData;
}

export async function fetchAllShows(accessToken) {
  var showArray = [];
  console.log("access token: " + accessToken);
  for (let i = 0, limit = 10; i < limit; i++) {
    var showId = generateString(22);
    console.log(showId, typeof showId);

    const showData = await fetchShowById(accessToken, showId);

    if (showData) {
      console.log("Fetched show data:", showData);
      showArray.push(showData);
    } else {
      console.error("Error fetching all shows", showData);
    }
  }

  let a = "38bS44xjbVVZ3No3ByF1dJ";
  let b = "4rOoJ6Egrf8K2IrywzwOMk";

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
