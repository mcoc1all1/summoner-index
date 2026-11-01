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
 const html=loadoutPanel(data,c);assert.match(html,/No sourced pairing yet/);assert.match(html,/Attacker starting point/);
 c.loadout.battlecastId='invented';assert(validate(data).length);
});


test('defender selections reject attacker-only Adrenaline but attacker trials accept it',()=>{
 for(const field of ['defenseFocus','defenseAlternative']){
  const copy=structuredClone(db);copy.champions[0].loadout[field]='Adrenaline';
  assert(validate(copy).some(e=>e.includes('invalid '+field)));
 }
 const copy=structuredClone(db);copy.champions[0].loadout.attackFocus='Adrenaline';
 assert.deepEqual(validate(copy),[]);
});

test('all standard entries have a compatible sourced relic and synchronized reference fields',()=>{
 for(const c of db.champions.filter(c=>c.loadout)){
  const ids=[c.loadout.battlecastId,c.loadout.statcastId].filter(Boolean);
  assert(ids.length>0,c.id);assert.deepEqual(c.relicIds,ids,c.id);
  for(const kind of ['battlecast','statcast']){
   const r=db.relics.find(r=>r.id===c.loadout[kind+'Id']);
   if(r){assert.equal(r.name,c.referenceFacts[kind],c.id);assert.equal(r.class,c.class,c.id);}
  }
 }
});

test('partial relic coverage explains the missing alternative and keeps review scopes separate',()=>{
 const c=db.champions.find(c=>c.id==='spider-man-noir');const html=loadoutPanel(db,c);
 assert.match(html,/Valkyrie/);assert.match(html,/No sourced pairing yet/);
 assert.match(html,/not incompatible/);assert.match(html,/Relic listing checked 2026-11-01/);
 assert.match(html,/focus and kit review dates are separate/);
});
