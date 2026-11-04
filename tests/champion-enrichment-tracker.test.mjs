import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {championEnrichmentAudit,trackerCsv} from '../scripts/champion-enrichment-tracker.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
test('complete roster coverage yields a stable prioritized batch queue and reviewed exceptions',()=>{
 const result=championEnrichmentAudit(db);
 assert.equal(result.summary.totalChampions,db.champions.length);
 assert(result.summary.completedPilot>=10,'must preserve first ten enriched champions');
 assert.equal(result.summary.identityReview,2,'special roster-only characters are not automatically assigned guides');
 assert.equal(result.summary.queued+result.summary.completedPilot+result.summary.identityReview,result.summary.totalChampions);
 assert(result.summary.batches>=15,'all remaining roster entries need explicit batch coverage');
 const work=result.rows.filter(r=>r.batch!==null);
 assert.equal(new Set(work.map(r=>r.id)).size,work.length);
 assert(work.every((r,i)=>r.priorityRank>0),'all queued profiles have a rank');
 for(const r of work)assert(r.batch>=1&&r.batch<=result.summary.batches);
 for(const exception of ['summoned-symbioid','ghost-rider-robbie-reyes']){
  const row=result.rows.find(r=>r.id===exception);
  assert(row?.identityReview,exception);
  assert.equal(row.batch,null,exception);
 }
});
test('tracker exports no protected kit compilations or withheld Stat Focus picks',()=>{
 const report=championEnrichmentAudit(db);
 const text=trackerCsv(report);
 assert.equal(text.trim().split('\n').length,db.champions.length+1);
 assert(!text.includes('attackFocus'));
 assert(!text.includes('battlecastId'));
 assert(!text.includes('referenceFacts'));
 assert(text.includes('No scoped protection records (not a claim of no immunities)'));
 const first=report.rows.find(r=>r.batch===1);
 assert(first);
 assert(first.priorityRank===1);
});
test('priority queue is deterministic and configurable without orphaning champions',()=>{
 const a=championEnrichmentAudit(db,{batchSize:20});
 const b=championEnrichmentAudit(db,{batchSize:25});
 assert.equal(a.summary.queued,b.summary.queued);
 assert.deepEqual(a.rows.filter(x=>x.batch===1).map(x=>x.id),
  championEnrichmentAudit(db,{batchSize:20}).rows.filter(x=>x.batch===1).map(x=>x.id));
 assert.throws(()=>championEnrichmentAudit(db,{batchSize:0}),/Batch size/);
});
