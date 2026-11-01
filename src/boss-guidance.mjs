import {escapeHtml as e} from './domain.mjs';

export function bossVerification(boss){
 const v=boss.verification;
 if(!v)return '<div class="notice"><strong>Verification status: source-reviewed.</strong> No current-client gameplay test is recorded for this guide. Check linked nodes and the current in-game ability text before entry.</div>';
 return `<div class="notice"><strong>Verification status: ${e(v.label||v.status)}.</strong> Source check: ${e(v.checkedAt||'not recorded')} · Gameplay tested: ${v.gameplayTested?'yes':'no'}. ${e(v.note||'')}</div>`;
}

function list(items=[]){return items.length?`<ul>${items.map(t=>`<li><p>${e(t)}</p></li>`).join('')}</ul>`:'';}
function cheatSheet(rows=[]){
 if(!rows.length)return '';
 return `<div class="boss-cheat-sheet" role="region" aria-label="Phase cheat sheet"><h2>Phase cheat sheet</h2><div class="table-wrap"><table><thead><tr><th>Stage</th><th>Your objective</th><th>Watch for</th></tr></thead><tbody>${rows.map(row=>`<tr><td><strong>${e(row.stage)}</strong></td><td>${e(row.objective)}</td><td>${e(row.watch||'—')}</td></tr>`).join('')}</tbody></table></div></div>`;
}
function mechanicTags(tags=[]){return tags.length?`<div class="quick-row boss-mechanics"><strong>Fight mechanics</strong>${tags.map(t=>`<span class="chip">${e(t)}</span>`).join('')}</div>`:'';}
function relatedGuides(items=[]){
 if(!items.length)return '';
 return `<section class="panel related-boss-guides"><span class="eyebrow">RELATED FIGHT GUIDES</span><h2>Choose the exact encounter</h2><p class="muted">Match the in-game Signature Ability and fight mechanic before using a variant guide.</p><div class="boss-grid">${items.map(item=>`<a class="panel" href="${e(item.href)}"><h3>${e(item.label)} →</h3>${item.note?`<p>${e(item.note)}</p>`:''}</a>`).join('')}</div></section>`;
}

export function bossGuidance(boss){
 const d=boss.guideDetails;
 const verification=bossVerification(boss);
 const tags=mechanicTags(boss.mechanicTags||[]);
 if(!d)return verification+tags;
 const status=d.statusNote?`<p class="notice"><strong>Guide scope:</strong> ${e(d.statusNote)}</p>`:'';
 const related=relatedGuides(d.relatedGuides);
 const attacker=d.attackerProfile?.length?`<section class="panel"><h2>Attacker profile</h2><p class="muted">These are useful traits, not a claim that one Champion is mandatory.</p>${list(d.attackerProfile)}</section>`:'';
 const recovery=d.troubleshooting?.length?`<h2>When the fight goes wrong</h2>${d.troubleshooting.map(t=>`<h3>${e(t.problem)}</h3><p>${e(t.response)}</p>`).join('')}`:'';
 return `${verification}${tags}${status}${related}${cheatSheet(d.cheatSheet)}${attacker}<section class="panel"><h2>Before entering</h2>${list(d.preparation)}${recovery}<h2>What this guide covers</h2><p>${e(d.scope)}</p></section>`;
}
