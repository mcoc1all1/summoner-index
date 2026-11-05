import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const data=JSON.parse(fs.readFileSync(new URL('../content/boss-commercial-review-casefiles.json',import.meta.url),'utf8'));
const patch=JSON.parse(fs.readFileSync(new URL('../content/boss-zzzz-commercial-clarifications-patches.json',import.meta.url),'utf8'));
const catalog=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));

test('source-comparison casefiles never self-certify rights from community evidence',()=>{
 const expected=['gwenmaster','kang-conqueror','scytalis','bahamet'];
 assert.deepEqual(data.cases.map(x=>x.id),expected);
 assert.equal(data.status,'pending');
 for(const row of data.cases){
  assert.equal(row.status,'pending',row.id);
  assert(row.expressionAssessment.trim().length>=30,row.id+' expression assessment needs detail');
  assert(row.arrangementAssessment.trim().length>=30,row.id+' arrangement assessment needs detail');
  assert(row.openIssues.length>=1,row.id);
  assert(row.sources.length>=2,row.id);
  assert(row.sources.some(s=>s.access==='text-compared'),row.id);
  for(const source of row.sources){
   assert(new URL(source.url).protocol==='https:',row.id);
   assert(source.finding.length>50,row.id);
  }
 }
});

test('four revised boss troubleshooting notes survive merged patch rendering and keep source evidence',()=>{
 assert.equal(patch.reviewedAt,'2026-11-05');
 assert.equal(patch.bossPatches.length,4);
 for(const row of patch.bossPatches){
  const boss=catalog.bosses.find(item=>item.id===row.id);
  assert(boss,row.id);
  assert(boss.sourceIds.length>0,row.id);
  assert.deepEqual(boss.guideDetails.troubleshooting,row.guideDetails.troubleshooting,row.id+' latest editorial patch not present');
  assert.match(boss.avoid,/not|No|source-based|review|tested/i,row.id+' must not appear certified');
 }
 assert.match(catalog.bosses.find(b=>b.id==='bahamet').guideDetails.troubleshooting.find(t=>t.problem.includes('parry or heavy')).response,/Removal charge/);
 assert.match(catalog.bosses.find(b=>b.id==='kang-conqueror').guideDetails.troubleshooting.find(t=>t.problem.includes('Time Collapse')).response,/Paradox/);
});
