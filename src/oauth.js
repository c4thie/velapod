import { initializePopup } from "./popup.js";
import { markets } from "./constants/markets.js";

// Authorization tokens to access API
const client_secret = "64caa2f4522e4d13ad19daa9b61f7c2a";
var client_id = "ee8e41e49dfb47b29f9e6d19e316e753";
const redirectUri = chrome.runtime.getURL("popup.html");
console.log(redirectUri);
const scope = "user-library-modify user-library-read";
var accessToken = undefined;

// Construct the authorization URL
export const authUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(
  redirectUri
)}&scope=${encodeURIComponent(scope)}&response_type=code`;

// Function to exchange authorization code for access token
export async function exchangeAuthorizationCode(authorizationCode) {
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

export function authenticate() {
  const authLink = document.getElementById("auth-link");
  const auth = document.querySelector(".non-authorized");
  const mainContainer = document.querySelector(".main-container");
  const browser = document.querySelector(".podcast-selection-body");
  const shuffle = document.querySelector(".shuffle");
  const collapse = document.querySelector(".collapse");
  const expand = document.querySelector(".expand");

  const select = document.querySelector("select");

  markets.forEach((marketObj) => {
    const option = document.createElement("option");
    option.value = marketObj.code;
    option.textContent = marketObj.label;
    select.appendChild(option);
  });

  // initially hide expand icon
  expand.style.display = "none";

  // Token is expired or not available, show the authorization link
  console.log("token invalid");
  auth.style.display = "flex";
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
      const tokenResponse = await exchangeAuthorizationCode(authorizationCode);

      if (!tokenResponse) {
        console.log("token exchange failed");
        // Token exchange failed, show the authorization link again
        auth.style.display = "flex";
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

        // Store selected country in local storage
        const selectedCountry = select.value;
        localStorage.setItem("selectedCountry", selectedCountry);
        console.log("set selectedCountry on submit", selectedCountry);
      }
    }
  });

  // Event listener for select element
  select.addEventListener("change", (event) => {
    const selectedCountry = event.target.value;
    localStorage.setItem("selectedCountry", selectedCountry);
    console.log("set selectedCountry", selectedCountry);
  });
}
