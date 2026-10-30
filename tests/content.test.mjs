import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {search,validate} from '../src/domain.mjs';
import {requirementCheck} from '../src/roster.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
test('form-dependent immunities do not leak into unconditional search',()=>{
 for(const immunity of ['bleed','shock','incinerate','poison'])assert(!search(db,immunity+' immune').champions.some(c=>c.id==='absorbing-man'));
 assert(search(db,'armor break immune').champions.some(c=>c.id==='absorbing-man'));
 assert(!search(db,'armor break immune').champions.some(c=>c.id==='nimrod'));
});
test('awakened-only counter plans exclude unawakened roster entries',()=>{
 for(const id of ['kitty-bullseye','archangel-absorbing-man']){
 const c=db.counters.find(c=>c.id===id);
 assert.equal(requirementCheck(c,{awakened:false,signature:0}).eligible,false);
 assert.match(requirementCheck(c,{awakened:true,signature:1}).message,/unreviewed/);
 }
});
test('new research remains community sourced and uses valid dated references',()=>{
 assert.deepEqual(validate(db),[]);
 for(const c of db.counters.filter(c=>c.review?.reviewedAt==='2026-10-21')){
 assert.notEqual(c.review.status,'tested');assert.equal(c.review.gameVersion,null);assert(c.score<4);
 assert(c.sourceIds.some(id=>db.sources.find(s=>s.id===id)?.kind==='community-report'));
 }
});
