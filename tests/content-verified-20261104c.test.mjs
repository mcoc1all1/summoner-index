import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {applyAccuracyPatches} from '../src/accuracy-patches.mjs';
import {matchingProtections} from '../src/protections.mjs';
import {validate} from '../src/domain.mjs';

const catalog=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
const immunityPatch=JSON.parse(fs.readFileSync(new URL('../content/immunity-verified-20261104c-patches.json',import.meta.url)));
const focusPatch=JSON.parse(fs.readFileSync(new URL('../content/stat-focus-70-editorial-rationale-patches.json',import.meta.url)));
const afterImmunities=applyAccuracyPatches(catalog,immunityPatch);
const champion=id=>afterImmunities.champions.find(c=>c.id===id);
const protection=(id,effect)=>champion(id)?.protections?.find(p=>p.effectId===effect);

test('opponent-directed Buff Immunity does not make Claire or Nico self-Buff-immune',()=>{
 for(const id of ['black-widow-claire-voyant','nico-minoru']){
  const c=champion(id);
  assert(c);
  assert(!c.immunityIds.includes('buff'),id);
  assert(!matchingProtections(c,{immunity:'buff'}).length,id);
 }
 for(const effect of ['poison','rupture']){
  assert.equal(protection('nico-minoru',effect).availability,'conditional');
  assert.match(protection('nico-minoru',effect).condition,/Ward/);
 }
});

test('Hulk, Lizard and High Evolutionary protections retain synergy and source conditions',()=>{
 for(const effect of ['buff','nullify','fate-seal','stagger','reversed-controls']){
  const p=protection('hulk',effect);
  assert(p,effect);assert.equal(p.availability,'conditional');
  assert.match(p.condition,/synergy|team|Hulkbuster|Overseer/i);
 }
 assert.match(protection('lizard','buff').condition,/Special Attacks/);
 assert.equal(protection('lizard','heal-block').availability,'conditional');
 assert.match(protection('high-evolutionary','buff').condition,/opponent/);
 for(const effect of ['neutralize','rupture'])assert.equal(protection('high-evolutionary',effect).availability,'always');
 assert.deepEqual(validate(afterImmunities),[]);
});

test('eight new focus records are sourced editorial hypotheses, not test claims',()=>{
 const ids=['shang-chi','colossus','corvus-glaive','domino','dust','enchantress','hit-monkey','titania'];
 assert.deepEqual(focusPatch.championPatches.map(x=>x.id).sort(),ids.sort());
 const updated=applyAccuracyPatches(catalog,focusPatch);
 for(const id of ids){
  const champ=updated.champions.find(c=>c.id===id);
  const row=focusPatch.championPatches.find(x=>x.id===id).statFocusRecommendation;
  assert(champ);
  assert.equal(champ.statFocusReview?.confidence,'medium');
  assert(row.sourceIds.length);
  assert.match(row.attackReason,/Editorial test rationale/i);
  assert(row.defenseReason.length>70);
  assert.match(row.note,/not independent gameplay testing/i);
 }
 assert.deepEqual(validate(updated),[]);
});
