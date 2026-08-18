import { getEpisodes, recommendedShows, searchShows } from "./api.js";
import { languageName, supportedLanguages } from "./languages.js";
import { localeMarket } from "./location.js";

const $ = (selector) => document.querySelector(selector);
const elements = { app:$("#app"), status:$("#status"), language:$("#language"), duration:$("#duration"), search:$("#search"), shows:$("#shows"), showsSection:$("#shows-section"), episodes:$("#episodes"), episodesSection:$("#episodes-section"), episodesTitle:$("#episodes-title"), playerSection:$("#player-section"), player:$("#player"), nowPlaying:$("#now-playing"), resultsTitle:$("#results-title"), resultsKicker:$("#results-kicker") };
let market = localeMarket(); let language = ""; let duration = ""; let recommendationCycle = 0; let searchOffset = 0; let currentEpisodes = []; let playingEpisodeId = "";
let contextQuery = new URLSearchParams(window.location.search).get("q")?.trim() || "";

function setStatus(message="",error=false) { elements.status.textContent=message; elements.status.classList.toggle("error",error); }
function imageFor(item) { return item.images?.[0]?.url || ""; }
function setLanguage(code) { language=supportedLanguages.some((item)=>item.code===code) ? code : ""; elements.language.value=language; chrome.storage.local.set({selectedLanguage:language}); }
function setDuration(value) { duration=["short","medium","long"].includes(value) ? value : ""; elements.duration.value=duration; chrome.storage.local.set({selectedDuration:duration}); }
function matchesDuration(episode) {
  if (!duration) return true;
  const minutes=(episode.duration_ms || 0)/60000;
  if (!minutes) return false;
  if (duration==="short") return minutes<20;
  if (duration==="medium") return minutes>=20 && minutes<=45;
  return minutes>45;
}

function renderShows(shows) {
  elements.shows.replaceChildren();
  if (!shows.length) { setStatus(language ? `No ${languageName(language)} podcasts found. Try another language.` : "No podcasts found. Try another search."); return; }
  for (const show of shows) {
    const card=document.createElement("article"); card.className="show-card";
    const button=document.createElement("button"); button.className="show-open"; button.type="button";
    const artwork=imageFor(show); const image=document.createElement("img"); image.alt=""; if (artwork) image.src=artwork;
    const title=document.createElement("span"); title.textContent=show.name; if (artwork) button.append(image); button.append(title);
    const link=document.createElement("a"); link.className="catalog-link"; link.href=show.externalUrl; link.target="_blank"; link.rel="noopener noreferrer"; link.textContent="View on Apple Podcasts ↗";
    button.addEventListener("click",()=>openShow(show)); card.append(button,link); elements.shows.append(card);
  }
}
function renderEpisodes(episodes) {
  elements.episodes.replaceChildren();
  const filtered=episodes.filter(matchesDuration);
  if (!filtered.length) { setStatus(duration ? "No episodes match that length. Try another duration." : (language ? `No ${languageName(language)} episodes are available for this show.` : "No playable episodes are available for this show.")); return; }
  for (const episode of filtered) {
    const card=document.createElement("article"); card.className="episode-card";
    const button=document.createElement("button"); button.className="episode"; button.type="button";
    const artwork=imageFor(episode); const image=document.createElement("img"); image.alt=""; if (artwork) image.src=artwork;
    const body=document.createElement("span"); const title=document.createElement("strong"); title.textContent=episode.name;
    const meta=document.createElement("small"); const minutes=Math.max(1,Math.round((episode.duration_ms||0)/60000)); meta.textContent=`${episode.release_date||""} · ${minutes} min`;
    const link=document.createElement("a"); link.className="catalog-link"; link.href=episode.externalUrl; link.target="_blank"; link.rel="noopener noreferrer"; link.textContent="View on Apple Podcasts ↗";
    body.append(title,meta); if (artwork) button.append(image); button.append(body); button.addEventListener("click",()=>playEpisode(episode)); card.append(button,link); elements.episodes.append(card);
  }
}
async function loadRecommendations() {
  setStatus(language ? `Finding ${languageName(language)} podcasts…` : "Finding podcasts…"); elements.showsSection.classList.remove("hidden"); elements.episodesSection.classList.add("hidden");
  try { renderShows(await recommendedShows(market,recommendationCycle,language)); if (elements.shows.children.length) setStatus(""); }
  catch(error) { setStatus(error.message,true); }
}
async function runSearch(query, kicker="PODCAST SEARCH", offset=0) {
  const trimmed=query.trim();
  if (!trimmed) { contextQuery=""; elements.search.value=""; elements.resultsTitle.textContent="Recommended podcasts"; elements.resultsKicker.textContent="DISCOVER"; return loadRecommendations(); }
  contextQuery=trimmed; elements.search.value=trimmed; setStatus("Searching podcasts…"); elements.resultsTitle.textContent=`Results for “${trimmed}”`; elements.resultsKicker.textContent=kicker; elements.showsSection.classList.remove("hidden"); elements.episodesSection.classList.add("hidden");
  try { renderShows(await searchShows(trimmed,market,10,offset,language)); if (elements.shows.children.length) setStatus(""); }
  catch(error) { setStatus(error.message,true); }
}
async function refreshResults() { return contextQuery ? runSearch(contextQuery,"CONTEXT DISCOVERY",searchOffset) : loadRecommendations(); }
async function openShow(show) {
  setStatus("Loading episodes…"); elements.episodesTitle.textContent=show.name; elements.showsSection.classList.add("hidden"); elements.episodesSection.classList.remove("hidden");
  try { currentEpisodes=await getEpisodes(show.id,market,language); renderEpisodes(currentEpisodes); if (elements.episodes.children.length) setStatus(""); } catch(error) { setStatus(error.message,true); }
}
function playEpisode(episode) {
  playingEpisodeId=episode.id; elements.nowPlaying.textContent=episode.name; elements.player.src=episode.audioUrl; elements.playerSection.classList.remove("hidden"); elements.player.play().catch(()=>{}); window.scrollTo({top:0,behavior:"smooth"});
}
async function initialize() {
  await chrome.storage.local.remove("selectedMarket");
  for (const item of supportedLanguages) { const option=document.createElement("option"); option.value=item.code; option.textContent=item.name; elements.language.append(option); }
  const {selectedLanguage,selectedDuration,pendingContextQuery} = await chrome.storage.local.get(["selectedLanguage","selectedDuration","pendingContextQuery"]);
  if (!contextQuery && pendingContextQuery) { contextQuery=pendingContextQuery.trim(); await chrome.storage.local.remove("pendingContextQuery"); }
  setLanguage(selectedLanguage || ""); setDuration(selectedDuration || "");
  if (contextQuery) await runSearch(contextQuery,"CONTEXT DISCOVERY"); else await loadRecommendations();
}

$("#settings").addEventListener("click",()=>chrome.runtime.openOptionsPage());
elements.language.addEventListener("change",async(event)=>{ setLanguage(event.target.value); recommendationCycle=0; searchOffset=0; await refreshResults(); });
elements.duration.addEventListener("change",(event)=>{ setDuration(event.target.value); if (!elements.episodesSection.classList.contains("hidden")) { setStatus(""); renderEpisodes(currentEpisodes); } });
$("#refresh").addEventListener("click",async()=>{ recommendationCycle+=1; searchOffset=(searchOffset+10)%50; await refreshResults(); });
$("#back").addEventListener("click",()=>{ elements.episodesSection.classList.add("hidden"); elements.showsSection.classList.remove("hidden"); setStatus(""); });
$("#close-player").addEventListener("click",()=>{ elements.player.pause(); elements.player.removeAttribute("src"); elements.player.load(); elements.playerSection.classList.add("hidden"); });
elements.player.addEventListener("error",()=>{ if (!playingEpisodeId) return; currentEpisodes=currentEpisodes.filter((episode)=>episode.id!==playingEpisodeId); playingEpisodeId=""; elements.playerSection.classList.add("hidden"); renderEpisodes(currentEpisodes); setStatus("That publisher’s audio is unavailable, so the episode was removed.",true); });
$("#search-form").addEventListener("submit",async(event)=>{ event.preventDefault(); searchOffset=0; await runSearch(elements.search.value); });
initialize();
