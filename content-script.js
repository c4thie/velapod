// Function to exchange authorization code for access token
async function exchangeAuthorizationCode(authorizationCode) {
    const tokenUrl = 'https://open.spotify.com/get_access_token?reason=transport&productType=web_player';
  
    const response = await fetch(tokenUrl, {
      method: "GET",
    });
  
    if (!response.ok) {
      new Error(response.message);
      console.error(response.message);
      console.log("authorization failed");
    //   chrome.tabs.create({ url: authUrl });
    }
  
    const tokenResponse = await response.accessToken.json();
    return tokenResponse;
  }

