import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {matchingProtections} from '../src/protections.mjs';
import {validate} from '../src/domain.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const champ=id=>db.champions.find(c=>c.id===id);
const protection=(id,effect)=>champ(id)?.protections?.find(p=>p.effectId===effect);
test('new source-supported protections keep correct activation requirements',()=>{
 for(const [id,effect,trigger] of [
 ['black-tarantula','nullify','synergy'],['dazzler','incinerate','Kitty Pryde'],
 ['diablo','armor-break','Grain of Uru'],['diablo','stun','Philosopher'],
 ['gentle','stun','Well-Timed Block'],['imperiosa','special-lock','four-second']
 ]){
  const p=protection(id,effect);
  assert(p,id+':'+effect);assert.equal(p.availability,'conditional',id+':'+effect);
  assert(p.condition.includes(trigger),id+':'+effect);
  assert(p.sourceIds.length);
  assert.equal(matchingProtections(champ(id),{immunity:effect,activation:'always'}).length,0,id+':'+effect);
 }
});
test('Blue Marvel and Count Nefaria Power Steal immunity is not every kind of power control',()=>{
 for(const id of ['blue-marvel','count-nefaria']){
  const p=protection(id,'power-steal');
  assert(p,id);
  assert.equal(p.availability,'always');
  assert.equal(p.forms[0],'effect');
  assert(!matchingProtections(champ(id),{immunity:'power-lock'}).some(x=>x.availability==='always'));
 }
});
test('irrelevant Bad Vibes and unsupported Coldsnap tags are not advertised as reliable immunity',()=>{
 assert(!champ('dazzler').immunityIds.includes('bad-vibes'));
 assert(!champ('doctor-strange').immunityIds.includes('coldsnap'));
 assert.equal(matchingProtections(champ('doctor-strange'),{immunity:'coldsnap'}).length,0);
 assert.deepEqual(validate(db),[]);
});
