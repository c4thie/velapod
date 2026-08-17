import { SPOTIFY_CLIENT_ID } from "./config.js";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const storage = chrome.storage.local;

function randomString(length = 64) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}
async function sha256(value) { return crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); }
function base64Url(buffer) { return btoa(String.fromCharCode(...new Uint8Array(buffer))).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", ""); }
export async function getClientId() { const { spotifyClientId = "" } = await storage.get("spotifyClientId"); return (spotifyClientId || SPOTIFY_CLIENT_ID).trim(); }
async function saveToken(payload) {
  const current = await storage.get("spotifyToken");
  const token = { accessToken: payload.access_token, refreshToken: payload.refresh_token || current.spotifyToken?.refreshToken, expiresAt: Date.now() + payload.expires_in * 1000 - 60_000 };
  await storage.set({ spotifyToken: token }); return token.accessToken;
}
async function exchange(body) {
  const response = await fetch(TOKEN_URL, { method:"POST", headers:{ "Content-Type":"application/x-www-form-urlencoded" }, body:new URLSearchParams(body) });
  if (!response.ok) throw new Error("Spotify sign-in could not be completed.");
  return saveToken(await response.json());
}
export async function connect() {
  const clientId = await getClientId();
  if (!clientId) throw new Error("Add a Spotify client ID in Developer setup first.");
  const verifier = randomString(); const challenge = base64Url(await sha256(verifier)); const state = randomString(24); const redirectUri = chrome.identity.getRedirectURL("spotify");
  const params = new URLSearchParams({ client_id:clientId, response_type:"code", redirect_uri:redirectUri, code_challenge_method:"S256", code_challenge:challenge, state });
  const resultUrl = await chrome.identity.launchWebAuthFlow({ url:`https://accounts.spotify.com/authorize?${params}`, interactive:true });
  if (!resultUrl) throw new Error("Spotify sign-in was cancelled.");
  const result = new URL(resultUrl);
  if (result.searchParams.get("state") !== state) throw new Error("Spotify sign-in validation failed.");
  if (result.searchParams.get("error")) throw new Error(`Spotify sign-in failed: ${result.searchParams.get("error")}.`);
  const code = result.searchParams.get("code"); if (!code) throw new Error("Spotify did not return an authorization code.");
  return exchange({ client_id:clientId, grant_type:"authorization_code", code, redirect_uri:redirectUri, code_verifier:verifier });
}
export async function getAccessToken() {
  const { spotifyToken } = await storage.get("spotifyToken");
  if (!spotifyToken) return null;
  if (spotifyToken.accessToken && Date.now() < spotifyToken.expiresAt) return spotifyToken.accessToken;
  if (!spotifyToken.refreshToken) return null;
  try { return await exchange({ client_id:await getClientId(), grant_type:"refresh_token", refresh_token:spotifyToken.refreshToken }); }
  catch { await storage.remove("spotifyToken"); return null; }
}
export async function disconnect() { await storage.remove("spotifyToken"); }
