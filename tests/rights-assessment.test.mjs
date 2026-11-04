import test from 'node:test';
import assert from 'node:assert/strict';
import {fingerprint,rightsAssessmentReasons} from '../src/rights-assessment.mjs';
const db={sources:[{id:'a',url:'https://example.org/a'}],bosses:[{id:'boss',sourceIds:['a'],summary:'Original draft'}]};
function fixture(){return {fingerprint:fingerprint(db,db.bosses[0]),reviewer:'Fixture',reviewedAt:'2026-11-04',rights:{status:'reviewed',basis:'independently-authored-facts',evidence:'Comparison record',expression:'Functional terminology',arrangement:'Natural encounter order',compilation:'No distinctive selection reused',unresolved:[],sources:[{sourceId:'a',url:'https://example.org/a',access:'compared',comparison:'Original factual prose',licenseStatus:'No license relied upon',locator:'Ability section',checkedAt:'2026-11-04'}]}};}
test('content and citation mutations invalidate an otherwise complete assessment',()=>{
 for(const mutate of [d=>d.bosses[0].summary+=' edit',d=>d.sources[0].url+='/changed',d=>d.bosses[0].sourceIds.push('missing')]){
  const copy=structuredClone(db);mutate(copy);
  assert(rightsAssessmentReasons(copy,copy.bosses[0],fixture()).length);
 }
});
test('all assessment dimensions and each cited source are required',()=>{
 assert.deepEqual(rightsAssessmentReasons(db,db.bosses[0],fixture()),[]);
 for(const mutate of [r=>delete r.rights.expression,r=>delete r.rights.arrangement,r=>delete r.rights.compilation,r=>r.rights.sources=[],r=>r.rights.sources.push(r.rights.sources[0]),r=>r.rights.sources[0].access='blocked',r=>r.rights.sources[0].url='https://wrong.example',r=>r.rights.unresolved=['Pending comparison'],r=>r.reviewedAt='2026-02-30',r=>r.reviewedAt='2099-01-01',r=>r.reviewer=' ',r=>r.rights.basis='licensed',r=>r.rights.basis='permission',r=>r.rights.basis='documented-exception']){
  const r=fixture();mutate(r);assert(rightsAssessmentReasons(db,db.bosses[0],r).length);
 }
});
