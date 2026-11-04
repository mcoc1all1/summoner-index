import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {applyAccuracyPatches} from '../src/accuracy-patches.mjs';
import {matchingProtections} from '../src/protections.mjs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
const patch=JSON.parse(fs.readFileSync(new URL('../content/immunity-verified-20261104-patches.json',import.meta.url)));
const c=id=>updated.champions.find(x=>x.id===id);
const updated=applyAccuracyPatches(db,patch);
const protection=(id,effect)=>c(id).protections.find(p=>p.effectId===effect);

test('reviewed conditional immunity entries never become permanent base immunities',()=>{
 const peni=protection('peni-parker','stun');
 assert.equal(peni.availability,'conditional');
 assert.match(peni.condition,/Sync-Shield/);
 assert.equal(peni.forms.join(','),'debuff');
 const titania=protection('titania','bleed');
 assert.equal(titania.availability,'conditional');
 assert.match(titania.condition,/Absorbing Man/);
 assert(!matchingProtections(c('titania'),{immunity:'bleed',activation:'always'}).length);
 assert(matchingProtections(c('titania'),{immunity:'bleed',activation:'conditional'}).length);
});
test('Serpent survival buff is not listed as a blanket death immunity',()=>{
 const serpent=c('serpent');
 assert(!serpent.immunityIds.includes('death'));
 assert(!serpent.protections?.some(p=>p.effectId==='death'));
 for(const effect of ['fate-seal','special-lock','heal-block','power-lock']){
  const item=protection('serpent',effect);
  assert(item, effect);assert.equal(item.availability,'always');assert(item.sourceIds.length);
 }
});
test('source-scoped protections require dated, attributable evidence',()=>{
 assert.equal(protection('bullseye','fatigue').availability,'always');
 assert.match(protection('the-champion','regen-rate-mod').condition,/final node in a Quest/);
 for(const champion of updated.champions){
  for(const p of champion.protections||[]){
   if(p.checkedAt==='2026-11-04'){
    assert(p.sourceIds.length);
    assert.match(p.checkedAt,/^\\d{4}-\\d{2}-\\d{2}$/);
   }
  }
 }
});
