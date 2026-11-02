import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {basePath} from '../src/deployment.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
const db=JSON.parse(fs.readFileSync(path.join(root,'content/catalog.json'),'utf8'));
const base=basePath(process.env.SITE_BASE_PATH||'');
const standardCount=db.champions.filter(c=>c.id!=='summoned-symbioid').length;
const specialCount=db.champions.length-standardCount;
const uxCssSource=path.join(root,'src','ux-cleanup.css');
const uxCssTarget=path.join(out,'ux-cleanup.css');
if(fs.existsSync(uxCssSource))fs.copyFileSync(uxCssSource,uxCssTarget);

function walk(dir){
 for(const item of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,item.name);
  if(item.isDirectory())walk(file);
  else if(item.name.endsWith('.html'))clean(file);
 }
}

function clean(file){
 let html=fs.readFileSync(file,'utf8');

 // Brand the product consistently while keeping "Fieldguide" as the descriptor.
 html=html
  .replaceAll('FIELDGUIDE<small>MCOC COMPANION</small>','SUMMONER INDEX<small>MCOC FIELDGUIDE</small>')
  .replaceAll('<b>F</b>FIELDGUIDE','<b>S</b>SUMMONER INDEX')
  .replaceAll('| Fieldguide · MCOC','| Summoner Index · MCOC')
  .replaceAll(' · Fieldguide</title>',' · Summoner Index</title>')
  .replaceAll('content="Fieldguide"','content="Summoner Index"')
  .replaceAll('>Search the fieldguide<','>Search Summoner Index<');

 if(!html.includes('ux-cleanup.css'))html=html.replace('</head>',`<link rel="stylesheet" href="${base}/ux-cleanup.css"></head>`);

 // One concise global beta signal is enough; page-specific evidence remains available in disclosures.
 html=html.replace(/<p class="beta-bar"><strong>Public beta · provisional guidance\.<\/strong> <a href="[^\"]*\/methodology">Sourced guidance · Matchups untested →<\/a><\/p>/g,
  `<p class="beta-bar"><strong>Public beta</strong> <a href="${base}/methodology">How recommendations are sourced →</a></p>`);

 // Keep internal authoring utilities out of normal visitor navigation.
 html=html.replace(/<a href="[^\"]*\/content-workbench">Content workbench<\/a>/g,'');

 // "Shortlist" is clearer beside "My Roster" than a second "saved" concept.
 html=html.replaceAll('Saved champions →','Shortlist →').replaceAll('Saved champions','Shortlist');

 // Explain the advanced immunity filter once, without making the whole directory feel unfinished.
 html=html.replace(/<p class="notice">Form and condition review currently covers ([\s\S]*?)Resistance, Purify and Cleanse are not immunity\.<\/p>/,
  '<details class="notice compact-disclosure"><summary>Advanced immunity filters · beta</summary><p>Effect-form and activation filters only include explicitly reviewed records. Missing results do not prove a champion lacks protection. Resistance, Purify and Cleanse are separate mechanics.</p></details>');

 // Standardize public-facing champion counts and make the special-case record explicit.
 html=html.replace(/333 source pages checked on 23 October 2026\. A checked reference is not a tested combat guide\./g,
  `${db.champions.length} champion records in the directory (${standardCount} standard${specialCount?` + ${specialCount} special-case`:''}).`);
 html=html.replace(/(\d+) source catalogues · (\d+) detailed guides · (\d+) focus trials\./g,
  '$1 source catalogues · $2 detailed guides · $3 focus trials.');

 // Coverage is a status dashboard: repeated prose belongs on the profile, not every row.
 html=html.replace('<th>Research note</th>','<th>Status</th>');
 html=html.replace(/<td>([^<]*(?:current-game validation|individual review|remain open|outstanding research)[^<]*)<\/td>/gi,
  '<td><span class="status-chip">Needs review</span></td>');
 html=html.replace(/<p>Unlisted means absent from the source summary\.[\s\S]*?current game client\.<\/p>/,
  '<p class="muted">“Unlisted” means absent from the checked source summary. Open a champion profile for evidence, caveats and outstanding research.</p>');

 fs.writeFileSync(file,html);
}

walk(out);

// Update generated social artwork to match the public name.
const og=path.join(out,'og.svg');
if(fs.existsSync(og)){
 let svg=fs.readFileSync(og,'utf8');
 svg=svg.replace('FIELDGUIDE / MCOC COMPANION','SUMMONER INDEX / MCOC FIELDGUIDE');
 fs.writeFileSync(og,svg);
}

console.log('Applied Summoner Index UX cleanup pass.');
