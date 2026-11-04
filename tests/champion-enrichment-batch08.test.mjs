import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {championEnrichmentAudit} from '../scripts/champion-enrichment-tracker.mjs';
import {championFieldNotes} from '../src/champion-field-notes.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const ids=[
  "psylocke",
  "punisher-2099",
  "purgatory",
  "quake",
  "rocket-raccoon",
  "rogue",
  "ronan",
  "sabretooth",
  "spot",
  "star-lord-stellar-forged",
  "thanos",
  "thor",
  "unstoppable-colossus",
  "vision-age-of-ultron",
  "yellow-jacket",
  "adam-warlock",
  "ant-man",
  "arcade",
  "arnim-zola",
  "baron-zemo",
  "bastion",
  "black-panther",
  "black-panther-civil-war",
  "black-tarantula",
  "black-widow",
  "black-widow-claire-voyant",
  "black-widow-deadly-origin",
  "blade-stellar-forged",
  "blue-marvel",
  "cable",
  "captain-america-infinity-war",
  "captain-america-sam-wilson",
  "captain-britain",
  "carina-tivan",
  "carnage",
  "cassie-lang",
  "civil-warrior",
  "colossus-age-of-apocalypse",
  "count-nefaria",
  "cull-obsidian"
];

test('batch 08 adds forty distinct profiles and 120 referenced, original decisions',()=>{
 assert.equal(ids.length,40);
 assert.equal(new Set(ids).size,40);
 const sourceIds=new Set(db.sources.map(s=>s.id));
 for(const id of ids){
  const c=db.champions.find(x=>x.id===id);
  assert(c,id);
  assert.equal(c.fieldNotes?.checkedAt,'2026-11-05',id);
  assert.equal(c.fieldNotes.decisions.length,3,id);
  assert(c.fieldNotes.sourceIds.length>=2,id);
  for(const sid of c.fieldNotes.sourceIds)assert(sourceIds.has(sid),id+': '+sid);
  for(const d of c.fieldNotes.decisions){
   assert(d.title.length>=12,id);
   assert(d.text.length>=90,id);
  }
  const html=championFieldNotes(db,c);
  assert.match(html,/What to check in the fight/,id);
  assert.match(html,/Evidence & sources/,id);
  const notes=JSON.stringify(c.fieldNotes);
  for(const marker of ['referenceFacts','battlecastId','statcastId','statFocusRecommendation'])
   assert(!notes.includes(marker),id+': '+marker);
 }
});

test('batch 08 brings field-note coverage to 210 and keeps previous cohorts',()=>{
 const audit=championEnrichmentAudit(db);
 assert.equal(audit.summary.totalChampions,334);
 assert.equal(audit.summary.batchSize,40);
 assert.equal(audit.summary.completedPilot,210);
 assert.equal(audit.summary.identityReview,2);
 assert.equal(audit.summary.queued,122);
 assert.equal(audit.summary.batches,4);
 for(const id of ['doctor-doom','silk','kate-bishop','sunspot','colossus',
  'scorpion','terrax','blade','psylocke','colossus-age-of-apocalypse'])
  assert.equal(db.champions.find(c=>c.id===id)?.fieldNotes?.decisions?.length,3,id);
 assert.equal(db.champions.find(c=>c.id==='beast')?.fieldNotes?.decisions?.length||0,0);
});

test('version and identity qualifications remain visible in new notes',()=>{
 const carina=championFieldNotes(db,db.champions.find(x=>x.id==='carina-tivan'));
 const colossus=championFieldNotes(db,db.champions.find(x=>x.id==='colossus-age-of-apocalypse'));
 const blade=championFieldNotes(db,db.champions.find(x=>x.id==='blade-stellar-forged'));
 assert.match(carina,/Myriad/);
 assert.match(colossus,/community report/i);
 assert.match(blade,/original Blade/i);
});
