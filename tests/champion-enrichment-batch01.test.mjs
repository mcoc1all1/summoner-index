import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {championEnrichmentAudit} from '../scripts/champion-enrichment-tracker.mjs';
import {championFieldNotes} from '../src/champion-field-notes.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const ids=['silk','falcon','magneto','shang-chi','america-chavez','jean-grey','spider-ham',
 'negasonic-teenage-warhead','knull','omega-sentinel','omega-red','abomination-immortal',
 'cheeilth','sersi','gorr','namor','shathra','archangel','ebony-maw','gladiator'];
test('batch 1 covers 20 distinct roster champions with 60 source-linked decisions',()=>{
 assert.equal(new Set(ids).size,20);
 const sourceIds=new Set(db.sources.map(s=>s.id));
 for(const id of ids){
  const champion=db.champions.find(c=>c.id===id);
  assert(champion,id);
  assert.equal(champion.fieldNotes?.decisions?.length,3,id);
  assert.equal(champion.fieldNotes.checkedAt,'2026-11-04');
  assert(champion.fieldNotes.sourceIds.length>=2,id);
  for(const sourceId of champion.fieldNotes.sourceIds)assert(sourceIds.has(sourceId),id+' '+sourceId);
  for(const note of champion.fieldNotes.decisions){
   assert(note.text.length>=90,id);
   assert(!/Community-corroborated starting point/.test(note.text),id);
  }
  const html=championFieldNotes(db,champion);
  assert.match(html,/SOURCE-LINKED/);
  assert.match(html,/What to check in the fight/);
  assert.equal((html.match(/class="panel"/g)||[]).length,3);
 }
});
test('the existing 10 pilot champions are retained after batch 1',()=>{
 const old=['doctor-doom','kushala','onslaught','bullseye','serpent','human-torch',
  'warlock','angela','shocker','venom'];
 for(const id of old)assert.equal(db.champions.find(c=>c.id===id).fieldNotes?.decisions?.length,3,id);
 const audit=championEnrichmentAudit(db);
 assert.equal(audit.summary.totalChampions,334);
 assert(audit.summary.completedPilot>=30,'batch 1 and pilot records remain enriched');
 assert(audit.summary.identityReview<=2,'a previously unresolved identity may be verified without introducing new exceptions');
 assert.equal(audit.summary.queued+audit.summary.completedPilot+audit.summary.identityReview,334);
 assert(audit.summary.batches>=0);
});
test('no imported kit research or protected source compilations reappear in field notes',()=>{
 for(const id of ids){
  const c=db.champions.find(c=>c.id===id);
  const notes=JSON.stringify(c.fieldNotes);
  assert(!notes.includes('referenceFacts'));
  assert(!notes.includes('battlecastId'));
  assert(!notes.includes('statcastId'));
  assert(!notes.includes('statFocusRecommendation'));
 }
});
