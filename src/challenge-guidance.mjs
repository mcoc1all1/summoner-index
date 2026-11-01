import {escapeHtml as e} from './domain.mjs';
import {challengePlanById} from './challenge-plans.mjs';
export const challengeRoot='/challenges/carina-volume-4';
const list=items=>`<ul>${items.map(x=>`<li><p>${e(x)}</p></li>`).join('')}</ul>`;
const champ=(db,id)=>{const c=db.champions.find(x=>x.id===id);if(!c)throw new Error(`Unknown challenge champion: ${id}`);return c;};
const champLink=(db,id)=>`<a href="/champions/${e(id)}">${e(champ(db,id).name)}</a>`;
const champLinks=(db,ids=[])=>ids.map(id=>champLink(db,id)).join(', ');

export function communityTeams(g,db){
 const options=g.teamOptions||[];
 if(!options.length)return '';
 return `<section aria-labelledby="community-teams"><h2 id="community-teams">More teams from community runs</h2><p>These are teams players reported using, not interchangeable best-team rankings. “Completion reported” means the author explicitly reports finishing. “Run report” provides fight experience but does not independently establish full objective completion.</p><div class="profile-grid">${options.map(t=>{
  if(!['completion','run-report'].includes(t.status))throw Error('Unknown team evidence status');
  const url=new URL(t.sourceUrl);if(url.protocol!=='https:')throw Error('Unsafe team source URL');
  const links=t.championIds.map(id=>`<a class="video-link" href="/champions/${e(id)}">${e(champ(db,id).name)} →</a>`).join('');
  return `<article class="panel"><span class="eyebrow">${t.status==='completion'?'COMPLETION REPORTED':'COMMUNITY RUN REPORT'}</span><h3>${e(t.title)}</h3><p class="muted">Reported by ${e(t.author)} · source checked ${e(t.reviewedAt)}</p>${links}<h4>Reported roles</h4><p>${e(t.roles)}</p><h4>Conditions and limits</h4><p>${e(t.caveat)}</p><a class="text-link" href="${e(t.sourceUrl)}" target="_blank" rel="noopener noreferrer">Read the player’s run report ↗</a></article>`;
 }).join('')}</div><p class="muted">Every slot must still be a 7-star with the objective’s required tag. Ranks describe the reported run, not a proven minimum. These accounts have not been independently gameplay-tested by Fieldguide.</p></section>`;
}

export function challengeHub(collection){
 return `<h1>Carina’s Challenges · Volume 4</h1><p>Good v Evil: six planners for the Ordeal, Abyss and Epoch’s True Olympian.</p><p class="notice">Each challenge restricts every team slot to 7-star champions with the required in-game #Hero or #Villain tag. Check the active objective and eligibility in your game before spending items. Character lore is not an eligibility check.</p><div class="boss-grid">${collection.guides.map(g=>`<a class="panel" href="${challengeRoot}/${e(g.id)}"><span class="eyebrow">7-STAR · #${e(g.tag.toUpperCase())}</span><h2>${e(g.title)}</h2><p>${e(g.objective)}</p><span class="text-link">Fight plan, team roles & alternatives →</span></a>`).join('')}</div><section class="panel"><h2>Plan the right quest</h2><p>The Ordeal is the enhanced Gauntlet. Abyss requires any completed path through the Nameless Collector. True Olympian is a single five-champion gauntlet containing the fights from the original Epoch paths, followed by Ares; it does not use the original class gates or path-wide nodes.</p><p>These planners summarize reported completion routes and assignments. They are not exhaustive node transcripts or independent gameplay tests. Confirm the current objective, fight nodes and account access in-game before spending items.</p><a href="https://forums.playcontestofchampions.com/en/discussion/412302/carina-challenges-heroes-and-villains-guide" target="_blank" rel="noopener noreferrer">Community overview and planning spreadsheet ↗</a><p class="muted">Sources reviewed ${e(collection.reviewedAt)}.</p></section>`;
}

function difficultyPanel(g){
 const d=g.difficulty;if(!d)return '';
 return `<section class="panel"><span class="eyebrow">RUN PROFILE</span><h2>How demanding is this challenge?</h2><div class="quick-facts"><div><h3>Overall</h3><p>${e(d.overall)}</p></div><div><h3>Mechanical load</h3><p>${e(d.mechanics)}</p></div><div><h3>Roster breadth</h3><p>${e(d.rosterBreadth)}</p></div><div><h3>Main resource risk</h3><p>${e(d.resourceRisk)}</p></div></div><h3>Main danger points</h3>${list(d.mainRisks||[])}<p class="muted">${e(d.note||'')}</p></section>`;
}

function roleCoverage(g,db){
 if(!g.roleCoverage?.length)return '';
 return `<section class="panel" id="role-coverage"><h2>What your five slots need to cover</h2><p class="muted">Use this as a substitution checklist. Replacing one champion is safe only if the replacement still covers the jobs you need later.</p><div class="profile-grid">${g.roleCoverage.map(r=>`<article><h3>${e(r.label)}</h3><p>${champLinks(db,r.candidates)}</p><p>${e(r.note)}</p></article>`).join('')}</div></section>`;
}

function requirementPanel(g,db){
 if(!g.requirements?.length)return '';
 return `<section class="panel" id="setup"><h2>Champion-specific setup before entry</h2><div class="steps">${g.requirements.map(r=>`<div class="step"><div><h3>${champLink(db,r.championId)} · ${e(r.label)}</h3><p>${e(r.text)}</p></div></div>`).join('')}</div></section>`;
}

function routePanel(g){
 if(!g.routePlans?.length)return '';
 return `<section class="panel" id="route-plan"><h2>Route planning</h2><p class="muted">Abyss assignments are route-dependent. Confirm the route first, then lock the team.</p>${g.routePlans.map(r=>`<article class="route-plan"><span class="eyebrow">${e(r.status.toUpperCase())}</span><h3>${e(r.name)}</h3><p>${e(r.note)}</p>${r.sequence?.length?`<p><strong>Order:</strong> ${r.sequence.map((x,i)=>`${i+1}. ${e(x)}`).join(' · ')}</p>`:''}</article>`).join('')}</section>`;
}

function flexPanel(g,db){
 if(!g.flexSlot)return '';
 return `<section class="panel"><h2>${e(g.flexSlot.label)}</h2><p>${e(g.flexSlot.note)}</p><p><strong>Community-reported possibilities:</strong> ${champLinks(db,g.flexSlot.candidates)}</p><p class="muted">This is intentionally not a fixed fifth member or ranking.</p></section>`;
}

function fightPlan(g,db){
 if(!g.fightPlan?.length)return '';
 return `<section class="panel" id="complete-plan"><div class="section-head"><div><span class="eyebrow">FEATURED COMPLETION PLAN</span><h2>Fight-by-fight assignments</h2></div><span>${g.fightPlan.length} fights mapped</span></div><p class="muted">Primary and backup choices summarize the cited run or route plan. “Watch” highlights the mechanic most likely to invalidate the assignment. Always read the current in-game nodes before entering.</p><div class="table-scroll" tabindex="0"><table class="challenge-plan-table"><caption>${e(g.title)} featured fight plan</caption><thead><tr><th>#</th><th>Fight</th><th>Primary</th><th>Backup</th><th>Plan</th><th>Watch</th></tr></thead><tbody>${g.fightPlan.map((f,i)=>`<tr><td>${i+1}</td><th>${e(f.fight)}</th><td>${champLinks(db,f.primary)}</td><td>${f.backup?.length?champLinks(db,f.backup):'—'}</td><td>${e(f.plan)}</td><td>${e(f.watch||'')}</td></tr>`).join('')}</tbody></table></div><p class="muted">Evidence level: community completion/run reports. These assignments are not independently gameplay-tested by Fieldguide.</p></section>`;
}

function finalBossPanel(g,db){
 const b=g.finalBoss;if(!b)return '';
 return `<section class="panel" id="final-boss"><span class="eyebrow">FINAL ENCOUNTER</span><h2>${e(b.name)} plan</h2><p><strong>Primary:</strong> ${champLinks(db,b.primary)}${b.backup?.length?` · <strong>Backups:</strong> ${champLinks(db,b.backup)}`:''}</p><p>${e(b.plan)}</p><h3>Common run-ending mistakes</h3>${list(b.failurePoints||[])}</section>`;
}

function rosterCheck(g){
 const team=[...new Set([...(g.team||[]),...(g.flexSlot?.candidates||[])])];
 return `<section class="panel" id="roster-check" data-challenge-roster="${e(team.join(','))}" data-core-team="${e((g.team||[]).join(','))}"><h2>Check this plan against My Roster</h2><p class="muted">Loading your browser-local roster…</p><noscript><p>Roster matching requires JavaScript. <a href="/roster">Open My Roster →</a></p></noscript></section>`;
}

export function challengePage(input,collection,db){
 const extra=challengePlanById(input.id);const g=extra?{...input,...extra}:input;
 const team=g.team.map(id=>`<a class="video-link" href="/champions/${e(id)}">${e(champ(db,id).name)} · champion guide →</a>`).join('');
 const altCount=g.teamOptions?.length||0;
 return `<div class="crumbs"><a href="${challengeRoot}">Carina Volume 4</a> / ${e(g.title)}</div><h1>${e(g.title)}</h1><p>${e(g.objective)}</p><nav class="quick-row" aria-label="Challenge sections"><a href="#team-example">Featured team</a><a href="#roster-check">My Roster</a>${g.roleCoverage?.length?'<a href="#role-coverage">Role coverage</a>':''}${g.routePlans?.length?'<a href="#route-plan">Route</a>':''}${g.fightPlan?.length?'<a href="#complete-plan">Full fight plan</a>':'<a href="#fight-checks">Fight checks</a>'}<a href="#final-boss">Final boss</a><a href="#community-teams">${altCount} alternative teams</a></nav><div class="notice"><strong>Required: only 7-star #${e(g.tag)} champions, including support slots.</strong> Verify tags, objective availability and the selected quest in-game. Community-sourced guidance · reviewed ${e(collection.reviewedAt)} · not independently gameplay-tested.</div>${difficultyPanel(g)}<div class="profile-grid"><section class="panel"><h2>Choose the correct quest</h2><p>${e(g.quest)}</p><h3>Easy mistake to avoid</h3><p>${e(g.pitfall)}</p></section><section class="panel"><h2 id="team-example">Featured team example</h2><p>${e(g.teamNote)}</p>${team}<p class="muted">A reported team is an option, not a minimum-rank guarantee. Check awakening, masteries, prefights and your own build before investing.</p></section></div>${rosterCheck(g)}${roleCoverage(g,db)}${requirementPanel(g,db)}${flexPanel(g,db)}${routePanel(g)}${fightPlan(g,db)}${finalBossPanel(g,db)}<section class="panel"><h2 id="fight-checks">Key roadblocks</h2><p class="muted">These are quick reminders for the fights most likely to break the plan. The complete fight table above is the main execution checklist where available.</p><div class="steps">${g.checks.map(([name,plan])=>`<div class="step"><div><h3>${e(name)}</h3><p>${e(plan)}</p></div></div>`).join('')}</div></section>${communityTeams(g,db)}<section class="panel"><h2>Before spending items</h2>${list(['Open the objective and verify every champion’s rarity and required tag. Confirm the quest title before starting.','Use the fight table to assign a primary and backup before entry. For Abyss, lock the route before locking the team.','Check awakening, signature, masteries and prefights against every champion-specific setup note. Practise the hardest opening or boss mechanics before using limited boosts.','Set your own resource limit from trial attempts. Another player’s revive total is evidence of one run, not a budget promise.'])}<h2>At the finish</h2><p>Defeat the required final boss and check objective credit before claiming completion. If credit does not appear, capture the objective, quest and team details for game support.</p></section><section class="panel"><h2>Evidence and remaining limits</h2><a class="video-link" href="${e(g.planSource||g.source)}" target="_blank" rel="noopener noreferrer">Featured completion / route report ↗</a><a class="video-link" href="${e(g.source)}" target="_blank" rel="noopener noreferrer">Challenge discussion and alternative team reports ↗</a><p>Fight assignments summarize community reports in original wording written for this guide; they are not copied transcripts. Current-client verification, exhaustive node coverage and a personally tested resource estimate remain open.</p></section><nav class="quick-row" aria-label="Other Volume 4 challenges">${collection.guides.filter(x=>x.id!==g.id).map(x=>`<a href="${challengeRoot}/${e(x.id)}">${e(x.title)} →</a>`).join('')}</nav><script type="module" src="/challenge-roster.mjs"></script>`;
}
