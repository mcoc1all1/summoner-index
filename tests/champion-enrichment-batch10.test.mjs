import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {championEnrichmentAudit} from '../scripts/champion-enrichment-tracker.mjs';
import {championFieldNotes} from '../src/champion-field-notes.mjs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const ids=[
  "mister-negative",
  "misty-knight",
  "modok",
  "mole-man",
  "moon-knight",
  "moondragon",
  "morbius",
  "mr-knight",
  "night-thrasher",
  "okoye",
  "old-man-logan",
  "patriot",
  "phoenix",
  "phyla-vell",
  "platinum-pool",
  "prowler",
  "punisher",
  "quick-silver",
  "red-goblin",
  "rhino",
  "ronin",
  "ruby-thursday",
  "sandman",
  "scarlet-witch-sigil",
  "scream",
  "sentry",
  "shatterstar",
  "she-hulk",
  "she-hulk-deathless",
  "silver-centurion",
  "silver-sable",
  "silver-samurai",
  "silver-surfer",
  "solvarch",
  "sorcerer-supreme",
  "spider-man-stark-enhanced",
  "spider-man-miles-morales",
  "spider-man-pavitr-prabhakar",
  "spider-man-stealth-suit",
  "spider-man-symbiote"
];

test('batch 10 adds forty profiles and 120 original source-linked decisions',()=>{
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
  for(const sid of notes.sourceIds)assert(sourceIds.has(sid),id+': '+sid);
  for(const note of notes.decisions){
   assert(note.title.length>=12,id);
   assert(note.text.length>=90,id);
  }
  const html=championFieldNotes(db,c);
  assert.match(html,/What to check in the fight/,id);
  assert.match(html,/Evidence & sources/,id);
  assert.equal((html.match(/class="panel"/g)||[]).length,3,id);
  const body=JSON.stringify(notes);
  for(const key of ['referenceFacts','battlecastId','statcastId','statFocusRecommendation'])
   assert(!body.includes(key),id+': '+key);
 }
});

test('batch 10 preserves history and reaches 290/334 profile-note coverage',()=>{
 const audit=championEnrichmentAudit(db);
 assert.equal(audit.summary.totalChampions,334);
 assert.equal(audit.summary.batchSize,40);
 assert(audit.summary.completedPilot>=290,'batch 10 coverage persists in later cohorts');
 assert(audit.summary.queued<=42,'subsequent batches must not enlarge the outstanding queue');
 assert.equal(audit.summary.identityReview,2);
 assert.equal(audit.summary.batches,Math.ceil(audit.summary.queued/audit.summary.batchSize));
 assert.equal(audit.summary.queued+audit.summary.completedPilot+audit.summary.identityReview,334);
 for(const id of ['doctor-doom','silk','kate-bishop','sunspot','colossus',
  'scorpion','terrax','psylocke','gwenom','mister-fantastic','mister-negative'])
  assert.equal(db.champions.find(x=>x.id===id)?.fieldNotes?.decisions?.length,3,id);
 assert.equal(db.champions.find(x=>x.id==='beast')?.fieldNotes?.decisions?.length||0,0,
  'do not mark unreleased Beast rework kit as reviewed');
});

test('unverified player reports are not presented as established facts',()=>{
 const solvarch=championFieldNotes(db,db.champions.find(x=>x.id==='solvarch'));
 const samurai=championFieldNotes(db,db.champions.find(x=>x.id==='silver-samurai'));
 const shatter=championFieldNotes(db,db.champions.find(x=>x.id==='shatterstar'));
 assert.match(solvarch,/player experiences/i);
 assert.match(samurai,/shield cap/i);
 assert.match(shatter,/Kabam champion spotlight/i);
});
