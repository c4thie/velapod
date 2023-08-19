// Imports
import {
  fetchRandomRecommendedShows,
  fetchEpisodes,
  fetchSubscribedShows,
  unsubscribeFromShow,
  subscribeToShow,
} from "./api.js";

import { initializePopup } from "./popup.js";

// Function to create show buttons and add click listeners
export function createMyShowButtons(showsList, accessToken) {
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
      } else {
        initializePopup();
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
export async function createShowButtons(showsList, accessToken) {
  const showsContainer = document.querySelector(".recshows-container");
  const myShowsContainer = document.querySelector(".myshows-container");

  // Clear existing child elements of the showsContainer
  showsContainer.innerHTML = "";

  showsList.slice(0, 6).forEach((showobj) => {
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
    const addButton = document.createElement("button");
    const error = document.createElement("span");

    episodeButton.classList.add("episode-button");
    episodeButton.textContent = "Episodes";

    episodeButton.addEventListener("click", async () => {
      const episodes = await fetchEpisodes(showId, accessToken);
      createEpisodeButtons(episodes, episodes.items.slice(0, 25), true);
    });

    addButton.classList.add("add-button");
    addButton.textContent = "Add";

    addButton.addEventListener("click", async () => {
      const success = await subscribeToShow(showId, accessToken);
      if (!success) {
        error.textContent = "Error subscribing from show";
        button.appendChild(error);
      } else {
        initializePopup();
      }
    });

    button.appendChild(episodeButton);
    button.appendChild(addButton);

    // Add right-click event listener to show description
    button.addEventListener("contextmenu", (event) => {
      showEpisodeDescription(description.textContent);
    });

    showsContainer.appendChild(button);
    button.appendChild(detailsContainer);
    detailsContainer.appendChild(paragraph);
    detailsContainer.appendChild(image);
  });
}

// Function to create all episode buttons
export function createEpisodeButtons(
  episodesObj,
  displayedEpisodesItem,
  isShowingFirst25
) {
  const episodesContainer = document.querySelector(".episodes-container");
  const switchEpisodesButton = document.getElementById("switchEpisodesButton");
  const limitMessage = document.querySelector(".limit-message");
  
  limitMessage.innerHTML = ""; // Clear previous message
  episodesContainer.innerHTML = ""; // Clear previous episodes
  const episodesList = displayedEpisodesItem;

  // Initially show the button text based on the new state
  if (
    (episodesObj.items && episodesObj.items.length <= 25) ||
    (!episodesObj.items && episodesObj.length <= 25)
  ) {
    switchEpisodesButton.textContent = "";
  } else {
    switchEpisodesButton.textContent = "arrow_forward";
  }

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
      createContextMenu(description.textContent);
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

    episodesContainer.appendChild(button);
    button.appendChild(detailsContainer);
    detailsContainer.appendChild(title);
    detailsContainer.appendChild(description);

    // Add right-click event listener to show description
    button.addEventListener("contextmenu", (event) => {
      createContextMenu(description.textContent);
    });
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

  const limitMessage = document.querySelector(".limit-message");

  if (!isShowingFirst25) {
    // Notice user of Spotify API limits (50 episodes)
    limitMessage.innerHTML = "";
    limitMessage.innerHTML =
      "Only 50 Episodes are available. Please click on the Web Player to listen to older episodes on the Spotify Web App";
    // Only add limit message if doesn't aleady exist on page
  } else {
    // If showing the first 25 episodes, do not show limit message
    limitMessage.innerHTML = "";
  }
}

function showEpisodeDescription(description) {
  const episodeButton = document.querySelector(".episode");

  // Remove any existing popup
  const existingPopup = document.querySelector(".episode-description-popup");
  if (existingPopup) {
    existingPopup.remove();
  }
  // Create a new div element
  const popup = document.createElement("div");
  popup.classList.add("episode-description-popup");

  // Create a paragraph element for the description
  const descriptionParagraph = document.createElement("p");
  descriptionParagraph.textContent = description;

  // Append the description paragraph to the dropdown
  popup.appendChild(descriptionParagraph);

  // Add the dropdown to the body
  episodeButton.appendChild(popup);

  // Calculate the position of the dropdown and set its style
  const rect = description.getBoundingClientRect();
  popup.style.position = "absolute";
  popup.style.left = rect.left + "5px";
  popup.style.top = rect.bottom + "20px";

  // Add a click event listener to the dropdown to remove it when clicked
  popup.addEventListener("click", () => {
    document.body.removeChild(popup);
  });
}

export function clearEpisodeButtons() {
  const episodesContainer = document.querySelector(".episodes-container");
  episodesContainer.innerHTML = ""; // Clear episode buttons
}
