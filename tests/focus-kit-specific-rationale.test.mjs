import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {publicResearchView} from '../src/publication-safety.mjs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const publicDb=publicResearchView(db);

test('four focus reviews are kit-specific, sourced and published only as trials',()=>{
 for(const id of ['shocker','venom','galan','angela']){
  const c=db.champions.find(c=>c.id===id);
  const pub=publicDb.champions.find(c=>c.id===id);
  assert.equal(c.statFocusReview.status,'reviewed',id);
  assert.equal(pub.statFocusReview.status,'reviewed',id);
  assert(c.loadout.attackReason.includes(c.name)||c.loadout.attackReason.includes(id==='shocker'?'Shocker':id==='venom'?'Venom':id==='galan'?'Galan':'Angela'),id);
  assert(!c.loadout.attackReason.startsWith('Community-corroborated starting point'),id);
  assert(c.loadout.defenseReason.length>100,id);
  assert(c.statFocusReview.sourceIds.length>=3,id);
  assert(pub.loadout.attackFocus!=='Not reviewed',id);
  assert(pub.loadout.defenseFocus!=='Not reviewed',id);
 }
});

test('Shocker Critical Rating is never described as increasing critical-hit chance',()=>{
 const c=db.champions.find(c=>c.id==='shocker');
 assert.match(c.loadout.attackReason,/cannot land critical hits/i);
 assert.match(c.loadout.attackReason,/Armor Rating/i);
 assert.match(c.loadout.defenseReason,/not protect/i);
});
