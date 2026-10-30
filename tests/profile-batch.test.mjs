import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {search,validate} from '../src/domain.mjs';
import {compareTable} from '../src/components.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
test('conditional and adaptive immunities stay out of unconditional filters',()=>{
 for(const id of ['hercules','scorpion','nick-fury','kingpin','apocalypse','black-widow-claire-voyant']){
  const c=db.champions.find(c=>c.id===id);assert.equal(c.coverage,'curated');assert.deepEqual(c.immunityIds,[]);assert(c.resistanceNote);
 }
 for(const effect of ['bleed','poison','shock','incinerate']){
  const ids=search(db,effect+' immune').champions.map(c=>c.id);
  for(const id of ['hercules','scorpion','apocalypse','black-widow-claire-voyant'])assert(!ids.includes(id));
 }
});
test('Hulkling power immunity does not imply Heal Block or Power Lock immunity',()=>{
 for(const effect of ['poison','shock','power-drain','power-steal','power-burn'])assert(search(db,'',{immunity:effect}).champions.some(c=>c.id==='hulkling'));
 for(const effect of ['heal-block','power-lock'])assert(!search(db,'',{immunity:effect}).champions.some(c=>c.id==='hulkling'));
});
test('new profiles and matchup records retain honest review limits',()=>{
 assert.deepEqual(validate(db),[]);
 const ids=['apocalypse','black-widow-claire-voyant','hercules','hulkling','kingpin','nick-fury','scorpion'];const cs=ids.map(id=>db.champions.find(c=>c.id===id));assert(cs.every(Boolean));
 for(const c of cs){assert.equal(c.kitReview.gameVersion,null);assert.equal(c.signatureTarget,null);assert(c.sourceIds.some(s=>s.startsWith('kit-')));}
 for(const id of ['hulkling-peni-parker','scorpion-immortal-abomination']){const c=db.counters.find(c=>c.id===id);assert(c.score<4);assert.equal(c.review.gameVersion,null);}
 assert.match(db.counters.find(c=>c.id==='scorpion-immortal-abomination').strategy,/Select Shock or Rupture/);
});
test('comparison preserves the conditions behind protection',()=>{
 const html=compareTable(db,['scorpion','black-widow-claire-voyant']);
 assert.match(html,/Conditional protection/);assert.match(html,/Default Poison Sting/);assert.match(html,/curse-dependent/);
});
