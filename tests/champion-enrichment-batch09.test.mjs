import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {championEnrichmentAudit} from '../scripts/champion-enrichment-tracker.mjs';
import {championFieldNotes} from '../src/champion-field-notes.mjs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const ids=[
  "dani-moonstar",
  "daredevil-hells-kitchen",
  "dark-phoenix",
  "doctor-bong",
  "doctor-voodoo",
  "elsa-bloodstone",
  "falcon-joaquin-torres",
  "franken-castle",
  "ghost-rider",
  "goldpool",
  "green-goblin-stellar-forged",
  "guillotine",
  "gwenom",
  "gwenpool",
  "hawkeye",
  "heimdall",
  "high-evolutionary",
  "hit-monkey",
  "hobgoblin",
  "howard-the-duck",
  "hulk-immortal",
  "imperiosa",
  "invisible-woman",
  "jabari-panther",
  "jessica-jones",
  "joe-fixit",
  "jubilee",
  "juggernaut",
  "karnak",
  "karolina-dean",
  "king-groot-deathless",
  "kraven",
  "lady-deathstrike",
  "lizard",
  "longshot",
  "luke-cage",
  "lumatrix",
  "mbaku",
  "maestro",
  "mister-fantastic"
];

test('batch 09 has 40 unique profiles, 120 player decisions and working source references',()=>{
 assert.equal(ids.length,40);
 assert.equal(new Set(ids).size,40);
 const sourceIds=new Set(db.sources.map(s=>s.id));
 for(const id of ids){
  const c=db.champions.find(x=>x.id===id);
  assert(c,id);
  const notes=c.fieldNotes;
  assert.equal(notes?.checkedAt,'2026-11-05',id);
  assert.equal(notes.decisions.length,3,id);
  assert(notes.sourceIds.length>=2,id);
  for(const sourceId of notes.sourceIds)
   assert(sourceIds.has(sourceId),id+': '+sourceId);
  for(const d of notes.decisions){
   assert(d.title.length>=12,id);
   assert(d.text.length>=90,id);
   assert(!/defendant's fire-related/i.test(d.text),id);
  }
  const html=championFieldNotes(db,c);
  assert.match(html,/What to check in the fight/,id);
  assert.match(html,/Evidence & sources/,id);
  assert.equal((html.match(/class="panel"/g)||[]).length,3,id);
  const text=JSON.stringify(notes);
  for(const marker of ['referenceFacts','battlecastId','statcastId','statFocusRecommendation'])
   assert(!text.includes(marker),id+': '+marker);
 }
});

test('40-champion batch reaches 250 of 334 field-note records',()=>{
 const report=championEnrichmentAudit(db);
 assert.equal(report.summary.totalChampions,334);
 assert.equal(report.summary.batchSize,40);
 assert(report.summary.completedPilot>=250,'batch 09 coverage remains present after later enrichment');
 assert.equal(report.summary.identityReview,2);
 assert(report.summary.queued<=82,'new batches should not enlarge the previous unreviewed queue');
 assert.equal(report.summary.batches,Math.ceil(report.summary.queued/report.summary.batchSize));
 assert.equal(report.summary.queued+report.summary.completedPilot+report.summary.identityReview,334);
 for(const id of ['doctor-doom','silk','kate-bishop','sunspot','scorpion','terrax','psylocke','gwenom','mister-fantastic']){
  assert.equal(db.champions.find(x=>x.id===id)?.fieldNotes?.decisions?.length,3,id);
 }
 assert.equal(db.champions.find(x=>x.id==='beast')?.fieldNotes?.decisions?.length||0,0);
});

test('recent variants and mechanic limitations remain explicit',()=>{
 const green=championFieldNotes(db,db.champions.find(x=>x.id==='green-goblin-stellar-forged'));
 const gwenom=championFieldNotes(db,db.champions.find(x=>x.id==='gwenom'));
 const falcon=championFieldNotes(db,db.champions.find(x=>x.id==='falcon-joaquin-torres'));
 assert.match(green,/Fractured Power Bar/);
 assert.match(gwenom,/Spider-Sense/);
 assert.match(falcon,/Peak Performance/);
});
