import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compareTable,counterConfidence} from '../src/components.mjs';
import {protectionRecords} from '../src/protections.mjs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));

test('comparison distinguishes reviewed and source-listed protection states',()=>{
 const html=compareTable(db,['scorpion','black-widow-claire-voyant']);
 assert.match(html,/Reviewed always-active protections/);
 assert.match(html,/Reviewed conditional protections/);
 assert.match(html,/Source-listed effects · activation unreviewed/);
 assert.match(html,/open a champion page for activation details/i);
 assert.doesNotMatch(html,/Immunities \(curated subset\)/);
 const scorpion=db.champions.find(x=>x.id==='scorpion');
 assert(protectionRecords(scorpion).some(x=>x.availability==='conditional'));
});

test('a score cannot assert gameplay testing without independently recorded evidence',()=>{
 assert.equal(counterConfidence({score:5}).label,'Community-backed · kit supported');
 const review={gameplayTested:true,gameVersion:'2026.11',testedAt:'2026-11-04',testEvidence:'Recorded test of quest node'};
 assert.equal(counterConfidence({score:4,review}).label,'Tested on documented nodes');
 assert.equal(counterConfidence({score:5,review:{...review,testCount:2}}).label,'Repeatedly tested');
 assert.equal(counterConfidence({score:5,review:{...review,testCount:1}}).label,'Tested on documented nodes');
 assert.equal(counterConfidence({score:5,review:{...review,testEvidence:''}}).label,'Community-backed · kit supported');
});
