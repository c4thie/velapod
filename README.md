# Spot the Pod

A Chrome extension for discovering podcasts and listening through Spotify.

## In 2.0

- Chrome Manifest V3 with only `storage` and `identity` permissions
- Spotify Authorization Code with PKCE; no client secret or localhost backend
- recommendations and manual language selection
- podcast search, episode browsing
- no content scripts, browsing-history access, remote JavaScript

## Configuration

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Load this directory from `chrome://extensions` using **Load unpacked**.
3. Open the extension's **Developer setup** page and copy its redirect URI.
4. Add that exact HTTPS URI to the Spotify app's redirect URI allowlist.
5. Paste the Spotify client ID into Developer setup and save.

## Privacy

See [PRIVACY.md](PRIVACY.md). Host the same policy at a public URL and add it to the Chrome Web Store listing before submission.
