import {matchingProtections,protectionFilterActive,protectionLabel,protectionRecords} from './protections.32aa2738f008e39d.mjs';
import {relicName,focusPublicValue,focusEligibilityState} from './loadouts.32aa2738f008e39d.mjs';
import {requirementCheck} from './roster.32aa2738f008e39d.mjs';
import {escapeHtml as e,names,getCounters} from './domain.32aa2738f008e39d.mjs';
import {counterMechanicSummary} from './counter-mechanics-ui.32aa2738f008e39d.mjs';
import {counterEvidenceLabel} from './counter-provenance.32aa2738f008e39d.mjs';

export const badge=c=>`<span class="badge ${c.toLowerCase()}">${e(c)}</span>`;
export const avatar=(c,large=false)=>`<span aria-hidden="true" class="avatar ${c.class?.toLowerCase()||'boss'} ${large?'large':''}">${e(c.initials||c.name.slice(0,2).toUpperCase())}</span>`;
export const chips=(items)=>items.map(x=>`<span class="chip">${e(x)}</span>`).join('');
export const sevenStarLabel=c=>c.rarityAvailability?.status==='verified'?(c.rarityAvailability.sevenStarAvailable?'7★ available':'Not listed as 7★'):'7★ availability unreviewed';

export function protectionSummary(db,records){return records.map(p=>`<li><strong>${e(names(db,'immunities',[p.effectId])[0])}</strong> — ${e(protectionLabel(p))}<br>${e(p.condition)}</li>`).join('');}

export function protectionPanel(db,c){
 return c.protections?.length?`<section class="panel" id="immunity-details"><h2>Reviewed immunity conditions</h2><p class="muted">Structured conditions for the effects reviewed so far.</p><ul>${protectionSummary(db,c.protections)}</ul>${sources(db,[...new Set(c.protections.flatMap(p=>p.sourceIds))])}</section>`:'';
}

export function championCard(db,c,filters={}){
 const coverage=c.coverage==='roster'?(c.referenceFacts?.status==='source-link-only'?'Kit guide pending':c.referenceFacts?'Source catalogue':'Guide pending'):'Detailed guide';
 return `<article class="champion-card champion-card--${e(c.class?.toLowerCase()||'universal')}">
  <div class="champion-card-identity"><div class="card-top">${avatar(c)}<button class="save" data-save="${c.id}" aria-label="Save ${e(c.name)}" aria-pressed="false">☆</button></div>
  <div class="champion-card-title">${badge(c.class)}<h3><a href="/summoner-index/champions/${c.id}">${e(c.name)}</a></h3></div></div>
  <small class="coverage-label">${e(sevenStarLabel(c))} · ${coverage}</small>
  <p class="champion-card-summary">${e(c.summary)}</p>
  <div class="chips">${chips(names(db,'abilities',c.abilityIds).slice(0,2))}</div>
  ${protectionFilterActive(filters)?`<ul class="protection-matches">${protectionSummary(db,matchingProtections(c,{activation:'always',...filters}))}</ul>`:''}
  <a class="card-link" href="/summoner-index/champions/${c.id}">View champion <span aria-hidden="true">↗</span></a></article>`;
}

function sourceList(db,ids){
 return `<ul>${ids.map(id=>{const s=db.sources.find(s=>s.id===id);return s?`<li><a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.title)} ↗</a><small>${e(s.kind)} · checked ${e(s.checkedAt||db.reviewedAt)}</small></li>`:'';}).join('')}</ul>`;
}

export function sources(db,ids){
 const unique=[...new Set(ids)].filter(Boolean);
 if(!unique.length)return '';
 return `<details class="sources"><summary>Evidence & sources <span>${unique.length} ${unique.length===1?'reference':'references'}</span></summary>${sourceList(db,unique)}</details>`;
}

export function counterConfidence(c,db){
 return counterEvidenceLabel(c,db||{sources:[]});
}

function buildRows(db,c){
 const rows=[];
 if(c.awakening)rows.push(['Awakening / signature',c.awakening]);
 if(c.requirements?.minSignature!=null)rows.push(['Minimum signature',String(c.requirements.minSignature)]);
 if(c.relicId)rows.push(['Relic',relicName(db,c.relicId)]);
 return rows;
}

export function counterCard(db,c,owned){
 const a=db.champions.find(a=>a.id===c.attackerId);
 const confidence=counterConfidence(c,db);
 const rows=buildRows(db,c);
 const ownership=owned?`<p class="ownership owned">Owned · ${e(requirementCheck(c,owned).message)}</p>`:owned===null?'<p class="ownership not-owned">Not in your roster</p>':'<p class="ownership"><a href="/summoner-index/roster">Add to My Roster to check requirements →</a></p>';
 return `<article class="counter-card"><div class="counter-head">${avatar(a)}<div><a href="/summoner-index/champions/${a.id}"><h3>${e(a.name)}</h3></a>${badge(a.class)}</div><span class="confidence-badge ${confidence.className}">${e(confidence.label)}</span></div>
 ${ownership}<section class="counter-glance" aria-label="Counter at a glance"><h4>At a glance</h4><div class="counter-glance-grid"><div><strong>Relevant utility</strong><div class="chips">${chips(names(db,'abilities',c.abilityIds).slice(0,4))||'<span class="muted">See detailed evidence</span>'}</div></div><div><strong>Game modes</strong><p>${e(names(db,'gameModes',c.modeIds).join(', ')||'Check matchup context')}</p></div><div><strong>Awakening</strong><p>${c.requirements?.awakened===true?'Required':c.requirements?.awakened===false?'Not required for recorded plan':'Not established'}</p></div><div><strong>Known signature minimum</strong><p>${Number.isInteger(c.requirements?.minSignature)?e(String(c.requirements.minSignature)):'Not established'}</p></div></div><p class="counter-glance-plan"><strong>Fight plan:</strong> ${e(c.strategy)}</p><p class="counter-glance-risk"><strong>Watch out:</strong> ${e(c.risks)}</p></section><details class="counter-context"><summary>Matchup rationale and conditions</summary><div class="chips">${chips(names(db,'gameModes',c.modeIds))}</div><p><strong>Proposed interaction:</strong> ${e(c.why)}</p>${counterMechanicSummary(db,c)}<div class="chips">${chips(names(db,'abilities',c.abilityIds))}</div>
 <section class="counter-plan"><h4>Fight plan</h4><p>${e(c.strategy)}</p>${c.conditions?.length?`<h4>Check before choosing</h4><ul>${c.conditions.map(condition=>`<li>${e(condition)}</li>`).join('')}</ul>`:''}${rows.length?`<dl class="counter-build">${rows.map(([label,value])=>`<dt>${e(label)}</dt><dd>${e(value)}</dd>`).join('')}</dl>`:''}<p class="risk"><strong>Watch out</strong> ${e(c.risks)}</p></section></details><details class="confidence-details"><summary>Why this confidence?</summary><p>${e(c.scoreReason)}</p><p class="muted">${e(c.review?.status||'community-sourced')}${c.review?.reviewedAt?' · sources reviewed '+e(c.review.reviewedAt):''}${c.review?.gameVersion?' · claimed game version '+e(c.review.gameVersion):''}</p><p class="muted counter-rights-pending">Source-linked editorial selection; current-client testing and independent expression/compilation review are not documented. A reference link is not a reuse license.</p></details>${sources(db,c.sourceIds)}</article>`;
}

export function bossCard(b){return `<a class="boss-card" href="/summoner-index/bosses/${b.id}"><div class="boss-art ${b.id}" aria-hidden="true"><span>${b.id==='bahamet'?'◈':'⌖'}</span><small>${/^\d/.test(b.chapter)?'ACT ':''}${e(b.chapter)}</small></div><div><span class="eyebrow">${/^\d/.test(b.chapter)?'STORY QUEST':'SPECIAL QUEST'} · ${e(b.chapter)}</span><h3>${e(b.name)} <span>↗</span></h3><p>${e(b.summary)}</p><span class="text-link">Open fight guide →</span></div></a>`;}

export function compareTable(db,ids){
 const cs=ids.map(id=>db.champions.find(c=>c.id===id)).filter(Boolean);
 const rows=[['Class',c=>c.class],['7★ availability',c=>sevenStarLabel(c)],['Reviewed always-active protections',c=>names(db,'immunities',protectionRecords(c).filter(p=>p.availability==='always').map(p=>p.effectId)).join(', ')||'None reviewed'],['Reviewed conditional protections',c=>names(db,'immunities',protectionRecords(c).filter(p=>p.availability==='conditional').map(p=>p.effectId)).join(', ')||'None reviewed'],['Source-listed effects · activation unreviewed',c=>names(db,'immunities',protectionRecords(c).filter(p=>p.availability==='unknown').map(p=>p.effectId)).join(', ')||'None listed'],['Additional conditions / resistance',c=>c.resistanceNote||'See champion protection details'],['Utility',c=>names(db,'abilities',c.abilityIds).join(', ')],['Strengths',c=>c.strengths],['Watch out',c=>c.risks],['Awakening',c=>c.awakening||'Not reviewed'],['Recommended signature',c=>c.signatureTarget??'Not reviewed'],['Battlecast · community option',c=>relicName(db,c.loadout?.battlecastId)],['Statcast · community option',c=>relicName(db,c.loadout?.statcastId)],['7★ attacker focus',c=>focusPublicValue(c,'attack')],['7★ defender focus',c=>focusPublicValue(c,'defense')],['Stat Focus eligibility',c=>focusEligibilityState(c).label],['Source-linked matchup leads',c=>db.counters.filter(x=>x.attackerId===c.id).map(x=>[...db.champions,...db.bosses].find(t=>t.id===x.defenderId)?.name).join(', ')||'No source-linked matchups']];
 const evaluated=rows.map(([label,fn])=>({label,values:cs.map(c=>String(fn(c)??''))})).map(row=>({...row,different:cs.length>1&&new Set(row.values).size>1}));
 const different=evaluated.filter(r=>r.different).length;
 const heads=cs.map(c=>`<th scope="col">${avatar(c)}<a href="/summoner-index/champions/${c.id}">${e(c.name)}</a></th>`).join('');
 const mobile=cs.map(c=>`<a class="compare-mini-card" href="/summoner-index/champions/${c.id}"><span class="compare-mini-icon">${avatar(c)}</span><span><strong>${e(c.name)}</strong><small>${e(c.class)} · ${e(sevenStarLabel(c))}</small></span><span aria-hidden="true">↗</span></a>`).join('');
 return `<section class="compare-insights" aria-label="Comparison overview"><div><span class="eyebrow">AT A GLANCE</span><strong>${different} of ${evaluated.length} attributes differ</strong><p>Different values reflect recorded review status, not a strength ranking. Always-active, conditional and unreviewed protection lists are separate; open a champion page for activation details. An empty field does not mean a weak champion.</p></div><button class="secondary compare-toggle" type="button" aria-pressed="false" data-compare-toggle>Show differences only</button></section><div class="compare-mini-grid">${mobile}</div><div class="table-scroll compare-table-scroll" tabindex="0" aria-label="Champion comparison, scroll horizontally"><table><caption>Curated attributes · missing values mean not reviewed</caption><thead><tr><th scope="col">Compare attributes</th>${heads}</tr></thead><tbody>${evaluated.map(row=>`<tr class="${row.different?'compare-diff':'compare-same'}"><th scope="row">${e(row.label)}${row.different?'<span class="visually-hidden"> · different values</span>':''}</th>${row.values.map(value=>`<td>${e(value)||'<span class="compare-unreviewed">Not reviewed</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export const scoreNote=`<details class="score-note"><summary>How evidence labels work</summary><p>A <strong>single cited source</strong> is a research lead, not independent confirmation. Linked player reports, official pages and kit references describe the source types, not a win-rate ranking. Only a dated, documented in-game test may receive a tested label. A citation does not grant permission to reproduce third-party writing, data compilations or artwork. Counter selections and prose still require individual rights review before commercial use.</p></details>`;

export function counterResults(db,id,mode='',roster=null){
 const all=getCounters(db,id,mode);
 const owned=c=>roster?.find(r=>r.id===c.attackerId);
 const cs=roster===null?all:all.filter(c=>requirementCheck(c,owned(c)).eligible);
 const excluded=roster===null?[]:all.filter(c=>owned(c)&&!requirementCheck(c,owned(c)).eligible);
 const explanation=excluded.length?`<details class="notice"><summary>${excluded.length} owned option${excluded.length===1?'':'s'} excluded by recorded requirements</summary><ul>${excluded.map(c=>`<li>${e(db.champions.find(a=>a.id===c.attackerId).name)}: ${e(requirementCheck(c,owned(c)).message)}</li>`).join('')}</ul><a href="/summoner-index/roster">Review your roster →</a></details>`:'';
 return `<p class="result-count">${cs.length} source-linked ${cs.length===1?'matchup idea':'matchup ideas'}${mode?' for '+e(names(db,'gameModes',[mode])[0]):''}</p>${roster!==null?'<p class="muted">Showing alternatives from your saved roster and recorded requirements.</p>':''}${explanation}${cs.length?cs.map(c=>(roster===null?'':`<p class="notice roster-check">${e(requirementCheck(c,owned(c)).message)}</p>`)+counterCard(db,c,roster===null?undefined:owned(c))).join(''):'<div class="empty"><h3>No source-linked options in this context</h3><p>Try another mode or <a href="/summoner-index/roster">update your roster</a>. An empty result does not mean no counter exists.</p></div>'}`;
}

export function groupedCounterResults(db,id,mode='',roster=[]){
 if(!roster.length)return counterResults(db,id,mode);
 const all=getCounters(db,id,mode),owned=c=>roster.find(r=>r.id===c.attackerId);
 const groups=[['Source-linked options in my roster',all.filter(c=>owned(c)&&requirementCheck(c,owned(c)).eligible)],['Other source-linked options',all.filter(c=>!owned(c))],['Owned · requirements not met',all.filter(c=>owned(c)&&!requirementCheck(c,owned(c)).eligible)]];
 return '<p class="muted">Matched to your saved ownership and recorded awakening/signature requirements.</p>'+groups.filter(([,cs],index)=>index!==2||cs.length).map(([title,cs])=>'<section class="counter-group"><h2>'+title+' <small>('+cs.length+')</small></h2>'+(cs.length?cs.map(c=>counterCard(db,c,owned(c)||null)).join(''):'<p class="empty">No reviewed options in this group for the selected mode.</p>')+'</section>').join('');
}
