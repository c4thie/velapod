// Imports
import {
  fetchRandomRecommendedShows,
  fetchEpisodes,
  fetchSubscribedShows,
  unsubscribeFromShow,
  subscribeToShow,
} from "./api.js";
import { createContextMenu } from "./context-menu.js";
import { authenticate, exchangeAuthorizationCode, authUrl } from "./oauth.js";
import { createShowButtons, createMyShowButtons } from "./create-buttons.js";

// Get the user's language setting
const userLanguage = chrome.i18n.getUILanguage();
// Example of using localized messages
const welcomeMessage = chrome.i18n.getMessage("welcomeMessage");
console.log(welcomeMessage);
// Use the user's language to get the corresponding country (for most cases)
const userCountry = userLanguage.substr(-2);

let subscribedShowsData = [];

// Main function to initialize the popup
export async function initializePopup() {
  const authLink = document.getElementById("auth-link");
  const auth = document.querySelector(".non-authorized");
  const mainContainer = document.querySelector(".main-container");
  const browser = document.querySelector(".podcast-selection-body");
  const shuffle = document.querySelector(".shuffle");
  const collapse = document.querySelector(".collapse");
  const expand = document.querySelector(".expand");
  const limitMessage = document.querySelector(".limit-message");

  // initially make sure limitMessage is blank
  limitMessage.innerHTML = "";

  // Additional formatting for popup
  const body = document.querySelector("body");
  const iframe = document.querySelector("iframe");

  // initially hide expand icon
  expand.style.display = "none";

  // Get the access token and its expiration timestamp from local storage
  const storageData = await new Promise((resolve) => {
    chrome.storage.local.get(
      ["accessToken", "tokenExpiration", "selectedCountry"],
      (result) => resolve(result)
    );
  });

  const accessToken = storageData.accessToken;
  const tokenExpiration = storageData.tokenExpiration;
  const selectedCountry = localStorage.getItem("selectedCountry");
  // const selectedCountry = storageData.selectedCountry;
  // console.log(
  //   "accessToken: " + accessToken,
  //   "tokenExpiration: " + tokenExpiration,
  //   "selectedCountry: " + selectedCountry
  // );

  // Refresh recommended shows on shuffle click
  shuffle.addEventListener("click", async () => {
    const shows = await fetchRandomRecommendedShows(selectedCountry);
    createShowButtons(shows, accessToken);
  });

  // Open accordion when expand is clicked
  expand.addEventListener("click", async () => {
    body.style.height = "550px";
    body.style.width = "600px";
    iframe.style.width = "545px";
    browser.style.display = "block";
    collapse.style.display = "block";
    expand.style.display = "none";
  });

  // When collapse is clicked, close accordion
  collapse.addEventListener("click", async () => {
    body.style.height = "157px";
    body.style.width = "220px";
    iframe.style.width = "170px";
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
    subscribedShowsData = myShowsData;
    console.log("myShowsData", myShowsData);
    createMyShowButtons(myShowsData, accessToken);

    // Fetch recommended shows
    // Fetch and display recommended shows based on the selected country
    if (selectedCountry) {
      const recShowsData = await fetchRandomRecommendedShows(selectedCountry);

      // Handle recommendedShows data and update your UI accordingly
      console.log("recShowsData", recShowsData);
      createShowButtons(recShowsData, accessToken);
    } else {
      console.error("No selected country found.");
    }
    // const recShowsData = await fetchRandomRecommendedShows(selectedCountry);
    // console.log("recShowsData", recShowsData);
    // createShowButtons(recShowsData, accessToken);
  } else {
    authenticate();
    // // Token is expired or not available, show the authorization link
    // console.log("token invalid");
    // auth.style.display = "block";
    // mainContainer.style.display = "none";
    // authLink.href = authUrl;
    // authLink.textContent = "Authorize with Spotify";

    // // Click event listener to the link
    // authLink.addEventListener("click", async (event) => {
    //   event.preventDefault();
    //   window.location.href = authUrl;

    //   const authorizationCode = new URLSearchParams(window.location.search).get(
    //     "code"
    //   );
    //   if (authorizationCode) {
    //     console.log("auth obtained, waiting for token validation");
    //     const tokenResponse = await exchangeAuthorizationCode(
    //       authorizationCode
    //     );

    //     if (!tokenResponse) {
    //       console.log("token exchange failed");
    //       // Token exchange failed, show the authorization link again
    //       auth.style.display = "block";
    //       mainContainer.style.display = "none";
    //     } else if (tokenResponse.access_token) {
    //       const expirationTimestamp =
    //         Date.now() + tokenResponse.expires_in * 1000;

    //       // Store the access token and its expiration timestamp in the extension's storage
    //       chrome.storage.local.set(
    //         {
    //           accessToken: tokenResponse.access_token,
    //           tokenExpiration: expirationTimestamp,
    //         },
    //         function () {
    //           console.log("Access token stored.");
    //           // Initialize popup after storing the token
    //           initializePopup();
    //         }
    //       );
    //     }
    //   }
    // });
  }
}

// Initialize the popup when the DOM is ready
document.addEventListener("DOMContentLoaded", async function () {
  console.log("page loaded");
  initializePopup();
});

export { subscribedShowsData };
