import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validate} from '../src/domain.mjs';
import {loadoutCards,loadoutPanel,loadoutGuide} from '../src/loadouts.mjs';
import {compareTable} from '../src/components.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
test('every published loadout has sourced, class-compatible guidance',()=>{
 assert.deepEqual(validate(db),[]);
 for(const c of db.champions.filter(c=>c.loadout)){assert(c.loadout);assert.equal(c.loadout.status,'editorial-trial');assert.match(c.loadout.eligibility,/7-star/);for(const kind of ['battlecast','statcast']){if(c.loadout[kind+'Id']===null)continue;const r=db.relics.find(r=>r.id===c.loadout[kind+'Id']);assert.equal(r.class,c.class);assert.equal(r.kind,kind);}}
});
test('invalid types, classes, sources, dates and focus choices cannot be imported',()=>{
 for(const change of [c=>c.loadout.battlecastId='statcast-karnak',c=>c.loadout.battlecastId='battlecast-thor',c=>c.loadout.sourceIds=['missing'],c=>c.loadout.reviewedAt='2026-02-30',c=>c.loadout.attackFocus='Invincibility',c=>c.loadout.status='tested',c=>c.loadout.attackReason='']){const data=structuredClone(db);change(data.champions[0]);assert(validate(data).length>0);}
});
test('loadout filters intersect and preserve an explicit empty state',()=>{
 assert(loadoutCards(db,'bullseye','Skill').count>=1); // Bullseye is also a source-listed relic.
 assert.match(loadoutCards(db,'bullseye','Skill').html,/href="\/champions\/bullseye"/);
 assert.equal(loadoutCards(db,'bullseye','Tech').count,0);
 assert.match(loadoutCards(db,'unknown').html,/No matching guidance/);
 assert(loadoutCards(db,'Storm','Mutant').count>1);
});
test('profiles and comparisons distinguish trial settings from verified requirements',()=>{
 const c=db.champions.find(c=>c.id==='bullseye');
 assert.match(loadoutPanel(db,c),/Critical Damage Rating/);
 assert.match(loadoutPanel(db,c),/Exact attribute variant not reviewed/);
 assert.match(compareTable(db,[c.id]),/7★ attacker focus · trial/);
 assert.match(loadoutGuide(db),/Statcasts also have Strikers/);
});
test('loadout renderer escapes imported text and supports an unreviewed record',()=>{
 const c=structuredClone(db.champions[0]);c.loadout.attackReason='<script>alert(1)</script>';
 assert(!loadoutPanel(db,c).includes('<script>'));assert.match(loadoutPanel(db,c),/&lt;script&gt;/);
 delete c.loadout;assert.match(loadoutPanel(db,c),/SOURCE SHORTLIST/);
 delete c.referenceFacts;assert.match(loadoutPanel(db,c),/No loadout guidance reviewed/);
});

test('standalone focus advice does not invent a relic or defensive recommendation',()=>{
 const c=structuredClone(db.champions.find(c=>c.id==='spider-man-noir'));
 c.focusTrial={attackFocus:'Block Penetration',attackAlternative:'Block Proficiency',attackReason:'Fixture trial',eligibility:'Eligible 7-star only',status:'editorial-trial',reviewedAt:'2026-10-28',sourceIds:c.sourceIds};delete c.loadout;
 assert.match(loadoutPanel(db,c),/RELIC PAIRING UNREVIEWED/);
 assert.match(loadoutPanel(db,c),/Defender focus remains unreviewed/);
 assert.match(loadoutCards(db,c.focusTrial.attackFocus,'Skill').html,/spider-man-noir/);
 assert.match(compareTable(db,[c.id]),/Block Penetration/);
 const copy=structuredClone(db),entry=copy.champions.find(c=>c.id==='spider-man-noir');delete entry.loadout;entry.focusTrial=structuredClone(c.focusTrial);
 entry.focusTrial.attackReason='<script>unsafe</script>';
 assert.match(loadoutPanel(copy,entry),/&lt;script/);
 for(const change of [f=>f.sourceIds=['missing'],f=>f.reviewedAt='2026-02-30',f=>f.attackFocus='Invincibility',f=>f.status='tested']){
  const invalid=structuredClone(copy);change(invalid.champions.find(c=>c.id===entry.id).focusTrial);
  assert(validate(invalid).length);
 }
});

test('paginated guidance covers the full result set without duplicate cards',()=>{
 const ids=[];
 const first=loadoutCards(db,'','',{pageSize:12});
 for(let page=1;page<=first.pages;page++){
  const result=loadoutCards(db,'','',{pageSize:12,page});
  const batch=[...result.html.matchAll(/class="panel loadout-card" id="([^"]+)"/g)].map(m=>m[1]);
  assert(batch.length<=12);ids.push(...batch);
 }
 assert.equal(ids.length,first.count);assert.equal(new Set(ids).size,first.count);
 assert.equal(loadoutCards(db,'','',{pageSize:12,page:9999}).page,first.pages);
 assert.equal(loadoutCards(db,'','',{pageSize:12,page:-2}).page,1);
});
test('focus availability intersects search and class, including standalone trials',()=>{
 const trials=loadoutCards(db,'','',{coverage:'trials'});
 const references=loadoutCards(db,'','',{coverage:'references'});
 assert.equal(trials.count,db.champions.filter(c=>c.loadout||c.focusTrial).length);
 assert.equal(trials.count+references.count,loadoutCards(db).count);
 assert.equal(loadoutCards(db,'Spider-Man Noir','Skill',{coverage:'trials'}).count,1);
 assert.equal(loadoutCards(db,'Spider-Man Noir','Skill',{coverage:'references'}).count,0);
 assert.equal(loadoutCards(db,'does-not-exist','',{pageSize:12,page:900}).start,0);
 assert.equal((loadoutGuide(db).match(/class="panel loadout-card"/g)||[]).length,12);
});
