import {
  fetchRandomRecommendedShows,
  fetchEpisodes,
  fetchSubscribedShows,
} from "./api.js";
// Define a global variable for IFrameAPI
let IFrameAPIInstance;

// window.onSpotifyIframeApiReady = () => {
//   // IFrameAPIInstance = IFrameAPI;

//   const iframe = document.getElementById("embed-iframe");
//   // const options = {
//   //   uri: "spotify:episode:7makk4oTQel546B0PZlDM5",
//   // };
//   const callback = () => {
//     document.querySelectorAll(".episode").forEach((episode) => {
//       episode.addEventListener("click", () => {
//         console.log("ep clicked iframe");
//         iframe.src = episode.dataset.spotifyId;
//       });
//     });
//   };
//   // IFrameAPIInstance.createController(element, options, callback);
// };

// function playEpisode(episodeUri) {
//   // Ensure that the IFrameAPI is ready
//   if (IFrameAPIInstance && IFrameAPIInstance.createController) {
//     const element = document.getElementById("embed-iframe");
//     const options = {
//       uri: episodeUri,
//     };

//     IFrameAPIInstance.createController(element, options, (EmbedController) => {
//       EmbedController.loadUri(episodeUri);
//     });
//   } else {
//     console.log("IFrameAPI is not ready yet.");
//   }
// }

// Authorization tokens to access API
const client_secret = "64caa2f4522e4d13ad19daa9b61f7c2a";
var client_id = "ee8e41e49dfb47b29f9e6d19e316e753";
const redirectUri = chrome.runtime.getURL("popup.html");
console.log(redirectUri);
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
      Authorization: "Basic " + btoa(`${client_id}:${client_secret}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: tokenRequestBody.toString(),
  });

  if (!response.ok) {
    console.error(response.message);
    return null;
  }

  const tokenResponse = await response.json();
  return tokenResponse;
}

// Get the user's language setting
const userLanguage = chrome.i18n.getUILanguage();

// // Example of using localized messages
// const welcomeMessage = chrome.i18n.getMessage("welcomeMessage");
// console.log(welcomeMessage);

// Use the user's language to get the corresponding country (for most cases)
const userCountry = userLanguage.substr(-2);

// Function to create show buttons and add click listeners
function createShowButtons(showsList, accessToken, type) {
  var showsContainer = document.querySelector(".myshows-container");
  console.log("myshowslist", showsList);
  if (type === "REC_SHOWS") {
    showsContainer = document.querySelector(".recshows-container");
    console.log("recshowslist", showsList);
  }

  // Clear existing child elements of the showsContainer
  showsContainer.innerHTML = "";

  showsList.forEach((showobj) => {
    // Create new HTML elements for each show
    const button = document.createElement("button");
    const image = document.createElement("img");
    const detailsContainer = document.createElement("div");
    const paragraph = document.createElement("p");
    const description = document.createElement("p");
    var showId = undefined;

    // Add button CSS class and text
    button.classList.add("show");
    detailsContainer.classList.add("shows-details-container");

    // Image source and alt
    if (type === "MY_SHOWS") {
      showId = showobj.show.id;
      image.src = showobj.show.images[0].url;
      image.alt = showobj.show.name;
      paragraph.textContent = showobj.show.name;
    } else if (type === "REC_SHOWS") {
      showId = showobj.podcast_id;
      image.src = showobj.image_url;
      image.alt = showobj.title;
      paragraph.textContent = showobj.title;
      description.textContent = showobj.description;
    }

    button.addEventListener("click", async () => {
      const episodes = await fetchEpisodes(showId, accessToken);
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
    const description = document.createElement("p");

    button.classList.add("episode");
    detailsContainer.classList.add("episodes-details-container");
    description.classList.add("episodes-details-description");

    button.dataset.spotifyId = episodeObj.id;
    title.textContent = episodeObj.name;
    description.textContent = episodeObj.description;
    // No description
    if (description.textContent === "") {
      description.textContent = "No description";
    }

    episodesContainer.appendChild(button);
    button.appendChild(detailsContainer);
    detailsContainer.appendChild(title);
    detailsContainer.appendChild(description);
  });

  const iframe = document.getElementById("embed-iframe");
  document.querySelectorAll(".episode").forEach((episode) => {
    episode.addEventListener("click", () => {
      console.log("ep clicked iframe");
      iframe.src =
        "https://open.spotify.com/embed/episode/" +
        episode.dataset.spotifyId +
        "?utm_source=generator&theme=0&t=0";
      console.log(iframe);
    });
  });
}

// Main function to initialize the popup
async function initializePopup() {
  const authLink = document.getElementById("auth-link");
  const auth = document.querySelector(".non-authorized");
  const mainContainer = document.querySelector(".main-container");
  const browser = document.querySelector(".podcast-selection-body");
  const shuffle = document.querySelector(".shuffle");
  const collapse = document.querySelector(".collapse");
  const expand = document.querySelector(".expand");
  expand.style.display = "none";

  // Get the access token and its expiration timestamp from local storage
  const storageData = await new Promise((resolve) => {
    chrome.storage.local.get(["accessToken", "tokenExpiration"], (result) =>
      resolve(result)
    );
  });

  const accessToken = storageData.accessToken;
  const tokenExpiration = storageData.tokenExpiration;

  // Refresh recommended shows on shuffle click
  shuffle.addEventListener("click", async () => {
    const shows = await fetchRandomRecommendedShows();
    createShowButtons(shows, accessToken, "REC_SHOWS");
  });

  // Open accordion when expand is clicked
  expand.addEventListener("click", async () => {
    browser.style.display = "block";
    collapse.style.display = "block";
    expand.style.display = "none";
  });

  // When collapse is clicked, close accordion
  collapse.addEventListener("click", async () => {
    browser.style.display = "none";
    collapse.style.display = "none";
    expand.style.display = "block";
  });

  if (accessToken && tokenExpiration && Date.now() < tokenExpiration) {
    console.log("valid token");
    // Token is valid, proceed with fetching and rendering data
    auth.style.display = "none";
    mainContainer.style.display = "block";

    // Fetch and initialize subscribed shows
    const myShowsData = await fetchSubscribedShows(accessToken);
    console.log("myShowsData", myShowsData);
    createShowButtons(myShowsData, accessToken, "MY_SHOWS");

    // Fetch recommended shows
    const recShowsData = await fetchRandomRecommendedShows();
    console.log("recShowsData", recShowsData);
    createShowButtons(recShowsData, accessToken, "REC_SHOWS");
  } else {
    // Token is expired or not available, show the authorization link
    console.log("token invalid");
    auth.style.display = "block";
    mainContainer.style.display = "none";
    authLink.href = authUrl;
    authLink.textContent = "Authorize with Spotify";

    // Click event listener to the link
    authLink.addEventListener("click", async (event) => {
      event.preventDefault();
      window.location.href = authUrl;

      const authorizationCode = new URLSearchParams(window.location.search).get(
        "code"
      );

      if (authorizationCode) {
        console.log("auth obtained, waiting for token validation");
        const tokenResponse = await exchangeAuthorizationCode(
          authorizationCode
        );

        if (!tokenResponse) {
          console.log("token exchange failed");
          // Token exchange failed, show the authorization link again
          auth.style.display = "block";
          mainContainer.style.display = "none";
        } else if (tokenResponse.access_token) {
          const expirationTimestamp =
            Date.now() + tokenResponse.expires_in * 1000;

          // Store the access token and its expiration timestamp in the extension's storage
          chrome.storage.local.set(
            {
              accessToken: tokenResponse.access_token,
              tokenExpiration: expirationTimestamp,
            },
            function () {
              console.log("Access token stored.");
              // Initialize popup after storing the token
              initializePopup();
            }
          );
        }
      }
    });
  }
}

// Initialize the popup when the DOM is ready
document.addEventListener("DOMContentLoaded", async function () {
  console.log("page loaded");
  initializePopup();
});
