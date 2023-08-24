// Imports
import {
  fetchRandomRecommendedShows,
  fetchSubscribedShows,
  fetchToken,
} from "./api.js";
// import { createContextMenu } from "./context-menu.js";
import { redirectToAuthCodeFlow } from "./oauth.js";
import { createShowButtons, createMyShowButtons } from "./create-buttons.js";
import { markets } from "./constants/markets.js";

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

  // Additional formatting for popup
  const body = document.querySelector("body");
  const iframe = document.querySelector("iframe");

  // initially make sure limitMessage is blank
  limitMessage.innerHTML = "";

  // initially hide expand icon
  expand.style.display = "none";

  // Get the access token and its expiration timestamp from local storage
  // const storageData = await new Promise((resolve) => {
  //   chrome.storage.local.get(["accessToken", "tokenExpiration"], (result) =>
  //     resolve(result)
  //   );
  // });
  const accessToken = localStorage.getItem("access_token");
  const tokenExpiration = localStorage.getItem("tokenExpiration");
  console.log(
    "accessToken, tokenExpiration, dateNOW",
    accessToken,
    tokenExpiration,
    Date.now()
  );

  const selectedCountry = localStorage.getItem("selectedCountry");

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
    if (selectedCountry) {
      const recShowsData = await fetchRandomRecommendedShows(selectedCountry);

      // Handle recommendedShows data and update your UI accordingly
      console.log("recShowsData", recShowsData);
      createShowButtons(recShowsData, accessToken);
    } else {
      console.error("No selected country found.");
    }
  } else {
    // Token is expired or not available, show the authorization link
    console.log("token invalid");
    auth.style.display = "flex";
    mainContainer.style.display = "none";

    // Create options for country selection
    const select = document.querySelector("select");

    markets.forEach((marketObj) => {
      const option = document.createElement("option");
      option.value = marketObj.code;
      option.textContent = marketObj.label;
      select.appendChild(option);
    });

    // Event listener for select element
    select.addEventListener("change", (event) => {
      const selectedCountry = event.target.value;
      localStorage.setItem("selectedCountry", selectedCountry);
      console.log("set selectedCountry", selectedCountry);
    });

    authLink.textContent = "Authorize with Spotify";

    // Click event listener to the link
    authLink.addEventListener("click", async (event) => {
      event.preventDefault();
      console.log("authLink clicked");
      await redirectToAuthCodeFlow();
      // After successful authorization, the page will be redirected
      // and the initializePopup function will be called again with a valid token
    });
  }
}

// Initialize the popup when the DOM is ready
document.addEventListener("DOMContentLoaded", async function () {
  console.log("page loaded");
  initializePopup();
});

// popup.js
window.onload = async function () {
  // Function to extract query parameters from the URL
  function getQueryParam(url, name) {
    const params = new URLSearchParams(new URL(url).search);
    return params.get(name);
  }

  // Get the authorization code from the URL
  const authorizationCode = getQueryParam(window.location.href, "code");
  const redirectUri = chrome.runtime.getURL("popup.html");

  if (authorizationCode) {
    // Authorization code is available, send it to backend for token exchange using an API call.
    console.log("popup.js: Authorization Code:", authorizationCode);

    const tokenResponse = await fetchToken(authorizationCode, redirectUri);
    if (tokenResponse && tokenResponse.access_token) {
      console.log(
        "popup.js: token response retrieved successfully",
        tokenResponse
      );
      const expirationTimestamp = Date.now() + tokenResponse.expires_in * 1000;

      // Store the access token and its expiration timestamp in the extension's storage
      chrome.storage.local.set(
        {
          accessToken: tokenResponse.access_token,
          tokenExpiration: expirationTimestamp,
        },
        function () {
          console.log("oauth.js: Access token stored.");
          // Initialize popup after storing the token
          initializePopup();
        }
      );
      localStorage.setItem("access_token", tokenResponse.access_token);
      localStorage.setItem("tokenExpiration", expirationTimestamp);
      console.log(
        "popup.js: Access token stored, access_token, tokenExpiration: " +
          JSON.stringify(tokenResponse)
      );

      // Initialize popup after storing the token
      // initializePopup();
    } else {
      console.log("popup.js: token response was not found", tokenResponse);
      // } else {
      //   console.log(
      //     "oauth.js: couldn't find authentication code, restarting authcodeflow"
      //   );
      //   // await redirectToAuthCodeFlow();
      // }
    }
  } else {
    console.log(
      "popup.js: No authorization code found in the URL.",
      authorizationCode
    );
  }
};

// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   const tab = tabs[0];
//   chrome.tabs.update(tab.id, { url: "popup.html" });
// });

export { subscribedShowsData };
