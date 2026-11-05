import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {championEnrichmentAudit} from '../scripts/champion-enrichment-tracker.mjs';
import {championFieldNotes} from '../src/champion-field-notes.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));

test('Yondu and Robbie have original, source-linked decisions and a reviewed Robbie rotation',()=>{
 const sources=new Set(db.sources.map(x=>x.id));
 for(const id of ['yondu','ghost-rider-robbie-reyes']){
  const c=db.champions.find(x=>x.id===id);
  assert(c,id);
  assert.equal(c.fieldNotes?.decisions?.length,3,id);
  for(const sid of c.fieldNotes.sourceIds)assert(sources.has(sid),id+sid);
  for(const item of c.fieldNotes.decisions)assert(item.text.length>=90,id);
  assert.match(championFieldNotes(db,c),/Evidence & sources/,id);
 }
 const robbie=db.champions.find(x=>x.id==='ghost-rider-robbie-reyes');
 assert.equal(robbie.rotation.length,3);
 assert(robbie.rotation.every(s=>s.length>=70));
 assert.equal(robbie.researchReview.status,'guide-added');
});

test('332 champion notes and exactly the two explicitly scoped gaps remain',()=>{
 const report=championEnrichmentAudit(db);
 assert.equal(report.summary.totalChampions,334);
 assert.equal(report.summary.completedPilot,332);
 assert.equal(report.summary.queued,1);
 assert.equal(report.summary.identityReview,1);
 assert.deepEqual(report.rows.filter(r=>r.status==='Queued').map(r=>r.id),['beast']);
 assert.deepEqual(report.rows.filter(r=>r.status==='Identity review first').map(r=>r.id),['summoned-symbioid']);
});
