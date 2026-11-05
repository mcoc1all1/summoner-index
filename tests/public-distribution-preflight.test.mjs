import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {inspectDistribution} from '../scripts/public-distribution-preflight.mjs';

const fixture=()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'summoner-dist-preflight-'));
 fs.writeFileSync(path.join(dir,'index.html'),'<html><head><meta name="robots" content="noindex,follow"></head><body>Beta</body></html>');
 fs.writeFileSync(path.join(dir,'sitemap.xml'),'<?xml version="1.0"?><urlset/>');
 fs.writeFileSync(path.join(dir,'catalog.json'),JSON.stringify({champions:[{id:'trial',referenceFacts:{status:'source-link-only',url:'https://example.org'},relicIds:[],loadout:{battlecastId:null,statcastId:null}}]}));
 return dir;
};
test('clean beta distribution passes without indexing or third-party compilation',()=>{
 const dir=fixture();
 try{
  const report=inspectDistribution(dir);
  assert.equal(report.ready,true,JSON.stringify(report.issues));
  assert.equal(report.inventory.html,1);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('preflight blocks source dumps, raw reference lists, leaked secrets and indexable pages',()=>{
 const dir=fixture();
 try{
  fs.mkdirSync(path.join(dir,'content'));
  fs.writeFileSync(path.join(dir,'content','catalog.json'),'{}');
  fs.writeFileSync(path.join(dir,'index.html'),'<title>Indexable</title>');
  fs.writeFileSync(path.join(dir,'catalog.json'),JSON.stringify({champions:[{id:'trial',referenceFacts:{status:'source-catalogued',abilities:['copied']},relicIds:['example']}]}));
  fs.writeFileSync(path.join(dir,'private.pem'),'-----BEGIN PRIVATE KEY-----\nfictional test data');
  const issues=inspectDistribution(dir).issues.map(x=>x.id);
  for(const expected of ['forbidden-directory','indexing-hold-violated','compiled-reference-republished','unreviewed-relic-pairing','source-file-exposed'])
   assert(issues.includes(expected),expected+': '+JSON.stringify(issues));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
