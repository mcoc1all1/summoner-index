import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
const rows=id=>db.counters.filter(c=>c.defenderId===id);
const champion=id=>db.champions.find(c=>c.id===id);
const addedIds=new Set([
 'shuri-arnim-zola','hulkbuster-arnim-zola','sentinel-arnim-zola',
 'ironheart-jean-grey','jack-olantern-jean-grey','wiccan-jean-grey',
 'attuma-high-evolutionary','bullseye-high-evolutionary','medusa-high-evolutionary',
 'juggernaut-thanos-deathless','gladiator-thanos-deathless','cheeilth-thanos-deathless',
 'silk-count-nefaria','shang-chi-count-nefaria',
 'hulkling-arcade','gladiator-arcade','thanos-deathless-arcade',
 'prowler-domino','count-nefaria-domino','sunspot-dust','kushala-dust',
 'thanos-deathless-red-skull','galan-red-skull','kate-bishop-spider-ham','thanos-deathless-spider-ham',
 'mister-sinister-bullseye','spiral-serpent','luke-cage-enchantress'
]);

test('newly covered difficult defenders have multiple reviewed options',()=>{
 const expected={
  'arnim-zola':3,
  'jean-grey':3,
  'high-evolutionary':3,
  'thanos-deathless':3,
  'count-nefaria':2,
  'arcade':3
 };
 for(const [id,count] of Object.entries(expected)){
  assert(rows(id).length>=count,`${id}: expected at least ${count}`);
 }
});

test('previously thin difficult-defender pages now have at least three options',()=>{
 for(const id of ['domino','dust','red-skull','spider-ham']){
  assert(rows(id).length>=3,`${id}: counter depth`);
 }
});

test('new records stay provisional, sourced and non-duplicative',()=>{
 const fresh=db.counters.filter(c=>addedIds.has(c.id));
 assert.equal(fresh.length,addedIds.size);
 for(const c of fresh){
  assert(c.score<=3,c.id);
  assert.equal(c.review?.status,'community-sourced',c.id);
  assert.equal(c.review?.reviewedAt,'2026-11-01',c.id);
  assert.equal(c.review?.gameVersion,null,c.id);
  assert(Array.isArray(c.conditions)&&c.conditions.length>=2,c.id);
  assert(c.sourceIds.some(id=>db.sources.some(s=>s.id===id&&s.kind==='community-report')),`${c.id}: community evidence`);
  assert(!/guaranteed|best counter|automatic win/i.test(`${c.why} ${c.strategy} ${c.risks} ${c.scoreReason}`),c.id);
 }
 const seen=new Set();
 for(const c of db.counters){
  const key=`${c.attackerId}->${c.defenderId}`;
  assert(!seen.has(key),`duplicate matchup: ${key}`);
  seen.add(key);
 }
});

test('weak Bullseye fallback is removed while reviewed options remain',()=>{
 assert(!db.counters.some(c=>c.id==='warlock-bullseye'));
 assert(rows('bullseye').some(c=>c.id==='mister-sinister-bullseye'));
 assert(rows('bullseye').length>=4);
});

test('Jean Grey recommendations preserve the Reversed Controls condition',()=>{
 const expected=['ironheart','jack-olantern','wiccan'];
 for(const id of expected){
  const protections=champion(id)?.referenceFacts?.protections||[];
  assert(protections.some(x=>/Reversed Controls Immunity/i.test(x)),`${id}: Reversed Controls protection`);
 }
 assert(champion('ironheart').referenceFacts.protections.some(x=>/Reversed Controls Immunity \(conditional\)/i.test(x)));
 const ironheart=db.counters.find(c=>c.id==='ironheart-jean-grey');
 assert.match(`${ironheart.why} ${ironheart.risks} ${ironheart.conditions.join(' ')}`,/conditional|Armor Up/i);
});

test('High Evolutionary options have sourced True Accuracy and retain the combo warning',()=>{
 for(const id of ['attuma','bullseye','medusa']){
  const facts=champion(id)?.referenceFacts?.abilities||[];
  assert(facts.some(x=>x==='True Accuracy'),`${id}: True Accuracy`);
  const row=db.counters.find(c=>c.attackerId===id&&c.defenderId==='high-evolutionary');
  assert(row);
  assert.match(`${row.strategy} ${row.conditions.join(' ')}`,/Combo Detonation/i);
 }
});

test('Count Nefaria additions do not rely on Bleed against a Bleed-immune record',()=>{
 const nefaria=champion('count-nefaria');
 assert(nefaria.referenceFacts.protections.some(x=>/Bleed Immunity/i.test(x)));
 for(const c of db.counters.filter(c=>addedIds.has(c.id)&&c.defenderId==='count-nefaria')){
  assert.doesNotMatch(`${c.why} ${c.strategy} ${c.conditions.join(' ')}`,/\bBleed\b/i,c.id);
 }
});
