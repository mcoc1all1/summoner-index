import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {versionAssets} from '../scripts/version-assets.mjs';
test('asset versions invalidate transitive modules and data while preserving project URLs',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fieldguide-assets-'));
 try{
  fs.writeFileSync(path.join(dir,'app.mjs'),"import {x} from './child.mjs'; await import('./editor.mjs'); fetch(base+'/catalog.json');");
  fs.writeFileSync(path.join(dir,'child.mjs'),'export const x=1;');
  fs.writeFileSync(path.join(dir,'editor.mjs'),'export const editor=true;');
  fs.writeFileSync(path.join(dir,'catalog.json'),'{}');
  fs.writeFileSync(path.join(dir,'styles.css'),'body{color:red}');
  const html='<script src="/summoner-index/app.mjs"></script><link href="/summoner-index/styles.css"><a href="/summoner-index/champions">Champions</a>';
  fs.writeFileSync(path.join(dir,'index.html'),html);
  const a=versionAssets(dir,'/summoner-index');
  const js=fs.readFileSync(path.join(dir,a.assets['app.mjs']),'utf8');
  for(const name of ['child.mjs','editor.mjs','catalog.json'])assert(js.includes(a.assets[name]));
  assert(fs.readFileSync(path.join(dir,'index.html'),'utf8').includes('/summoner-index/'+a.assets['styles.css']));
  assert(fs.readFileSync(path.join(dir,'index.html'),'utf8').includes('href="/summoner-index/champions"'));
  assert.equal(versionAssets(dir,'/summoner-index').version,a.version);
  fs.writeFileSync(path.join(dir,'child.mjs'),'export const x=2;');
  fs.writeFileSync(path.join(dir,'index.html'),html);
  const b=versionAssets(dir,'/summoner-index');assert.notEqual(b.assets['app.mjs'],a.assets['app.mjs']);
  fs.writeFileSync(path.join(dir,'catalog.json'),'{"changed":true}');
  assert.notEqual(versionAssets(dir,'/summoner-index').version,b.version);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
