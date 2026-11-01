import {escapeHtml as e} from './domain.mjs';

export function bossVerification(boss){
 const v=boss.verification;
 if(!v)return '<div class="notice"><strong>Verification status: source-reviewed.</strong> No current-client gameplay test is recorded for this guide. Check linked nodes and the current in-game ability text before entry.</div>';
 return `<div class="notice"><strong>Verification status: ${e(v.label||v.status)}.</strong> Source check: ${e(v.checkedAt||'not recorded')} · Gameplay tested: ${v.gameplayTested?'yes':'no'}. ${e(v.note||'')}</div>`;
}

export function bossGuidance(boss){
 const d=boss.guideDetails;
 const verification=bossVerification(boss);
 if(!d)return verification;
 return `${verification}<section class="panel"><h2>Before entering</h2><ul>${d.preparation.map(t=>`<li><p>${e(t)}</p></li>`).join('')}</ul><h2>When the fight goes wrong</h2>${d.troubleshooting.map(t=>`<h3>${e(t.problem)}</h3><p>${e(t.response)}</p>`).join('')}<h2>What this guide covers</h2><p>${e(d.scope)}</p></section>`;
}
