import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { execFileSync } from "node:child_process";
const root=new URL("../",import.meta.url); const manifest=JSON.parse(await readFile(new URL("manifest.json",root),"utf8"));
if(manifest.manifest_version!==3)throw new Error("Manifest V3 is required.");
for(const permission of ["tabs","activeTab","<all_urls>","declarativeContent"])if(JSON.stringify(manifest).includes(`\"${permission}\"`))throw new Error(`Overbroad permission found: ${permission}`);
async function walk(directory){const entries=await readdir(directory,{withFileTypes:true});return(await Promise.all(entries.map((entry)=>entry.isDirectory()?walk(join(directory,entry.name)):join(directory,entry.name)))).flat();}
const rootPath=new URL(root).pathname;const files=(await walk(rootPath)).filter((file)=>!file.includes("/.git/")&&!file.includes("/dist/")&&!file.includes("/node_modules/"));
for(const file of files.filter((item)=>extname(item)===".js"))execFileSync(process.execPath,["--check",file],{stdio:"inherit"});
const source=await Promise.all(files.filter((item)=>/[.](?:js|html)$/.test(item)).map((item)=>readFile(item,"utf8")));
if(source.some((text)=>/http:\/\/localhost|<script[^>]+https?:\/\//i.test(text)))throw new Error("Development server or remotely hosted script found.");
console.log(`Validated ${files.length} files for Manifest V3 packaging.`);
