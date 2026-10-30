import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validate} from '../src/domain.mjs';
import {loadoutPanel} from '../src/loadouts.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));

test('every directory entry has a full focus trial or an explicit eligibility exception',()=>{
 for(const c of db.champions){
  assert(c.loadout||c.loadoutException,c.id);
  if(c.loadout){
   for(const field of ['attackFocus','attackAlternative','attackReason','defenseFocus','defenseAlternative','defenseReason','relicNotes'])assert(c.loadout[field]?.trim(),`${c.id}: ${field}`);
   assert(c.loadout.sourceIds.length);assert.equal(c.loadout.status,'editorial-trial');
  }
 }
});

test('unresolved event eligibility cannot silently acquire a focus assignment',()=>{
 const data=structuredClone(db),c=data.champions.find(c=>c.id==='summoned-symbioid');
 assert(c.loadoutException);assert.match(loadoutPanel(db,c),/No relic or focus assigned/);
 c.loadout=structuredClone(db.champions.find(c=>c.loadout).loadout);
 assert(validate(data).some(e=>e.includes('unresolved eligibility')));
});

test('missing sourced relic pairing stays empty without removing focus advice',()=>{
 const data=structuredClone(db),c=data.champions.find(c=>c.loadout);
 c.loadout.battlecastId=null;c.loadout.statcastId=null;
 assert.deepEqual(validate(data),[]);
 const html=loadoutPanel(data,c);assert.match(html,/Not reviewed/);assert.match(html,/Attacker starting point/);
 c.loadout.battlecastId='invented';assert(validate(data).length);
});
