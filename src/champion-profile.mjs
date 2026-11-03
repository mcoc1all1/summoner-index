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
 return `<article class="protection-card protection-${status}"><div class="protection-card-head"><strong>${e(effectName(db,record.effectId))}</strong></div><span class="protection-scope">${e(scopeLabel(record))}</span><p>${e(record.condition||statusMeta[status].hint)}</p></article>`;
}
function protectionGroup(db,groups,key){
 return `<section class="protection-group"><div class="protection-group-title"><h3>${e(statusMeta[key].label)}</h3><small>${groups[key].length} ${groups[key].length===1?'effect':'effects'}</small></div><div class="protection-grid">${groups[key].map(record=>protectionCard(db,record,key)).join('')}</div></section>`;
}

export function championProtectionPanel(db,c){
 const groups=championProtectionGroups(c);
 const total=statusOrder.reduce((sum,key)=>sum+groups[key].length,0);
 const reviewed=['always','conditional','synergy'].filter(key=>groups[key].length).map(key=>protectionGroup(db,groups,key)).join('');
 const unverified=groups.unknown.length?`<details class="unverified-protections"><summary>Unverified protections · ${groups.unknown.length}</summary><p class="muted">These source-listed protections still need activation or scope review.</p><div class="protection-grid">${groups.unknown.map(record=>protectionCard(db,record,'unknown')).join('')}</div></details>`:'';
 const body=total?reviewed+unverified:'<div class="empty protection-empty"><h3>No structured immunity record yet</h3><p>Open the source catalogue below for the information currently available.</p></div>';
 return `<section class="panel immunity-hub" id="immunities"><div class="section-head"><div><span class="eyebrow">IMMUNITIES & PROTECTIONS</span><h2>What the kit is protected from</h2></div><a class="text-link" href="/champions?immunity=&activation=all">Browse immunity finder →</a></div><div class="protection-legend" aria-label="Immunity status legend"><span class="legend-always">Always</span><span class="legend-conditional">Conditional</span><span class="legend-synergy">Synergy / pre-fight</span></div>${body}${c.resistanceNote?`<p class="notice"><strong>Resistance / scope note:</strong> ${e(c.resistanceNote)}</p>`:''}</section>`;
}

function coverageLabel(c){return c.coverage==='roster'?'Reference profile · guide pending':'Detailed guide';}
function matchupLinks(outgoing,opponents){
 if(!outgoing.length)return '<p class="muted">No reviewed attacker matchups attached yet.</p>';
 return `<div class="matchup-links">${outgoing.map(row=>{const target=opponents.find(item=>item.id===row.defenderId);return target?`<a href="/counters/${e(row.defenderId)}">Against ${e(target.name)} <span>→</span></a>`:'';}).join('')}</div>`;
}
function relicName(db,id){return db.relics?.find(item=>item.id===id)?.name||null;}
function championLoadoutSummary(db,c){
 const verifiedFocus=c.statFocusEligibility?.status==='confirmed';
 const rows=[];
 const battle=c.loadout?.battlecastId?relicName(db,c.loadout.battlecastId):c.referenceFacts?.battlecast;
 const statcast=c.loadout?.statcastId?relicName(db,c.loadout.statcastId):c.referenceFacts?.statcast;
 const attack=verifiedFocus?(c.loadout?.attackFocus||c.focusTrial?.attackFocus):null;
 const defense=verifiedFocus?c.loadout?.defenseFocus:null;
 if(battle)rows.push(['Battlecast',battle]);
 if(statcast)rows.push(['Statcast',statcast]);
 if(attack)rows.push(['Attacker focus',attack]);
 if(defense)rows.push(['Defender focus',defense]);
 const status=c.loadoutException?'Eligibility review required':verifiedFocus?'7★ Stat Focus eligibility verified':'Stat Focus recommendation not published yet';
 const summary=rows.length?`<div class="loadout-summary-grid">${rows.map(([label,value])=>`<div><span>${e(label)}</span><strong>${e(value)}</strong></div>`).join('')}</div>`:'<p class="muted">No champion-specific relic or Stat Focus recommendation is published yet.</p>';
 return `${summary}<p class="loadout-status">${e(status)}</p><details class="loadout-evidence"><summary>Why these choices, alternatives & evidence</summary>${loadoutPanel(db,c)}</details>`;
}
function researchCenter(db,c,sourceCatalogue,allSourceIds,{includeCatalogue=true}={}){
 const catalogue=includeCatalogue&&sourceCatalogue?sourceCatalogue:'';
 const refs=allSourceIds.length?sources(db,allSourceIds):'';
 return `<details class="panel research-center" id="research-center"><summary>Sources & research status</summary><div class="research-center-body">${catalogue}${researchPanel(db,c)}${refs}</div></details>`;
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
 const focusVerified=c.statFocusEligibility?.status==='confirmed';
 const attackFocus=focusVerified?(c.loadout?.attackFocus||c.focusTrial?.attackFocus||null):null;
 const quickUtility=utility.slice(0,6);
 const remainingUtility=utility.slice(6);
 const statusLine=`${coverageLabel(c)} · ${sevenStarLabel(c)}`;
 const playSection=hasRotation?rotationPanel(c):'';
 const investmentBits=[c.awakening?`<dt>Awakening</dt><dd>${e(c.awakening)}</dd>`:'',signature!=null?`<dt>Signature</dt><dd>${e(signature)}</dd>`:'',attackFocus?`<dt>Attacker focus</dt><dd>${e(attackFocus)}</dd>`:''].join('');
 const header=`<div class="crumbs"><a href="/champions">Champions</a> / ${e(c.name)}</div>${guidePending?'<div class="notice"><strong>Reference profile.</strong> Kit facts and structured protections are available; detailed rotation and matchup guidance are still being built.</div>':''}<header class="profile-head profile-head-upgraded">${avatar(c,true)}<div class="profile-title">${badge(c.class)}<h1>${e(c.name)}</h1><p>${e(c.summary)}</p><small>${e(statusLine)}</small></div><button class="save" data-save="${c.id}" aria-label="Save ${e(c.name)}" aria-pressed="false">☆</button></header><div class="profile-decision-strip" aria-label="Champion quick facts"><div><span>Class</span><strong>${e(c.class)}</strong></div><div><span>Recorded utility</span><strong>${quickUtility.length} listed ${quickUtility.length===1?'tool':'tools'}</strong></div><div><span>Matchup options</span><strong>${incoming.length} counters · ${outgoing.length} attacker matches</strong></div><div><span>Guide status</span><strong>${e(coverageLabel(c))}</strong></div></div><div class="actions profile-actions"><a class="primary" href="/counters/${c.id}">Counters to ${e(c.name)} →</a><a class="secondary" href="/compare?ids=${c.id}">Compare ${e(c.name)} ⇄</a></div>`;
 const overview=`<section class="profile-overview" id="overview"><article class="overview-card profile-overview-primary"><span class="eyebrow">KEY UTILITY</span><h2>What stands out</h2><div class="chips">${quickUtility.length?chips(quickUtility):'<span class="muted">Utility review pending</span>'}</div>${remainingUtility.length?`<a class="text-link" href="#mechanics">${remainingUtility.length} more listed ${remainingUtility.length===1?'tool':'tools'} →</a>`:''}</article><article class="overview-card profile-overview-strengths"><span class="eyebrow">BEST USE</span><h2>Where the kit helps</h2><p>${e(c.strengths||c.summary||'Detailed strengths review pending.')}</p></article><article class="overview-card profile-overview-risk"><span class="eyebrow">WATCH OUT</span><h2>Limits & caveats</h2><p>${e(c.risks||'Champion-specific limitations are not yet reviewed.')}</p></article>${investmentBits?`<article class="overview-card"><span class="eyebrow">INVESTMENT</span><h2>Before ranking up</h2><dl>${investmentBits}</dl></article>`:''}</section>`;
 const loadout=`<section class="panel" id="loadout"><div class="section-head"><div><span class="eyebrow">RELICS & STAT FOCUS</span><h2>Loadout starting point</h2></div><a href="/loadouts">Full selection guide →</a></div>${championLoadoutSummary(db,c)}</section>`;
 if(guidePending){
  const jump=`<nav class="profile-jump" aria-label="Jump to champion page sections"><a href="#overview">Overview</a><a href="#immunities">Immunities</a>${sourceCatalogue?'<a href="#source-catalogue">Kit reference</a>':''}<a href="#loadout">Relics & focus</a><a href="#research-center">Sources</a></nav>`;
  return `${header}${jump}${overview}${championProtectionPanel(db,c)}${sourceCatalogue||''}${loadout}${videosHtml}${researchCenter(db,c,'',allSourceIds,{includeCatalogue:false})}${noticeHtml}`;
 }
 const jump=`<nav class="profile-jump" aria-label="Jump to champion page sections"><a href="#overview">Overview</a>${hasRotation?'<a href="#play-plan">How to play</a>':''}<a href="#immunities">Immunities</a><a href="#matchups">Matchups</a><a href="#loadout">Relics & focus</a><a href="#research-center">Sources</a></nav>`;
 const mechanics=`<section class="panel" id="mechanics"><span class="eyebrow">KIT SNAPSHOT</span><h2>How the kit is built</h2>${remainingUtility.length?`<h3>More listed tools</h3><div class="chips">${chips(remainingUtility)}</div>`:''}${tags.length?`<h3>Tags</h3><div class="chips">${chips(tags)}</div>`:''}<h3>Playstyle</h3><p>${e(c.playstyle||'Detailed playstyle review pending.')}</p></section>`;
 const matchups=`<section class="panel matchup-panel" id="matchups"><span class="eyebrow">MATCHUPS</span><h2>Using or facing ${e(c.name)}</h2><div class="matchup-directions"><div><h3>Using ${e(c.name)}</h3><p class="muted">Reviewed fights where this champion is an attacker.</p>${matchupLinks(outgoing,opponents)}</div><div><h3>Facing ${e(c.name)}</h3><div class="matchup-stat"><strong>${incoming.length}</strong><span>reviewed counter ${incoming.length===1?'option':'options'}</span></div><a class="primary compact-primary" href="/counters/${c.id}">View counters to ${e(c.name)} →</a></div></div></section>`;
 const synergies=`<section class="panel"><span class="eyebrow">SYNERGIES</span><h2>Build considerations</h2>${synergyPanel(db,c)}</section>`;
 return `${header}${jump}${overview}${playSection}${championProtectionPanel(db,c)}<div class="profile-grid upgraded-profile-grid">${mechanics}${matchups}${synergies}</div>${loadout}${videosHtml}${researchCenter(db,c,sourceCatalogue,allSourceIds)}${noticeHtml}`;
}
