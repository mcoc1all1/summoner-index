import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=new URL('../dist/',import.meta.url);
const base=process.env.SITE_BASE_PATH||'/summoner-index';
let pages=0;
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);
 if(entry.isDirectory())walk(file);
 else if(entry.name.endsWith('.html')){
  const text=fs.readFileSync(file,'utf8');pages++;
  assert.match(text,/Public beta · provisional guidance/);
  assert.match(text,/Report an issue/);
  for(const [,url] of text.matchAll(/(?:href|src|action)="(\/[^\"]*)"/g)){
   assert.ok(url.startsWith(base+'/'),`Outside project: ${url} in ${file}`);
   const local=url.slice(base.length).split(/[?#]/)[0];
   assert.ok(fs.existsSync(new URL('.'+local,root)),`Missing target: ${url}`);
  }
  if(file.includes(path.sep+'champions'+path.sep)||file.includes(path.sep+'quests'+path.sep))assert.match(text,/content="noindex,follow"/);
 }
}}
walk(fileURLToPath(root));
const sitemap=fs.readFileSync(new URL('sitemap.xml',root),'utf8');
assert.equal([...sitemap.matchAll(/<loc>/g)].length,2);
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.mjs'))){
 const text=fs.readFileSync(new URL(file,root),'utf8');
 for(const [,url] of text.matchAll(/(?:href|src|action)="(\/[^\"]*)"/g))assert.ok(url.startsWith(base+'/'),`Runtime URL outside project in ${file}: ${url}`);
}
console.log(`Beta checked: ${pages} HTML files, local links, provisional indexing and runtime link templates.`);
