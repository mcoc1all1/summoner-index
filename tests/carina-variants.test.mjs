import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {bossGuidance} from '../src/boss-guidance.mjs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
const boss=id=>db.bosses.find(b=>b.id===id);
const counters=id=>db.counters.filter(c=>c.defenderId===id);

const variants={
 'carina-mutant-mystic-vulnerability':{
  signature:'Mutant-Mystic Vulnerability',
  mechanic:'Encroaching ISO Infection',
  emulation:/Skill\/Cosmic/i,
  attackers:['jean-grey']
 },
 'carina-science-tech-vulnerability':{
  signature:'Science-Tech Vulnerability',
  mechanic:'Corrupted ISO Blast',
  emulation:/Mutant\/Mystic/i,
  attackers:['ironheart','viv-vision','red-skull']
 },
 'carina-skill-cosmic-vulnerability':{
  signature:'Skill-Cosmic Vulnerability',
  mechanic:'Corrupted ISO Traps',
  emulation:/Science\/Tech/i,
  attackers:['yelena-belova','serpent']
 }
};

test('Act 9.4.6 Carina is an overview plus three distinct variant bosses',()=>{
 const act9=db.quests.find(q=>q.id==='act-9');
 assert(act9);
 assert(act9.bossIds.includes('carina-chronoserpent'));
 for(const id of Object.keys(variants))assert(act9.bossIds.includes(id),id);
 assert.equal(Object.keys(variants).filter(id=>boss(id)).length,3);

 const overview=boss('carina-chronoserpent');
 assert.equal(overview.name,'Carina (Chronoserpent) — Overview');
 assert.equal(overview.guideDetails.relatedGuides.length,3);
 assert.match(overview.summary,/three Carina variants/i);
 assert(overview.phases.some(p=>/three different Carina versions/i.test(p.text)));
 assert(!overview.phases.some(p=>/^Alternative route/i.test(p.name)));
});

test('variant names follow the Signature Ability while documenting Carina emulation separately',()=>{
 for(const [id,expected] of Object.entries(variants)){
  const b=boss(id);
  assert(b,id);
  assert.equal(b.questId,'act-9');
  assert.equal(b.chapter.startsWith('9.4.6'),true,id);
  assert(b.mechanicTags.includes(expected.signature),`${id}: signature terminology`);
  assert(b.mechanicTags.includes(expected.mechanic),`${id}: route mechanic`);
  const text=[b.summary,...b.phases.map(p=>p.text),...(b.guideDetails?.preparation||[])].join(' ');
  assert.match(text,expected.emulation,`${id}: emulated class pair`);
  assert.equal(b.verification?.gameplayTested,false,`${id}: no gameplay-test claim`);
  assert(b.sourceIds.length>=2,`${id}: evidence`);
  assert(b.guideDetails.relatedGuides.some(g=>g.href==='/bosses/carina-chronoserpent'),`${id}: overview link`);
 }
});

test('variant counters are attached only to the matching Carina target and remain provisional',()=>{
 for(const [id,expected] of Object.entries(variants)){
  const rows=counters(id);
  assert.deepEqual(rows.map(c=>c.attackerId).sort(),[...expected.attackers].sort(),`${id}: attackers`);
  for(const c of rows){
   assert(c.score<=2,c.id);
   assert.equal(c.review?.status,'community-sourced',c.id);
   assert(c.sourceIds.some(sourceId=>db.sources.some(s=>s.id===sourceId&&s.kind==='community-report')),c.id);
   assert(!/guaranteed|best counter|automatic win/i.test(`${c.why} ${c.strategy} ${c.scoreReason}`),c.id);
  }
 }
});

test('overview and variant guidance render explicit navigation between the four pages',()=>{
 const overviewHtml=bossGuidance(boss('carina-chronoserpent'));
 for(const id of Object.keys(variants)){
  assert.match(overviewHtml,new RegExp(`/bosses/${id}`),id);
 }
 const variantHtml=bossGuidance(boss('carina-science-tech-vulnerability'));
 assert.match(variantHtml,/\/bosses\/carina-chronoserpent/);
 assert.match(variantHtml,/Mutant\/Mystic Vulnerability/);
 assert.match(variantHtml,/Skill\/Cosmic Vulnerability/);
});
