let input = document.querySelector("input");

document.querySelector(".editable").addEventListener("click", function (event) {
  let element = event.target;
  if (element.innerText) {
    element.innerText = input.value;
  }
});

import { allEpisodes, subscribedShows } from "./popup.js";

const allShowData = fetchAllShows();

// Function to fetch all shows
async function fetchAllShows() {
  try {
    const response = await fetch("http://localhost:3000/allshows");
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching all shows", error);
    return [];
  }
}

// Function to perform search
export function performSearch(query) {
  console.log(allEpisodes, subscribedShows, allShowData);

  // Build list of all information available
  const searchBase = [].concat.apply(
    [],
    [allEpisodes, subscribedShows, allShowData]
  );

  const searchResults = searchBase.filter((field) =>
    field.name.toLowerCase().includes(query.toLowerCase())
  );

  // Call a function to display search results
  displaySearchResults(searchResults);
}

// Function to display search results
function displaySearchResults(results) {
  const episodesContainer = document.querySelector(".episodes-container");
  episodesContainer.innerHTML = ""; // Clear previous episodes

  createEpisodeButtons(results, results.items.slice(0, 25), true);
}

// Add event listeners to handle search input
const searchInput = document.getElementById("search-input");
searchInput.addEventListener("input", (event) => {
  const searchQuery = event.target.value;
  performSearch(searchQuery);
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    const searchQuery = event.target.value;
    performSearch(searchQuery);
  }
});
