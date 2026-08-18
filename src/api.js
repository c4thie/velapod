import { languageSearchTermsFor } from "./languages.js";

const API="https://itunes.apple.com";

async function catalogue(path,params) {
  const response=await fetch(`${API}${path}?${new URLSearchParams(params)}`);
  if (response.status===429) throw new Error("The podcast catalogue is busy. Please try again shortly.");
  if (!response.ok) throw new Error(`Podcast catalogue request failed (${response.status}).`);
  return response.json();
}

function showFrom(result) {
  return {
    id:String(result.collectionId || result.trackId),
    name:result.collectionName || result.trackName,
    author:result.artistName || "",
    description:[result.artistName,result.primaryGenreName].filter(Boolean).join(" · "),
    images:[{url:result.artworkUrl600 || result.artworkUrl100}],
    externalUrl:result.collectionViewUrl || result.trackViewUrl,
  };
}

function episodeFrom(result) {
  return {
    id:String(result.trackId || result.episodeGuid),
    name:result.trackName,
    description:result.description || result.shortDescription || "",
    images:[{url:result.artworkUrl600 || result.artworkUrl160 || result.artworkUrl60}],
    duration_ms:result.trackTimeMillis || 0,
    release_date:result.releaseDate ? result.releaseDate.slice(0,10) : "",
    audioUrl:result.episodeUrl || result.previewUrl || "",
    externalUrl:result.trackViewUrl,
  };
}

export async function searchShows(query,market,limit=8,offset=0,language="") {
  const languageTerm=languageSearchTermsFor(language)[0] || "";
  const term=[query,languageTerm].filter(Boolean).join(" ");
  const requestLimit=Math.min(200,Math.max(limit+offset,20));
  const data=await catalogue("/search",{term,country:market,media:"podcast",entity:"podcast",limit:String(requestLimit),explicit:"No"});
  return (data.results || []).slice(offset,offset+limit).map(showFrom);
}

export async function recommendedShows(market,cycle=0,language="") {
  const themes=["news","comedy","culture","science","stories","technology","history","wellness"];
  const theme=themes[Math.abs(cycle)%themes.length];
  const offset=Math.floor(Math.abs(cycle)/themes.length)*8%40;
  return searchShows(theme,market,8,offset,language);
}

export async function getEpisodes(showId,market) {
  const data=await catalogue("/lookup",{id:showId,entity:"podcastEpisode",limit:"25",country:market});
  return (data.results || []).filter((result)=>result.wrapperType==="podcastEpisode" && (result.episodeUrl || result.previewUrl)).map(episodeFrom);
}
