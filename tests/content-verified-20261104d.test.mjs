import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {applyAccuracyPatches} from '../src/accuracy-patches.mjs';
import {matchingProtections} from '../src/protections.mjs';
import {validate} from '../src/domain.mjs';

const read=relative=>JSON.parse(fs.readFileSync(new URL(relative,import.meta.url),'utf8'));
const catalog=read('../content/catalog.json');
const immunities=read('../content/immunity-verified-20261104d-patches.json');
const focus=read('../content/stat-focus-80-editorial-rationale-patches.json');
const db=applyAccuracyPatches(catalog,immunities);
const champion=id=>db.champions.find(c=>c.id===id);
const protection=(id,effect)=>champion(id).protections?.find(p=>p.effectId===effect);

test('Ironheart only keeps Armor Up-dependent immunities while Armor Up is active',()=>{
 assert(!champion('ironheart').immunityIds.includes('ability-accuracy-reduction'));
 for(const effect of ['reversed-controls','coldsnap','incinerate','frostbite']){
  const p=protection('ironheart',effect);
  assert(p,effect);assert.equal(p.availability,'conditional');
  assert.match(p.condition,/Armor Up/);
 }
 assert.equal(matchingProtections(champion('ironheart'),{immunity:'reversed-controls',activation:'always'}).length,0);
});

test('Mysterio reverse controls requires Emma synergy and helmet-dependent effects remain conditional',()=>{
 const rev=protection('mysterio','reversed-controls');
 assert.equal(rev.availability,'conditional');
 assert.match(rev.condition,/Emma Frost/);
 for(const effect of ['poison','ability-accuracy-reduction']){
  const p=protection('mysterio',effect);
  assert(p);assert.equal(p.availability,'conditional');
  assert.match(p.condition,/helmet/i);
 }
});

test('death escape mechanics and Precision interaction are not generic debuff immunity claims',()=>{
 assert(!champion('moondragon').immunityIds.includes('death'));
 assert(!champion('moondragon').protections?.some(x=>x.effectId==='death'));
 const p=protection('bullseye','precision');
 assert.deepEqual(p.forms,['effect']);
 assert.match(p.condition,/Precision/);
 assert(!matchingProtections(champion('bullseye'),{immunity:'precision',form:'debuff'}).length);
 assert.deepEqual(validate(db),[]);
});

test('eight current Stat Focus rationales remain source-linked editorial comparisons',()=>{
 const ids=['iceman','havok','baron-zemo','bishop','blade','rintrah','shuri','wiccan'];
 assert.deepEqual(focus.championPatches.map(c=>c.id).sort(),ids.sort());
 const updated=applyAccuracyPatches(catalog,focus);
 for(const id of ids){
  const row=focus.championPatches.find(x=>x.id===id).statFocusRecommendation;
  assert(row.attackReason.length>120);
  assert(row.defenseReason.length>120);
  assert(row.sourceIds.length>0);
  const champ=updated.champions.find(x=>x.id===id);
  assert.equal(champ.statFocusReview.confidence,'medium');
  assert.match(champ.statFocusReview.note,/not a gameplay-tested best choice/);
 }
 assert.deepEqual(validate(updated),[]);
});
