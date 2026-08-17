import { getAccessToken } from "./auth.js";
import { languageSearchTermsFor, matchesLanguage } from "./languages.js";
const API = "https://api.spotify.com/v1";
async function spotify(path) {
  const token = await getAccessToken(); if (!token) throw new Error("Connect Spotify to continue.");
  const response = await fetch(`${API}${path}`, { headers:{ Authorization:`Bearer ${token}` } });
  if (response.status === 401) { await chrome.storage.local.remove("spotifyToken"); throw new Error("Your Spotify session expired. Connect again."); }
  if (response.status === 429) throw new Error("Spotify is busy. Please try again shortly.");
  if (!response.ok) throw new Error(`Spotify request failed (${response.status}).`);
  return response.json();
}
export async function searchShows(query, market, limit=8, offset=0, language="") {
  // Language filtering happens after Spotify returns the catalogue page. Ask
  // for a wider page when a filter is active so a matching show ranked below
  // the first few results is not discarded before we can inspect it.
  // Spotify reduced Search's maximum page size to 10 in February 2026.
  const requestLimit = Math.min(10, language ? 10 : limit);
  const params = new URLSearchParams({ q:query, type:"show", market, limit:String(requestLimit), offset:String(offset) });
  const data = await spotify(`/search?${params}`);
  return data.shows?.items?.filter((show) => show && matchesLanguage(show, language)).slice(0, limit) || [];
}
export async function recommendedShows(market, cycle=0, language="") {
  const themes = ["news","comedy","culture","science","stories","technology","history","wellness"];
  const first = Math.abs(cycle) % themes.length; const queries = [themes[first], themes[(first+3)%themes.length]];
  const targetedQueries = languageSearchTermsFor(language);
  // Keep the selected language in every rotating query. Previously the same
  // static language query dominated each refresh and Spotify returned the
  // same first page repeatedly.
  const allQueries = language
    ? targetedQueries.flatMap((term) => queries.map((theme) => `${term} ${theme}`))
    : queries;
  const limit = language ? 10 : 6;
  const offset = Math.floor(Math.abs(cycle) / themes.length) * 5 % 50;
  const batches = await Promise.all(allQueries.map((query) => searchShows(query, market, limit, offset, language)));
  return [...new Map(batches.flat().map((show) => [show.id,show])).values()].slice(0,8);
}
export async function getEpisodes(showId, market, language="") {
  const params = new URLSearchParams({ market, limit:"20" }); const data = await spotify(`/shows/${encodeURIComponent(showId)}/episodes?${params}`);
  return data.items?.filter((episode) => episode && matchesLanguage(episode, language)) || [];
}
