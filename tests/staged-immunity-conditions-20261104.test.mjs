import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validate} from '../src/domain.mjs';
import {matchingProtections,protectionLabel} from '../src/protections.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const get=id=>{const c=db.champions.find(x=>x.id===id);assert(c,id);return c;};
const effect=(id,e)=>get(id).protections?.find(p=>p.effectId===e);
test('sourced conditional immunities preserve prerequisite wording and evidence',()=>{
 const checks=[
  ['peni-parker','stun','Sync-Shield'],
  ['titania','bleed','Absorbing Man'],
  ['rintrah','stun','15 Mystical Charges'],
  ['juggernaut','reversed-controls','Gem of Cyttorak'],
  ['nick-fury','stun','Life Model Decoy'],
  ['hulk','buff','Silver Surfer'],
  ['lizard','heal-block','Unstoppable'],
  ['ironheart','coldsnap','Armor Up'],
  ['mysterio','reversed-controls','Emma Frost'],
  ['crossbones','nullify','Hydra Recruitment'],
  ['prowler','reversed-controls','Spider-Punk'],
  ['the-hood','stun','Invisibility'],
 ];
 for(const [id,e,word] of checks){
  const p=effect(id,e);assert(p,id+':'+e);assert.equal(p.availability,'conditional',id+':'+e);
  assert(p.condition.includes(word),id+':'+e);
  assert(p.sourceIds.length>0);
  assert.match(p.checkedAt,/^\d{4}-\d{2}-\d{2}$/);
  assert.equal(matchingProtections(get(id),{immunity:e,activation:'always'}).length,0);
 }
});
test('effect-level sources do not falsely claim Debuff-only or passive-only protection',()=>{
 for(const [id,e] of [['red-skull','nullify'],['titania','buff'],['bullseye','precision'],['mysterio','reversed-controls'],['doctor-bong','power-sting']]){
  const p=effect(id,e);assert(p,id+':'+e);
  assert.deepEqual(p.forms,['effect']);
  assert.match(protectionLabel(p),/Effect-level interaction/);
  assert.equal(matchingProtections(get(id),{immunity:e,form:'debuff'}).length,0);
 }
});
test('disputed blanket immune labels are withdrawn from ordinary filters',()=>{
 for(const [id,e] of [['serpent','death'],['moondragon','death'],['black-widow-claire-voyant','buff'],['nico-minoru','buff'],['ironheart','ability-accuracy-reduction']]){
  assert(!get(id).immunityIds.includes(e),id+':'+e);
  assert(!effect(id,e),id+':'+e);
 }
 for(const e of ['nullify','power-sting'])assert.equal(effect('doctor-bong',e).availability,'always');
 for(const e of ['fate-seal','special-lock','power-lock','heal-block'])assert.equal(effect('serpent',e).availability,'always');
 assert.deepEqual(validate(db),[]);
});
