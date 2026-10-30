import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {counterCard,counterResults} from '../src/components.mjs';
import {validate} from '../src/domain.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));

test('ten priority opponents have three dated, conditional, provisional options',()=>{
 const targets=['serpent','onslaught','bullseye','doctor-doom','absorbing-man','peni-parker','kitty-pryde','abomination-immortal','photon','enchantress'];
 for(const id of targets){
  const rows=db.counters.filter(c=>c.defenderId===id&&c.conditions?.length&&c.review?.reviewedAt==='2026-10-28');
  assert(rows.length>=3,id);
  assert.equal(new Set(rows.map(c=>c.attackerId)).size,rows.length);
  for(const c of rows){assert(c.sourceIds.length);assert(c.score<4);assert.equal(c.review.gameVersion,null);assert.equal(c.requirements.minSignature,null);}
 }
});

test('counter conditions and review date render as escaped text',()=>{
 const row={...db.counters[0],conditions:['<script>unsafe</script>'],review:{status:'community-sourced',reviewedAt:'2026-10-28',gameVersion:null}};
 const html=counterCard(db,row);
 assert.match(html,/Check before choosing/);
 assert.match(html,/&lt;script&gt;unsafe&lt;\/script&gt;/);
 assert.match(html,/Checked: 2026-10-28/);
 assert.match(html,/Game version: not tested/);
});

test('invalid condition lists are rejected without requiring them on legacy records',()=>{
 for(const conditions of [[],[''],['  '],[null],'text']){
  const data=structuredClone(db);data.counters[0].conditions=conditions;
  assert(validate(data).some(x=>x.includes('matchup conditions')));
 }
 const data=structuredClone(db);delete data.counters[0].conditions;
 assert.deepEqual(validate(data),[]);
});

test('owned but ineligible options explain awakening and signature exclusions',()=>{
 const first={...db.counters[0],requirements:{awakened:true,minSignature:40}};
 const data={...db,counters:[first]};
 for(const [awakened,signature,reason] of [[false,0,'Requires awakening'],[true,20,'Requires signature 40+']]){
  const html=counterResults(data,first.defenderId,'',[{id:first.attackerId,awakened,signature}]);
  assert.match(html,/0 curated options/);assert.match(html,/1 owned option excluded/);
  assert(html.includes(reason));assert(!html.includes('class="counter-card"'));
 }
 const html=counterResults(data,first.defenderId,'',[{id:first.attackerId,awakened:true,signature:40}]);
 assert.match(html,/1 curated option/);assert.match(html,/class="counter-card"/);
 assert(!html.includes('owned option excluded'));
});
