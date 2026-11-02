import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {applyAccuracyPatches} from '../src/accuracy-patches.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const contentDir=path.join(root,'content');
const outPath=path.join(contentDir,'immunity-audit-live.json');

const sourceImmunities=[
  ['Ability Accuracy Reduction Immunity','ability-accuracy-reduction'],
  ['Armor Break Immunity','armor-break'],
  ['Armor Shattered Immunity','armor-shatter'],
  ['Bad Vibes Immunity','bad-vibes'],
  ['Bleed Immunity','bleed'],
  ['Buff Immunity','buff'],
  ['Coldsnap Immunity','coldsnap'],
  ['Concussion Immunity','concussion'],
  ['Concussion Immunnity','concussion'],
  ['Crush Immunity','crush'],
  ['Death Immunity','death'],
  ['Delirium Immunity','delirium'],
  ['Disintegrate Immunity','disintegration'],
  ['Disorient Immunity','disorient'],
  ['Falter Immunity','falter'],
  ['Fate Seal Immunity','fate-seal'],
  ['Fatigue Immunity','fatigue'],
  ['Frostbite Immunity','frostbite'],
  ['Heal Block Immunity','heal-block'],
  ['Incinerate Immunity','incinerate'],
  ['Infuriate Immunity','infuriate'],
  ['Intimidate Immunity','intimidate'],
  ['Neuroshock Immunity','neuroshock'],
  ['Neutralize Immunity','neutralize'],
  ['Nova Flame Immunity','nova-flame'],
  ['Nullify Immunity','nullify'],
  ['Petrify Immunity','petrify'],
  ['Poison Immunity','poison'],
  ['Power Burn Immunity','power-burn'],
  ['Power Drain Immunity','power-drain'],
  ['Power Lock Immunity','power-lock'],
  ['Power Steal Immunity','power-steal'],
  ['Power Sting Immunity','power-sting'],
  ['Precision Immunity','precision'],
  ['Reverse Control Immunity','reversed-controls'],
  ['Reverse Controls Immunity','reversed-controls'],
  ['Rupture Immunity','rupture'],
  ['Shock Immunity','shock'],
  ['Slow Immunity','slow'],
  ['Special Lock Immunity','special-lock'],
  ['Spectre Immunity','spectre'],
  ['Stagger Immunity','stagger'],
  ['Stun Immunity','stun'],
  ['Taunt Immunity','taunt'],
  ['Wither Immunity','wither']
];

const canonicalNames=new Map();
for(const [name,id] of sourceImmunities)if(!canonicalNames.has(id))canonicalNames.set(id,name.replace('Immunnity','Immunity'));

function loadPatchedCatalog(){
  let db=JSON.parse(fs.readFileSync(path.join(contentDir,'catalog.json'),'utf8'));
  const patchFiles=[
    'accuracy-patches.json',
    ...fs.readdirSync(contentDir).filter(name=>/^(?:boss|counter|rarity|immunity)-.*-patches\.json$/.test(name)).sort()
  ];
  for(const name of patchFiles){
    db=applyAccuracyPatches(db,JSON.parse(fs.readFileSync(path.join(contentDir,name),'utf8')));
  }
  return db;
}

function decodeHtml(value){
  const named={amp:'&',quot:'"',apos:"'",nbsp:' ',lt:'<',gt:'>'};
  return value
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)))
    .replace(/&([a-z]+);/gi,(m,n)=>named[n.toLowerCase()]??m);
}

function textFromHtml(html){
  return decodeHtml(html
    .replace(/<script\b[\s\S]*?<\/script>/gi,' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi,' ')
    .replace(/<(?:br|\/p|\/div|\/li|\/h[1-6]|\/section|\/article|\/tr)>/gi,'\n')
    .replace(/<[^>]+>/g,' '))
    .split(/\r?\n/)
    .map(line=>line.replace(/\s+/g,' ').trim())
    .filter(Boolean)
    .join('\n');
}

function normalizeName(value){
  return String(value||'')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/æ/gi,'ae')
    .toLowerCase()
    .replace(/\bthe\b/g,'the')
    .replace(/[^a-z0-9]+/g,'');
}

function immunityIdsFromText(text){
  const found=new Set();
  const compact=text.replace(/\s+/g,' ');
  for(const [label,id] of sourceImmunities){
    if(compact.toLowerCase().includes(label.toLowerCase()))found.add(id);
  }
  return [...found].sort();
}

async function fetchText(url,{attempts=3}={}){
  let last;
  for(let attempt=1;attempt<=attempts;attempt++){
    try{
      const response=await fetch(url,{headers:{'user-agent':'Summoner-Index-Immunity-Audit/1.0 (+https://mcoc1all1.github.io/summoner-index/)'}});
      if(!response.ok)throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    }catch(error){
      last=error;
      if(attempt<attempts)await new Promise(resolve=>setTimeout(resolve,400*attempt));
    }
  }
  throw last;
}

function extractChampionLinks(html){
  const links=new Map();
  for(const match of html.matchAll(/href=["'](?:https?:\/\/mcochub\.insaneskull\.com)?\/champions\/([^"'#?]+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
    const slug=decodeURIComponent(match[1]);
    const name=textFromHtml(match[2]).replace(/^Image:\s*/i,'').trim();
    if(slug&&name&&!links.has(slug))links.set(slug,name);
  }
  return [...links].map(([slug,name])=>({slug,name}));
}

function extractChampion(html,slug){
  const text=textFromHtml(html);
  const lines=text.split('\n');
  const h1=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const name=h1?textFromHtml(h1[1]):lines.find(line=>line&&!/MCOCHUB/i.test(line));
  let immunitySection='';
  const index=lines.findIndex(line=>/^Immunities$/i.test(line));
  if(index!==-1){
    const stop=/^(?:Tags|Duel Targets|7\* Stat Focus|Playstyle and Requirements|Relics|Abilities|Synergies|Signature Ability|Spotlight & Gameplay)$/i;
    const picked=[];
    for(let i=index+1;i<Math.min(lines.length,index+12);i++){
      if(stop.test(lines[i]))break;
      picked.push(lines[i]);
    }
    immunitySection=picked.join(' ');
  }
  return {slug,name,immunityIds:immunityIdsFromText(immunitySection),immunityText:immunitySection};
}

async function mapLimit(items,limit,worker){
  const out=new Array(items.length);
  let next=0;
  async function run(){
    while(true){
      const index=next++;
      if(index>=items.length)return;
      out[index]=await worker(items[index],index);
    }
  }
  await Promise.all(Array.from({length:Math.min(limit,items.length)},run));
  return out;
}

const db=loadPatchedCatalog();
const indexHtml=await fetchText('https://mcochub.insaneskull.com/champions');
const links=extractChampionLinks(indexHtml);
if(links.length<250)throw new Error(`MCOCHUB champion index parsing returned only ${links.length} links`);

const failures=[];
const sourceChampions=(await mapLimit(links,5,async item=>{
  try{
    const html=await fetchText(`https://mcochub.insaneskull.com/champions/${encodeURIComponent(item.slug)}`);
    return extractChampion(html,item.slug);
  }catch(error){
    failures.push({slug:item.slug,name:item.name,error:String(error?.message||error)});
    return {slug:item.slug,name:item.name,immunityIds:[],immunityText:'',failed:true};
  }
})).filter(Boolean);

const sourceByName=new Map();
for(const champion of sourceChampions)sourceByName.set(normalizeName(champion.name),champion);

const rows=[];
const unmatchedSite=[];
for(const champion of db.champions){
  const source=sourceByName.get(normalizeName(champion.name));
  if(!source){
    unmatchedSite.push({id:champion.id,name:champion.name});
    continue;
  }
  const siteIds=new Set([...(champion.immunityIds||[]),...(champion.protections||[]).map(record=>record.effectId)]);
  const sourceIds=new Set(source.immunityIds);
  rows.push({
    id:champion.id,
    name:champion.name,
    sourceSlug:source.slug,
    sourceImmunityIds:[...sourceIds].sort(),
    siteImmunityIds:[...siteIds].sort(),
    missingOnSite:[...sourceIds].filter(id=>!siteIds.has(id)).sort(),
    siteOnly:[...siteIds].filter(id=>!sourceIds.has(id)).sort(),
    sourceText:source.immunityText
  });
  sourceByName.delete(normalizeName(champion.name));
}

const unmatchedSource=[...sourceByName.values()].map(({slug,name,immunityIds})=>({slug,name,immunityIds}));
const sourceTypes=[...new Set(sourceChampions.flatMap(champion=>champion.immunityIds))].sort();
const siteTypes=new Set(db.immunities.map(effect=>effect.id));
const missingTaxonomy=sourceTypes.filter(id=>!siteTypes.has(id));
const missingRows=rows.filter(row=>row.missingOnSite.length);
const siteOnlyRows=rows.filter(row=>row.siteOnly.length);

const report={
  generatedAt:new Date().toISOString(),
  source:{name:'MCOCHUB public champion pages',url:'https://mcochub.insaneskull.com/champions',note:'Public-page audit records source-listed immunities. It does not infer always/conditional/synergy status when the page summary does not expose that distinction.'},
  immunityDictionary:Object.fromEntries([...canonicalNames].sort((a,b)=>a[0].localeCompare(b[0]))),
  summary:{
    siteChampions:db.champions.length,
    sourceLinks:links.length,
    sourcePagesParsed:sourceChampions.length-failures.length,
    fetchFailures:failures.length,
    matchedChampions:rows.length,
    unmatchedSite:unmatchedSite.length,
    unmatchedSource:unmatchedSource.length,
    sourceImmunityTypes:sourceTypes.length,
    siteTaxonomyTypes:siteTypes.size,
    missingTaxonomyTypes:missingTaxonomy.length,
    championsMissingSourceListedImmunities:missingRows.length,
    championsWithSiteOnlyImmunities:siteOnlyRows.length
  },
  missingTaxonomy,
  failures,
  unmatchedSite,
  unmatchedSource,
  missingChampionMappings:missingRows,
  siteOnlyMappings:siteOnlyRows,
  champions:rows
};

fs.writeFileSync(outPath,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.summary,null,2));
console.log('Missing taxonomy:',missingTaxonomy.join(', ')||'none');
console.log('Missing champion mappings:',missingRows.length);
for(const row of missingRows)console.log(`MISSING ${row.id}: ${row.missingOnSite.join(', ')}`);
console.log(`Wrote ${path.relative(root,outPath)}`);
