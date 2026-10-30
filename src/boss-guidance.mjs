import {escapeHtml as e} from './domain.mjs';

export function bossGuidance(boss){
 const d=boss.guideDetails;
 if(!d)return '';
 return `<section class="panel"><h2>Before entering</h2><ul>${d.preparation.map(t=>`<li><p>${e(t)}</p></li>`).join('')}</ul><h2>When the fight goes wrong</h2>${d.troubleshooting.map(t=>`<h3>${e(t.problem)}</h3><p>${e(t.response)}</p>`).join('')}<h2>What this guide covers</h2><p>${e(d.scope)}</p></section>`;
}
