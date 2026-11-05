import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {championEnrichmentAudit} from '../scripts/champion-enrichment-tracker.mjs';
import {championFieldNotes} from '../src/champion-field-notes.mjs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const ids=[
  "spider-man-2099",
  "spider-man-noir",
  "spider-punk",
  "spider-slayer-j-jonah-jameson",
  "spider-woman",
  "spiral",
  "squirrel-girl",
  "star-lord",
  "storm",
  "storm-pyramid-x",
  "stryfe",
  "super-skrull",
  "superior-iron-man",
  "taskmaster",
  "thanos-deathless",
  "the-champion",
  "the-destroyer",
  "the-hood",
  "the-leader",
  "the-maker",
  "the-overseer",
  "thor-jane-foster",
  "thor-ragnarok",
  "toad",
  "ultron",
  "ultron-classic",
  "valkyrie",
  "venom-the-duck",
  "venompool",
  "vision-deathless",
  "viv-vision",
  "war-machine",
  "wave",
  "werewolf-by-night",
  "white-tiger",
  "winter-soldier",
  "wolverine-weapon-x",
  "wolverine-x-23",
  "wong",
  "yelena-belova"
];

test('batch 11 adds forty source-linked champion profiles and 120 distinct decisions',()=>{
 assert.equal(ids.length,40);
 assert.equal(new Set(ids).size,40);
 const knownSources=new Set(db.sources.map(s=>s.id));
 const contentTexts=new Set();
 for(const id of ids){
  const champion=db.champions.find(c=>c.id===id);
  assert(champion,id);
  const notes=champion.fieldNotes;
  assert.equal(notes?.checkedAt,'2026-11-05',id);
  assert.equal(notes.decisions.length,3,id);
  assert(notes.sourceIds.length>=2,id);
  for(const sid of notes.sourceIds)assert(knownSources.has(sid),id+': '+sid);
  for(const note of notes.decisions){
   assert(note.title.length>=12,id);
   assert(note.text.length>=90,id);
   assert(!contentTexts.has(note.text),id+' duplicated editorial note');
   contentTexts.add(note.text);
  }
  const html=championFieldNotes(db,champion);
  assert.match(html,/What to check in the fight/,id);
  assert.match(html,/Evidence & sources/,id);
  assert.equal((html.match(/class="panel"/g)||[]).length,3,id);
  const text=JSON.stringify(notes);
  for(const key of ['referenceFacts','battlecastId','statcastId','statFocusRecommendation'])
   assert(!text.includes(key),id+': '+key);
 }
 assert.equal(contentTexts.size,120);
});

test('batch 11 reaches 330 of 334 profiles without claiming unreviewed entries',()=>{
 const report=championEnrichmentAudit(db);
 assert.equal(report.summary.totalChampions,334);
 assert.equal(report.summary.batchSize,40);
 assert(report.summary.completedPilot>=330,'prior forty champion cohort remains enriched');
 assert(report.summary.queued<=2,'remaining eligible queue may shrink');
 assert(report.summary.identityReview<=2,'identity exceptions can be resolved');
 assert.equal(report.summary.batches,Math.ceil(report.summary.queued/report.summary.batchSize));
 assert.equal(report.summary.completedPilot+report.summary.queued+report.summary.identityReview,334);
 for(const id of ['doctor-doom','silk','kate-bishop','terrax','psylocke',
 'mister-negative','spider-man-noir','yelena-belova']){
  assert.equal(db.champions.find(c=>c.id===id)?.fieldNotes?.decisions?.length,3,id);
 }
 for(const id of ['beast']){
  assert.equal(db.champions.find(c=>c.id===id)?.fieldNotes?.decisions?.length||0,0,
   id+' must remain queued for an explicit follow-up');
 }
});

test('current source caveats and variant distinctions survive public rendering',()=>{
 const noir=championFieldNotes(db,db.champions.find(c=>c.id==='spider-man-noir'));
 const maker=championFieldNotes(db,db.champions.find(c=>c.id==='the-maker'));
 const wave=championFieldNotes(db,db.champions.find(c=>c.id==='wave'));
 assert.match(noir,/October patch/);
 assert.match(maker,/unofficial fan-designed/i);
 assert.match(wave,/Community recap/i);
});
