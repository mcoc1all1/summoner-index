import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {applyAccuracyPatches} from '../src/accuracy-patches.mjs';
import {validate} from '../src/domain.mjs';
import {matchingProtections,protectionLabel} from '../src/protections.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
test('effect-level protections distinguish special mechanics from Debuff and Passive forms',()=>{
 const champion=catalog.champions.find(c=>c.id==='red-skull');
 const source=catalog.sources[0].id;
 const review={version:1,reviewedAt:'2026-11-04',championPatches:[{id:champion.id,addProtections:[{
  effectId:'nullify',forms:['effect'],availability:'conditional',condition:'Only a champion-ability sourced Nullify effect, not a quest node.',sourceIds:[source],checkedAt:'2026-11-04'
 }]}]};
 const updated=applyAccuracyPatches(catalog,review);
 assert.deepEqual(validate(updated),[]);
 const reviewed=updated.champions.find(c=>c.id===champion.id);
 const p=reviewed.protections.find(p=>p.effectId==='nullify');
 assert.match(protectionLabel(p),/Effect-level interaction/);
 assert.equal(matchingProtections(reviewed,{immunity:'nullify',form:'effect',activation:'conditional'}).length,1);
 assert.equal(matchingProtections(reviewed,{immunity:'nullify',form:'debuff'}).length,0);
 assert.equal(matchingProtections(reviewed,{immunity:'nullify',activation:'always'}).length,0);
});
