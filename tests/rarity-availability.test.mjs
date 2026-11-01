import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeRoster} from '../src/roster.mjs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));

test('every champion has a dated 7-star availability classification or explicit exception',()=>{
 assert.equal(db.champions.length,334);
 const exceptions=db.champions.filter(c=>c.rarityAvailability?.status==='exception');
 const reviewed=db.champions.filter(c=>c.rarityAvailability?.status==='verified');
 assert.equal(reviewed.length,333);
 assert.deepEqual(exceptions.map(c=>c.id),['summoned-symbioid']);
 for(const c of reviewed){
  assert.equal(typeof c.rarityAvailability.sevenStarAvailable,'boolean',c.id);
  assert.equal(c.rarityAvailability.checkedAt,'2026-11-02',c.id);
  assert.deepEqual(c.rarityAvailability.sourceIds,['availability-7star-directory-20261102'],c.id);
  assert.equal(c.statFocusEligibility?.status,c.rarityAvailability.sevenStarAvailable?'confirmed':'ineligible',c.id);
 }
});

test('the reviewed snapshot distinguishes known available and unavailable examples',()=>{
 for(const id of ['spider-man-noir','iceman','havok','shang-chi','nimrod','kitty-pryde','ghost-rider-robbie-reyes'])assert.equal(db.champions.find(c=>c.id===id)?.rarityAvailability?.sevenStarAvailable,true,id);
 for(const id of ['doctor-doom','hercules','kate-bishop','quake','magneto','archangel'])assert.equal(db.champions.find(c=>c.id===id)?.rarityAvailability?.sevenStarAvailable,false,id);
 assert.equal(db.champions.filter(c=>c.rarityAvailability?.sevenStarAvailable===true).length,266);
 assert.equal(db.champions.filter(c=>c.rarityAvailability?.sevenStarAvailable===false).length,67);
});

test('roster validation rejects impossible reviewed 7-star builds but permits verified ones',()=>{
 const base=id=>({version:1,champions:[{id,awakened:false,signature:0,rarity:7}]});
 assert.throws(()=>normalizeRoster(base('doctor-doom'),db),/not listed as a 7★ champion/);
 assert.equal(normalizeRoster(base('spider-man-noir'),db).champions[0].rarity,7);
});
