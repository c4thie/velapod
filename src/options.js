const status=document.querySelector("#status");
document.querySelector("#clear").addEventListener("click",async()=>{await chrome.storage.local.clear();status.textContent="Saved preferences cleared.";});
