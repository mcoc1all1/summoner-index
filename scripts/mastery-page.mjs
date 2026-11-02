import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {basePath,localAttributes} from '../src/deployment.mjs';
import {siteOrigin} from '../src/build-safety.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
const base=basePath(process.env.SITE_BASE_PATH||'');
const origin=siteOrigin(process.env.SITE_ORIGIN||'https://contest-fieldguide.rt119.chatgpt.site');
const beta=process.env.PUBLIC_BETA==='1';
const data=JSON.parse(fs.readFileSync(path.join(root,'content','masteries.json'),'utf8'));
const e=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const sourceById=id=>data.sources.find(source=>source.id===id);
const sourceList=ids=>`<details class="sources"><summary>Evidence & sources <span>${ids.length} references</span></summary><ul>${ids.map(id=>{const s=sourceById(id);return s?`<li><a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.title)} ↗</a><small>${e(s.kind)} · checked ${e(s.checkedAt)}</small></li>`:'';}).join('')}</ul></details>`;
const template=fs.readFileSync(path.join(out,'index.html'),'utf8');

function renderPage(route,title,description,body){
 const raw=localAttributes(`<p class="beta-bar"><strong>Public beta</strong> <a href="/methodology">How recommendations are sourced →</a></p>${body}`,base);
 let html=template
  .replace(/<title>[\s\S]*?<\/title>/,`<title>${e(title)} | Summoner Index · MCOC</title>`)
  .replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${e(description)}">`)
  .replace(/<meta name="robots" content="[^"]*">/,`<meta name="robots" content="${beta?'noindex,follow':'index,follow'}">`)
  .replace(/<link rel="canonical" href="[^"]*">/,`<link rel="canonical" href="${origin}${base}${route}">`)
  .replace(/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="${e(title)} · Summoner Index">`)
  .replace(/<meta property="og:description" content="[^"]*">/,`<meta property="og:description" content="${e(description)}">`)
  .replace(/<meta property="og:url" content="[^"]*">/,`<meta property="og:url" content="${origin}${base}${route}">`)
  .replace(/<main id="main" tabindex="-1">[\s\S]*?<\/main>/,`<main id="main" tabindex="-1">${raw}</main>`)
  .replace(/data-page="[^"]*"/,`data-page="${route}"`);
 fs.mkdirSync(path.join(out,route.slice(1)),{recursive:true});
 fs.writeFileSync(path.join(out,route.slice(1),'index.html'),html);
}

const coreCards=data.coreMasteries.map(item=>`<article class="panel mastery-card"><span class="eyebrow">${e(item.tree)} · ${e(item.priority)}</span><h3>${e(item.name)}</h3><p><strong>Points:</strong> ${e(item.points)}</p><p>${e(item.why)}</p></article>`).join('');
const presetCards=data.presets.map(item=>`<a class="panel mastery-preset-card" href="/masteries/${e(item.id)}"><span class="eyebrow">${e(item.eyebrow)}</span><h2>${e(item.title)} →</h2><p>${e(item.summary)}</p></a>`).join('');

renderPage('/masteries','MCOC Mastery Setups','Practical MCOC mastery setup guidance for general play, Battlegrounds, recoil builds and roster-specific specialist choices.',`<section class="hero"><span class="eyebrow">MASTERY SETUPS</span><h1>Build masteries around how you actually play.</h1><p>There is no single best mastery tree for every account. Start with the universal core, then spend the flexible points around your roster, game mode and tolerance for self-damage.</p></section><section class="panel"><h2>How to use these guides</h2><p>These are starter frameworks, not rigid screenshots to copy forever. Unlock the core movement and offense pieces first, then tune specialist masteries when your roster or game mode gives them a reason to exist.</p><div class="quick-row"><a href="#core">Core masteries</a><a href="#setups">Setup guides</a><a href="#principles">Decision rules</a></div></section><section id="setups"><div class="section-head"><h2>Choose a setup</h2></div><div class="boss-grid">${presetCards}</div></section><section id="core"><div class="section-head"><h2>Core and commonly-used masteries</h2></div><div class="mastery-grid">${coreCards}</div></section><section class="panel" id="principles"><h2>Decision rules</h2><ul><li><p><strong>Universal before specialist:</strong> Parry, Dexterity, Precision, Cruelty and Block Proficiency generally give more accounts value than immediately maxing a niche branch.</p></li><li><p><strong>Roster decides specialist points:</strong> Deep Wounds needs Bleed attackers, Mystic Dispersion needs Mystics that benefit from opponent buffs, and Despair needs debuff-heavy attackers.</p></li><li><p><strong>Mode matters:</strong> health preservation is more important in Battlegrounds than in many farming situations, so Recoil setups need a stronger reason there.</p></li><li><p><strong>Do not confuse an unlock path with an ideal final investment:</strong> some early masteries are mainly bridge points used to reach more valuable nodes.</p></li></ul><p class="notice"><strong>Mastery costs and availability can change.</strong> Check the in-game mastery screen before spending Units or cores. These pages focus on build logic and tradeoffs rather than claiming a permanent exact point-cost chart.</p></section>${sourceList([...new Set(data.sources.map(s=>s.id))])}`);

for(const preset of data.presets){
 renderPage(`/masteries/${preset.id}`,preset.title,`${preset.title} guidance for MCOC with priorities, tradeoffs and roster-dependent adjustments.`, `<div class="crumbs"><a href="/masteries">Masteries</a> / ${e(preset.title)}</div><section class="hero mastery-hero"><span class="eyebrow">${e(preset.eyebrow)}</span><h1>${e(preset.title)}</h1><p>${e(preset.summary)}</p></section><div class="counter-layout"><section><section class="panel"><h2>Best for</h2><div class="chips">${preset.bestFor.map(item=>`<span class="chip">${e(item)}</span>`).join('')}</div></section><section class="panel"><h2>Build priorities</h2><ol class="mastery-priority-list">${preset.priorities.map(item=>`<li><p>${e(item)}</p></li>`).join('')}</ol></section><section class="panel"><h2>What to watch</h2><ul>${preset.watch.map(item=>`<li><p>${e(item)}</p></li>`).join('')}</ul></section>${sourceList(preset.sourceIds)}</section><aside><section class="panel"><span class="eyebrow">QUICK CHECK</span><h2>Before you copy a build</h2><p>Ask three questions:</p><ol><li>Which champions do I actually use most?</li><li>Which mode am I optimizing for?</li><li>Am I comfortable paying the health or flexibility cost of this setup?</li></ol><a class="text-link" href="/masteries">Compare the other mastery approaches →</a></section></aside></div>`);
}

function enhanceExisting(){
 for(const item of fs.readdirSync(out,{withFileTypes:true})){
  if(!item.isDirectory())continue;
 }
 const tools=path.join(out,'tools','index.html');
 if(fs.existsSync(tools)){
  let html=fs.readFileSync(tools,'utf8');
  if(!html.includes('href="'+base+'/masteries"'))html=html.replace('<div class="boss-grid">','<div class="boss-grid"><a class="panel" href="'+base+'/masteries"><h2>Mastery setups →</h2><p>General, Battlegrounds, Recoil and specialist mastery guidance.</p></a>');
  fs.writeFileSync(tools,html);
 }
 const guides=path.join(out,'guides','index.html');
 if(fs.existsSync(guides)){
  let html=fs.readFileSync(guides,'utf8');
  if(!html.includes('href="'+base+'/masteries"'))html=html.replace('<div class="boss-grid">','<div class="boss-grid"><a class="panel" href="'+base+'/masteries"><span class="eyebrow">ACCOUNT SETUP</span><h2>Mastery setups →</h2><p>Choose a mastery framework for questing, Battlegrounds or Recoil-compatible rosters.</p></a>');
  fs.writeFileSync(guides,html);
 }
}
enhanceExisting();
console.log(`Generated ${data.presets.length+1} mastery pages.`);
