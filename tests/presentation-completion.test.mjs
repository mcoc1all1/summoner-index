import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {championProfilePage} from '../src/champion-profile.mjs';
import {compareTable} from '../src/components.mjs';
import {bossQuickPlan} from '../src/guide-experience.mjs';
import {catalogViews} from '../src/catalog-views.mjs';
import {loadoutCards} from '../src/loadouts.mjs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url),'utf8'));
const views=catalogViews(db);
test('champion profiles put decision information ahead of detailed kit evidence',()=>{
 for(const id of ['kushala','doctor-doom']){
  const c=db.champions.find(c=>c.id===id);
  const html=championProfilePage(db,c,{opponents:[...db.champions,...db.bosses]});
  assert.match(html,/class="profile-decision-strip"/);
  assert.match(html,/class="overview-card profile-overview-primary"/);
  assert.match(html,/class="overview-card profile-overview-risk"/);
  assert(html.indexOf('profile-decision-strip')<html.indexOf('id="overview"'));
 }
});
test('comparison displays differences without inventing rankings or dropping catalogue values',()=>{
 const view=views['catalog-compare'];
 const html=compareTable(view,['kushala','doctor-doom']);
 assert.match(html,/compare-insights/);
 assert.match(html,/data-compare-toggle/);
 assert.match(html,/compare-diff/);
 assert.match(html,/compare-mini-card/);
 assert.match(html,/kushala/);
 assert.match(html,/Doctor Doom/);
 assert.match(html,/not a strength ranking/);
 const solo=compareTable(view,['doctor-doom']);
 assert.doesNotMatch(solo,/class="compare-diff"/);
});
test('boss overview previews the phase order but retains sourced text in deep guide',()=>{
 const html=bossQuickPlan({name:'Boss',summary:'Research only',phases:[{name:'Start',text:'Do one thing'},{name:'Finish',text:'Do something else'}],mistakes:[],mechanicTags:[],verification:{gameplayTested:false}});
 assert.match(html,/boss-phase-rail/);
 assert.match(html,/Start/);
 assert.match(html,/Finish/);
 assert.match(html,/current-client test not recorded/);
});
test('loadout summary clearly withholds unpublished focus data',()=>{
 const html=loadoutCards(views['catalog-loadouts'],'doctor doom','',{pageSize:12}).html;
 assert.match(html,/loadout-decision-strip/);
 assert.match(html,/7★ focus eligibility/);
});
test('generated site includes mobile and page-specific styles and an interactive comparison filter',()=>{
 const dist=new URL('../dist/',import.meta.url);
 const css=fs.readFileSync(new URL('ux-cleanup.css',dist),'utf8');
 assert.match(css,/\.sidebar nav\{grid-template-columns:repeat\(7/);
 assert.match(css,/compare-only-differences/);
 assert.match(css,/profile-decision-strip/);
 assert.match(css,/roster-toolbar/);
 const app=fs.readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
 assert.match(app,/compareButton\.setAttribute\('aria-pressed'/);
});
