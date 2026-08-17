import { connect, getAccessToken } from "./auth.js";
import { getEpisodes, recommendedShows, searchShows } from "./api.js";
import { languageName, supportedLanguages } from "./languages.js";
import { localeMarket, supportedMarkets } from "./location.js";

const $ = (selector) => document.querySelector(selector);
const elements = { setup:$("#setup"), app:$("#app"), status:$("#status"), market:$("#market"), language:$("#language"), search:$("#search"), marketName:$("#market-name"), shows:$("#shows"), showsSection:$("#shows-section"), episodes:$("#episodes"), episodesSection:$("#episodes-section"), episodesTitle:$("#episodes-title"), playerSection:$("#player-section"), player:$("#player"), nowPlaying:$("#now-playing"), resultsTitle:$("#results-title"), resultsKicker:$("#results-kicker") };
let market = "US"; let language = ""; let recommendationSeed = Date.now();
let contextQuery = new URLSearchParams(window.location.search).get("q")?.trim() || "";

function setStatus(message="",error=false) { elements.status.textContent=message; elements.status.classList.toggle("error",error); }
function imageFor(item) { return item.images?.[0]?.url || "icons/256.png"; }
function marketName(code) { return supportedMarkets.find((item)=>item.code===code)?.name || code; }
function setMarket(code) { market=code; elements.market.value=code; elements.marketName.textContent=marketName(code); chrome.storage.local.set({selectedMarket:code}); }
function setLanguage(code) { language=supportedLanguages.some((item)=>item.code===code) ? code : ""; elements.language.value=language; chrome.storage.local.set({selectedLanguage:language}); }
function showSetup() { elements.setup.classList.remove("hidden"); elements.app.classList.add("hidden"); }
function showApp() { elements.setup.classList.add("hidden"); elements.app.classList.remove("hidden"); }

function renderShows(shows) {
  elements.shows.replaceChildren();
  if (!shows.length) { setStatus(language ? `No ${languageName(language)} podcasts found. Try another language or market.` : "No podcasts found. Try another search or market."); return; }
  for (const show of shows) {
    const button=document.createElement("button"); button.className="show-card"; button.type="button";
    const image=document.createElement("img"); image.src=imageFor(show); image.alt="";
    const title=document.createElement("span"); title.textContent=show.name; button.append(image,title);
    button.addEventListener("click",()=>openShow(show)); elements.shows.append(button);
  }
}
function renderEpisodes(episodes) {
  elements.episodes.replaceChildren();
  if (!episodes.length) { setStatus(language ? `No ${languageName(language)} episodes are available for this show.` : "No playable episodes are available in this market."); return; }
  for (const episode of episodes) {
    const button=document.createElement("button"); button.className="episode"; button.type="button";
    const image=document.createElement("img"); image.src=imageFor(episode); image.alt="";
    const body=document.createElement("span"); const title=document.createElement("strong"); title.textContent=episode.name;
    const meta=document.createElement("small"); const minutes=Math.max(1,Math.round((episode.duration_ms||0)/60000)); meta.textContent=`${episode.release_date||""} · ${minutes} min`;
    body.append(title,meta); button.append(image,body); button.addEventListener("click",()=>playEpisode(episode)); elements.episodes.append(button);
  }
}
async function loadRecommendations() {
  setStatus(language ? `Finding ${languageName(language)} podcasts available in your selected market…` : "Finding podcasts available in your selected market…"); elements.showsSection.classList.remove("hidden"); elements.episodesSection.classList.add("hidden");
  try { renderShows(await recommendedShows(market,recommendationSeed,language)); if (elements.shows.children.length) setStatus(""); }
  catch(error) { setStatus(error.message,true); if(error.message.includes("Connect")) showSetup(); }
}
async function runSearch(query, kicker="SPOTIFY SEARCH") {
  const trimmed=query.trim();
  if (!trimmed) { contextQuery=""; elements.search.value=""; elements.resultsTitle.textContent="Recommended podcasts"; elements.resultsKicker.textContent="FOR YOUR MARKET"; return loadRecommendations(); }
  contextQuery=trimmed; elements.search.value=trimmed; setStatus("Searching Spotify…"); elements.resultsTitle.textContent=`Results for “${trimmed}”`; elements.resultsKicker.textContent=kicker; elements.showsSection.classList.remove("hidden"); elements.episodesSection.classList.add("hidden");
  try { renderShows(await searchShows(trimmed,market,10,0,language)); if (elements.shows.children.length) setStatus(""); }
  catch(error) { setStatus(error.message,true); }
}
async function refreshResults() { return contextQuery ? runSearch(contextQuery,"CONTEXT DISCOVERY") : loadRecommendations(); }
async function openShow(show) {
  setStatus("Loading episodes…"); elements.episodesTitle.textContent=show.name; elements.showsSection.classList.add("hidden"); elements.episodesSection.classList.remove("hidden");
  try { renderEpisodes(await getEpisodes(show.id,market,language)); if (elements.episodes.children.length) setStatus(""); } catch(error) { setStatus(error.message,true); }
}
function playEpisode(episode) {
  elements.nowPlaying.textContent=episode.name; elements.player.src=`https://open.spotify.com/embed/episode/${encodeURIComponent(episode.id)}?utm_source=spot_the_pod&theme=0`; elements.playerSection.classList.remove("hidden"); window.scrollTo({top:0,behavior:"smooth"});
}
async function initialize() {
  for (const item of supportedMarkets) { const option=document.createElement("option"); option.value=item.code; option.textContent=item.code; option.title=item.name; elements.market.append(option); }
  for (const item of supportedLanguages) { const option=document.createElement("option"); option.value=item.code; option.textContent=item.name; elements.language.append(option); }
  const {selectedMarket,selectedLanguage,pendingContextQuery} = await chrome.storage.local.get(["selectedMarket","selectedLanguage","pendingContextQuery"]);
  if (!contextQuery && pendingContextQuery) { contextQuery=pendingContextQuery.trim(); await chrome.storage.local.remove("pendingContextQuery"); }
  setMarket(selectedMarket || localeMarket()); setLanguage(selectedLanguage || "");
  if (!(await getAccessToken())) { showSetup(); return; } showApp(); if (contextQuery) await runSearch(contextQuery,"CONTEXT DISCOVERY"); else await loadRecommendations();
}

$("#connect").addEventListener("click",async()=>{ setStatus(""); try { await connect(); showApp(); await refreshResults(); } catch(error) { elements.setup.querySelector("p").textContent=error.message; } });
$("#settings").addEventListener("click",()=>chrome.runtime.openOptionsPage()); $("#configure").addEventListener("click",()=>chrome.runtime.openOptionsPage());
elements.market.addEventListener("change",async(event)=>{ setMarket(event.target.value); recommendationSeed=Date.now(); await refreshResults(); });
elements.language.addEventListener("change",async(event)=>{ setLanguage(event.target.value); recommendationSeed=Date.now(); await refreshResults(); });
$("#refresh").addEventListener("click",async()=>{ recommendationSeed=Date.now(); await refreshResults(); });
$("#back").addEventListener("click",()=>{ elements.episodesSection.classList.add("hidden"); elements.showsSection.classList.remove("hidden"); setStatus(""); });
$("#close-player").addEventListener("click",()=>{ elements.player.src="about:blank"; elements.playerSection.classList.add("hidden"); });
$("#search-form").addEventListener("submit",async(event)=>{ event.preventDefault(); await runSearch(elements.search.value); });
initialize();
