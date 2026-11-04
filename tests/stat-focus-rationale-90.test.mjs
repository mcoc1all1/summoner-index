import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {applyAccuracyPatches} from '../src/accuracy-patches.mjs';
import {validate} from '../src/domain.mjs';

const read=rel=>JSON.parse(fs.readFileSync(new URL(rel,import.meta.url),'utf8'));
const base=read('../content/catalog.json');
const patch=read('../content/stat-focus-90-editorial-rationale-patches.json');
const expected=new Set(['captain-america-infinity-war','carnage','cassandra-nova','dragon-man','hulkbuster','iron-man','silver-surfer','white-tiger']);

test('source-linked editorial focus batch preserves intended eight champions',()=>{
 assert.equal(patch.championPatches.length,8);
 assert.deepEqual(new Set(patch.championPatches.map(p=>p.id)),expected);
 for(const {id,statFocusRecommendation:focus} of patch.championPatches){
  assert.equal(focus.confidence,'medium',id);
  assert(focus.sourceIds.length>=2,id);
  assert(focus.attackReason.length>140,id);
  assert(focus.defenseReason.length>140,id);
  assert.match(focus.note,/not independently gameplay-tested/i);
 }
});

test('focus rationale patches integrate cleanly without fabricating gameplay testing',()=>{
 const db=applyAccuracyPatches(base,patch);
 assert.deepEqual(validate(db),[]);
 for(const id of expected){
  const champ=db.champions.find(c=>c.id===id);
  const focus=patch.championPatches.find(p=>p.id===id).statFocusRecommendation;
  assert.equal(champ.loadout.attackFocus,focus.attackFocus,id);
  assert.equal(champ.loadout.defenseFocus,focus.defenseFocus,id);
  assert.match(champ.statFocusReview.note,/not independently gameplay-tested/i);
 }
});
