import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {search,validate} from '../src/domain.mjs';
import {referencePanel} from '../src/reference.mjs';
import {rotationPanel,synergyPanel} from '../src/guidance.mjs';
import {updateRecord,draftPreview} from '../src/draft.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
const byId=id=>db.champions.find(c=>c.id===id);
test('deeper guides carry dated sources and practice steps without asserting gameplay verification',()=>{
 const cs=db.champions.filter(c=>c.kitReview?.batch?.startsWith('deep-guides'));
 assert.equal(cs.length,28);
 for(const c of cs){assert.equal(c.rotation.length,3);assert.equal(c.kitReview.gameVersion,null);assert(c.sourceIds.includes('deep-'+c.id));assert.match(rotationPanel(c),/No current-build combat test/);}
 assert.deepEqual(validate(db),[]);
});
test('form, signature, cleanse and resistance conditions stay out of unconditional immunity search',()=>{
 for(const id of ['angela','juggernaut','ghost','silk','titania','lady-deathstrike','diablo','bishop','emma-frost','venom','crossbones','cheeilth'])assert(byId(id));
 const bleedAlways=search(db,'',{immunity:'bleed',activation:'always'}).champions.map(c=>c.id);
 for(const id of ['omega-red','titania','lady-deathstrike','emma-frost'])assert(!bleedAlways.includes(id));
 const shockAlways=search(db,'',{immunity:'shock',activation:'always'}).champions.map(c=>c.id);
 for(const id of ['ultron','emma-frost'])assert(!shockAlways.includes(id));
 assert(!search(db,'',{immunity:'reversed-controls',activation:'always'}).champions.some(c=>c.id==='juggernaut'));
 assert(search(db,'',{immunity:'reversed-controls',activation:'all'}).champions.some(c=>c.id==='wiccan'));
 for(const effect of ['bleed','power-steal','neutralize'])assert(byId('photon').immunityIds.includes(effect));
 assert(!referencePanel(byId('ghost')).includes('Damaging Debuffs Immunity'));
 assert.match(referencePanel(byId('ghost')),/conversion is not immunity/);
});
test('Stat Focus publication withholds unreviewed drafts and keeps reviewed recommendations actionable',()=>{
 for(const id of ['ghost','omega-red','lady-deathstrike']){
  const c=byId(id);
  assert.equal(c.statFocusReview?.status,'withheld');
  assert.match(c.loadout?.attackReason||c.focusTrial?.attackReason||'',/withheld pending champion-specific review/);
 }
 const crossbones=byId('crossbones');
 assert.equal(crossbones.statFocusReview?.status,'reviewed');
 assert.equal(crossbones.statFocusReview?.confidence,'medium');
 assert.equal(crossbones.loadout.attackFocus,'Critical Rating');
 assert(crossbones.statFocusReview.sourceIds.includes('stat-focus-community-table-2025'));
});
test('synergy notes require a real partner, evidence and conditions',()=>{
 const clone=structuredClone(db);clone.synergies[0].partnerIds=['unknown'];assert(validate(clone).some(e=>e.includes('unknown champions')));
 clone.synergies[0].partnerIds=['ghost'];assert(validate(clone).some(e=>e.includes('itself')));
 assert.match(synergyPanel(db,byId('ghost')),/Team synergy only/);
 assert.match(synergyPanel(db,byId('ghost')),/\/champions\/wasp/);
});
test('guide editing preserves steps and escapes markup in previews',()=>{
 const c=structuredClone(byId('ghost'));c.rotation[0]='<img src=x onerror=alert(1)>';
 const next=updateRecord(db,'champions',c);assert.equal(next.champions.find(x=>x.id===c.id).rotation[0],c.rotation[0]);
 assert(!draftPreview(next,'champions',c).includes('<img'));assert.match(rotationPanel(c),/&lt;img/);
 c.rotation=[''];const clone=structuredClone(db);clone.champions[clone.champions.findIndex(x=>x.id===c.id)]=c;assert(validate(clone).some(e=>e.includes('rotation')));
});
