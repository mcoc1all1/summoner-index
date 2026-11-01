import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeRoster} from '../src/roster.mjs';
import {groupedCounterResults} from '../src/components.mjs';
import {search} from '../src/domain.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
test('optional build fields round-trip while legacy rosters remain unchanged',()=>{
 const legacy={id:'kushala',awakened:false,signature:0};
 assert.deepEqual(normalizeRoster({version:1,champions:[legacy]},db).champions,[legacy]);
 const detailed={...legacy,rarity:7,rank:3,ascension:1};
 assert.deepEqual(normalizeRoster({version:1,champions:[detailed]},db).champions,[detailed]);
 for(const bad of [{rarity:8},{rank:0},{ascension:-1},{rank:2.5},{rarity:'7'}])assert.throws(()=>normalizeRoster({version:1,champions:[{...legacy,...bad}]},db));
});
test('automatic grouping separates eligible owned, unowned, and unmet requirements',()=>{
 const data=structuredClone(db);const records=data.counters.filter(c=>c.defenderId==='serpent');
 records[0].requirements={awakened:true,minSignature:40};
 const roster=[{id:records[0].attackerId,awakened:false,signature:0},{id:records[1].attackerId,awakened:false,signature:0}];
 const html=groupedCounterResults(data,'serpent','',roster);
 const groups=html.split('<section class="counter-group">');
 assert.match(groups[1],/Recommended from my roster/);assert.match(groups[1],new RegExp('/champions/'+records[1].attackerId));
 assert.doesNotMatch(groups[1],new RegExp('/champions/'+records[0].attackerId));
 assert.match(groups[2],/Not in your roster/);assert.match(groups[3],/Requires awakening/);
 assert.doesNotMatch(groupedCounterResults(data,'serpent','questing',roster),/class="counter-card"/);
});
test('combined immunity and utility searches intersect strict structured properties',()=>{
 const result=search(db,'Poison immune with power control').champions;
 assert(result.length>0);assert(result.some(c=>c.id==='warlock'));
 assert(result.every(c=>c.immunityIds.includes('poison')));
 assert(!search(db,'Shock immune with power control').champions.some(c=>c.id==='magneto'));
 assert.equal(search(db,'Poison immune with impossible utility').champions.length,0);
});
