import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateFightMechanics} from '../src/fight-mechanics.mjs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const raw=JSON.parse(fs.readFileSync(new URL('../content/fight-mechanics.json',import.meta.url),'utf8'));

test('fight mechanics pilot validates against the patched catalog',()=>{
 assert.deepEqual(validateFightMechanics(db,raw),[]);
});

test('pilot covers a useful set of difficult defenders',()=>{
 assert.ok(raw.defenders.length>=10);
 for(const id of ['serpent','bullseye','enchantress','arnim-zola','jean-grey','high-evolutionary','count-nefaria','arcade','domino','dust']){
  assert.ok(raw.defenders.some(item=>item.id===id),`missing pilot defender ${id}`);
 }
});

test('structured mappings distinguish solved and unresolved fight problems',()=>{
 const spiral=raw.counters.find(item=>item.counterId==='spiral-serpent');
 assert.ok(spiral);
 assert.ok(spiral.handledProblemIds.includes('falter'));
 assert.ok(spiral.mitigatedProblemIds.includes('buff-cycle'));
 assert.ok(spiral.unresolvedProblemIds.includes('death-immunity'));
});

test('patched catalog receives mechanic data for mapped counters',()=>{
 assert.ok(Array.isArray(db.fightMechanics));
 assert.ok(Array.isArray(db.defenderMechanics));
 const counter=db.counters.find(item=>item.id==='kate-bishop-spider-ham');
 assert.equal(counter?.fightMechanics?.fit,'strong');
 assert.ok(counter?.fightMechanics?.handledProblemIds.includes('evade'));
});
