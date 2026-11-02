import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const data=JSON.parse(fs.readFileSync(path.join(root,'content','masteries.json'),'utf8'));

test('mastery guide data has unique presets and source references',()=>{
 assert.equal(data.version,1);
 assert.ok(data.coreMasteries.length>=10);
 assert.ok(data.presets.length>=4);
 const presetIds=data.presets.map(item=>item.id);
 assert.equal(new Set(presetIds).size,presetIds.length);
 const sourceIds=new Set(data.sources.map(item=>item.id));
 for(const preset of data.presets){
  assert.ok(preset.title);
  assert.ok(preset.summary);
  assert.ok(preset.priorities.length>=3);
  assert.ok(preset.watch.length>=2);
  for(const id of preset.sourceIds)assert.ok(sourceIds.has(id),`${preset.id} references missing source ${id}`);
 }
});

test('mastery sources use https and expose checked dates',()=>{
 for(const source of data.sources){
  assert.match(source.url,/^https:\/\//);
  assert.match(source.checkedAt,/^\d{4}-\d{2}-\d{2}$/);
 }
});

test('mastery pages are generated in a built site when dist exists',()=>{
 const hub=path.join(root,'dist','masteries','index.html');
 if(!fs.existsSync(path.join(root,'dist')))return;
 assert.ok(fs.existsSync(hub));
 const html=fs.readFileSync(hub,'utf8');
 assert.match(html,/Build masteries around how you actually play/);
 assert.match(html,/General \/ Non-Recoil Setup/);
 assert.match(html,/Battlegrounds Setup/);
 assert.match(html,/Recoil \/ Liquid Courage \/ Double Edge/);
});
