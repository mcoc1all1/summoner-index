import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {challengeHub,challengePage,challengeRoot,communityTeams} from '../src/challenge-guidance.mjs';
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
test('hub links all guides and guide output escapes supplied content',()=>{
 const hub=challengeHub(collection);
 for(const g of collection.guides)assert.ok(hub.includes(`${challengeRoot}/${g.id}`));
 const html=challengePage({...collection.guides[0],title:'<script>bad</script>'},collection,db);
 assert.ok(!html.includes('<script>bad'));assert.ok(html.includes('&lt;script&gt;'));assert.match(html,/not independently gameplay-tested/);
});
