import {escapeHtml as e,names} from './domain.mjs';
import {avatar,badge,chips,sources,sevenStarLabel} from './components.mjs';
import {protectionRecords} from './protections.mjs';
import {rotationPanel,synergyPanel} from './guidance.mjs';
import {referencePanel} from './reference.mjs';
import {loadoutPanel} from './loadouts.mjs';
import {researchPanel} from './research.mjs';

const statusOrder=['always','conditional','synergy','unknown'];
const statusMeta={
 always:{label:'Always active',hint:'Active without an additional fight condition.'},
 conditional:{label:'Conditional',hint:'Applies only when the listed condition is met.'},
 synergy:{label:'Synergy / pre-fight',hint:'Depends on a synergy, pre-fight choice or similar setup.'},
 unknown:{label:'Needs review',hint:'Source-listed protection whose activation still needs review.'}
};

function effectName(db,id){return names(db,'immunities',[id])[0]||id;}
function scopeLabel(record){
 if(record.forms?.length===2)return 'Debuffs + passives';
 if(record.forms?.[0]==='debuff')return 'Debuffs';
 if(record.forms?.[0]==='passive')return 'Passives';
 return 'Scope not reviewed';
}

export function protectionStatus(record){
 if(record.availability==='always')return 'always';
 if(record.availability!=='conditional')return 'unknown';
 return /\b(?:synerg(?:y|ies)|pre[- ]?fight|prefight)\b/i.test(record.condition||'')?'synergy':'conditional';
}

export function championProtectionGroups(c){
 const groups={always:[],conditional:[],synergy:[],unknown:[]};
 for(const record of protectionRecords(c))groups[protectionStatus(record)].push(record);
 return groups;
}

function protectionCard(db,record,status){
 return `<article class="protection-card protection-${status}"><div class="protection-card-head"><strong>${e(effectName(db,record.effectId))}</strong><span class="protection-state">${e(statusMeta[status].label)}</span></div><span class="protection-scope">${e(scopeLabel(record))}</span><p>${e(record.condition||statusMeta[status].hint)}</p></article>`;
}

export function championProtectionPanel(db,c){
 const groups=championProtectionGroups(c);
 const total=statusOrder.reduce((sum,key)=>sum+groups[key].length,0);
 const body=total?statusOrder.filter(key=>groups[key].length).map(key=>`<section class="protection-group"><div class="protection-group-title"><h3>${e(statusMeta[key].label)}</h3><small>${groups[key].length} ${groups[key].length===1?'effect':'effects'}</small></div><div class="protection-grid">${groups[key].map(record=>protectionCard(db,record,key)).join('')}</div></section>`).join(''):'<div class="empty protection-empty"><h3>No structured immunity record yet</h3><p>Open the full kit reference below for source-listed information.</p></div>';
 return `<section class="panel immunity-hub" id="immunities"><div class="section-head"><div><span class="eyebrow">IMMUNITIES & PROTECTIONS</span><h2>What the kit is protected from</h2></div><a class="text-link" href="/champions?immunity=&activation=all">Browse immunity finder →</a></div><div class="protection-legend" aria-label="Immunity status legend"><span class="legend-always">Always</span><span class="legend-conditional">Conditional</span><span class="legend-synergy">Synergy / pre-fight</span><span class="legend-unknown">Needs review</span></div>${body}${c.resistanceNote?`<p class="notice"><strong>Resistance / scope note:</strong> ${e(c.resistanceNote)}</p>`:''}</section>`;
}

function coverageLabel(c){return c.coverage==='roster'?'Source catalogue · guide pending':'Detailed guide';}
function matchupLinks(outgoing,opponents){
 if(!outgoing.length)return '<p class="muted">No reviewed attacker matchups attached yet.</p>';
 return `<div class="matchup-links">${outgoing.map(row=>{const target=opponents.find(item=>item.id===row.defenderId);return target?`<a href="/counters/${e(row.defenderId)}">Against ${e(target.name)} <span>→</span></a>`:'';}).join('')}</div>`;
}

export function championProfilePage(db,c,{incoming=[],outgoing=[],opponents=[],videosHtml='',noticeHtml='' }={}){
 const utility=names(db,'abilities',c.abilityIds||[]);
 const tags=names(db,'tags',c.tagIds||[]);
 const protectionSourceIds=(c.protections||[]).flatMap(record=>record.sourceIds||[]);
 const allSourceIds=[...new Set([...(c.sourceIds||[]),...protectionSourceIds,...(c.id==='kushala'?['serpent-counter']:[])])];
 const hasRotation=Boolean(c.rotation?.length);
 const sourceCatalogue=referencePanel(c);
 const guidePending=c.coverage==='roster';
 const signature=c.signatureTarget??null;
 const attackFocus=c.loadout?.attackFocus||c.focusTrial?.attackFocus||null;
 const quickUtility=utility.slice(0,6);
 const statusLine=`${coverageLabel(c)} · ${sevenStarLabel(c)}`;
 const playSection=hasRotation?rotationPanel(c):`<section class="panel" id="play-plan"><span class="eyebrow">HOW TO PLAY</span><h2>Fight plan pending</h2><p>This profile does not yet publish a champion-specific rotation. Use the kit reference below rather than treating this page as a verified sequence.</p></section>`;
 const sourceDetails=sourceCatalogue?`<details class="kit-disclosure" id="full-kit"${guidePending?' open':''}><summary><span><strong>Full source-listed kit & review notes</strong><small>${guidePending?'Primary reference for this profile':'Open underlying source catalogue'}</small></span><span aria-hidden="true">＋</span></summary>${sourceCatalogue}</details>`:'';
 const investmentBits=[c.awakening?`<dt>Awakening</dt><dd>${e(c.awakening)}</dd>`:'',signature!=null?`<dt>Signature</dt><dd>${e(signature)}</dd>`:'',attackFocus?`<dt>Attack focus</dt><dd>${e(attackFocus)}</dd>`:''].join('');
 return `<div class="crumbs"><a href="/champions">Champions</a> / ${e(c.name)}</div>${guidePending?'<div class="notice"><strong>Guide pending.</strong> Source-listed kit facts and structured immunities are available; rotation and matchup guidance are still being expanded.</div>':''}<header class="profile-head profile-head-upgraded">${avatar(c,true)}<div class="profile-title">${badge(c.class)}<h1>${e(c.name)}</h1><p>${e(c.summary)}</p><small>${e(statusLine)}</small></div><button class="save" data-save="${c.id}" aria-label="Save ${e(c.name)}" aria-pressed="false">☆</button></header><div class="actions profile-actions"><a class="primary" href="/counters/${c.id}">Find counters →</a><a class="secondary" href="/compare?ids=${c.id},${c.id==='doctor-doom'?'kushala':'doctor-doom'}">Compare champion ⇄</a></div><nav class="profile-jump" aria-label="Champion page sections"><a href="#overview">Overview</a><a href="#immunities">Immunities</a><a href="#play-plan">How to play</a><a href="#matchups">Matchups</a><a href="#loadout">Relics & focus</a>${sourceCatalogue?'<a href="#full-kit">Full kit</a>':''}</nav><section class="profile-overview" id="overview"><article class="overview-card"><span class="eyebrow">KEY UTILITY</span><h2>What stands out</h2><div class="chips">${quickUtility.length?chips(quickUtility):'<span class="muted">Utility review pending</span>'}</div>${utility.length>quickUtility.length?`<a class="text-link" href="#mechanics">See all ${utility.length} listed tools →</a>`:''}</article><article class="overview-card"><span class="eyebrow">BEST USE</span><h2>Where the kit helps</h2><p>${e(c.strengths||c.summary||'Detailed strengths review pending.')}</p></article><article class="overview-card"><span class="eyebrow">WATCH OUT</span><h2>Limits & caveats</h2><p>${e(c.risks||'Champion-specific limitations are not yet reviewed.')}</p></article>${investmentBits?`<article class="overview-card"><span class="eyebrow">INVESTMENT</span><h2>Before ranking up</h2><dl>${investmentBits}</dl></article>`:''}</section>${championProtectionPanel(db,c)}${playSection}<div class="profile-grid upgraded-profile-grid"><section class="panel" id="mechanics"><span class="eyebrow">KEY MECHANICS</span><h2>Tools in the kit</h2><div class="chips">${utility.length?chips(utility):'<span class="muted">No structured ability labels yet.</span>'}</div>${tags.length?`<h3>Tags</h3><div class="chips">${chips(tags)}</div>`:''}<h3>Playstyle</h3><p>${e(c.playstyle||'Detailed playstyle review pending.')}</p></section><section class="panel" id="matchups"><span class="eyebrow">MATCHUP CONNECTIONS</span><h2>Use or face this champion</h2><div class="matchup-stat"><strong>${incoming.length}</strong><span>reviewed counter ${incoming.length===1?'option':'options'} when facing ${e(c.name)}</span></div><a class="primary compact-primary" href="/counters/${c.id}">Open counter finder →</a><h3>Reviewed attacker matchups</h3>${matchupLinks(outgoing,opponents)}</section><section class="panel"><span class="eyebrow">SYNERGIES</span><h2>Build considerations</h2>${synergyPanel(db,c)}</section><section class="panel"><span class="eyebrow">EDITORIAL NOTES</span><h2>What to keep in mind</h2><p>${e(c.risks||'Detailed limitation review pending.')}</p></section></div><section class="panel" id="loadout"><div class="section-head"><div><span class="eyebrow">RELICS & STAT FOCUS</span><h2>Loadout starting point</h2></div><a href="/loadouts">Full selection guide →</a></div>${loadoutPanel(db,c)}</section>${sourceDetails}${videosHtml}${researchPanel(db,c)}${allSourceIds.length?sources(db,allSourceIds):''}${noticeHtml}`;
}
