import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {bossEditorialReviewNotice} from '../src/boss-guidance.mjs';

const review=JSON.parse(fs.readFileSync(new URL('../content/publication-review.json',import.meta.url),'utf8'));

test('public boss notices disclose pending reviews without claiming infringement',()=>{
 const expected=new Set(['gwenmaster','kang-conqueror','scytalis','bahamet']);
 for(const row of review.reviews){
  if(!expected.has(row.id))continue;
  assert.equal(row.accuracy.status,'pending');
  assert.equal(row.rights.status,'pending');
  const html=bossEditorialReviewNotice(row);
  assert.match(html,/Research draft/);
  assert.match(html,/review in progress/);
  assert.match(html,/current-game accuracy and reuse review are not complete/);
  assert.doesNotMatch(html,/infringement|copyright violation|permission granted/i);
 }
});

test('completed reviews and guides without review records are not flagged',()=>{
 assert.equal(bossEditorialReviewNotice(null),'');
 assert.equal(bossEditorialReviewNotice({accuracy:{status:'approved'},rights:{status:'approved'}}),'');
 assert.match(bossEditorialReviewNotice({accuracy:{status:'pending'},rights:{status:'approved'}}),/Research draft/);
 assert.match(bossEditorialReviewNotice({accuracy:{status:'approved'},rights:{status:'pending'}}),/Research draft/);
});
