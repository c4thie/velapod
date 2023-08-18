// Create a custom context menu
export function createContextMenu(description) {
  // Generate a unique id for the context menu item
  const contextMenuId = `episodeContextMenu`;

  // Remove any existing context menus with the same id
  chrome.contextMenus.remove(contextMenuId);

  // Create a context menu item
  chrome.contextMenus.create({
    id: contextMenuId,
    title: "See Description",
    contexts: ["selection"],
    // callback: () => {
    //   chrome.contextMenus.onClicked.addListener((info, tab) => {
    //     console.log(info);
    //     console.log(info.description);
    //     if (info.menuItemId === "episodeContextMenu") {
    //       showEpisodeDescription(description);
    //     }
    //   });
    // },
  });
}

// Handle context menu item clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // chrome.localStorage.getItem(accessToken).then(async (accessToken) => {
  //   // Extract the showId from the menu item id
  //   const showId = info.menuItemId.replace("episodeContextMenu_", "");
  //   const episodes = await fetchEpisodes(showId, accessToken);
  //   const description = episodes.description;

  console.log(info);
  console.log(info.description);
  if (info.menuItemId === "episodeContextMenu") {
    showEpisodeDescription(info.description);
  }
});
