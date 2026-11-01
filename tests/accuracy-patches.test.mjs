import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {applyAccuracyPatches,deriveInitials} from '../src/accuracy-patches.mjs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
const patches=JSON.parse(fs.readFileSync(new URL('../content/accuracy-patches.json',import.meta.url)));

test('accuracy patches add Robbie Reyes and correct Scytalis phase labels',()=>{
 const patched=applyAccuracyPatches(db,patches);
 const robbie=patched.champions.find(c=>c.id==='ghost-rider-robbie-reyes');
 assert(robbie);
 assert.equal(robbie.class,'Mystic');
 assert(robbie.immunityIds.includes('bleed'));
 assert(robbie.immunityIds.includes('incinerate'));
 const scytalis=patched.bosses.find(b=>b.id==='scytalis');
 assert.deepEqual(scytalis.phases.map(p=>p.name),[
  'Setup — wait for an armed trap',
  'Opening • 100–81%',
  'Middle • 80–41%',
  'Late • 40–6%',
  'Finish • 5–0%'
 ]);
});

test('malformed parenthetical initials are repaired deterministically',()=>{
 assert.equal(deriveInitials('Colossus (Age of Apocalypse)'),'CA');
 assert.equal(deriveInitials('Cyclops (Blue Team)'),'CB');
 assert.equal(deriveInitials('Storm (Pyramid X)'),'SP');
 const patched=applyAccuracyPatches(db,patches);
 for(const champion of patched.champions)assert(!champion.initials?.endsWith('('));
});

test('priority Stat Focus eligibility is evidence-backed and dated',()=>{
 const patched=applyAccuracyPatches(db,patches);
 const confirmed=['bullseye','serpent','onslaught','kushala','photon','silk','titania','absorbing-man','warlock','human-torch','shuri','ant-man-future','domino','bishop','dust','enchantress','the-destroyer'];
 const ineligible=['doctor-doom','hercules','kate-bishop'];
 for(const id of confirmed){
  const champion=patched.champions.find(c=>c.id===id);assert(champion,id);
  assert.equal(champion.statFocusEligibility?.status,'confirmed',id);
  assert.equal(champion.statFocusEligibility?.checkedAt,'2026-11-01',id);
  assert(champion.statFocusEligibility.sourceIds.length,id);
  for(const sourceId of champion.statFocusEligibility.sourceIds)assert(patched.sources.some(source=>source.id===sourceId),`${id}: ${sourceId}`);
 }
 for(const id of ineligible){
  const champion=patched.champions.find(c=>c.id===id);assert(champion,id);
  assert.equal(champion.statFocusEligibility?.status,'ineligible',id);
  assert.equal(champion.statFocusEligibility?.checkedAt,'2026-11-01',id);
 }
});

test('eligibility patches reject missing evidence',()=>{
 const broken=structuredClone(patches);
 broken.championPatches[0].statFocusEligibility.sourceIds=['missing-source'];
 assert.throws(()=>applyAccuracyPatches(db,broken),/unknown source/);
});
