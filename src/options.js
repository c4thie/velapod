import { disconnect } from "./auth.js";
const clientId=document.querySelector("#client-id"),redirect=document.querySelector("#redirect"),status=document.querySelector("#status");
async function initialize(){const data=await chrome.storage.local.get("spotifyClientId");clientId.value=data.spotifyClientId||"";redirect.value=chrome.identity.getRedirectURL("spotify");}
document.querySelector("#save").addEventListener("click",async()=>{const next=clientId.value.trim();await chrome.storage.local.set({spotifyClientId:next});await disconnect();status.textContent=next?"Saved. Reconnect Spotify from the extension popup.":"Client ID cleared.";});
document.querySelector("#disconnect").addEventListener("click",async()=>{await disconnect();status.textContent="Spotify disconnected.";});
redirect.addEventListener("click",()=>redirect.select());initialize();
