import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {search} from '../src/domain.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
test('Magneto resistance is not indexed as Bleed or Shock immunity',()=>{
 for(const immunity of ['bleed','shock'])assert(!search(db,'',{immunity}).champions.some(c=>c.id==='magneto'));
 assert.match(db.champions.find(c=>c.id==='magneto').resistanceNote,/not eliminated/);
});
test('Cosmic Ghost Rider has the sourced unconditional immunities',()=>{
 for(const immunity of ['bleed','incinerate'])assert(search(db,'',{immunity}).champions.some(c=>c.id==='cosmic-ghost-rider'));
});
test('conditional protection does not silently become an immunity or tested build',()=>{
 const cs=db.champions.filter(c=>c.kitReview?.batch==='two');assert.equal(cs.length,6);
 for(const c of cs){assert.equal(c.kitReview.gameVersion,null);assert.equal(c.signatureTarget,null);assert.equal(c.loadout.status,'editorial-trial');assert(c.resistanceNote);assert(c.sourceIds.includes('kit-'+c.id));}
 for(const id of ['guardian','quake','tigra','falcon'])assert.deepEqual(db.champions.find(c=>c.id===id).immunityIds,[]);
});
