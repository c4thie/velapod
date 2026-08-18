import { mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
const root=new URL("../",import.meta.url),dist=new URL("dist/",root),target=new URL("velapod-3.1.0.zip",dist);
await mkdir(dist,{recursive:true});await rm(target,{force:true});
const includes=["manifest.json","background.js","popup.html","popup.css","language.css","options.html","options.css","PRIVACY.md","THIRD_PARTY_CONTENT.md","icons","src/api.js","src/languages.js","src/location.js","src/options.js","src/popup.js"];
execFileSync("zip",["-r",new URL(target).pathname,...includes],{cwd:new URL(root).pathname,stdio:"inherit"});console.log(`Created ${new URL(target).pathname}`);
