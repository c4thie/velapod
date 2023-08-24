import { generateString } from "./random.js";

// Spotify API base URL
const spotifyAPIBase = "https://api.spotify.com/v1";
const backendAPIBase = "http://localhost:3000";

// Function to fetch all shows
export async function fetchAllShows() {
  try {
    const response = await fetch(`${backendAPIBase}/allshows`);

    if (!response.ok) {
      console.error("Error fetching all shows - Status:", response.status);
      console.error("Response:", await response.text());
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all shows", error);
    return [];
  }
}

// Function to fetch 6 random recommended shows from your backend
export async function fetchRandomRecommendedShows(selectedCountry) {
  console.log(selectedCountry);
  console.log(`${backendAPIBase}/v1/recommendations/${selectedCountry}`);
  try {
    const response = await fetch(
      `${backendAPIBase}/v1/recommendations/${selectedCountry}`
    ); // Change the URL
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

export async function getAuthInfo() {
  try {
    const response = await fetch(`${backendAPIBase}/v1/get-auth`);

    if (!response.ok) {
      console.error(
        "api.js: Error getting client credentials response not ok:",
        response.statusText
      );
      console.error(response);
      return null; // Return null on error
    }

    console.log(
      "api.js: getting client credentials obtained successfully:",
      response
    );
    return response; // Return the response object
  } catch (error) {
    console.error("api.js: Error getting client credentials error:", error);
    return null; // Return null on error
  }
}

export async function authorize(redirectUri) {
  try {
    const response = await fetch(
      `${backendAPIBase}/authorize?redirectUri=${redirectUri}`
    );

    if (!response.ok) {
      console.error("api.js: Error login not successful:", response);
      console.error(response);
      return null; // Return null on error
    }

    console.log("api.js: redirect successful:", response);
    return response; // Return the response object
  } catch (error) {
    console.error("api.js: Error login not successful", error);
    return null; // Return null on error
  }
}

export async function fetchToken(authorizationCode, redirectUri) {
  console.log("api.js: fetchToken function called");
  try {
    const response = await fetch(
      `${backendAPIBase}/get-token?authorizationCode=${authorizationCode}&redirectUri=${encodeURIComponent(
        redirectUri
      )}`,
      {
        headers: {
          Origin: window.location.origin,
        },
      }
    );

    if (!response.ok) {
      console.error("api.js: Error getting token:", response.statusText);
      console.error(response);
      return false;
    }

    const tokenResponse = await response.json();
    console.log("api.js: Token retrieved successfully.", tokenResponse);
    return tokenResponse;
  } catch (error) {
    console.error("api.js: Error getting token:", error);
    return false;
  }
}
