import {
  fetchRandomRecommendedShows,
  fetchEpisodes,
  fetchSubscribedShows,
  unsubscribeFromShow,
  subscribeToShow,
} from "./api.js";

import { exchangeAuthorizationCode, authUrl } from "./oauth.js";

// Get the user's language setting
const userLanguage = chrome.i18n.getUILanguage();

// Example of using localized messages
const welcomeMessage = chrome.i18n.getMessage("welcomeMessage");
console.log(welcomeMessage);

// Use the user's language to get the corresponding country (for most cases)
const userCountry = userLanguage.substr(-2);

// Function to create show buttons and add click listeners
function createMyShowButtons(showsList, accessToken) {
  var showsContainer = document.querySelector(".myshows-container");
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
    showId = showobj.show.id;
    image.src = showobj.show.images[0].url;
    image.alt = showobj.show.name;
    paragraph.textContent = showobj.show.name;

    // Add event listeners for hover and click
    button.addEventListener("mouseover", () => {
      button.classList.add("hovered");
      image.style.display = "none"; // Hide the image
      paragraph.style.display = "none"; // Hide the paragraph
    });

    button.addEventListener("mouseout", () => {
      button.classList.remove("hovered");
      image.style.display = "block";
      paragraph.style.display = "block";
    });

    // Create and append episode and remove buttons
    const episodeButton = document.createElement("button");
    const removeButton = document.createElement("button");
    const error = document.createElement("span");

    episodeButton.classList.add("episode-button");
    episodeButton.textContent = "Episodes";

    episodeButton.addEventListener("click", async () => {
      const episodes = await fetchEpisodes(showId, accessToken);
      createEpisodeButtons(episodes, episodes.items.slice(0, 25), true);
    });

    removeButton.classList.add("remove-button");
    removeButton.textContent = "Remove";

    removeButton.addEventListener("click", async () => {
      const success = await unsubscribeFromShow(showId, accessToken);
      if (!success) {
        error.textContent = "Error unsubscribing from show";
        button.appendChild(error);
      }
    });

    button.appendChild(episodeButton);
    button.appendChild(removeButton);

    showsContainer.appendChild(button);
    button.appendChild(detailsContainer);
    detailsContainer.appendChild(paragraph);
    detailsContainer.appendChild(image);
  });
}

// Function to create show buttons and add click listeners
function createShowButtons(showsList, accessToken) {
  const showsContainer = document.querySelector(".recshows-container");

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
    showId = showobj.podcast_id;
    image.src = showobj.image_url;
    image.alt = showobj.title;
    paragraph.textContent = showobj.title;
    description.textContent = showobj.description;

    button.addEventListener("click", async () => {
      const episodes = await fetchEpisodes(showId, accessToken);
      createEpisodeButtons(episodes, episodes.items.slice(0, 25), true);
    });

    // Add right-click event listener to show description
    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      showEpisodeDescription(description.textContent);
    });
    showsContainer.appendChild(button);
    button.appendChild(detailsContainer);
    detailsContainer.appendChild(paragraph);
    detailsContainer.appendChild(image);
  });
}

// Function to create all episode buttons
function createEpisodeButtons(
  episodesObj,
  displayedEpisodesItem,
  isShowingFirst25
) {
  const episodesContainer = document.querySelector(".episodes-container");
  episodesContainer.innerHTML = ""; // Clear previous episodes
  const episodesList = displayedEpisodesItem;

  const switchEpisodesButton = document.getElementById("switchEpisodesButton");

  // Update the button text based on the initial state
  // switchEpisodesButton.textContent = isShowingFirst25
  //   ? "arrow_forward"
  //   : "arrow_back";

  // Add event listener to navigate between episodes & switch arrow icons
  switchEpisodesButton.addEventListener("click", () => {
    isShowingFirst25 = !isShowingFirst25;

    // Update the button text based on the new state
    switchEpisodesButton.textContent = isShowingFirst25
      ? "arrow_forward"
      : "arrow_back";

    if (isShowingFirst25) {
      switchEpisodesButton.textContent = "arrow_forward";
      console.log("clicked on arrow forward");
      createEpisodeButtonsSlice(episodesList.slice(0, 25), true); // Display the first 25 episodes
    } else {
      switchEpisodesButton.textContent = "arrow_back";
      console.log("clicked on arrow back");
      createEpisodeButtonsSlice(episodesObj.items.slice(25, 50), false); // Display the last 25 episodes
    }
  });

  const episodesToShow = isShowingFirst25
    ? episodesList.slice(0, 25)
    : episodesList.slice(25, 50);

  episodesToShow.forEach((episodeObj) => {
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

    // Add right-click event listener to show description
    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      showEpisodeDescription(description.textContent);
    });

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

function createEpisodeButtonsSlice(displayedEpisodesItem, isShowingFirst25) {
  const episodes = document.querySelector(".episodes");
  const episodesContainer = document.querySelector(".episodes-container");
  episodesContainer.innerHTML = ""; // Clear previous episodes
  console.log(displayedEpisodesItem);

  displayedEpisodesItem.forEach((episodeObj) => {
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

    // Add right-click event listener to show description
    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      showEpisodeDescription(description.textContent);
    });

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

  const limitMessage = document.createElement("p");

  if (!isShowingFirst25) {
    limitMessage.classList.add("limit-message");
    limitMessage.innerHTML =
      "Only 50 Episodes are available. Please click on the Web Player to listen to older episodes on the Spotify Web App";
    episodes.appendChild(limitMessage);
  } else {
    limitMessage.style.display = "none";
  }
}

export function showEpisodeDescription(description) {
  const episodeButton = document.querySelector(".episode");

  const popup = document.createElement("div");
  popup.classList.add("episode-description-popup");

  // Create a paragraph element for the description
  const descriptionParagraph = document.createElement("p");
  descriptionParagraph.textContent = description;

  // Append the description paragraph to the dropdown
  dropdown.appendChild(descriptionParagraph);

  // Add the dropdown to the body
  episodeButton.appendChild(dropdown);

  // Calculate the position of the dropdown and set its style
  const rect = description.getBoundingClientRect();
  dropdown.style.position = "absolute";
  dropdown.style.left = rect.left + "5px";
  dropdown.style.top = rect.bottom + "20px";

  // Add a click event listener to the dropdown to remove it when clicked
  popup.addEventListener("click", () => {
    document.body.removeChild(popup);
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

  // Additional formatting for popup
  const body = document.querySelector("body");
  const iframe = document.querySelector("iframe");
  // const iframeImg = document.querySelector(".Metadata_coverArt__AZhtt");

  // initially hide expand icon
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
    createShowButtons(shows, accessToken);
  });

  // Open accordion when expand is clicked
  expand.addEventListener("click", async () => {
    body.style.height = "550px";
    body.style.width = "600px";
    iframe.style.width = "545px";
    // iframeImg.style.width = "90px";
    // iframeImg.style.height = "90px";
    // iframeImg.style.margin = "8px auto";
    browser.style.display = "block";
    collapse.style.display = "block";
    expand.style.display = "none";
  });

  // When collapse is clicked, close accordion
  collapse.addEventListener("click", async () => {
    body.style.height = "157px";
    body.style.width = "220px";
    iframe.style.width = "170px";
    // iframeImg.style.width = "100px";
    // iframeImg.style.height = "100px";
    // iframeImg.style.margin = "8px 10px";
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
    createMyShowButtons(myShowsData, accessToken);

    // Fetch recommended shows
    const recShowsData = await fetchRandomRecommendedShows();
    console.log("recShowsData", recShowsData);
    createShowButtons(recShowsData, accessToken);
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
