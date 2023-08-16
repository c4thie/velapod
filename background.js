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

// chrome.runtime.onInstalled.addListener(function () {
//   // Make extension work on all pages
//   chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
//     chrome.declarativeContent.onPageChanged.addRules([
//       {
//         conditions: [new chrome.declarativeContent.PageStateMatcher({})],
//         actions: [new chrome.declarativeContent.ShowPageAction()],
//       },
//     ]);
//   });
// });

// // Function to exchange authorization code for access token
// async function exchangeAuthorizationCode(authorizationCode) {
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
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     body: tokenRequestBody.toString(),
//   });

//   const tokenResponse = await response.json();
//   return tokenResponse;
// }

// // Function to send a message to popup script
// function sendMessageToPopup(action, data) {
//   chrome.runtime.sendMessage(chrome.runtime.id, { action, ...data });
// }

// // Handle the authorization code when received
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.action === "handleAuthorizationCode") {
//     const authorizationCode = request.authorizationCode;
//     if (authorizationCode) {
//       exchangeAuthorizationCode(authorizationCode).then((tokenResponse) => {
//         if (tokenResponse.access_token) {
//           // Store the access token in the extension's storage
//           chrome.storage.local.set(
//             { accessToken: tokenResponse.access_token },
//             function () {
//               console.log("Access token stored.");
//             }
//           );
//           // Notify the popup that the access token has been set
//           sendMessageToPopup("setAccessToken", {
//             accessToken: tokenResponse.access_token,
//           });
//         }
//       });
//     }
//   }
// });
