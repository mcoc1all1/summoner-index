import test from 'node:test';
import assert from 'node:assert/strict';
import {championProtectionGroups,championProtectionPanel,protectionStatus} from '../src/champion-profile.mjs';

test('protectionStatus separates always, conditional, synergy and unknown',()=>{
 assert.equal(protectionStatus({availability:'always',forms:['debuff'],condition:'Base kit'}),'always');
 assert.equal(protectionStatus({availability:'conditional',forms:['debuff'],condition:'While in Diamond Form'}),'conditional');
 assert.equal(protectionStatus({availability:'conditional',forms:['debuff'],condition:'Granted by Prowler synergy pre-fight'}),'synergy');
 assert.equal(protectionStatus({availability:'unknown',forms:[],condition:'Not reviewed'}),'unknown');
});

test('championProtectionGroups includes reviewed and source-listed protections',()=>{
 const champion={
  immunityIds:['poison','shock'],
  protections:[
   {effectId:'poison',availability:'always',forms:['debuff'],condition:'Always active'},
   {effectId:'rupture',availability:'conditional',forms:['debuff'],condition:'With a synergy active'}
  ]
 };
 const groups=championProtectionGroups(champion);
 assert.deepEqual(groups.always.map(x=>x.effectId),['poison']);
 assert.deepEqual(groups.synergy.map(x=>x.effectId),['rupture']);
 assert.deepEqual(groups.unknown.map(x=>x.effectId),['shock']);
});

test('championProtectionPanel labels activation states clearly',()=>{
 const db={immunities:[{id:'concussion',name:'Concussion'},{id:'rupture',name:'Rupture'}]};
 const champion={protections:[
  {effectId:'concussion',availability:'always',forms:['debuff'],condition:'Rebellious Spirit is always active.'},
  {effectId:'rupture',availability:'conditional',forms:['debuff'],condition:'Granted by synergy pre-fight.'}
 ]};
 const html=championProtectionPanel(db,champion);
 assert.match(html,/Concussion/);
 assert.match(html,/Always active/);
 assert.match(html,/Rupture/);
 assert.match(html,/Synergy \/ pre-fight/);
 assert.match(html,/Debuffs/);
});
