import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {publicResearchView} from '../src/publication-safety.mjs';
import {referencePanel,referenceLoadout} from '../src/reference.mjs';
import {catalogViews} from '../src/catalog-views.mjs';

const original=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));

test('public mode withholds bulk imported Scout labels and relic pairings without mutating research',()=>{
 const first=original.champions.find(c=>c.id==='doctor-doom');
 assert(first.referenceFacts.abilities.length>0);
 const pub=publicResearchView(original);
 assert.equal(pub.champions.length,original.champions.length);
 for(const c of pub.champions){
  assert.equal(c.referenceFacts?.status,'source-link-only',c.id);
  assert(c.referenceFacts?.url?.startsWith('https://'),c.id);
  assert.equal(c.referenceFacts?.abilities,undefined,c.id);
  assert.equal(c.referenceFacts?.protections,undefined,c.id);
  assert.equal(c.referenceFacts?.battlecast,undefined,c.id);
  assert.equal(c.referenceFacts?.statcast,undefined,c.id);
  assert.deepEqual(c.relicIds,[],c.id);
  if(c.loadout){
   assert.equal(c.loadout.battlecastId,null,c.id);
   assert.equal(c.loadout.statcastId,null,c.id);
  }
 }
 assert(first.referenceFacts.abilities.length>0,'the local canonical dataset must remain unchanged');
 assert.equal(pub.champions.find(c=>c.id==='doctor-doom').name,first.name);
 assert.deepEqual(pub.champions.find(c=>c.id==='doctor-doom').abilityIds,first.abilityIds);
});

test('public reference displays link out without republishing source compilations',()=>{
 const pub=publicResearchView(original);
 const originalDoom=original.champions.find(c=>c.id==='doctor-doom');
 const doom=pub.champions.find(c=>c.id==='doctor-doom');
 const html=referencePanel(doom),loadout=referenceLoadout(doom);
 assert.match(html,/EXTERNAL KIT REFERENCE/);
 assert.match(html,/Check the complete kit/);
 assert(!html.includes('Listed abilities'));
 assert(!html.includes('<li>Shock</li>'));
 assert(!loadout.includes(originalDoom.referenceFacts.battlecast));
 assert(!loadout.includes(originalDoom.referenceFacts.statcast));
 assert.match(loadout,/not published/);
});

test('public browser payloads cannot re-expose copied reference data',()=>{
 const views=catalogViews(publicResearchView(original));
 for(const [name,view] of Object.entries(views)){
  for(const c of view.champions||[]){
   assert.equal(c.referenceFacts?.abilities,undefined,name+': '+c.id);
   assert.equal(c.referenceFacts?.protections,undefined,name+': '+c.id);
   assert.equal(c.referenceFacts?.battlecast,undefined,name+': '+c.id);
   assert.equal(c.referenceFacts?.statcast,undefined,name+': '+c.id);
   if(c.loadout){
    assert.equal(c.loadout.battlecastId,null,name+': '+c.id);
    assert.equal(c.loadout.statcastId,null,name+': '+c.id);
   }
  }
 }
});
