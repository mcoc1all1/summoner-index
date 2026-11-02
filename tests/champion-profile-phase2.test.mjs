import test from 'node:test';
import assert from 'node:assert/strict';
import {championProfilePage,championProtectionPanel} from '../src/champion-profile.mjs';
import {rotationPanel} from '../src/guidance.mjs';

const db={
 abilities:[{id:'power-control',name:'Power Control'},{id:'nullify',name:'Nullify'}],
 tags:[{id:'villain',name:'Villain'}],
 immunities:[{id:'shock',name:'Shock'},{id:'poison',name:'Poison'}],
 relics:[{id:'relic-a',name:'Relic A'}],
 synergies:[],
 sources:[],
 champions:[]
};
const curated={
 id:'test-champ',name:'Test Champ',class:'Mystic',summary:'Controls power and buffs.',coverage:'curated',
 abilityIds:['power-control','nullify'],tagIds:['villain'],strengths:'Buff-heavy fights.',risks:'Needs careful timing.',
 awakening:'Useful, not required.',signatureTarget:40,rotation:['Build to SP1','Use a Heavy','Launch SP2'],
 protections:[{effectId:'poison',availability:'always',forms:['debuff'],condition:'Always active.'},{effectId:'shock',availability:'unknown',forms:[],condition:'Activation not reviewed.'}],
 immunityIds:['poison','shock'],sourceIds:[],loadout:{battlecastId:'relic-a',reviewedAt:'2026-11-01',relicNotes:'Starting point.',eligibility:'Check the owned item.',sourceIds:[]},
 statFocusEligibility:{status:'unverified'},referenceFacts:null
};

test('curated champion page uses directional actions and split matchup language',()=>{
 const html=championProfilePage(db,curated,{incoming:[{defenderId:'test-champ'}],outgoing:[],opponents:[]});
 assert.match(html,/Counters to Test Champ/);
 assert.match(html,/Using Test Champ/);
 assert.match(html,/Facing Test Champ/);
 assert.doesNotMatch(html,/Find counters →/);
 assert.doesNotMatch(html,/EDITORIAL NOTES/);
});

test('guide-pending profile stays lean and omits empty gameplay sections',()=>{
 const pending={...curated,id:'pending',name:'Pending Champ',coverage:'roster',rotation:[],loadout:null,referenceFacts:null};
 const html=championProfilePage(db,pending,{incoming:[],outgoing:[],opponents:[]});
 assert.match(html,/Reference profile/);
 assert.doesNotMatch(html,/Fight plan pending/);
 assert.doesNotMatch(html,/MATCHUPS/);
 assert.doesNotMatch(html,/SYNERGIES/);
});

test('unverified protections are collapsed separately from reviewed groups',()=>{
 const html=championProtectionPanel(db,curated);
 assert.match(html,/Always active/);
 assert.match(html,/Unverified protections · 1/);
 assert.doesNotMatch(html,/protection-state/);
});

test('rotation panel leads with a compact quick loop',()=>{
 const html=rotationPanel(curated);
 assert.match(html,/HOW TO PLAY/);
 assert.match(html,/Quick loop/);
 assert.match(html,/Build to SP1 → Use a Heavy → Launch SP2/);
 assert.doesNotMatch(html,/PRACTICE REQUIRED/);
});
