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
