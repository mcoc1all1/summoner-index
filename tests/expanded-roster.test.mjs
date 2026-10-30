import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {search,validate} from '../src/domain.mjs';
import {normalizeRoster} from '../src/roster.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
const manifest=JSON.parse(fs.readFileSync(new URL('../content/roster-manifest.json',import.meta.url)));
test('every checked source champion maps to exactly one local record',()=>{
 assert.equal(manifest.length,333);assert.equal(new Set(manifest.map(r=>r.id)).size,333);
 for(const r of manifest)assert.equal(db.champions.filter(c=>c.id===r.id).length,1);
 assert.equal(db.champions.length,333);assert.deepEqual(validate(db),[]);
});
test('roster entries do not invent detailed gameplay data',()=>{
 const basic=db.champions.filter(c=>c.coverage==='roster');assert.equal(basic.length+db.champions.filter(c=>c.coverage==='curated').length,333);
 for(const c of basic){assert.equal(c.abilityIds.length,0);assert.equal(c.immunityIds.length,0);assert.equal(c.relicIds.length,0);assert.equal(c.loadout,undefined);assert(c.sourceIds.length);assert(!c.name.includes('&#'));}
 assert(db.champions.filter(c=>c.loadout).length>=42);
});
test('expanded searches distinguish class and coverage including Universal',()=>{
 const fixture=structuredClone(db);fixture.champions.find(c=>c.id==='annihilus').coverage='roster';assert.equal(search(fixture,'annihilus',{coverage:'roster',class:'Cosmic'}).champions.length,1);
 assert.equal(search(db,'hercules',{coverage:'curated'}).champions.length,1);
 assert.equal(search(db,'',{class:'Universal'}).champions[0].id,'summoned-symbioid');
 assert.equal(search(db,'',{coverage:'curated'}).champions.length,db.champions.filter(c=>c.coverage==='curated').length);
});
test('new champions work in local roster backups without replacing existing IDs',()=>{
 const result=normalizeRoster({version:1,champions:[{id:'hercules',awakened:true,signature:20},{id:'serpent',awakened:false,signature:0}]},db);
 assert.equal(result.champions.length,2);
 assert(db.champions.some(c=>c.id==='shang-chi'));assert(!db.champions.some(c=>c.id==='the-serpent'));
});
