import test from 'node:test';
import assert from 'node:assert/strict';
import {provenanceReview} from '../scripts/provenance-review.mjs';

test('editorial provenance queue exposes missing claim-specific metadata without rejecting facts',()=>{
 const report=provenanceReview();
 assert.equal(report.immunity.total,86);
 assert.equal(report.immunity.scopeFollowups,85);
 assert.equal(report.statFocus.total,116);
 assert.equal(report.statFocus.rationaleFollowups,115);
 assert(report.immunity.claims.some(x=>x.championId==='serpent'&&x.effectId==='death'&&x.reviewNeeded));
 assert(report.statFocus.claims.some(x=>x.championId==='kushala'&&x.reviewNeeded));
 assert(report.statFocus.claims.some(x=>x.championId==='carina-tivan'&&!x.reviewNeeded));
 assert.match(report.purpose,/not copyright clearance/i);
});
