import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validate} from '../src/domain.mjs';
import {matchingProtections} from '../src/protections.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const c=id=>{const v=db.champions.find(x=>x.id===id);assert(v,id);return v};
const p=(id,e)=>c(id).protections.find(x=>x.effectId===e);
test('eleven researched protection records match activation conditions',()=>{
 const cases=[
 ['iron-man-infinity-war','coldsnap','Molecular Armor','conditional'],
 ['kindred','stun','Dread Aura','conditional'],
 ['lady-deathstrike','ability-accuracy-reduction','Mutant','conditional'],
 ['lady-deathstrike','armor-break','Nanobots Regenerator','conditional'],
 ['lady-deathstrike','heal-block','Willpower','always'],
 ['lady-deathstrike','rupture','Armor Up','conditional'],
 ['longshot','ability-accuracy-reduction','Debuffs','conditional'],
 ['madelyne-pryor','rupture','Force Field','conditional'],
 ['photon','neutralize','awakened','conditional'],
 ['purgatory','bleed','synergy','conditional'],
 ['red-skull','ability-accuracy-reduction','Mutant','conditional']
 ];
 for(const [id,e,condition,availability] of cases){
  const r=p(id,e);assert(r,id+':'+e);
  assert.equal(r.availability,availability,id+':'+e);
  assert(r.condition.includes(condition),id+':'+e);
  assert(r.sourceIds.length>0);
  if(availability==='conditional')assert(!matchingProtections(c(id),{immunity:e,activation:'always'}).length,id+':'+e);
 }
 assert.deepEqual(validate(db),[]);
});
