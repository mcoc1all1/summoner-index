import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validate} from '../src/domain.mjs';

const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
const boss=id=>db.bosses.find(b=>b.id===id);

test('expanded boss guide catalog validates and includes Act 10 Chronoserpent',()=>{
 assert.deepEqual(validate(db),[]);
 assert.equal(db.bosses.length,28);
 const chrono=boss('chronoserpent-act10');
 assert(chrono);
 assert.equal(chrono.chapter,'10.4.4');
 assert.equal(chrono.questId,'act-10');
 assert(db.quests.find(q=>q.id==='act-10')?.bossIds.includes(chrono.id));
 assert(chrono.sourceIds.some(id=>db.sources.some(s=>s.id===id&&s.kind==='official')));
 assert(chrono.phases.some(p=>/20–17 bars/.test(p.name)));
 assert.match(chrono.phases.at(-1).text,/more than one personal Vigor/i);
});

test('Cerastes final instruction uses the player light attack into block',()=>{
 const c=boss('cerastes');
 const finish=c.phases.at(-1).text;
 assert.match(finish,/strike Cerastes' Block with a Light Attack/i);
 assert.doesNotMatch(finish,/block his first light attack/i);
 assert(c.guideDetails.cheatSheet.some(row=>row.stage==='1%'&&/Light Attack into his Block/i.test(row.objective)));
});

test('every boss has actionable preparation, recovery and explicit verification',()=>{
 for(const b of db.bosses){
  assert(b.guideDetails,`${b.id}: guideDetails`);
  assert(Array.isArray(b.guideDetails.preparation)&&b.guideDetails.preparation.length,`${b.id}: preparation`);
  assert(Array.isArray(b.guideDetails.troubleshooting)&&b.guideDetails.troubleshooting.length,`${b.id}: troubleshooting`);
  assert(b.guideDetails.scope?.trim(),`${b.id}: scope`);
  assert(b.verification,`${b.id}: verification`);
  assert.equal(typeof b.verification.gameplayTested,'boolean',`${b.id}: gameplayTested`);
  assert.match(b.verification.checkedAt,/^\d{4}-\d{2}-\d{2}$/,`${b.id}: verification date`);
 }
});

test('late-story bosses expose concise mechanic terminology and phase cheat sheets',()=>{
 for(const id of ['superior-kang','cerastes','glykhan','orochi','lotan','dread-emperor-doom','nameless-grandmaster','chronoserpent-act10']){
  const b=boss(id);
  assert(Array.isArray(b.mechanicTags)&&b.mechanicTags.length>=3,`${id}: mechanic tags`);
  assert(Array.isArray(b.guideDetails.cheatSheet)&&b.guideDetails.cheatSheet.length>=3,`${id}: cheat sheet`);
  assert(Array.isArray(b.guideDetails.attackerProfile)&&b.guideDetails.attackerProfile.length>=3,`${id}: attacker profile`);
 }
 assert(boss('orochi').mechanicTags.includes('Violent Purge'));
 assert(boss('orochi').mechanicTags.includes('Backfire'));
 assert(boss('lotan').mechanicTags.includes('Seal of Soul'));
 assert(boss('dread-emperor-doom').mechanicTags.includes('Will'));
 assert(boss('glykhan').mechanicTags.includes('Wound of Defiance'));
 assert(boss('chronoserpent-act10').mechanicTags.includes('Major Mode'));
});

test('new boss counters remain conservative community recommendations',()=>{
 const bossIds=new Set(db.bosses.map(b=>b.id));
 const counters=db.counters.filter(c=>bossIds.has(c.defenderId));
 assert(counters.length>=23);
 for(const c of counters.filter(c=>['chronoserpent-act10','superior-kang','cerastes','glykhan','nameless-grandmaster'].includes(c.defenderId))){
  assert(c.score<=3,c.id);
  assert.equal(c.review?.status,'community-sourced',c.id);
  assert(c.sourceIds.some(id=>db.sources.some(s=>s.id===id&&s.kind==='community-report')),c.id);
  assert(!/guaranteed|best counter|automatic win/i.test(`${c.why} ${c.strategy} ${c.scoreReason}`),c.id);
 }
});

test('legacy Act 5 bosses are clearly scoped as legacy preparation',()=>{
 for(const id of ['collector-act5','ultron-act5']){
  const b=boss(id);
  assert.match(b.guideDetails.statusNote,/Legacy progression encounter/i);
  assert.match(b.verification.label,/Legacy encounter/i);
 }
});
