import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourcePath=path.join(root,'content/catalog.json');
const dist=path.join(root,'dist');
const publicCatalogPath=path.join(dist,'catalog.json');
const db=JSON.parse(fs.readFileSync(sourcePath,'utf8'));
const withheld=db.champions.filter(c=>c.statFocusReview?.status==='withheld');
const reviewed=db.champions.filter(c=>c.statFocusReview?.status==='reviewed');

function scrubFocusObject(target,{hidePrimary=false}={}){
  if(!target)return;
  if(hidePrimary){
    if(Object.hasOwn(target,'attackFocus'))target.attackFocus='Not reviewed';
    if(Object.hasOwn(target,'defenseFocus'))target.defenseFocus='Not reviewed';
  }
  if(Object.hasOwn(target,'attackAlternative'))target.attackAlternative='Not reviewed';
  if(Object.hasOwn(target,'defenseAlternative'))target.defenseAlternative='Not reviewed';
}

if(fs.existsSync(publicCatalogPath)){
  const publicDb=JSON.parse(fs.readFileSync(publicCatalogPath,'utf8'));
  for(const c of publicDb.champions){
    const status=c.statFocusReview?.status;
    if(status==='withheld'){
      scrubFocusObject(c.loadout,{hidePrimary:true});
      scrubFocusObject(c.focusTrial,{hidePrimary:true});
    }else if(status==='reviewed'){
      scrubFocusObject(c.loadout);
      scrubFocusObject(c.focusTrial);
    }
  }
  fs.writeFileSync(publicCatalogPath,JSON.stringify(publicDb,null,2)+'\n');
}

function scrubHtml(html,{hidePrimary=false}={}){
  html=html.replace(/Alternative to test: [^<]*/g,'Alternative to test: Not reviewed');
  if(!hidePrimary)return html;
  html=html.replace(/(<h3>Loadout starting point<\/h3><p>)[^<]*(<\/p>)/g,'$1Not reviewed$2');
  html=html.replace(/(<dt>Attacker starting point<\/dt><dd>)[^<]*(<\/dd>)/g,'$1Not reviewed$2');
  html=html.replace(/(<dt>Defender starting point<\/dt><dd>)[^<]*(<\/dd>)/g,'$1Not reviewed$2');
  html=html.replace(/(<h3>7★ attacker starting point: )[^<]*(<\/h3>)/g,'$1Not reviewed$2');
  return html;
}

for(const c of db.champions){
  const file=path.join(dist,'champions',c.id,'index.html');
  if(!fs.existsSync(file))continue;
  const status=c.statFocusReview?.status;
  if(status!=='reviewed'&&status!=='withheld')continue;
  const html=fs.readFileSync(file,'utf8');
  fs.writeFileSync(file,scrubHtml(html,{hidePrimary:status==='withheld'}));
}

const loadoutsPath=path.join(dist,'loadouts','index.html');
if(fs.existsSync(loadoutsPath)){
  let html=fs.readFileSync(loadoutsPath,'utf8');
  for(const c of [...withheld,...reviewed]){
    const escaped=c.id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const re=new RegExp(`(<article class="panel loadout-card" id="${escaped}">[\\s\\S]*?<\\/article>)`,'g');
    html=html.replace(re,segment=>scrubHtml(segment,{hidePrimary:c.statFocusReview?.status==='withheld'}));
  }
  fs.writeFileSync(loadoutsPath,html);
}

console.log(`Public Stat Focus scrub: ${reviewed.length} reviewed primary recommendations kept; ${withheld.length} unreviewed primary drafts hidden; alternatives hidden.`);
