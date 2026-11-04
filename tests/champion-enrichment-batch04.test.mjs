import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {championEnrichmentAudit} from '../scripts/champion-enrichment-tracker.mjs';
import {championFieldNotes} from '../src/champion-field-notes.mjs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const ids=['colossus','iceman','beta-ray-bill','kitty-pryde','electro','peni-parker',
 'photon','rintrah','emma-frost','ironheart','mephisto','mysterio','red-hulk','shuri',
 'korg','nimrod','sentinel','thing','anti-venom','attuma'];

test('batch 04 adds twenty distinct profiles with three source-linked, actionable notes each',()=>{
 assert.equal(new Set(ids).size,20);
 const sourceIds=new Set(db.sources.map(s=>s.id));
 for(const id of ids){
  const c=db.champions.find(x=>x.id===id);
  assert(c,id);
  assert.equal(c.fieldNotes?.checkedAt,'2026-11-05',id);
  assert.equal(c.fieldNotes?.decisions?.length,3,id);
  assert(c.fieldNotes.sourceIds.length>=2,id);
  for(const sid of c.fieldNotes.sourceIds)assert(sourceIds.has(sid),id+': '+sid);
  for(const d of c.fieldNotes.decisions){
    assert(d.title.length>=12,id);
    assert(d.text.length>=90,id);
  }
  assert.match(championFieldNotes(db,c),/What to check in the fight/);
  assert.match(championFieldNotes(db,c),/Evidence & sources/);
 }
});

test('batch 04 reaches ninety profiles while retaining all prior pilot and batch notes',()=>{
 for(const id of ['doctor-doom','venom','silk','falcon','kate-bishop','wiccan','sunspot','mister-sinister'])
  assert.equal(db.champions.find(x=>x.id===id)?.fieldNotes?.decisions?.length,3,id);
 const report=championEnrichmentAudit(db);
 assert.equal(report.summary.totalChampions,334);
 assert.equal(report.summary.completedPilot,90);
 assert.equal(report.summary.identityReview,2);
 assert.equal(report.summary.queued,242);
 assert.equal(report.summary.batches,13);
});

test('high-risk mechanical caveats are surfaced without bulk imported content',()=>{
 const colossus=championFieldNotes(db,db.champions.find(x=>x.id==='colossus'));
 const kitty=championFieldNotes(db,db.champions.find(x=>x.id==='kitty-pryde'));
 const nimrod=championFieldNotes(db,db.champions.find(x=>x.id==='nimrod'));
 assert.match(colossus,/conditional Armor Break/i);
 assert.match(kitty,/unawakened Kitty/i);
 assert.match(nimrod,/January 2026 signature/i);
 for(const id of ids){
  const notes=JSON.stringify(db.champions.find(x=>x.id===id).fieldNotes);
  assert(!notes.includes('referenceFacts'));
  assert(!notes.includes('battlecastId'));
  assert(!notes.includes('statcastId'));
 }
});
