import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {manualCommercialFindings,publicPageQuality,requiredCommercialChecks} from '../scripts/commercial-readiness.mjs';

const makeRegister=(status='pending')=>({version:1,checks:requiredCommercialChecks.map(id=>({
 id,status,reviewer:status==='approved'?'Editorial reviewer':null,reviewedAt:status==='approved'?'2026-11-04':null,
 evidence:status==='approved'?'Dated verified individual assessment, including source comparisons.':null
}))});

test('commercial approval is fail-closed without external evidence',()=>{
 const pending=manualCommercialFindings(makeRegister(),{today:'2026-11-05'});
 assert.equal(pending.filter(f=>f.severity==='blocker').length,requiredCommercialChecks.length);
 const forged=makeRegister('approved');
 forged.checks[1].evidence='unverified';
 forged.checks[2].reviewedAt='2027-01-01';
 assert.equal(manualCommercialFindings(forged,{today:'2026-11-05'}).filter(f=>f.severity==='blocker').length,2);
 assert.equal(manualCommercialFindings(makeRegister('approved'),{today:'2026-11-05'}).length,0);
});

test('public page quality audit counts actual beta indexing and detects ad code/editor links',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'summoner-commercial-test-'));
 try{
  fs.mkdirSync(path.join(root,'champions','test'),{recursive:true});
  fs.writeFileSync(path.join(root,'champions','test','index.html'),
   '<!doctype html><head><title>Test champion</title><meta name="description" content="Test description"><meta name="robots" content="noindex,follow"><link rel="canonical" href="https://example.com/champions/test"></head><main><h1>Test</h1><p>Brief note.</p></main><a href="/content-workbench">Edit</a><script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>');
  fs.writeFileSync(path.join(root,'index.html'),
   '<!doctype html><head><title>Home</title><meta name="description" content="Home overview"><link rel="canonical" href="https://example.com/"></head><main><h1>Home</h1></main>');
  const report=publicPageQuality(root);
  assert.equal(report.totalPages,2);
  assert.equal(report.indexablePages,1);
  assert.equal(report.noindexPages,1);
  assert.equal(report.shortEditorialPagesCount,1);
  assert.equal(report.workbenchLeaksCount,1);
  assert.equal(report.possibleAdTagsCount,1);
  assert.equal(report.missingCanonicalCount,0);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
