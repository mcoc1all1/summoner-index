import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validate} from '../src/domain.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const boss=id=>db.bosses.find(b=>b.id===id);
test('four researched Act 7 and 8 guide rewrites are sourced and explicitly untested',()=>{
 for(const id of ['gwenmaster','kang-conqueror','scytalis','bahamet']){
  const b=boss(id);assert(b,id);
  assert.equal(b.reviewedAt,'2026-11-04');
  assert.equal(b.verification.gameplayTested,false);
  assert.match(b.verification.label,/community-sourced/i);
  assert(b.sourceIds.length>=4);
  for(const sourceId of b.sourceIds)assert(db.sources.some(s=>s.id===sourceId),id+':'+sourceId);
  assert(b.guideDetails.preparation.length>=3);
  assert(b.guideDetails.troubleshooting.length>=4);
  assert.match(b.guideDetails.scope,/not independently|not a recorded gameplay test/i);
 }
 assert.deepEqual(validate(db),[]);
});
test('Scytalis traps and Bahamet charge reflection distinguish their final phases',()=>{
 const s=boss('scytalis'),b=boss('bahamet');
 assert.match(s.phases.at(-1).text,/7.5 seconds/);
 assert.match(s.phases.at(-1).text,/Prowess/);
 assert.match(s.phases.at(-1).text,/will not remove Corrupted Armor/);
 assert.match(b.phases[2].text,/Removal charge/i);
 assert.match(b.phases[2].text,/heavy release/i);
 assert.match(b.phases[3].text,/red Fire Blast/i);
 assert.match(b.phases[4].text,/no longer required/i);
});
test('Kang Power Loop and Gwenmaster Plot Armor remain separate quest mechanics',()=>{
 const k=boss('kang-conqueror'),g=boss('gwenmaster');
 assert.match(k.phases.at(-1).text,/SP3/);
 assert.match(k.avoid,/Paradox/);
 assert.equal(g.phases.length,7);
 assert.match(g.phases[4].text,/Heavy, SP1, SP2 and SP3/);
 assert.match(g.phases[0].text,/Plot Armor/);
});
