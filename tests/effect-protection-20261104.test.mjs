import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {applyAccuracyPatches} from '../src/accuracy-patches.mjs';
import {matchingProtections,protectionLabel} from '../src/protections.mjs';
import {validate} from '../src/domain.mjs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const followup=JSON.parse(fs.readFileSync(new URL('../content/immunity-verified-20261104b-patches.json',import.meta.url),'utf8'));
const updated=applyAccuracyPatches(db,followup);
const c=id=>updated.champions.find(champ=>champ.id===id);
const p=(champ,effect)=>c(champ).protections?.find(x=>x.effectId===effect);

test('effect-level immunity does not falsely claim debuff or passive scope',()=>{
 const red=p('red-skull','nullify');
 assert(red);assert.deepEqual(red.forms,['effect']);
 assert.equal(red.availability,'conditional');
 assert.match(red.condition,/Champion abilities/);
 assert.match(red.condition,/quest node/);
 assert.match(protectionLabel(red),/Effect-level interaction/);
 assert.equal(matchingProtections(c('red-skull'),{immunity:'nullify',form:'debuff'}).length,0);
 assert.equal(matchingProtections(c('red-skull'),{immunity:'nullify',form:'effect',activation:'conditional'}).length,1);
 assert.equal(matchingProtections(c('red-skull'),{immunity:'nullify',activation:'always'}).length,0);
 for(const effect of ['nullify','fate-seal','stagger']){
  assert.equal(p('red-skull',effect).forms[0],'effect');
 }
});

test('stun, reverse controls, and self-Buff immunity are labeled with their actual prerequisites',()=>{
 assert.match(p('rintrah','stun').condition,/15 Mystical Charges/);
 assert.equal(p('rintrah','stun').availability,'conditional');
 assert.match(p('nick-fury','stun').condition,/Life Model Decoy/);
 assert.equal(p('nick-fury','stun').availability,'conditional');
 assert.match(p('juggernaut','reversed-controls').condition,/Gem of Cyttorak/);
 assert.equal(p('juggernaut','reversed-controls').availability,'conditional');
 const t=p('titania','buff');
 assert.equal(t.availability,'always');
 assert.deepEqual(t.forms,['effect']);
 assert.match(t.condition,/Neutralize/);
 assert.match(t.condition,/self-Buff immunity/);
});

test('follow-up patch validates and all effect records cite dated evidence',()=>{
 assert.deepEqual(validate(updated),[]);
 for(const id of ['rintrah','nick-fury','juggernaut','red-skull','titania']){
  for(const p of c(id).protections||[]){
   if(p.checkedAt==='2026-11-04'&&p.forms.includes('effect')){
    assert.match(p.checkedAt,/^\d{4}-\d{2}-\d{2}$/);
    assert(p.sourceIds?.length);
    for(const sourceId of p.sourceIds)assert(updated.sources.some(s=>s.id===sourceId),sourceId);
   }
  }
 }
});
