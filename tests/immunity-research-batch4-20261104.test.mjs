import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {matchingProtections} from '../src/protections.mjs';
import {validate} from '../src/domain.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const champ=id=>db.champions.find(c=>c.id===id);
const protection=(id,effect)=>champ(id)?.protections?.find(p=>p.effectId===effect);
test('synergy and resource-gated immunities are never advertised as unconditional',()=>{
 const cases=[
  ['magik','bleed','Purgatory'],
  ['the-hood','bleed','Purgatory'],
  ['the-overseer','neutralize','Spider-Man (Supreme)'],
  ['the-overseer','reversed-controls','Hulk'],
  ['spiral','reversed-controls','Gambit'],
  ['thanos-deathless','power-burn','Vision (Deathless)'],
  ['thanos-deathless','power-drain','Vision (Deathless)'],
  ['solvarch','crush','Steadfast']
 ];
 for(const [id,e,condition] of cases){
  const p=protection(id,e);assert(p,id+':'+e);
  assert.equal(p.availability,'conditional',id+':'+e);
  assert(p.condition.includes(condition),id+':'+e);
  assert(p.sourceIds.length>0);
  assert.equal(matchingProtections(champ(id),{immunity:e,activation:'always'}).length,0,id+':'+e);
 }
});
test('regeneration-rate cap is not a broad immunity and Maker lacks generic Shock immunity',()=>{
 for(const [id,e] of [['solvarch','regen-rate-mod'],['the-maker','shock']]){
  assert(!champ(id).immunityIds.includes(e),id+':'+e);
  assert(!protection(id,e),id+':'+e);
 }
 assert.deepEqual(validate(db),[]);
});
