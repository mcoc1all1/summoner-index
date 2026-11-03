import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {bossEditorialReviewNotice} from '../src/boss-guidance.mjs';
import {contentPolicy} from '../src/content-policy.mjs';
import {counterConfidence} from '../src/components.mjs';

const manifest=JSON.parse(fs.readFileSync(new URL('../content/publication-review.json',import.meta.url),'utf8'));

test('pending boss publication reviews remain visible as research drafts',()=>{
 const ids=['gwenmaster','kang-conqueror','scytalis','bahamet'];
 for(const id of ids){
  const review=manifest.reviews.find(r=>r.id===id);
  assert(review,id);
  assert.match(bossEditorialReviewNotice(review),/Research draft · review in progress/);
 }
 assert.equal(bossEditorialReviewNotice({accuracy:{status:'source-checked'},rights:{status:'reviewed'}}),'');
 assert.equal(bossEditorialReviewNotice(null),'');
});

test('source-linked is distinguished from current-client verified gameplay',()=>{
 assert.match(contentPolicy,/Source-linked/);
 assert.match(contentPolicy,/Source-checked/);
 assert.match(contentPolicy,/game version, date, conditions and supporting evidence/);
 assert.match(contentPolicy,/Summoner Index is an independent fan project/);
 assert.match(contentPolicy,/href="\/feedback"/);
 assert.doesNotMatch(contentPolicy,/public corrections contact will be provided/i);
});

test('high numeric confidence cannot alone assert gameplay testing',()=>{
 for(const score of [4,5]){
  assert.doesNotMatch(counterConfidence({score}).label,/Tested|tested/);
  assert.doesNotMatch(counterConfidence({score,review:{gameplayTested:true}}).label,/Tested|tested/);
 }
});
