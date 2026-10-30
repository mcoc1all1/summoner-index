import {escapeHtml as e} from './domain.mjs';
export function rotationPanel(c){
 if(!c.rotation?.length)return '';
 return `<section class="panel" style="margin-bottom:24px"><span class="eyebrow">COMMUNITY-SOURCED PLAN · PRACTICE REQUIRED</span><h2>Fight sequence</h2><ol class="steps">${c.rotation.map(step=>`<li><p>${e(step)}</p></li>`).join('')}</ol><p class="muted">Source checked ${e(c.kitReview?.checkedAt)}. No current-build combat test is recorded. Adjust for nodes, opponent mechanics and your execution.</p></section>`;
}
export function synergyPanel(db,c){
 const rows=db.synergies.filter(s=>s.championId===c.id);
 if(!rows.length)return '<p>No reviewed recommendations yet.</p>';
 return rows.map(s=>`<div><strong>${s.partnerIds.map(id=>{const p=db.champions.find(p=>p.id===id);return `<a href="/champions/${e(id)}">${e(p?.name||id)}</a>`;}).join(' + ')}</strong><p>${e(s.summary)}</p><small>${e(s.conditions)}</small></div>`).join('');
}
