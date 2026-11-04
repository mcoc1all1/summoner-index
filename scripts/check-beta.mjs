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
  assert.match(text,/<p class="beta-bar"><strong>Public beta<\/strong>/);
  assert.match(text,/How recommendations are sourced/);
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
// Copyright-risk publication gate: check generated files, not just source files.
const publicDb=JSON.parse(fs.readFileSync(new URL('catalog.json',root),'utf8'));
for(const c of publicDb.champions){
 const f=c.referenceFacts;
 assert.equal(f?.status,'source-link-only',c.id+' must link to, not mirror, the compiled reference');
 for(const field of ['abilities','protections','battlecast','statcast'])
  assert.equal(f?.[field],undefined,c.id+': source compilation '+field+' exposed');
 assert.deepEqual(c.relicIds||[],[],c.id+': source-derived relic pairing exposed');
 if(c.loadout){
  assert.equal(c.loadout.battlecastId,null,c.id+': battlecast pairing exposed');
  assert.equal(c.loadout.statcastId,null,c.id+': statcast pairing exposed');
 }
 const html=fs.readFileSync(new URL('champions/'+c.id+'/index.html',root),'utf8');
 assert.match(html,/EXTERNAL KIT REFERENCE/,c.id+': link-only reference missing');
 assert.doesNotMatch(html,/SOURCE CATALOGUE ·/,c.id+': raw compilation UI leaked');
}
for(const filename of fs.readdirSync(root).filter(n=>/^catalog-(?:.+)\.json$/.test(n))){
 const data=JSON.parse(fs.readFileSync(new URL(filename,root),'utf8'));
 for(const c of data.champions||[]){
  for(const field of ['abilities','protections','battlecast','statcast'])
   assert.equal(c.referenceFacts?.[field],undefined,filename+': '+c.id+': '+field);
  if(c.loadout){
   assert.equal(c.loadout.battlecastId,null,filename+': '+c.id);
   assert.equal(c.loadout.statcastId,null,filename+': '+c.id);
  }
 }
}
// The full, compact, and hashed JSON artifacts must agree on every public
// editorial field. Checking only the unhashed catalog was insufficient.
const canonicalById=new Map(publicDb.champions.map(c=>[c.id,c]));
const jsonFiles=fs.readdirSync(root).filter(name=>/^catalog(?:-[a-z-]+)?(?:\.[0-9a-f]{16})?\.json$/.test(name));
assert(jsonFiles.some(name=>/^catalog\.[0-9a-f]{16}\.json$/.test(name)),
 'hashed canonical dataset was not inspected');
assert(jsonFiles.some(name=>/^catalog-loadouts\.[0-9a-f]{16}\.json$/.test(name)),
 'hashed loadout dataset was not inspected');
for(const filename of jsonFiles){
 const data=JSON.parse(fs.readFileSync(new URL(filename,root),'utf8'));
 for(const c of data.champions||[]){
  const reference=canonicalById.get(c.id);
  assert(reference,filename+' unknown '+c.id);
  if(!c.loadout)continue;
  const approved=reference.statFocusReview?.status==='reviewed'
    && reference.statFocusEligibility?.status==='confirmed';
  for(const field of ['attackFocus','defenseFocus','attackAlternative','defenseAlternative']){
   assert.equal(c.loadout[field],reference.loadout?.[field],
    filename+': '+c.id+' '+field+' differs from public canonical catalog');
  }
  if(!approved){
   assert.equal(c.loadout.attackFocus,'Not reviewed',filename+': '+c.id);
   assert.equal(c.loadout.defenseFocus,'Not reviewed',filename+': '+c.id);
  }
 }
}

assert.equal(fs.existsSync(new URL('content-workbench/',root)),false,'editor workbench must not be deployed');

const sitemap=fs.readFileSync(new URL('sitemap.xml',root),'utf8');
assert.equal([...sitemap.matchAll(/<loc>/g)].length,2);
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.mjs'))){
 const text=fs.readFileSync(new URL(file,root),'utf8');
 for(const [,url] of text.matchAll(/(?:href|src|action)="(\/[^\"]*)"/g))assert.ok(url.startsWith(base+'/'),`Runtime URL outside project in ${file}: ${url}`);
}
console.log(`Beta checked: ${pages} HTML files, local links, provisional indexing and runtime link templates.`);
