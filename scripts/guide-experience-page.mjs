import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bossQuickPlan,guideHub,challengeAtAGlance,addMobileFightCards} from '../src/guide-experience.mjs';
import {challengePlanById} from '../src/challenge-plans.mjs';
import {basePath,localAttributes} from '../src/deployment.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
const base=basePath(process.env.SITE_BASE_PATH||'');
const db=JSON.parse(fs.readFileSync(path.join(root,'content','catalog.json'),'utf8'));
const challenges=JSON.parse(fs.readFileSync(path.join(root,'content','carina-volume-4.json'),'utf8'));
const championName=id=>db.champions.find(c=>c.id===id)?.name||id;

const guidesPath=path.join(out,'guides','index.html');
if(fs.existsSync(guidesPath)){
  let html=fs.readFileSync(guidesPath,'utf8');
  const start=html.indexOf('<main id="main" tabindex="-1">');
  const end=html.indexOf('</main>',start);
  if(start!==-1&&end!==-1){
    const open='<main id="main" tabindex="-1">';
    const beta=html.slice(start+open.length).match(/^<p class="beta-bar">[\s\S]*?<\/p>/)?.[0]||'';
    const hero=`<section class="hero"><div><span class="eyebrow">GUIDES</span><h1>Prepare faster. Read only what matters.</h1><p>Use quick plans for familiar fights, then open the detailed mechanics, counters and evidence when you need them.</p></div></section>`;
    const body=localAttributes(hero+guideHub(),base);
    html=html.slice(0,start)+open+beta+body+html.slice(end);
    fs.writeFileSync(guidesPath,html);
  }
}

for(const boss of db.bosses){
  const file=path.join(out,'bosses',boss.id,'index.html');
  if(!fs.existsSync(file))continue;
  let html=fs.readFileSync(file,'utf8');
  const quick=/<section class="panel"><h2>Quick fight plan<\/h2>[\s\S]*?<\/section>/;
  if(quick.test(html))html=html.replace(quick,bossQuickPlan(boss));
  fs.writeFileSync(file,html);
}

for(const baseGuide of challenges.guides){
  const extra=challengePlanById(baseGuide.id);
  const guide=extra?{...baseGuide,...extra}:baseGuide;
  const file=path.join(out,'challenges','carina-volume-4',guide.id,'index.html');
  if(!fs.existsSync(file))continue;
  let html=fs.readFileSync(file,'utf8');
  const noticeEnd=html.indexOf('</div>',html.indexOf('<div class="notice">'));
  if(noticeEnd!==-1){
    html=html.slice(0,noticeEnd+6)+challengeAtAGlance(guide,championName)+html.slice(noticeEnd+6);
  }
  html=addMobileFightCards(html);
  fs.writeFileSync(file,html);
}

console.log('Improved guide hub, boss quick plans and Carina mobile layouts.');
