import {escapeHtml as e} from './domain.e77b7145e9e3b6fd.mjs';
export function rotationPanel(c){
 if(!c.rotation?.length)return '';
 const checked=c.kitReview?.checkedAt?` · source checked ${e(c.kitReview.checkedAt)}`:'';
 const quick=c.rotation.slice(0,3).map(step=>e(step)).join(' → ');
 return `<section class="panel play-plan" id="play-plan"><span class="eyebrow">HOW TO PLAY</span><h2>Fight sequence</h2><div class="basic-loop"><span>Quick loop</span><strong>${quick}</strong></div><ol class="steps">${c.rotation.map(step=>`<li><p>${e(step)}</p></li>`).join('')}</ol><p class="muted rotation-source">Community-sourced${checked}. No current-build combat test is recorded. Adjust for nodes, opponent mechanics and your execution.</p></section>`;
}
export function synergyPanel(db,c){
 const rows=db.synergies.filter(s=>s.championId===c.id);
 if(!rows.length)return '<p>No reviewed recommendations yet.</p>';
 return rows.map(s=>`<div><strong>${s.partnerIds.map(id=>{const p=db.champions.find(p=>p.id===id);return `<a href="/champions/${e(id)}">${e(p?.name||id)}</a>`;}).join(' + ')}</strong><p>${e(s.summary)}</p><small>${e(s.conditions)}</small></div>`).join('');
}
