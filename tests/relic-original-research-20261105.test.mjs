import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {applyAccuracyPatches} from '../src/accuracy-patches.mjs';
import {publicResearchView} from '../src/publication-safety.mjs';
import {loadoutCoverage} from '../src/loadout-coverage.mjs';
import {loadoutPanel} from '../src/loadouts.mjs';

const base=new URL('../content/',import.meta.url);
const read=name=>JSON.parse(fs.readFileSync(new URL(name,base),'utf8'));
const db=read('catalog.json');
const originalTrials=read('relic-zz-original-attribute-research-patches.json').championPatches;
const formerGeneric=Array.from({length:8},(_,i)=>read('stat-focus-96-kit-comparisons-'+String(i+1).padStart(2,'0')+'-patches.json')).flatMap(x=>x.championPatches);
const newTrials=['a','b','c'].flatMap(x=>read('stat-focus-98-reviewed-new-'+x+'-patches.json').championPatches);

test('71 generic Focus explanations replaced by original kit-dependent comparisons',()=>{
 assert.equal(formerGeneric.length,71);
 assert.equal(new Set(formerGeneric.map(x=>x.id)).size,71);
 for(const {id} of formerGeneric){
  const c=db.champions.find(x=>x.id===id);
  assert(c,id);
  assert.equal(c.statFocusReview.status,'reviewed',id);
  assert.equal(c.statFocusReview.checkedAt,'2026-11-05',id);
  assert(c.loadout.attackReason.length>=190,id+' attacker');
  assert(c.loadout.defenseReason.length>=160,id+' defender');
  assert.match(c.loadout.attackReason,/Compare /,id);
  assert.match(c.loadout.defenseReason,/Compare /,id);
  assert(!c.loadout.attackReason.startsWith('Community-corroborated starting point'),id);
 }
 const crossbones=db.champions.find(x=>x.id==='crossbones');
 const guillotine=db.champions.find(x=>x.id==='guillotine-2099');
 assert.match(crossbones.loadout.attackReason,/cannot actually land Critical Hits/);
 assert.match(guillotine.loadout.attackReason,/does not naturally crit/);
});

test('31 new eligible Focus trials preserve source IDs, alternative choices and honest status',()=>{
 assert.equal(newTrials.length,30);
 assert.equal(new Set(newTrials.map(x=>x.id)).size,30);
 for(const {id} of newTrials){
  const c=db.champions.find(x=>x.id===id);
  assert(c,id);
  assert.equal(c.statFocusEligibility?.status,'confirmed',id);
  assert.equal(c.statFocusReview?.status,'reviewed',id);
  assert.equal(c.statFocusReview?.checkedAt,'2026-11-05',id);
  assert(c.loadout.attackReason.length>=110,id);
  assert(c.loadout.defenseReason.length>=110,id);
  assert(c.loadout.attackAlternative,id);
  assert(c.loadout.defenseAlternative,id);
  assert(c.statFocusReview.sourceIds.every(s=>db.sources.some(x=>x.id===s)),id);
 }
 const sf=db.champions.find(x=>x.id==='green-goblin-stellar-forged');
 assert.equal(sf.statFocusReview.status,'reviewed');
 assert.equal(sf.loadout.attackFocus,'Adrenaline');
 assert.equal(sf.loadout.defenseFocus,'Block Penetration');
});

test('twelve publisher-grounded attribute research plans do not republish source-derived relic shortlists',()=>{
 assert.equal(originalTrials.length,12);
 assert.equal(new Set(originalTrials.map(x=>x.id)).size,12);
 const coverage=loadoutCoverage(db);
 assert.equal(coverage.originalRelicTrials,12);
 assert.equal(coverage.verifiedFocus,139);
 assert.equal(coverage.hiddenFocusDrafts,193);
 const published=publicResearchView(db);
 for(const {id} of originalTrials){
  const src=db.champions.find(x=>x.id===id),c=published.champions.find(x=>x.id===id);
  assert(src&&c,id);
  assert.equal(src.relicResearch.status,'editorial-trial',id);
  assert.equal(c.relicResearch.gameplayTested,false,id);
  assert(c.relicResearch.sourceIds.some(sid=>db.sources.find(s=>s.id===sid)?.kind==='official'),id);
  assert.equal(c.loadout?.battlecastId,null,id);
  assert.equal(c.loadout?.statcastId,null,id);
  const html=loadoutPanel(published,c);
  assert.match(html,/Original relic attribute research/,id);
  assert.match(html,/not independently gameplay-tested/,id);
  assert(!html.includes('<script>'),id);
 }
 const goblin=published.champions.find(x=>x.id==='green-goblin-stellar-forged');
 assert.equal(goblin.relicResearch.battlecastId,'battlecast-hulk');
 assert.equal(goblin.relicResearch.officialPairing,true);
 assert.match(loadoutPanel(published,goblin),/Publisher-recommended Battlecast/);
});

test('publisher-source and pairing gates reject unsupported relic claims',()=>{
 const first=originalTrials.find(x=>x.id==='hulkbuster');
 const broken=structuredClone(first);
 broken.relicResearch.sourceIds=['nonexistent-id'];
 assert.throws(()=>applyAccuracyPatches(db,{championPatches:[broken]}),/unknown source/);
 broken.relicResearch.sourceIds=first.relicResearch.sourceIds;
 broken.relicResearch.battlecastId='battlecast-hulkbuster';
 delete broken.relicResearch.officialPairing;
 assert.throws(()=>applyAccuracyPatches(db,{championPatches:[broken]}),/independently endorsed/);
 broken.relicResearch.officialPairing=true;
 broken.relicResearch.gameplayTested=true;
 assert.throws(()=>applyAccuracyPatches(db,{championPatches:[broken]}),/gameplay test evidence/);
});
