import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validate} from '../src/domain.mjs';
const read=(name)=>JSON.parse(fs.readFileSync(new URL('../content/'+name,import.meta.url),'utf8'));
const db=read('catalog.json');
const files=['stat-focus-60-current-refresh-patches.json','stat-focus-70-editorial-rationale-patches.json','stat-focus-80-editorial-rationale-patches.json','stat-focus-90-editorial-rationale-patches.json'];
const rows=files.flatMap(file=>read(file).championPatches.map(row=>({file,id:row.id,...row.statFocusRecommendation})));
test('32 champion-specific Stat Focus rationales are complete and sourced',()=>{
 assert.equal(rows.length,32);
 assert.equal(new Set(rows.map(x=>x.id)).size,32);
 for(const x of rows){
  assert.equal(x.confidence,'medium',x.id);
  assert(Array.isArray(x.sourceIds)&&x.sourceIds.length>=1,x.id);
  assert(x.attackReason?.length>120,x.id+': attack rationale');
  assert(x.defenseReason?.length>120,x.id+': defense rationale');
  assert(x.note?.toLowerCase().includes('not')||x.note?.toLowerCase().includes('editorial'),x.id+': tentative note');
  for(const sourceId of x.sourceIds)assert(db.sources.some(s=>s.id===sourceId),x.id+':'+sourceId);
  const champion=db.champions.find(c=>c.id===x.id);assert(champion,x.id);
  assert.equal(champion.statFocusReview?.confidence,'medium',x.id);
  assert.equal(champion.loadout?.attackFocus,x.attackFocus,x.id);
  assert.equal(champion.loadout?.defenseFocus,x.defenseFocus,x.id);
 }
 assert.deepEqual(validate(db),[]);
});
