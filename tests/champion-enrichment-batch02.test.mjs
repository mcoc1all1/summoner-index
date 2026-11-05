import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {championEnrichmentAudit} from '../scripts/champion-enrichment-tracker.mjs';
import {championFieldNotes} from '../src/champion-field-notes.mjs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const ids=['kate-bishop','red-guardian','vision-aarkus','cyclops-new-xavier-school',
 'deadpool','drax','guillotine-deathless','hela','hercules','scarlet-witch-classic',
 'wolverine','wiccan','ant-man-future','doctor-strange','gamora','guardian',
 'iron-fist','nova','tigra','havok'];

test('second batch enriches 20 priority champions with source-linked action-oriented decisions',()=>{
 assert.equal(new Set(ids).size,20);
 const sources=new Set(db.sources.map(s=>s.id));
 for(const id of ids){
  const champion=db.champions.find(c=>c.id===id);
  assert(champion,id);
  const notes=champion.fieldNotes;
  assert(notes,id);
  assert.equal(notes.checkedAt,'2026-11-05',id);
  assert.equal(notes.decisions.length,3,id);
  assert(notes.sourceIds.length>=2,id);
  for(const sourceId of notes.sourceIds)assert(sources.has(sourceId),id+' '+sourceId);
  for(const decision of notes.decisions){
   assert(decision.title.length>12,id);
   assert(decision.text.length>=90,id);
  }
  const html=championFieldNotes(db,champion);
  assert.match(html,/What to check in the fight/);
  assert.match(html,/Evidence & sources/);
  assert.equal((html.match(/class="panel"/g)||[]).length,3,id);
 }
});

test('enrichment does not destroy prior notes, immunity records or publish withheld reference kits',()=>{
 const earlier=['doctor-doom','kushala','onslaught','bullseye','serpent','human-torch',
  'warlock','angela','shocker','venom','silk','falcon','magneto','shang-chi'];
 for(const id of earlier)assert.equal(db.champions.find(c=>c.id===id)?.fieldNotes?.decisions?.length,3,id);
 const audit=championEnrichmentAudit(db);
 assert.equal(audit.summary.totalChampions,334);
 assert(audit.summary.completedPilot>=50,'batch 02 and preceding guides must remain present');
 assert.equal(audit.summary.queued+audit.summary.completedPilot+audit.summary.identityReview,334);
 assert(audit.summary.identityReview<=2,'a previously unresolved identity may be verified without introducing new exceptions');
 assert(audit.summary.batches>=0);
 for(const id of ids){
  const c=db.champions.find(c=>c.id===id);
  assert(!Object.hasOwn(c.fieldNotes,'referenceFacts'));
  assert(!Object.hasOwn(c.fieldNotes,'battlecast'));
  assert(!Object.hasOwn(c.fieldNotes,'statcast'));
 }
});

test('Wiccan and Hercules have explicit major setup caveats',()=>{
 const wiccan=db.champions.find(c=>c.id==='wiccan');
 const hercules=db.champions.find(c=>c.id==='hercules');
 assert.match(championFieldNotes(db,wiccan),/Neutralize/);
 assert.match(championFieldNotes(db,hercules),/Immortality/);
 assert.match(championFieldNotes(db,hercules),/Special 3/);
});
