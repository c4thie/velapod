# Spot the Pod

A Chrome extension for discovering podcasts and listening to episodes while browsing. It requires no user account, subscription, API key, or developer setup.

## Features

- podcast discovery
- language-aware recommendations and search
- short, medium, and long episode filters
- episode playback from podcast publishers
- rotating recommendations and selected-text context search
- automatic catalogue storefront selection from the browser locale
- no analytics, application server, or account system
- Chrome Manifest V3 with only `storage` and `contextMenus` permissions

Podcast metadata is provided by Apple's public Search API. Apple documents country-specific podcast search and JSON results in its [Search API documentation](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/Searching.html).

## Run locally

1. Open `chrome://extensions` (or Chromium browser Manage Extensions page).
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose this repository's root directory.

No configuration is required. Reload the extension card after making code changes.
