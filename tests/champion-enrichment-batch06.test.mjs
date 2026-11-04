import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {championEnrichmentAudit} from '../scripts/champion-enrichment-tracker.mjs';
import {championFieldNotes} from '../src/champion-field-notes.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const ids=[
 'terrax','bishop','hyperion','crossbones','dormammu',
 'dragon-man','guillotine-2099','hulk','man-thing','medusa',
 'morningstar','red-skull','sauron','vulture','agatha-harkness',
 'agent-venom','air-walker','black-bolt','blade','captain-america'
];

test('batch 06 adds twenty source-linked profiles and sixty editorial decisions',()=>{
 assert.equal(new Set(ids).size,20);
 const sources=new Set(db.sources.map(s=>s.id));
 for(const id of ids){
  const c=db.champions.find(x=>x.id===id);
  assert(c,id);
  const notes=c.fieldNotes;
  assert.equal(notes?.checkedAt,'2026-11-05',id);
  assert.equal(notes.decisions.length,3,id);
  assert(notes.sourceIds.length>=2,id);
  for(const sourceId of notes.sourceIds)assert(sources.has(sourceId),id+' '+sourceId);
  for(const note of notes.decisions){
   assert(note.title.length>=12,id);
   assert(note.text.length>=90,id);
  }
  const html=championFieldNotes(db,c);
  assert.match(html,/What to check in the fight/,id);
  assert.match(html,/Evidence & sources/,id);
  assert.equal((html.match(/class="panel"/g)||[]).length,3,id);
 }
});

test('the enriched roster now has 130 profiles and retains prior cohorts',()=>{
 for(const id of ['doctor-doom','silk','kate-bishop','sunspot','colossus','scorpion',
  'nick-fury','magik','sasquatch'])
  assert.equal(db.champions.find(x=>x.id===id)?.fieldNotes?.decisions?.length,3,id);
 const report=championEnrichmentAudit(db);
 assert.equal(report.summary.totalChampions,334);
 assert(report.summary.completedPilot>=130,'batch 06 coverage persists through larger batches');
 assert.equal(report.summary.identityReview,2);
 assert(report.summary.queued<=202,'subsequent batches should not increase the queue');
 assert.equal(report.summary.batches,Math.ceil(report.summary.queued/report.summary.batchSize));
});

test('version caveats and content-safety restrictions remain visible',()=>{
 const g=championFieldNotes(db,db.champions.find(x=>x.id==='guillotine-2099'));
 const a=championFieldNotes(db,db.champions.find(x=>x.id==='agatha-harkness'));
 const b=championFieldNotes(db,db.champions.find(x=>x.id==='blade'));
 assert.match(g,/historical bug reports/i);
 assert.match(a,/older fan concepts/i);
 assert.match(b,/Stellar.Forged Blade/i);
 for(const id of ids){
  const notes=JSON.stringify(db.champions.find(x=>x.id===id).fieldNotes);
  for(const key of ['referenceFacts','battlecastId','statcastId','statFocusRecommendation'])
   assert(!notes.includes(key),id+': '+key);
 }
});
