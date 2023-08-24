import { initializePopup } from "./popup.js";
import { markets } from "./constants/markets.js";

import { getAuthInfo, fetchToken, authorize } from "./api.js";

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

// // Function to exchange authorization code for access token
// export async function exchangeAuthorizationCode(authorizationCode) {
//   const tokenUrl = "https://accounts.spotify.com/api/token";
//   const tokenRequestBody = new URLSearchParams({
//     grant_type: "authorization_code",
//     code: authorizationCode,
//     redirect_uri: redirectUri,
//     client_id: client_id,
//     client_secret: client_secret,
//   });

//   const response = await fetch(tokenUrl, {
//     method: "POST",
//     headers: {
//       Authorization: "Basic " + btoa(`${client_id}:${client_secret}`),
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     body: tokenRequestBody.toString(),
//   });

//   if (!response.ok) {
//     console.error(response.message);
//     return null;
//   }

//   const tokenResponse = await response.json();
//   return tokenResponse;
// }

// export function authenticate() {
//   const authLink = document.getElementById("auth-link");
//   const auth = document.querySelector(".non-authorized");
//   const mainContainer = document.querySelector(".main-container");
//   const browser = document.querySelector(".podcast-selection-body");
//   const shuffle = document.querySelector(".shuffle");
//   const collapse = document.querySelector(".collapse");
//   const expand = document.querySelector(".expand");

//   const select = document.querySelector("select");

//   markets.forEach((marketObj) => {
//     const option = document.createElement("option");
//     option.value = marketObj.code;
//     option.textContent = marketObj.label;
//     select.appendChild(option);
//   });

//   // initially hide expand icon
//   expand.style.display = "none";

//   // Token is expired or not available, show the authorization link
//   console.log("token invalid");
//   auth.style.display = "flex";
//   mainContainer.style.display = "none";
//   authLink.href = authUrl;
//   authLink.textContent = "Authorize with Spotify";

//   // Click event listener to the link
//   authLink.addEventListener("click", async (event) => {
//     event.preventDefault();
//     window.location.href = authUrl;

//     const authorizationCode = new URLSearchParams(window.location.search).get(
//       "code"
//     );
//     if (authorizationCode) {
//       console.log("auth obtained, waiting for token validation");
//       const tokenResponse = await exchangeAuthorizationCode(authorizationCode);

//       if (!tokenResponse) {
//         console.log("token exchange failed");
//         // Token exchange failed, show the authorization link again
//         auth.style.display = "flex";
//         mainContainer.style.display = "none";
//       } else if (tokenResponse.access_token) {
//         const expirationTimestamp =
//           Date.now() + tokenResponse.expires_in * 1000;

//         // Store the access token and its expiration timestamp in the extension's storage
//         chrome.storage.local.set(
//           {
//             accessToken: tokenResponse.access_token,
//             tokenExpiration: expirationTimestamp,
//           },
//           function () {
//             console.log("Access token stored.");
//             // Initialize popup after storing the token
//             initializePopup();
//           }
//         );

//         // Store selected country in local storage
//         const selectedCountry = select.value;
//         localStorage.setItem("selectedCountry", selectedCountry);
//         console.log("set selectedCountry on submit", selectedCountry);
//       }
//     }
//   });

//   // Event listener for select element
//   select.addEventListener("change", (event) => {
//     const selectedCountry = event.target.value;
//     localStorage.setItem("selectedCountry", selectedCountry);
//     console.log("set selectedCountry", selectedCountry);
//   });
// }

// No client credentials or authorization logic here
// Communicate with your server's endpoints for authorization

function getHashParams() {
  var hashParams = {};
  var e,
    r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
  while ((e = r.exec(q))) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

export async function redirectToAuthCodeFlow() {
  console.log("oauth.js: intializeAuthorization function called");
  const redirectUri = chrome.runtime.getURL("popup.html");
  const response = await authorize(redirectUri);

  if (response) {
    console.log("oauth.js: got response from authorize:", response);
    const authUrl = await response.text();
    console.log("oauth.js: got authURL from response of auth:", authUrl);
    window.location.href = authUrl;

    // const authorizationCode = new URLSearchParams(authUrl).get("code");
    // console.log("oauth.js: authorizationCode: " + authorizationCode);
  } else {
    console.log("oauth.js: error getting response from authorize", response);
  }

  // var params = getHashParams();

  // var access_token = params.access_token,
  //   refresh_token = params.refresh_token,
  //   error = params.error;

  // if (error) {
  //   alert("There was an error during the authentication");
  // } else {
  //   if (access_token) {
  //     localStorage.setItem("access_token", access_token);
  //     localStorage.setItem("refresh_token", refresh_token);
  //     //         localStorage.setItem("tokenExpiration", expirationTimestamp);
  //     //         console.log(
  //     //           "oauth.js: Access token stored, access_token, tokenExpiration: " +
  //     //             JSON.stringify(tokenResponse)
  //     // //         );
  //   }
  // }

  // if (response) {
  //   console.log("oauth.js: got response from login");
  //   const authUrl = await response.text();
  //   if (authUrl) {
  //     console.log("oauth.js: got authURL from response of auth:", authUrl);
  //     window.location.href = authUrl;

  //     const authorizationCode = new URLSearchParams(window.location.search).get(
  //       "code"
  //     );

  //     if (authorizationCode) {
  //       console.log(
  //         "oauth.js: authorizationCode obtained, waiting for token validation:",
  //         authorizationCode
  //       );
  //       const tokenResponse = await fetchToken(authorizationCode, redirectUri);

  //       if (tokenResponse && tokenResponse.access_token) {
  //         console.log(
  //           "oauth.js: token response retrieved successfully",
  //           tokenResponse
  //         );
  //         const expirationTimestamp =
  //           Date.now() + tokenResponse.expires_in * 1000;

  //         // Store the access token and its expiration timestamp in the extension's storage
  //         // chrome.storage.local.set(
  //         //   {
  //         //     accessToken: tokenResponse.access_token,
  //         //     tokenExpiration: expirationTimestamp,
  //         //   },
  //         //   function () {
  //         //     console.log("oauth.js: Access token stored.");
  //         //     // Initialize popup after storing the token
  //         //     initializePopup();
  //         //   }
  //         // );
  //         localStorage.setItem("access_token", tokenResponse.access_token);
  //         localStorage.setItem("tokenExpiration", expirationTimestamp);
  //         console.log(
  //           "oauth.js: Access token stored, access_token, tokenExpiration: " +
  //             JSON.stringify(tokenResponse)
  //         );

  //         // Initialize popup after storing the token
  //         // initializePopup();
  //       }
  //       console.log("oauth.js: token response was not found", tokenResponse);
  //     } else {
  //       console.log(
  //         "oauth.js: couldn't find authentication code, restarting authcodeflow"
  //       );
  //       // await redirectToAuthCodeFlow();
  //     }
  //   }
  // }
}
