import test from 'node:test';
import assert from 'node:assert/strict';
import {counterDepthExpansion} from '../src/counter-depth-expansion.mjs';

const targets=['maestro','kindred','attuma','korg','mister-sinister','thing','sentinel','sasquatch'];

test('counter depth expansion adds three practical options for each target defender',()=>{
  for(const defenderId of targets){
    const rows=counterDepthExpansion.counters.filter(row=>row.defenderId===defenderId);
    assert.equal(rows.length,3,defenderId);
    assert.equal(new Set(rows.map(row=>row.attackerId)).size,3,defenderId);
    for(const row of rows){
      assert.equal(row.review.status,'community-sourced');
      assert.equal(row.review.reviewedAt,'2026-11-03');
      assert.equal(row.review.gameVersion,null);
      assert(row.score<=3);
      assert(row.sourceIds.length>0);
      assert(row.conditions.length>=2);
      assert(row.why.length>20);
      assert(row.strategy.length>20);
      assert(row.risks.length>20);
    }
  }
});

test('investment-dependent counters record roster requirements explicitly',()=>{
  const namorKorg=counterDepthExpansion.counters.find(row=>row.id==='namor-korg');
  const namorAttuma=counterDepthExpansion.counters.find(row=>row.id==='namor-attuma');
  const dazzlerKorg=counterDepthExpansion.counters.find(row=>row.id==='dazzler-korg');
  for(const row of [namorKorg,namorAttuma]){
    assert.equal(row.requirements.awakened,true);
    assert.equal(row.requirements.minSignature,200);
    assert.equal(row.signature,200);
  }
  assert.equal(dazzlerKorg.requirements.awakened,true);
});
