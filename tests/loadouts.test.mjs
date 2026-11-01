import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validate} from '../src/domain.mjs';
import {loadoutCards,loadoutPanel,loadoutGuide,focusPublicValue} from '../src/loadouts.mjs';
import {compareTable} from '../src/components.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
test('every published loadout remains a sourced editorial draft',()=>{
 assert.deepEqual(validate(db),[]);
 for(const c of db.champions.filter(c=>c.loadout)){assert(c.loadout);assert.equal(c.loadout.status,'editorial-trial');assert.match(c.loadout.eligibility,/7-star/);for(const kind of ['battlecast','statcast']){if(c.loadout[kind+'Id']===null)continue;const r=db.relics.find(r=>r.id===c.loadout[kind+'Id']);assert.equal(r.class,c.class);assert.equal(r.kind,kind);}}
});
test('invalid types, classes, sources, dates and focus choices cannot be imported',()=>{
 for(const change of [c=>c.loadout.battlecastId='statcast-karnak',c=>c.loadout.battlecastId='battlecast-thor',c=>c.loadout.sourceIds=['missing'],c=>c.loadout.reviewedAt='2026-02-30',c=>c.loadout.attackFocus='Invincibility',c=>c.loadout.status='tested',c=>c.loadout.attackReason='']){const data=structuredClone(db);change(data.champions[0]);assert(validate(data).length>0);}
});
test('loadout filters intersect and preserve an explicit empty state',()=>{
 assert(loadoutCards(db,'bullseye','Skill').count>=1);
 assert.match(loadoutCards(db,'bullseye','Skill').html,/href="\/champions\/bullseye"/);
 assert.equal(loadoutCards(db,'bullseye','Tech').count,0);
 assert.match(loadoutCards(db,'unknown').html,/No matching guidance/);
 assert(loadoutCards(db,'Storm','Mutant').count>1);
});
test('unverified profiles and comparisons withhold focus values',()=>{
 const data=structuredClone(db),c=data.champions.find(c=>c.id==='spider-man-noir');delete c.statFocusEligibility;
 assert.equal(focusPublicValue(c,'attack'),'Hidden — 7★ eligibility not verified');
 assert.match(loadoutPanel(data,c),/FOCUS DRAFT WITHHELD/);
 const compare=compareTable(data,[c.id]);
 assert.match(compare,/Hidden — 7★ eligibility not verified/);
 assert(!compare.includes(`<td>${c.loadout.attackFocus}</td>`));
 assert.match(loadoutGuide(db),/Exact Stat Focus picks are shown only when 7★ eligibility is explicitly confirmed/);
});
test('verified profiles expose their editorial focus drafts',()=>{
 const c=db.champions.find(c=>c.id==='spider-man-noir');
 assert.equal(focusPublicValue(c,'attack'),c.loadout.attackFocus);
 assert.match(loadoutPanel(db,c),/VERIFIED-ELIGIBILITY FOCUS TRIAL/);
 const compare=compareTable(db,[c.id]);
 assert(compare.includes(`<td>${c.loadout.attackFocus}</td>`));
});
test('loadout renderer escapes imported text and supports an unreviewed record',()=>{
 const c=structuredClone(db.champions[0]);c.loadout.attackReason='<script>alert(1)</script>';
 assert(!loadoutPanel(db,c).includes('<script>'));
 delete c.loadout;assert.match(loadoutPanel(db,c),/SOURCE SHORTLIST/);
 delete c.referenceFacts;assert.match(loadoutPanel(db,c),/No loadout guidance reviewed/);
});

test('standalone focus drafts remain hidden until eligibility is verified',()=>{
 const c=structuredClone(db.champions.find(c=>c.id==='spider-man-noir'));
 c.focusTrial={attackFocus:'Block Penetration',attackAlternative:'Block Proficiency',attackReason:'Fixture trial',eligibility:'Eligible 7-star only',status:'editorial-trial',reviewedAt:'2026-10-28',sourceIds:c.sourceIds};delete c.loadout;delete c.statFocusEligibility;
 assert.match(loadoutPanel(db,c),/STAT FOCUS WITHHELD/);
 assert(!loadoutPanel(db,c).includes('7★ attacker starting point: Block Penetration'));
 const copy=structuredClone(db),entry=copy.champions.find(x=>x.id==='spider-man-noir');delete entry.loadout;entry.focusTrial=structuredClone(c.focusTrial);delete entry.statFocusEligibility;
 const focusSearch=loadoutCards(copy,c.focusTrial.attackFocus,'Skill');
 assert(!focusSearch.html.includes('/champions/spider-man-noir'));
 entry.focusTrial.attackReason='<script>unsafe</script>';
 assert(!loadoutPanel(copy,entry).includes('<script>'));
 for(const change of [f=>f.sourceIds=['missing'],f=>f.reviewedAt='2026-02-30',f=>f.attackFocus='Invincibility',f=>f.status='tested']){
  const invalid=structuredClone(copy);change(invalid.champions.find(x=>x.id===entry.id).focusTrial);
  assert(validate(invalid).length);
 }
});

test('verified eligibility permits exact focus display',()=>{
 const data=structuredClone(db),c=data.champions.find(c=>c.id==='bullseye');
 c.statFocusEligibility={status:'confirmed',checkedAt:'2026-11-01',sourceIds:[c.sourceIds[0]]};
 assert.equal(focusPublicValue(c,'attack'),c.loadout.attackFocus);
 assert.match(loadoutPanel(data,c),/VERIFIED-ELIGIBILITY FOCUS TRIAL/);
 assert.match(loadoutPanel(data,c),new RegExp(c.loadout.attackFocus));
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
test('guidance filters separate hidden drafts from verified focus',()=>{
 const drafts=loadoutCards(db,'','',{coverage:'drafts'});
 const verified=loadoutCards(db,'','',{coverage:'verified'});
 const expectedVerified=db.champions.filter(c=>(c.loadout?.attackFocus||c.focusTrial?.attackFocus)&&c.statFocusEligibility?.status==='confirmed').length;
 assert(drafts.count>0);
 assert.equal(verified.count,expectedVerified);
 assert.equal(loadoutCards(db,'Bullseye','Skill',{coverage:'verified'}).count,1);
 assert.equal(loadoutCards(db,'Spider-Man Noir','Skill',{coverage:'verified'}).count,1);
 assert.equal(loadoutCards(db,'Doctor Doom','Mystic',{coverage:'drafts'}).count,1);
 assert.equal(loadoutCards(db,'does-not-exist','',{pageSize:12,page:900}).start,0);
 assert.equal((loadoutGuide(db).match(/class="panel loadout-card"/g)||[]).length,12);
});
