import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {researchGaps,researchPanel} from '../src/research.mjs';
import {validate} from '../src/domain.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
test('expanded guides retain dated source evidence and separate conditional protection',()=>{
 const expanded=db.champions.filter(c=>c.kitReview?.batch==='roster-expansion');
 assert(expanded.length>=68);
 for(const c of expanded){
  assert.equal(c.rotation.length,3);assert.equal(c.kitReview.gameVersion,null);
  assert(c.sourceIds.some(id=>db.sources.find(s=>s.id===id)?.checkedAt===c.kitReview.checkedAt));
  assert(c.resistanceNote.trim());assert(c.awakening.trim());
 }
 for(const id of ['corvus-glaive','adam-warlock','attuma','iron-man'])assert.deepEqual(db.champions.find(c=>c.id===id).immunityIds,[]);
 assert(!db.immunities.some(i=>i.id==='cold-snap'));
});
test('research gaps distinguish source catalogues from authored guidance',()=>{
 const c=structuredClone(db.champions.find(c=>c.id==='ghost'));
 assert(!researchGaps(db,c).includes('Step-by-step fight sequence'));
 assert(researchGaps(db,c).includes('Current-game combat validation'));
 delete c.rotation;delete c.loadout;c.coverage='roster';
 assert(researchGaps(db,c).includes('Step-by-step fight sequence'));
 assert(researchGaps(db,c).includes('Champion-specific stat-focus trial'));
});
test('research evidence notes are validated and escaped',()=>{
 const copy=structuredClone(db),c=copy.champions[0];
 c.researchReview={status:'source-gap',checkedAt:'2026-10-23',note:'<script>unsafe</script>'};
 assert.deepEqual(validate(copy),[]);
 assert.match(researchPanel(copy,c),/&lt;script/);
 c.researchReview.checkedAt='2026-02-30';assert(validate(copy).some(e=>e.includes('research review')));
});
