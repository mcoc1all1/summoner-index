import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {championEnrichmentAudit} from '../scripts/champion-enrichment-tracker.mjs';
import {championFieldNotes} from '../src/champion-field-notes.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const ids=['sunspot','absorbing-man','galan','hulkling','enchantress','domino','hulkbuster','aegon',
 'black-cat','killmonger','mantis','mojo','mordo','spider-gwen','spider-man-classic',
 'spider-man-supreme','symbiote-supreme','wasp','corvus-glaive','mister-sinister'];
test('batch 03 adds 20 source-linked unique champion field notes',()=>{
 assert.equal(new Set(ids).size,20);
 const sources=new Set(db.sources.map(s=>s.id));
 for(const id of ids){
  const c=db.champions.find(x=>x.id===id);
  assert(c,id);
  assert.equal(c.fieldNotes?.checkedAt,'2026-11-05',id);
  assert.equal(c.fieldNotes?.decisions?.length,3,id);
  assert(c.fieldNotes.sourceIds.length>=2,id);
  for(const sid of c.fieldNotes.sourceIds)assert(sources.has(sid),id+' '+sid);
  for(const note of c.fieldNotes.decisions)assert(note.text.length>=85,id);
  assert.match(championFieldNotes(db,c),/What to check in the fight/);
 }
});
test('batch 03 preserves 50 earlier enriched records and queued identity reviews',()=>{
 for(const id of ['doctor-doom','warlock','magneto','silk','kate-bishop','red-guardian','wiccan','havok'])
  assert.equal(db.champions.find(x=>x.id===id)?.fieldNotes?.decisions?.length,3,id);
 const report=championEnrichmentAudit(db);
 assert.equal(report.summary.totalChampions,334);
 assert.equal(report.summary.completedPilot,70);
 assert.equal(report.summary.queued,262);
 assert.equal(report.summary.identityReview,2);
 assert.equal(report.summary.batches,14);
});
test('field notes contain no imported kit arrays or relic pairings',()=>{
 for(const id of ids){
  const content=JSON.stringify(db.champions.find(c=>c.id===id).fieldNotes);
  assert(!content.includes('referenceFacts'));
  assert(!content.includes('battlecastId'));
  assert(!content.includes('statcastId'));
 }
});
