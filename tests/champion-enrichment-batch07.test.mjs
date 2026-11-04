import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {championEnrichmentAudit} from '../scripts/champion-enrichment-tracker.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const patch=JSON.parse(fs.readFileSync(new URL('../content/counter-zz-priority-batch07a-patches.json',import.meta.url),'utf8'));
const ids=patch.championPatches.map(x=>x.id);
test('batch 07A contributes eight unique source-linked champion decision sets',()=>{
 assert.equal(ids.length,8);assert.equal(new Set(ids).size,8);
 const sourceIds=new Set(db.sources.map(s=>s.id));
 for(const p of patch.championPatches){
  const c=db.champions.find(x=>x.id===p.id);
  assert(c,p.id);
  assert.equal(c.fieldNotes?.decisions?.length,2,p.id);
  assert.equal(p.fieldNotes.decisions.length,2,p.id);
  for(const s of p.fieldNotes.sourceIds)assert(sourceIds.has(s),p.id+': '+s);
  for(const d of p.fieldNotes.decisions){assert(d.title.length>15);assert(d.text.length>100)}
 }
});
test('tracker preserves roster count and previously enriched profiles',()=>{
 const report=championEnrichmentAudit(db);
 assert.equal(report.summary.totalChampions,334);
 assert(report.summary.completedPilot>=138,'previously published coverage must remain');
 assert.equal(report.summary.batchSize,40);
 assert.equal(report.summary.queued+report.summary.completedPilot+report.summary.identityReview,334);
});
