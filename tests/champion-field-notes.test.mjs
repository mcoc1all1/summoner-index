import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {championFieldNotes} from '../src/champion-field-notes.mjs';
import {championProfilePage} from '../src/champion-profile.mjs';
import {applyAccuracyPatches} from '../src/accuracy-patches.mjs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const ids=['doctor-doom','kushala','onslaught','bullseye','serpent','human-torch','warlock','angela','shocker','venom'];

test('ten champions gain independently written, referenced fight decisions and structured abilities',()=>{
 for(const id of ids){
  const c=db.champions.find(c=>c.id===id);
  assert(c,id);
  assert(c.fieldNotes,id+' missing field notes');
  assert.equal(c.fieldNotes.checkedAt,'2026-11-04',id);
  assert.equal(c.fieldNotes.decisions.length,3,id);
  assert(c.fieldNotes.sourceIds.every(s=>db.sources.some(src=>src.id===s)),id);
  for(const decision of c.fieldNotes.decisions){
   assert(decision.title.length>12,id);
   assert(decision.text.length>120,id);
  }
  const html=championFieldNotes(db,c);
  assert.match(html,/What to check in the fight/,id);
  assert.match(html,/Evidence & sources/,id);
  assert.equal((html.match(/class="panel"/g)||[]).length,3,id);
  assert.match(championProfilePage(db,c),/id="field-notes"/,id);
 }
 assert(db.champions.filter(c=>c.fieldNotes).length>=10,'the original pilot cohort must remain enriched after later batches');
});

test('enrichment preserves existing immunities and adds only recognized utility labels',()=>{
 const known=new Set(db.abilities.map(a=>a.id));
 for(const id of ids){
  const c=db.champions.find(c=>c.id===id);
  assert(c.abilityIds.every(x=>known.has(x)),id);
 }
 const doom=db.champions.find(c=>c.id==='doctor-doom');
 assert(doom.abilityIds.includes('stagger'));
 assert(doom.abilityIds.includes('power-steal'));
 const shocker=db.champions.find(c=>c.id==='shocker');
 assert(shocker.abilityIds.includes('auto-block'));
 assert.match(championFieldNotes(db,shocker),/cannot land critical hits/i);
});

test('field-note input rejects unknown sources and utility IDs and escapes imported HTML',()=>{
 const original=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
 const probe={championPatches:[{id:'shocker',addAbilityIds:['not-real']}]};
 assert.throws(()=>applyAccuracyPatches(original,probe),/Unknown utility label/);
 const fake={championPatches:[{id:'shocker',fieldNotes:{
  checkedAt:'2026-11-04',sourceIds:['missing-source'],
  decisions:[{title:'A',text:'A'.repeat(90)},{title:'B',text:'B'.repeat(90)}]
 }}]};
 assert.throws(()=>applyAccuracyPatches(original,fake),/unknown source/);
 const c=structuredClone(db.champions.find(c=>c.id==='shocker'));
 c.fieldNotes.decisions[0].text='<script>alert(1)</script>'.repeat(8);
 const html=championFieldNotes(db,c);
 assert(!html.includes('<script>'));
 assert(html.includes('&lt;script&gt;'));
});
