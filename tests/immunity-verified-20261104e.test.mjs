import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {applyAccuracyPatches} from '../src/accuracy-patches.mjs';
import {matchingProtections} from '../src/protections.mjs';
import {validate} from '../src/domain.mjs';

const read=relative=>JSON.parse(fs.readFileSync(new URL(relative,import.meta.url),'utf8'));
const catalog=read('../content/catalog.json');
const update=read('../content/immunity-verified-20261104e-patches.json');
const db=applyAccuracyPatches(catalog,update);
const c=id=>db.champions.find(x=>x.id===id);
const p=(id,effect)=>c(id).protections.find(x=>x.effectId===effect);

test('Doctor Bong source-backed protection is separately scoped',()=>{
 for(const effect of ['nullify','power-sting']){
  assert.equal(p('doctor-bong',effect).availability,'always');
  assert.deepEqual(p('doctor-bong',effect).forms,['effect']);
  assert(p('doctor-bong',effect).sourceIds.length>=2);
 }
 assert(!matchingProtections(c('doctor-bong'),{immunity:'stagger',activation:'always'}).length);
});

test('Crossbones and Prowler synergy protections are conditional',()=>{
 for(const effect of ['nullify','stagger']){
  const record=p('crossbones',effect);
  assert.equal(record.availability,'conditional');
  assert.match(record.condition,/Hydra Recruitment/);
  assert(!matchingProtections(c('crossbones'),{immunity:effect,activation:'always'}).length);
 }
 const prowler=p('prowler','reversed-controls');
 assert.equal(prowler.availability,'conditional');
 assert.match(prowler.condition,/Spider-Punk/);
 assert.match(prowler.condition,/pre-fight/);
 assert(!matchingProtections(c('prowler'),{immunity:'reversed-controls',activation:'always'}).length);
});

test('The Hood requires awakening and Invisibility for Stun protection',()=>{
 const record=p('the-hood','stun');
 assert.equal(record.availability,'conditional');
 assert.match(record.condition,/awakened/);
 assert.match(record.condition,/Invisibility/);
 assert(!matchingProtections(c('the-hood'),{immunity:'stun',activation:'always'}).length);
 assert.deepEqual(validate(db),[]);
});
