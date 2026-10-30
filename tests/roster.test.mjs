import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeRoster,requirementCheck} from '../src/roster.mjs';
import {counterResults} from '../src/components.mjs';
import {validate} from '../src/domain.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
test('roster import rejects unknown champions, duplicates and invalid signature',()=>{
 for(const champions of [[{id:'unknown',awakened:false,signature:0}],[{id:'iceman',awakened:false,signature:20}],[{id:'iceman',awakened:true,signature:201}],[{id:'iceman',awakened:false,signature:0},{id:'iceman',awakened:false,signature:0}]])assert.throws(()=>normalizeRoster({version:1,champions},db));
});
test('roster import drops unexpected properties',()=>assert.deepEqual(normalizeRoster({version:1,champions:[{id:'iceman',awakened:true,signature:20,secret:'discard'}]},db).champions[0],{id:'iceman',awakened:true,signature:20}));
test('unknown requirements remain explicitly unreviewed',()=>assert.match(requirementCheck(db.counters[0],{id:'kushala',awakened:false,signature:0}).message,/unreviewed/));
test('known awakening and signature requirements constrain matches',()=>{const c={requirements:{awakened:true,minSignature:40}};assert.equal(requirementCheck(c,{awakened:false,signature:0}).eligible,false);assert.equal(requirementCheck(c,{awakened:true,signature:20}).eligible,false);assert.equal(requirementCheck(c,{awakened:true,signature:40}).eligible,true);});
test('empty roster does not show all recommendations',()=>assert.match(counterResults(db,'bullseye','questing',[]),/0 curated options/));
test('roster filter intersects mode filter',()=>{const html=counterResults(db,'bullseye','battlegrounds',[{id:'warlock',awakened:false,signature:0}]);assert.match(html,/0 curated options/);});
test('high confidence ratings require versioned test evidence',()=>{const data=structuredClone(db);data.counters[0].score=5;assert(validate(data).some(x=>x.includes('test evidence')));});
test('malformed imports return errors rather than crashing',()=>{for(const data of [null,[],{...db,champions:[null]},{...db,quests:[{id:'act-8'}]}])assert(validate(data).length);});
