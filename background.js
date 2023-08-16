chrome.runtime.onInstalled.addListener(function () {
  // Set up rules for declarativeContent
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {},
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });
});

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

const authLink = document.getElementById("auth-link");

// Handle the authorization link click event
authLink.addEventListener("click", async function (event) {
  // Prevent the default behavior of following the link
  event.preventDefault();
  // Open the auth url
  window.location.href = authUrl;

  const authorizationCode = new URLSearchParams(window.location.search).get(
    "code"
  );

  // After the redirection, send a message to the popup script
  chrome.runtime.sendMessage({
    type: "authorizationRedirect",
    authorizationCode: authorizationCode,
    redirectedUrl: window.location.href,
  });
});
