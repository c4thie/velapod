// Define a global variable for IFrameAPI
let IFrameAPIInstance;

window.onSpotifyIframeApiReady = (IFrameAPI) => {
  IFrameAPIInstance = IFrameAPI;

  const element = document.getElementById("embed-iframe");
  const options = {
    uri: "spotify:episode:7makk4oTQel546B0PZlDM5",
  };
  const callback = (EmbedController) => {
    document.querySelectorAll(".episode").forEach((episode) => {
      episode.addEventListener("click", () => {
        console.log("ep clicked iframe")
        EmbedController.loadUri(episode.dataset.spotifyId);
      });
    });
  };
  IFrameAPIInstance.createController(element, options, callback);
};

function playEpisode(episodeUri) {
  // Ensure that the IFrameAPI is ready
  if (IFrameAPIInstance && IFrameAPIInstance.createController) {
    const element = document.getElementById("embed-iframe");
    const options = {
      uri: episodeUri,
    };

    IFrameAPIInstance.createController(element, options, (EmbedController) => {
      EmbedController.loadUri(episodeUri);
    });
  } else {
    console.log("IFrameAPI is not ready yet.");
  }
}

// Authorization tokens to access API
const client_secret = "64caa2f4522e4d13ad19daa9b61f7c2a";
var client_id = "ee8e41e49dfb47b29f9e6d19e316e753";
const redirectUri = chrome.runtime.getURL("popup.html");
const scope = "user-library-read";
var accessToken = undefined;

// Construct the authorization URL
const authUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(
  redirectUri
)}&scope=${encodeURIComponent(scope)}&response_type=code`;

// Function to exchange authorization code for access token
async function exchangeAuthorizationCode(authorizationCode) {
  const tokenUrl = "https://accounts.spotify.com/api/token";
  const tokenRequestBody = new URLSearchParams({
    grant_type: "authorization_code",
    code: authorizationCode,
    redirect_uri: redirectUri,
    client_id: client_id,
    client_secret: client_secret,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      'Authorization': 'Basic ' + btoa(`${client_id}:${client_secret}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: tokenRequestBody.toString(),
  });

  if (!response.ok) {
    return "Error";
    console.error(response.message);
    console.log("authorization failed");
  }

  const tokenResponse = await response.json();
  return tokenResponse;
}

// Spotify API base URL
const spotifyAPIBase = "https://api.spotify.com/v1";

// // Retrieve the stored access token
// chrome.storage.local.get(["accessToken"], async function (result) {
//   accessToken = result.accessToken;
// });

// Get the user's language setting
const userLanguage = chrome.i18n.getUILanguage();

// // Example of using localized messages
// const welcomeMessage = chrome.i18n.getMessage("welcomeMessage");
// console.log(welcomeMessage);

// Use the user's language to get the corresponding country (for most cases)
const userCountry = userLanguage.substr(-2);

async function fetchAllShows() {
  const response = await fetch(`${spotifyAPIBase}/shows`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,

    },
  });

  if (!response.ok) {
    console.error("Error fetching all shows:", response.statusText);
    console.error(response);
    return "error";
  }

  const allShowData = await response.json();
  console.log(allShowData);
  return allShowData;
}

async function fetchSubscribedShows() {
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
  return showData;
}


// // // Fetch episodes for a show
async function fetchEpisodes(showId) {
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


// Function to create show buttons and add click listeners
function createShowButtons(shows) {
  const showsContainer = document.querySelector(".myshows-container");
  const showsList = shows.items;
  showsList.forEach((showobj) => {
    // Create new HTML elements for each show
    const button = document.createElement("button");
    const image = document.createElement("img");
    const detailsContainer = document.createElement("div");

    // Image source and alt
    image.src = showobj.show.images[0].url;
    image.alt = showobj.show.name;

    // Add button CSS class and text
    button.classList.add("show");
    detailsContainer.classList.add("shows-details-container");

    // Create a paragraph element
    const paragraph = document.createElement("p");
    paragraph.textContent = showobj.show.name;
    button.addEventListener("click", async () => {
      const episodes = await fetchEpisodes(showobj.show.id);
      createEpisodeButtons(episodes);
    });
    showsContainer.appendChild(button);
    button.appendChild(detailsContainer);
    detailsContainer.appendChild(paragraph);
    detailsContainer.appendChild(image);
  });
}

// Function to create episode buttons
function createEpisodeButtons(episodes) {
  const episodesContainer = document.querySelector(".episodes-container");
  episodesContainer.innerHTML = ""; // Clear previous episodes
  const episodesList = episodes.items;
  episodesList.forEach((episodeObj) => {
    const button = document.createElement("button");
    const detailsContainer = document.createElement("div");
    const title = document.createElement("p");

    button.classList.add("episode");
    detailsContainer.classList.add("episodes-details-container");

    button.dataset.spotifyId = episodeObj.uri;
    title.textContent = episodeObj.name;

    button.addEventListener("click", () => {
      const spotifyUri = button.dataset.spotifyId;
      playEpisode(spotifyUri);
    });
    episodesContainer.appendChild(button);
    button.appendChild(detailsContainer);
    detailsContainer.appendChild(title);
  });
}

// Main function to initialize the popup when user does not need a new token
async function initializePopupValidToken() {
  console.log("initializing no new token");
  const authLink = document.getElementById("auth-link");
  const podcastContainer = document.querySelector(".podcast-container");

  chrome.storage.local.get(["accessToken"], function (result) {
    accessToken = result.accessToken;
    console.log("old auth, access token from storage", accessToken);
    // Hide the authorization link
    authLink.style.display = "none";
    // Show the shows container
    podcastContainer.style.display = "block";
  });

  // Fetch and initialize subscribed shows
  const myShowsData = await fetchSubscribedShows();
  console.log("myShowsData", myShowsData);
  createShowButtons(myShowsData);

  // Fetch all shows
  const allShowsData = await fetchAllShows();
  console.log("myShowsData", allShowsData);
  createShowButtons(allShowsData);
}

// Main function to initialize the popup when user needs a new token
async function initializePopupInvalidToken() {
  console.log("initializing new token");
  const authLink = document.getElementById("auth-link");
  const podcastContainer = document.querySelector(".podcast-container");

  // Show the authorization link
  authLink.style.display = "block";
  // Hide the shows container
  podcastContainer.style.display = "none";
  // Set the and text content of the authorization link
  authLink.href = authUrl;
  authLink.textContent = "Authorize with Spotify";

  // Click event listener to the link
  authLink.addEventListener("click", async function (event) {
    // Prevent the default behavior of following the link
    event.preventDefault();
    // Open the auth url
    window.location.href = authUrl;

    const authorizationCode = new URLSearchParams(window.location.search).get("code");

    if (authorizationCode) {
      console.log("Authorization code received:", authorizationCode);
      const tokenResponse = await exchangeAuthorizationCode(authorizationCode);
      console.log("Token response:", tokenResponse);
  
      if (tokenResponse && tokenResponse.access_token) {
        const expirationTimestamp = Date.now() + (tokenResponse.expires_in * 1000);
        console.log("token expires in", tokenResponse.expires_in);
        console.log("expiration timestamp:", expirationTimestamp);
  
        // Store the access token and its expiration timestamp in the extension's storage
        chrome.storage.local.set(
          { accessToken: tokenResponse.access_token, tokenExpiration: expirationTimestamp },
          function () {
            console.log("Access token stored.");
            accessToken = tokenResponse.access_token;
          });
      }
    } else {
      // Use chrome.storage to get the access token from background.js
      chrome.storage.local.get(["accessToken"], function (result) {
        accessToken = result.accessToken;
        console.log("new auth, access token from storage", accessToken);
        // Hide the authorization link
        authLink.style.display = "none";
        // Show the shows container
        podcastContainer.style.display = "block";
      });
    }
  });

  // Fetch and initialize subscribed shows
  const myShowsData = await fetchSubscribedShows();
  console.log("myShowsData", myShowsData);
  createShowButtons(myShowsData);

  // Fetch all shows
  const allShowsData = await fetchAllShows();
  console.log("myShowsData", allShowsData);
  createShowButtons(allShowsData);
}

// Initialize the popup when the DOM is ready
document.addEventListener("DOMContentLoaded", async function () {
  console.log("page loaded");

  const authorizationCode = new URLSearchParams(window.location.search).get("code");

  if (authorizationCode) { // user got a new auth code
    console.log("Authorization code received:", authorizationCode);
    const tokenResponse = await exchangeAuthorizationCode(authorizationCode);
    console.log("Token response:", tokenResponse);

    if (tokenResponse === "Error") {
      // Token exchange failed, get a new token
      initializePopupInvalidToken();

    } else if (tokenResponse && tokenResponse.access_token) {
      const expirationTimestamp = Date.now() + (tokenResponse.expires_in * 1000);
      console.log("Expiration timestamp:", expirationTimestamp);

      // Store the access token and its expiration timestamp in the extension's storage
      chrome.storage.local.set(
        { accessToken: tokenResponse.access_token, tokenExpiration: expirationTimestamp },
        function () {
          accessToken = tokenResponse.access_token;
          console.log("Access token stored.");
          initializePopupValidToken();
        }
      );
    }
  } else { // upon launch user already has a token
    // Use chrome.storage to get the access token and its expiration timestamp
    chrome.storage.local.get(["accessToken", "tokenExpiration"], async function (result) {
      const accessToken = result.accessToken;
      const tokenExpiration = result.tokenExpiration;
      console.log("Accesstoken + tokenExpiration", accessToken, tokenExpiration);

      const tokenResponse = await exchangeAuthorizationCode(authorizationCode);
      console.log("Token response:", tokenResponse);

      if (tokenResponse === "Error") {
        initializePopupInvalidToken();
      } else {
        initializePopupValidToken();
      }})
  }});
