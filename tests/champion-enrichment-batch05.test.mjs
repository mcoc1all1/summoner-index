import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {championEnrichmentAudit} from '../scripts/champion-enrichment-tracker.mjs';
import {championFieldNotes} from '../src/champion-field-notes.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const ids=[
 'scorpion','titania','void','vox','abomination','apocalypse',
 'captain-marvel-classic','ms-marvel','ms-marvel-kamala-khan','nick-fury',
 'vision','annihilus','captain-marvel','dust','iron-man',
 'iron-man-infamous','jack-olantern','kingpin','magik','sasquatch'
];

test('batch 05 adds 20 unique profiles with 60 original source-linked decisions',()=>{
 assert.equal(new Set(ids).size,20);
 const sources=new Set(db.sources.map(s=>s.id));
 for(const id of ids){
  const champion=db.champions.find(c=>c.id===id);
  assert(champion,id);
  const notes=champion.fieldNotes;
  assert.equal(notes?.checkedAt,'2026-11-05',id);
  assert.equal(notes.decisions.length,3,id);
  assert(notes.sourceIds.length>=2,id);
  for(const sourceId of notes.sourceIds)assert(sources.has(sourceId),id+': '+sourceId);
  for(const note of notes.decisions){
   assert(note.title.length>=12,id);
   assert(note.text.length>=90,id);
  }
  const html=championFieldNotes(db,champion);
  assert.match(html,/What to check in the fight/,id);
  assert.match(html,/Evidence & sources/,id);
  assert.equal((html.match(/class="panel"/g)||[]).length,3,id);
 }
});

test('batch 05 reaches 110 enriched records without losing past notes',()=>{
 const prior=['doctor-doom','venom','silk','falcon','kate-bishop',
  'wiccan','sunspot','mister-sinister','colossus','iceman','attuma'];
 for(const id of prior)assert.equal(db.champions.find(c=>c.id===id)?.fieldNotes?.decisions?.length,3,id);
 const report=championEnrichmentAudit(db);
 assert.equal(report.summary.totalChampions,334);
 assert(report.summary.completedPilot>=110,'batch 05 remains published after later enrichment');
 assert(report.summary.identityReview<=2,'identity exceptions may be resolved in later batches');
 assert(report.summary.queued<=222,'the unreviewed queue must not grow');
 assert(report.summary.batches<=12,'later batches must shrink the remaining workload');
});

test('variant distinctions, source validity and publication-safety hold',()=>{
 const nick=championFieldNotes(db,db.champions.find(c=>c.id==='nick-fury'));
 const captain=championFieldNotes(db,db.champions.find(c=>c.id==='captain-marvel'));
 const classic=championFieldNotes(db,db.champions.find(c=>c.id==='captain-marvel-classic'));
 assert.match(nick,/unawakened/i);
 assert.match(captain,/Binary/);
 assert.match(classic,/Classic/);
 for(const id of ids){
  const notes=JSON.stringify(db.champions.find(c=>c.id===id).fieldNotes);
  for(const key of ['referenceFacts','battlecastId','statcastId','statFocusRecommendation'])
   assert(!notes.includes(key),id+': '+key);
 }
});
