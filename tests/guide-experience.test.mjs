import test from 'node:test';
import assert from 'node:assert/strict';
import {bossQuickPlan,guideHub,challengeAtAGlance,addMobileFightCards} from '../src/guide-experience.mjs';

const boss={name:'Test Boss',summary:'Test summary',phases:[{text:'Build the fight resource, then punish.'}],mistakes:['Do not miss the punish.'],mechanicTags:['Power Gain','Unstoppable'],guideDetails:{attackerProfile:['Bring reliable power control.'],cheatSheet:[{stage:'Start',objective:'Build resource',watch:'Power gain'}]},verification:{gameplayTested:false}};

test('boss quick plan gives a scannable do/bring/avoid summary',()=>{
 const html=bossQuickPlan(boss);
 assert.match(html,/30-SECOND PLAN/);
 assert.match(html,/>DO</);
 assert.match(html,/>BRING</);
 assert.match(html,/>AVOID</);
 assert.match(html,/Build resource/);
 assert.match(html,/Power Gain/);
});

test('guide hub exposes the major preparation paths',()=>{
 const html=guideHub();
 for(const path of ['/quests','/challenges/carina-volume-4','/masteries','/roster','/events','/counters'])assert(html.includes(`href="${path}"`),path);
});

test('challenge glance prioritizes quest, restriction, team and risks',()=>{
 const html=challengeAtAGlance({quest:'The Ordeal',rarity:7,tag:'Hero',team:['a','b'],checks:[['Terrax','x'],['Korg','y']]},id=>id.toUpperCase());
 assert.match(html,/RUN AT A GLANCE/);
 assert.match(html,/7★ · #Hero/);
 assert.match(html,/A · B/);
 assert.match(html,/Terrax · Korg/);
});

test('mobile challenge cards preserve the fight table content',()=>{
 const input='<div class="table-scroll" tabindex="0"><table class="challenge-plan-table"><caption>x</caption><thead><tr><th>#</th><th>Fight</th><th>Primary</th><th>Backup</th><th>Plan</th><th>Watch</th></tr></thead><tbody><tr><td>1</td><th>Thing</th><td><a>A</a></td><td>B</td><td>Do this</td><td>Watch that</td></tr></tbody></table></div>';
 const html=addMobileFightCards(input);
 assert.match(html,/challenge-plan-desktop/);
 assert.match(html,/challenge-plan-cards/);
 assert.match(html,/Fight 1/);
 assert.match(html,/Thing/);
 assert.match(html,/Do this/);
});
