import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {championEnrichmentAudit} from '../scripts/champion-enrichment-tracker.mjs';
import {championFieldNotes} from '../src/champion-field-notes.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const ids=[
  "captain-america-wwii",
  "cassandra-nova",
  "cosmic-ghost-rider",
  "cyclops-blue-team",
  "daredevil-classic",
  "darkhawk",
  "dazzler",
  "deadpool-x-force",
  "diablo",
  "doctor-octopus",
  "dracula",
  "elektra",
  "gambit",
  "gentle",
  "ghost",
  "green-goblin",
  "groot",
  "hulk-ragnarok",
  "ikaris",
  "iron-fist-immortal",
  "iron-man-infinity-war",
  "iron-patriot",
  "isophyne",
  "kang",
  "kindred",
  "king-groot",
  "loki",
  "madelyne-pryor",
  "magneto-house-of-x",
  "mangog",
  "masacre",
  "nebula",
  "nico-minoru",
  "nightcrawler",
  "northstar",
  "odin",
  "pixie",
  "professor-x",
  "proxima-midnight",
  "psycho-man"
];

test('batch 07 has 40 unique champion profiles with 120 source-linked decisions',()=>{
 assert.equal(new Set(ids).size,40);
 const sources=new Set(db.sources.map(x=>x.id));
 for(const id of ids){
  const champ=db.champions.find(x=>x.id===id);
  assert(champ,id);
  const notes=champ.fieldNotes;
  assert.equal(notes?.checkedAt,'2026-11-05',id);
  assert.equal(notes.decisions.length,3,id);
  assert(notes.sourceIds.length>=2,id);
  for(const s of notes.sourceIds)assert(sources.has(s),id+' '+s);
  for(const n of notes.decisions){
   assert(n.title.length>=12,id);
   assert(n.text.length>=90,id);
  }
  assert.match(championFieldNotes(db,champ),/What to check in the fight/,id);
  const body=JSON.stringify(notes);
  assert(!body.includes('referenceFacts'),id);
  assert(!body.includes('battlecastId'),id);
  assert(!body.includes('statcastId'),id);
 }
});

test('40-size batches preserve all earlier 130 profiles and 2 special exceptions',()=>{
 const report=championEnrichmentAudit(db);
 assert.equal(report.summary.totalChampions,334);
 assert.equal(report.summary.batchSize,40);
 assert(report.summary.completedPilot>=170,'batch 07 coverage persists through subsequent batches');
 assert.equal(report.summary.identityReview,2);
 assert(report.summary.queued<=162,'new batches do not increase missing profile queue');
 assert.equal(report.summary.batches,Math.ceil(report.summary.queued/report.summary.batchSize));
 assert.equal(report.rows.filter(x=>x.batch===1).length,Math.min(report.summary.batchSize,report.summary.queued));
 for(const id of ['doctor-doom','silk','kate-bishop','sunspot','colossus','scorpion','terrax','blade'])
  assert.equal(db.champions.find(x=>x.id===id)?.fieldNotes?.decisions?.length,3,id);
 assert.equal(db.champions.find(x=>x.id==='beast')?.fieldNotes?.decisions?.length||0,0);
});
