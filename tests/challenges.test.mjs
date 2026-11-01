import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {challengeHub,challengePage,challengeRoot,communityTeams} from '../src/challenge-guidance.mjs';
import {challengePlanById} from '../src/challenge-plans.mjs';
const collection=JSON.parse(fs.readFileSync(new URL('../content/carina-volume-4.json',import.meta.url)));
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));

test('six distinct challenges retain rarity, tag and quest distinctions',()=>{
 assert.deepEqual(collection.guides.map(g=>g.id),['ordeal-heroes','ordeal-villains','abyss-heroes','abyss-villains','epoch-heroes','epoch-villains']);
 for(const g of collection.guides){assert.equal(g.rarity,7);assert.equal(g.tag,g.id.endsWith('heroes')?'Hero':'Villain');assert.ok(g.checks.length>=5);assert.equal(new URL(g.source).protocol,'https:');assert.ok(g.team.every(id=>db.champions.some(c=>c.id===id)));}
 for(const g of collection.guides.filter(g=>g.id.startsWith('epoch')))assert.match(g.quest,/True Olympian/);
 assert.equal(collection.guides.find(g=>g.id==='abyss-villains').team.length,4);
});

test('community alternatives preserve complete teams, specific evidence and honest status',()=>{
 for(const g of collection.guides){
  assert.ok(g.teamOptions.length>=2);
  for(const t of g.teamOptions){
   assert.equal(new Set(t.championIds).size,5);
   assert.ok(t.championIds.every(id=>db.champions.some(c=>c.id===id)));
   assert.ok(['completion','run-report'].includes(t.status));
   assert.match(t.sourceUrl,/^https:\/\/www\.reddit\.com\/r\/ContestOfChampions\/comments\/[^/]+\/comment\/[^/]+\/$/);
   assert.ok(t.author&&t.roles&&t.caveat&&t.reviewedAt);
  }
  assert.match(challengePage(g,collection,db),/More teams from community runs/);
 }
 const base=collection.guides[0];
 const altered={...base,teamOptions:[{...base.teamOptions[0],title:'<img src=x>',status:'run-report'}]};
 assert.match(communityTeams(altered,db),/&lt;img/);
 assert.ok(!communityTeams(altered,db).includes('COMPLETION REPORTED'));
 altered.teamOptions[0].sourceUrl='javascript:alert(1)';
 assert.throws(()=>communityTeams(altered,db),/Unsafe/);
});

test('all six challenges have structured run profiles, roles and final-boss plans',()=>{
 for(const g of collection.guides){
  const p=challengePlanById(g.id);assert(p,g.id);
  assert.ok(p.difficulty?.overall,g.id);
  assert.ok(p.roleCoverage.length>=5,g.id);
  assert.ok(p.requirements.length>=3,g.id);
  assert.ok(p.finalBoss?.name,g.id);
  assert.match(p.planSource,/^https:\/\/www\.reddit\.com\//,g.id);
  const ids=[...p.roleCoverage.flatMap(r=>r.candidates),...p.requirements.map(r=>r.championId),...p.fightPlan.flatMap(f=>[...f.primary,...f.backup]),...p.finalBoss.primary,...p.finalBoss.backup];
  assert(ids.every(id=>db.champions.some(c=>c.id===id)),g.id);
 }
});

test('Ordeal and True Olympian expose complete featured fight maps',()=>{
 assert.equal(challengePlanById('ordeal-heroes').fightPlan.length,21);
 assert.equal(challengePlanById('ordeal-villains').fightPlan.length,21);
 assert.equal(challengePlanById('epoch-heroes').fightPlan.length,25);
 assert.equal(challengePlanById('epoch-villains').fightPlan.length,25);
 for(const id of ['epoch-heroes','epoch-villains']){
  const p=challengePlanById(id);assert.equal(p.fightPlan.at(-1).fight,'Ares');
 }
});

test('Abyss planners are route-aware and Villains keeps the fifth slot explicitly flexible',()=>{
 for(const id of ['abyss-heroes','abyss-villains']){
  const p=challengePlanById(id);assert.ok(p.routePlans?.length,id);assert.ok(p.routePlans[0].sequence.includes('Nameless Collector'),id);
 }
 const villains=challengePlanById('abyss-villains');
 assert.ok(villains.flexSlot);assert.ok(villains.flexSlot.candidates.length>=3);
 const html=challengePage(collection.guides.find(g=>g.id==='abyss-villains'),collection,db);
 assert.match(html,/Fifth slot/);assert.match(html,/intentionally not a fixed fifth member/);
});

test('guide pages render roster checks, fight tables and MCOC terminology without claiming gameplay tests',()=>{
 for(const g of collection.guides){
  const html=challengePage(g,collection,db);
  assert.match(html,/data-challenge-roster=/,g.id);
  assert.match(html,/Fight-by-fight assignments/,g.id);
  assert.match(html,/FINAL ENCOUNTER/,g.id);
  assert.match(html,/not independently gameplay-tested/,g.id);
 }
 const epoch=challengePage(collection.guides.find(g=>g.id==='epoch-villains'),collection,db);
 assert.match(epoch,/Buffed Up/);assert.match(epoch,/Rupture/);assert.match(epoch,/Petrify/);assert.match(epoch,/Reversed Controls/);
});

test('hub links all guides and guide output escapes supplied content',()=>{
 const hub=challengeHub(collection);
 for(const g of collection.guides)assert.ok(hub.includes(`${challengeRoot}/${g.id}`));
 assert.match(hub,/one five-champion gauntlet/);
 const html=challengePage({...collection.guides[0],title:'<script>bad</script>'},collection,db);
 assert.ok(!html.includes('<script>bad'));assert.ok(html.includes('&lt;script&gt;'));assert.match(html,/not independently gameplay-tested/);
});
