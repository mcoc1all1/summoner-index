import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalogViews} from '../src/catalog-views.mjs';
import {search} from '../src/domain.mjs';
import {counterCard,championCard,compareTable} from '../src/components.mjs';
import {normalizeRoster} from '../src/roster.mjs';
import {loadoutCards} from '../src/loadouts.mjs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const views=catalogViews(db);

test('route-specific catalogs preserve the identities used by public tools',()=>{
 for(const key of ['catalog-finder','catalog-roster','catalog-champions','catalog-search','catalog-counters','catalog-compare','catalog-loadouts']){
  assert(views[key],key);
  assert.equal(views[key].champions.length,db.champions.length,key);
  assert.deepEqual(views[key].champions.map(c=>c.id),db.champions.map(c=>c.id),key);
 }
 assert.equal(views['catalog-counters'].counters.length,db.counters.length);
 assert.equal(views['catalog-search'].bosses.length,db.bosses.length);
 assert.equal(views['catalog-finder'].gameModes.length,db.gameModes.length);
});

test('compact views are smaller and do not expose entire source catalog',()=>{
 const full=JSON.stringify(db).length;
 for(const [name,value] of Object.entries(views)){
  assert(JSON.stringify(value).length<full, name+' should be smaller than full catalog');
  assert.equal(value.quests,undefined,name+' must not include unrelated quest data');
 }
 assert.equal(views['catalog-roster'].champions[0].rotation,undefined);
 assert.equal(views['catalog-finder'].champions[0].referenceFacts,undefined);
});

test('lean catalogs still support directory, search, comparison, and roster validation',()=>{
 const doom=views['catalog-champions'].champions.find(c=>c.id==='doctor-doom');
 assert.match(championCard(views['catalog-champions'],doom),/Doctor Doom/);
 assert(search(views['catalog-search'],'doctor doom').champions.some(c=>c.id==='doctor-doom'));
 assert.match(compareTable(views['catalog-compare'],['doctor-doom','kushala']),/Doctor Doom/);
 assert.deepEqual(normalizeRoster({version:1,champions:[{id:'doctor-doom',awakened:false,signature:0}]},views['catalog-roster']).champions.map(c=>c.id),['doctor-doom']);
 assert(loadoutCards(views['catalog-loadouts'],'doctor doom','',{pageSize:12}).count>=1);
});

test('counter view preserves render dependencies and evidence references',()=>{
 const match=views['catalog-counters'].counters[0];
 const html=counterCard(views['catalog-counters'],match);
 assert.match(html,/counter-glance/);
 assert.match(html,/Evidence & sources/);
});

test('nickname search remains compatible with normal names and structured queries',()=>{
 for(const [q,id] of [['ibom','abomination-immortal'],['cgr','cosmic-ghost-rider'],['torch','human-torch'],['doom','doctor-doom']]){
  assert(search(views['catalog-search'],q).champions.some(c=>c.id===id),q);
 }
 assert(search(views['catalog-search'],'poison immune with power control').champions.some(c=>c.id==='warlock'));
});
