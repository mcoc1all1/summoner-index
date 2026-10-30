import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validate} from '../src/domain.mjs';
const db=JSON.parse(fs.readFileSync(new URL('../content/catalog.json',import.meta.url)));
test('expanded story guides have phase instructions, evidence and correct quest membership',()=>{
 for(const id of ['gwenmaster','superior-kang','cerastes','glykhan','kang-conqueror','gwenperion','ice-phoenix','spider-witch','collector-act5','ultron-act5','sentinel-act6','champion-act6','captain-america-iw-act6','grandmaster','orochi','lotan','dread-emperor-doom','carina-chronoserpent','nameless-grandmaster','crossbones-act6','mister-sinister-act6','medusa-act6']){
  const b=db.bosses.find(b=>b.id===id);assert(b,id);assert(b.phases.length>=3);assert(b.sourceIds.length);assert(b.mistakes.length>=3);assert.equal(b.reviewedAt,(b.questId==='act-6'||['gwenmaster','kang-conqueror','carina-chronoserpent','cerastes','dread-emperor-doom'].includes(id))?'2026-10-30':'2026-10-29');
  assert(db.quests.find(q=>q.id===b.questId).bossIds.includes(id));
  const html=fs.readFileSync(new URL(`../dist/bosses/${id}/index.html`,import.meta.url),'utf8');
  assert(html.includes('Not gameplay-tested'));assert(html.includes('Team selection and preparation'));
 }
 assert.deepEqual(validate(db),[]);
});
test('boss review dates reject impossible dates',()=>{
 const copy=structuredClone(db);copy.bosses[0].reviewedAt='2026-02-30';assert(validate(copy).some(e=>e.includes('invalid boss review date')));
});

