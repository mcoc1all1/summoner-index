import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {matchingProtections} from '../src/protections.mjs';
import {validate} from '../src/domain.mjs';
import {provenanceReview} from '../scripts/provenance-review.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const champion=id=>db.champions.find(c=>c.id===id);
const p=(id,e)=>champion(id).protections?.find(x=>x.effectId===e);
test('Rupture and ability-accuracy protections have distinct conditions',()=>{
 const she=p('she-hulk-deathless','rupture');
 assert.equal(she.availability,'conditional');
 assert.match(she.condition,/Thanos \(Deathless\)/);
 assert.equal(matchingProtections(champion('she-hulk-deathless'),{immunity:'rupture',activation:'always'}).length,0);
 const shuri=p('shuri','ability-accuracy-reduction');
 assert.equal(shuri.availability,'always');
 assert.match(shuri.condition,/adaptive technology/);
});
test('regen-rate effects distinguish full outside-source immunity from floors and exceptions',()=>{
 for(const id of ['mister-sinister','kingpin','daredevil-hells-kitchen','sauron']){
  const r=p(id,'regen-rate-mod');assert(r,id);
  assert.equal(r.availability,'always');
  assert(r.sourceIds.length);
  assert(r.condition.length>80);
 }
 assert.match(p('kingpin','regen-rate-mod').condition,/Poison/);
 assert.match(p('daredevil-hells-kitchen','regen-rate-mod').condition,/Poison/);
 for(const id of ['wolverine-x-23','franken-castle','sasquatch','attuma','sersi']){
  assert(!champion(id).immunityIds.includes('regen-rate-mod'),id);
  assert(!p(id,'regen-rate-mod'),id);
 }
 assert(!champion('wolverine-weapon-x').immunityIds.includes('petrify'));
});
test('Franken-Castle Petrify/Spectre protection stays distinct from regen-rate floor',()=>{
 for(const effect of ['petrify','spectre']){
  const r=p('franken-castle',effect);
  assert(r,effect);assert.equal(r.availability,'always');assert(r.sourceIds.length);
 }
 assert.deepEqual(validate(db),[]);
});
test('roster source-audit queue has reviewed outcomes for all original 86 entries',()=>{
 const q=provenanceReview();
 assert.equal(q.immunity.total,86);
 assert.equal(q.immunity.scopeFollowups,0);
 assert(q.immunity.claims.every(x=>!x.reviewNeeded));
 assert(q.statFocus.effectiveRationaleFollowups>=0);
});
