import {matchingProtections,protectionFilterActive,protectionLabel} from './protections.mjs';
import {relicName,focusPublicValue,focusEligibilityState} from './loadouts.mjs';
import {requirementCheck} from './roster.mjs';
import {escapeHtml as e,names,getCounters} from './domain.mjs';

export const badge=c=>`<span class="badge ${c.toLowerCase()}">${e(c)}</span>`;
export const avatar=(c,large=false)=>`<span aria-hidden="true" class="avatar ${c.class?.toLowerCase()||'boss'} ${large?'large':''}">${e(c.initials||c.name.slice(0,2).toUpperCase())}</span>`;
export const chips=(items)=>items.map(x=>`<span class="chip">${e(x)}</span>`).join('');
export const sevenStarLabel=c=>c.rarityAvailability?.status==='verified'?(c.rarityAvailability.sevenStarAvailable?'7★ available':'Not listed as 7★'):'7★ availability unreviewed';

export function protectionSummary(db,records){return records.map(p=>`<li><strong>${e(names(db,'immunities',[p.effectId])[0])}</strong> — ${e(protectionLabel(p))}<br>${e(p.condition)}</li>`).join('');}

export function protectionPanel(db,c){
 return c.protections?.length?`<section class="panel" id="immunity-details"><h2>Reviewed immunity conditions</h2><p class="muted">Structured conditions for the effects reviewed so far.</p><ul>${protectionSummary(db,c.protections)}</ul>${sources(db,[...new Set(c.protections.flatMap(p=>p.sourceIds))])}</section>`:'';
}

export function championCard(db,c,filters={}){
 const coverage=c.coverage==='roster'?(c.referenceFacts?'Source catalogue':'Guide pending'):'Detailed guide';
 return `<article class="champion-card">
  <div class="card-top">${avatar(c)}<button class="save" data-save="${c.id}" aria-label="Save ${e(c.name)}" aria-pressed="false">☆</button></div>
  ${badge(c.class)}<small class="coverage-label">${e(sevenStarLabel(c))} · ${coverage}</small><h3><a href="/champions/${c.id}">${e(c.name)}</a></h3><p>${e(c.summary)}</p>
  <div class="chips">${chips(names(db,'abilities',c.abilityIds).slice(0,2))}</div>
  ${protectionFilterActive(filters)?`<ul class="protection-matches">${protectionSummary(db,matchingProtections(c,{activation:'always',...filters}))}</ul>`:''}
  <a class="card-link" href="/champions/${c.id}">View champion <span>↗</span></a></article>`;
}

function sourceList(db,ids){
 return `<ul>${ids.map(id=>{const s=db.sources.find(s=>s.id===id);return s?`<li><a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.title)} ↗</a><small>${e(s.kind)} · checked ${e(s.checkedAt||db.reviewedAt)}</small></li>`:'';}).join('')}</ul>`;
}

export function sources(db,ids){
 const unique=[...new Set(ids)].filter(Boolean);
 if(!unique.length)return '';
 return `<details class="sources"><summary>Evidence & sources <span>${unique.length} ${unique.length===1?'reference':'references'}</span></summary>${sourceList(db,unique)}</details>`;
}

export function counterConfidence(c){
 if(c.score>=5)return {label:'Repeatedly tested',className:'confidence-tested'};
 if(c.score>=4)return {label:'Tested on documented nodes',className:'confidence-tested'};
 if(c.score>=3)return {label:'Community-backed · kit supported',className:'confidence-supported'};
 if(c.score>=2)return {label:'Community recommended',className:'confidence-community'};
 return {label:'Limited evidence',className:'confidence-limited'};
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
 const confidence=counterConfidence(c);
 const rows=buildRows(db,c);
 const ownership=owned?`<p class="ownership owned">Owned · ${e(requirementCheck(c,owned).message)}</p>`:owned===null?'<p class="ownership not-owned">Not in your roster</p>':'<p class="ownership"><a href="/roster">Add to My Roster to check requirements →</a></p>';
 return `<article class="counter-card"><div class="counter-head">${avatar(a)}<div><a href="/champions/${a.id}"><h3>${e(a.name)}</h3></a>${badge(a.class)}</div><span class="confidence-badge ${confidence.className}">${e(confidence.label)}</span></div>
 ${ownership}<div class="chips">${chips(names(db,'gameModes',c.modeIds))}</div><p><strong>Why it works:</strong> ${e(c.why)}</p><div class="chips">${chips(names(db,'abilities',c.abilityIds))}</div>
 <section class="counter-plan"><h4>Fight plan</h4><p>${e(c.strategy)}</p>${c.conditions?.length?`<h4>Check before choosing</h4><ul>${c.conditions.map(condition=>`<li>${e(condition)}</li>`).join('')}</ul>`:''}${rows.length?`<dl class="counter-build">${rows.map(([label,value])=>`<dt>${e(label)}</dt><dd>${e(value)}</dd>`).join('')}</dl>`:''}<p class="risk"><strong>Watch out</strong> ${e(c.risks)}</p></section><details class="confidence-details"><summary>Why this confidence?</summary><p>${e(c.scoreReason)}</p><p class="muted">${e(c.review?.status||'community-sourced')}${c.review?.reviewedAt?' · reviewed '+e(c.review.reviewedAt):''}${c.review?.gameVersion?' · '+e(c.review.gameVersion):''}</p></details>${sources(db,c.sourceIds)}</article>`;
}

export function bossCard(b){return `<a class="boss-card" href="/bosses/${b.id}"><div class="boss-art ${b.id}" aria-hidden="true"><span>${b.id==='bahamet'?'◈':'⌖'}</span><small>${/^\d/.test(b.chapter)?'ACT ':''}${e(b.chapter)}</small></div><div><span class="eyebrow">${/^\d/.test(b.chapter)?'STORY QUEST':'SPECIAL QUEST'} · ${e(b.chapter)}</span><h3>${e(b.name)} <span>↗</span></h3><p>${e(b.summary)}</p><span class="text-link">Open fight guide →</span></div></a>`;}

export function compareTable(db,ids){
 const cs=ids.map(id=>db.champions.find(c=>c.id===id)).filter(Boolean);
 const rows=[['Class',c=>c.class],['7★ availability',c=>sevenStarLabel(c)],['Immunities (curated subset)',c=>names(db,'immunities',c.immunityIds).join(', ')||'None catalogued'],['Conditional protection / resistance',c=>c.resistanceNote||'No additional condition recorded'],['Utility',c=>names(db,'abilities',c.abilityIds).join(', ')],['Strengths',c=>c.strengths],['Watch out',c=>c.risks],['Awakening',c=>c.awakening||'Not reviewed'],['Recommended signature',c=>c.signatureTarget??'Not reviewed'],['Battlecast · community option',c=>relicName(db,c.loadout?.battlecastId)],['Statcast · community option',c=>relicName(db,c.loadout?.statcastId)],['7★ attacker focus',c=>focusPublicValue(c,'attack')],['7★ defender focus',c=>focusPublicValue(c,'defense')],['Stat Focus eligibility',c=>focusEligibilityState(c).label],['Curated opponent matchups',c=>db.counters.filter(x=>x.attackerId===c.id).map(x=>[...db.champions,...db.bosses].find(t=>t.id===x.defenderId)?.name).join(', ')||'No curated matchups']];
 return `<div class="table-scroll" tabindex="0" aria-label="Champion comparison, scroll horizontally"><table><caption>Curated attributes • missing values mean not reviewed</caption><thead><tr><th scope="col">Compare attributes</th>${cs.map(c=>`<th scope="col">${avatar(c)}<a href="/champions/${c.id}">${e(c.name)}</a></th>`).join('')}</tr></thead><tbody>${rows.map(([label,fn])=>`<tr><th scope="row">${label}</th>${cs.map(c=>`<td>${e(fn(c))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export const scoreNote=`<details class="score-note"><summary>How confidence labels work</summary><p><strong>Limited evidence</strong> means only part of the matchup is supported. <strong>Community recommended</strong> means players have reported the counter. <strong>Community-backed · kit supported</strong> also has documented utility that matches the fight. <strong>Tested on documented nodes</strong> and <strong>Repeatedly tested</strong> are reserved for recorded gameplay tests. Confidence describes the evidence behind the recommendation; it is not a champion rating or win-rate score.</p></details>`;

export function counterResults(db,id,mode='',roster=null){
 const all=getCounters(db,id,mode);
 const owned=c=>roster?.find(r=>r.id===c.attackerId);
 const cs=roster===null?all:all.filter(c=>requirementCheck(c,owned(c)).eligible);
 const excluded=roster===null?[]:all.filter(c=>owned(c)&&!requirementCheck(c,owned(c)).eligible);
 const explanation=excluded.length?`<details class="notice"><summary>${excluded.length} owned option${excluded.length===1?'':'s'} excluded by recorded requirements</summary><ul>${excluded.map(c=>`<li>${e(db.champions.find(a=>a.id===c.attackerId).name)}: ${e(requirementCheck(c,owned(c)).message)}</li>`).join('')}</ul><a href="/roster">Review your roster →</a></details>`:'';
 return `<p class="result-count">${cs.length} curated ${cs.length===1?'option':'options'}${mode?' for '+e(names(db,'gameModes',[mode])[0]):''}</p>${roster!==null?'<p class="muted">Showing alternatives from your saved roster and recorded requirements.</p>':''}${explanation}${cs.length?cs.map(c=>(roster===null?'':`<p class="notice roster-check">${e(requirementCheck(c,owned(c)).message)}</p>`)+counterCard(db,c,roster===null?undefined:owned(c))).join(''):'<div class="empty"><h3>No reviewed options in this context</h3><p>Try another mode or <a href="/roster">update your roster</a>.</p></div>'}`;
}

export function groupedCounterResults(db,id,mode='',roster=[]){
 if(!roster.length)return counterResults(db,id,mode);
 const all=getCounters(db,id,mode),owned=c=>roster.find(r=>r.id===c.attackerId);
 const groups=[['Recommended from my roster',all.filter(c=>owned(c)&&requirementCheck(c,owned(c)).eligible)],['Other recommended counters',all.filter(c=>!owned(c))],['Owned · requirements not met',all.filter(c=>owned(c)&&!requirementCheck(c,owned(c)).eligible)]];
 return '<p class="muted">Matched to your saved ownership and recorded awakening/signature requirements.</p>'+groups.filter(([,cs],index)=>index!==2||cs.length).map(([title,cs])=>'<section class="counter-group"><h2>'+title+' <small>('+cs.length+')</small></h2>'+(cs.length?cs.map(c=>counterCard(db,c,owned(c)||null)).join(''):'<p class="empty">No reviewed options in this group for the selected mode.</p>')+'</section>').join('');
}
