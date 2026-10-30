import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validate,search} from '../src/domain.mjs';
import {referencePanel,referenceLoadout} from '../src/reference.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
const report=JSON.parse(fs.readFileSync(new URL('../content/coverage-report.json',import.meta.url)));
test('full source pass covers every roster ID and report matches published facts',()=>{
 assert.equal(report.champions.length,db.champions.length);
 for(const c of db.champions){const r=report.champions.find(r=>r.id===c.id);assert(r);assert.equal(r.listedAbilities,c.referenceFacts.abilities.length);assert.equal(r.listedProtections,c.referenceFacts.protections.length);assert.equal(r.detailedGuide,c.coverage==='curated');assert.equal(r.focusTrial,!!(c.loadout||c.focusTrial));}
 assert.deepEqual(validate(db),[]);
});
test('source ability search expands coverage without importing conditional immunities',()=>{
 assert(search(db,'aptitude',{coverage:'curated'}).champions.some(c=>c.id==='angela'));
 assert(!search(db,'nullify immune').champions.some(c=>c.id==='angela'));
 const angela=db.champions.find(c=>c.id==='angela');assert.match(referencePanel(angela),/not permanent/);
 assert.match(referenceLoadout(angela),/Heimdall/);
});
test('source import validation rejects unsafe URLs, malformed facts and invalid dates',()=>{
 for(const change of [f=>f.url='javascript:alert(1)',f=>f.checkedAt='2026-02-30',f=>f.abilities='Fury',f=>f.protections=[null]]){const copy=structuredClone(db);change(copy.champions[0].referenceFacts);assert(validate(copy).length);}
});
test('source labels are escaped and empty lists do not assert absence',()=>{
 const c=structuredClone(db.champions[0]);c.referenceFacts.abilities=['<img onerror=alert(1)>'];c.referenceFacts.protections=[];c.coverage='roster';
 assert(!referencePanel(c).includes('<img'));assert.match(referencePanel(c),/&lt;img/);assert.match(referencePanel(c),/does not mean/);
});
