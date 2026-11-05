import test from 'node:test';
import assert from 'node:assert/strict';
import {contentRightsTriage} from '../scripts/content-rights-triage.mjs';

test('commercial content triage covers the original research as well as separate guide hubs',()=>{
 const report=contentRightsTriage();
 assert.equal(report.reviewNeeded,true);
 assert(report.byType.champions.records>=330);
 assert(report.byType.bosses.records>=20);
 assert(report.byType.counters.records>100);
 assert(report.byType['carina-guides'].records>=6);
 assert.equal(report.byType['mastery-guidance'].records,1);
 assert.equal(report.byType['events-news'].records,1);
 assert(report.byType.champions.thirdPartyLinked>0);
 assert.match(report.purpose,/not plagiarism detection/i);
});
