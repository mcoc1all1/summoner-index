import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {stageCleanPublication} from '../scripts/stage-clean-publication.mjs';
import {inspectDistribution} from '../scripts/public-distribution-preflight.mjs';

function fixture(){
 const base=fs.mkdtempSync(path.join(os.tmpdir(),'summoner-isolated-site-test-'));
 const dist=path.join(base,'dist');
 fs.mkdirSync(dist);
 fs.writeFileSync(path.join(dist,'index.html'),
  '<!doctype html><head><title>Summoner beta</title><meta name="robots" content="noindex,follow"></head><body>Site</body>');
 fs.writeFileSync(path.join(dist,'catalog.json'),
  JSON.stringify({champions:[{id:'test',referenceFacts:{status:'source-link-only',url:'https://example.org'},relicIds:[],loadout:{battlecastId:null,statcastId:null}}]}));
 fs.writeFileSync(path.join(dist,'sitemap.xml'),'<?xml version="1.0"?><urlset/>');
 fs.writeFileSync(path.join(dist,'robots.txt'),'User-agent: *\nAllow: /\n');
 return {base,dist,output:path.join(base,'snapshot')};
}
test('creates a clean checksummed noindex snapshot in a fresh independent directory',()=>{
 const {base,dist,output}=fixture();
 try{
  const result=stageCleanPublication({dist,output});
  assert.equal(result.remoteChanges,false);
  assert.equal(result.allPagesNoindex,true);
  assert.equal(result.files,5);
  assert.equal(fs.existsSync(path.join(result.site,'.nojekyll')),true);
  assert.equal(fs.existsSync(path.join(result.site,'.git')),false);
  assert.equal(fs.existsSync(path.join(result.site,'content')),false);
  assert.equal(inspectDistribution(result.site).ready,true);
  const manifest=JSON.parse(fs.readFileSync(result.manifest,'utf8'));
  assert.equal(manifest.sourceHistoryIncluded,false);
  assert.equal(manifest.allPagesNoindex,true);
  assert(manifest.filesManifest.some(x=>x.path==='index.html'&&/^[0-9a-f]{64}$/.test(x.sha256)));
  assert(!fs.existsSync(path.join(result.site,'manifest.json')),'internal manifest stays outside public site');
  assert.throws(()=>stageCleanPublication({dist,output}),/Refusing to replace/);
 }finally{fs.rmSync(base,{recursive:true,force:true});}
});
test('indexable source, accidental research files, and in-repository destinations fail closed',()=>{
 const {base,dist,output}=fixture();
 try{
  const index=path.join(dist,'index.html');
  fs.writeFileSync(index,fs.readFileSync(index,'utf8').replace('noindex,follow','index,follow'));
  assert.throws(()=>stageCleanPublication({dist,output}),/preflight/);
  assert.equal(fs.existsSync(output),false);
  fs.writeFileSync(index,fs.readFileSync(index,'utf8').replace('index,follow','noindex,follow'));
  fs.mkdirSync(path.join(dist,'content'));
  fs.writeFileSync(path.join(dist,'content','catalog.json'),'{}');
  assert.throws(()=>stageCleanPublication({dist,output}),/preflight/);
  const inRepo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','temporary-release-test');
  assert.throws(()=>stageCleanPublication({dist,output:inRepo}),/outside the source repository/);
 }finally{fs.rmSync(base,{recursive:true,force:true});}
});
test('only empty root nojekyll is permitted; other hidden deployment/source files are rejected',()=>{
 const {base,dist}=fixture();
 try{
  fs.writeFileSync(path.join(dist,'.nojekyll'),'');
  assert.equal(inspectDistribution(dist).ready,true);
  fs.writeFileSync(path.join(dist,'.nojekyll'),'suspicious');
  assert(inspectDistribution(dist).issues.some(x=>x.id==='invalid-nojekyll'));
  fs.writeFileSync(path.join(dist,'.npmrc'),'secret');
  assert(inspectDistribution(dist).issues.some(x=>x.id==='source-file-exposed'));
 }finally{fs.rmSync(base,{recursive:true,force:true});}
});
