import { showEpisodeDescription } from "./src/popup.js";

// Handle the message from the content script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // Open the popup page with the captured code
  if (message.authorizationCode) {
    chrome.action.setPopup({ popup: "popup.html" });
    chrome.action.openPopup();
  }
});

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

chrome.contextMenus.removeAll(function () {
  chrome.contextMenus.create({
    id: "1",
    title: "See Episode Description",
    contexts: ["selection"], // ContextType
  });
});

chrome.contextMenus.onClicked.addListener(showEpisodeDescription);
