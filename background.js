const MENU_ID = "spot-the-pod-search-selection";

function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Find podcasts about “%s”",
      contexts: ["selection"],
    });
  });
}

chrome.runtime.onInstalled.addListener(createContextMenu);
chrome.runtime.onStartup.addListener(createContextMenu);
chrome.contextMenus.onClicked.addListener(async (info) => {
  const selection = info.selectionText?.trim();
  if (!selection || info.menuItemId !== MENU_ID) return;
  const query = new URLSearchParams({ q: selection });
  await chrome.storage.local.set({ pendingContextQuery: selection });
  if (chrome.action?.openPopup) {
    try {
      await chrome.action.openPopup();
      return;
    } catch {
      // Fall back to a compact extension popup window on older Chrome versions.
    }
  }
  await chrome.windows.create({
    url: chrome.runtime.getURL(`popup.html?${query}`),
    type: "popup",
    width: 420,
    height: 700,
    focused: true,
  });
});

createContextMenu();
