import {
  createShowButtons,
  createMyShowButtons,
  createEpisodeButtons,
  clearEpisodeButtons,
} from "./create-buttons.js";

import { subscribedShowsData, initializePopup } from "./popup.js";

import { fetchAllShows, fetchEpisodes } from "./api.js";

// Function to perform search
async function performSearch(query) {
  // Check if the search query is empty
  console.log(query);
  if (query === "") {
    // Reinitialize
    initializePopup();
    clearEpisodeButtons();
    return;
  }

  // Get accessToken
  const accessToken = localStorage.getItem("access_token");
  // const accessTokenData = await new Promise((resolve) => {
  //   chrome.storage.local.get(["accessToken"], (result) => resolve(result));
  // });
  // const accessToken = accessTokenData.accessToken;
  // console.log(accessToken);

  const allShowData = await fetchAllShows();
  const allShowIds = allShowData.map((show) => show.podcast_id);
  const myShowIds = subscribedShowsData.map((show) => show.show.id);
  const showIdsCombined = [...allShowIds, ...myShowIds];

  // Fetch episodes for all show IDs
  const allEpisodesData = await Promise.all(
    showIdsCombined.map((showId) => fetchEpisodes(showId, accessToken))
  );
  console.log(allEpisodesData);

  const allEpisodesDataItems = allEpisodesData.map(
    (episodes) => episodes.items
  );
  const flattenedEpisodesDataItems = [].concat(...allEpisodesDataItems);
  console.log(flattenedEpisodesDataItems, subscribedShowsData, allShowData);

  // All results
  const allShowsResults = allShowData.filter((show) =>
    show.title.toLowerCase().includes(query.toLowerCase())
  );
  const myShowsResults = subscribedShowsData.filter((show) =>
    show.show.name.toLowerCase().includes(query.toLowerCase())
  );
  const episodesResults = flattenedEpisodesDataItems.filter((episode) =>
    episode.name.toLowerCase().includes(query.toLowerCase())
  );

  console.log(episodesResults, allShowsResults, myShowsResults);

  // Call a function to display search results
  displaySearchResults(
    allShowsResults,
    myShowsResults,
    episodesResults,
    accessToken
  );
}

// Function to display search results
async function displaySearchResults(
  allShowsResults,
  myShowsResults,
  episodesResults,
  accessToken
) {
  const recShowsContainer = document.querySelector(".recshows-container");
  recShowsContainer.innerHTML = ""; // Clear previous episodes
  const myShowsContainer = document.querySelector(".myshows-container");
  myShowsContainer.innerHTML = ""; // Clear previous episodes
  const episodesContainer = document.querySelector(".episodes-container");
  episodesContainer.innerHTML = ""; // Clear previous episodes

  // Create buttons
  if (allShowsResults.length > 0) {
    createShowButtons(allShowsResults, accessToken);
  }

  if (myShowsResults.length > 0) {
    createMyShowButtons(myShowsResults, accessToken);
  }

  if (episodesResults.length > 0) {
    createEpisodeButtons(episodesResults, episodesResults.slice(0, 25), true);
  }
}

// Add event listeners to handle search input
const searchInput = document.getElementById("search-input");
searchInput.addEventListener("input", (event) => {
  console.log("input");
  const searchQuery = event.target.value;
  performSearch(searchQuery);
});

searchInput.addEventListener("keydown", (event) => {
  console.log("entered");
  if (event.key === "Enter") {
    event.preventDefault();
    console.log("pressed enter");
    const searchQuery = event.target.value;
    performSearch(searchQuery);
  }
});
