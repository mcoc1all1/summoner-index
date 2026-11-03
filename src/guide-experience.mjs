const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function bossQuickPlan(boss){
  const details=boss.guideDetails||{};
  const cheat=details.cheatSheet||[];
  const doThis=cheat[0]?.objective||boss.phases?.[0]?.text||boss.summary||'Read the current fight mechanics before entering.';
  const bring=details.attackerProfile?.[0]||boss.avoid||'Bring a champion whose controls fit the encounter rather than relying on class advantage alone.';
  const avoid=boss.mistakes?.[0]||boss.avoid||'Do not assume normal quest habits bypass the encounter mechanic.';
  const tags=(boss.mechanicTags||[]).slice(0,6);
  const verification=boss.verification?.gameplayTested?'Gameplay-tested':'Source-reviewed · current-client test not recorded';
  return `<section class="panel boss-fast-plan"><div class="section-head"><div><span class="eyebrow">30-SECOND PLAN</span><h2>Know this before you enter</h2></div><span class="guide-status-chip">${e(verification)}</span></div><div class="boss-fast-grid"><article><span>DO</span><p>${e(doThis)}</p></article><article><span>BRING</span><p>${e(bring)}</p></article><article><span>AVOID</span><p>${e(avoid)}</p></article></div>${tags.length?`<div class="quick-row boss-fast-tags"><strong>Key mechanics</strong>${tags.map(tag=>`<span class="chip">${e(tag)}</span>`).join('')}</div>`:''}<nav class="quick-row" aria-label="Boss guide sections"><a href="#boss-counters">Counters</a><a href="#fight-loop">Full walkthrough</a><a href="#boss-video">Video</a></nav></section>`;
}

export function guideHub(){
  const card=(eyebrow,title,copy,href)=>`<a class="panel guide-hub-card" href="${href}"><span class="eyebrow">${eyebrow}</span><h3>${title} →</h3><p>${copy}</p></a>`;
  return `<section class="guide-hub-section"><div class="section-head"><div><span class="eyebrow">FIGHT GUIDES</span><h2>Prepare for the encounter</h2></div></div><div class="guide-hub-grid">${card('STORY & BOSSES','Boss guides','Phase plans, counters, mistakes and preparation for story encounters.','/quests')}${card('SPECIAL CHALLENGES','Carina Volume 4','Team roles, route planning, backups and fight-by-fight assignments.','/challenges/carina-volume-4')}</div></section><section class="guide-hub-section"><div class="section-head"><div><span class="eyebrow">BUILD & ACCOUNT</span><h2>Set up before the fight</h2></div></div><div class="guide-hub-grid">${card('ACCOUNT SETUP','Mastery setups','General, Battlegrounds, Recoil and specialist mastery frameworks.','/masteries')}${card('YOUR COLLECTION','My Roster','Save rarity, rank, awakening and signature so recommendations can use what you own.','/roster')}</div></section><section class="guide-hub-section"><div class="section-head"><div><span class="eyebrow">CURRENT PLANNING</span><h2>Turn current content into a plan</h2></div></div><div class="guide-hub-grid">${card('CURRENT CONTENT','Events & News','See what is live or upcoming, then open the relevant preparation tools.','/events')}${card('MATCHUP HELP','Counter Finder','Choose the defender and get sourced counter options, caveats and fight plans.','/counters')}</div></section><section class="panel guide-start-panel"><h2>How to use Summoner Index guides</h2><div class="guide-start-steps"><div><strong>1</strong><span>Read the 30-second plan.</span></div><div><strong>2</strong><span>Choose a counter your roster actually has.</span></div><div><strong>3</strong><span>Read the full mechanics only where the fight needs it.</span></div></div></section>`;
}

export function challengeAtAGlance(guide,championName=id=>id){
  const team=(guide.team||[]).map(championName);
  const risks=guide.difficulty?.mainRisks||guide.checks?.slice(0,3).map(item=>item[0])||[];
  const riskText=risks.length?risks.slice(0,3).join(' · '):'Review the key roadblocks before spending items.';
  return `<section class="panel challenge-glance"><div class="section-head"><div><span class="eyebrow">RUN AT A GLANCE</span><h2>Plan this run before spending items</h2></div></div><div class="challenge-glance-grid"><div><span>Quest</span><strong>${e(guide.quest)}</strong></div><div><span>Restriction</span><strong>${e(`${guide.rarity||7}★ · #${guide.tag}`)}</strong></div><div><span>Featured team</span><strong>${team.length?team.map(e).join(' · '):'See team section'}</strong></div><div><span>Main danger points</span><strong>${e(riskText)}</strong></div></div><p class="muted">Use this as the starting point. The full guide below explains substitutions, route choices and fight assignments.</p></section>`;
}

export function addMobileFightCards(html){
  const pattern=/<div class="table-scroll" tabindex="0"><table class="challenge-plan-table">([\s\S]*?)<\/table><\/div>/;
  const match=html.match(pattern);
  if(!match)return html;
  const table=match[0].replace('class="table-scroll"','class="table-scroll challenge-plan-desktop"');
  const body=match[1].match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1]||'';
  const rows=[...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)];
  const cards=rows.map(row=>{
    const cells=[...row[1].matchAll(/<(?:td|th)>([\s\S]*?)<\/(?:td|th)>/g)].map(cell=>cell[1]);
    if(cells.length<6)return '';
    return `<article class="challenge-fight-card"><div class="challenge-fight-head"><span>Fight ${cells[0]}</span><h3>${cells[1]}</h3></div><dl><dt>Primary</dt><dd>${cells[2]}</dd><dt>Backup</dt><dd>${cells[3]}</dd><dt>Plan</dt><dd>${cells[4]}</dd><dt>Watch</dt><dd>${cells[5]||'—'}</dd></dl></article>`;
  }).join('');
  if(!cards)return html;
  return html.replace(match[0],`${table}<div class="challenge-plan-cards" aria-label="Fight-by-fight assignments">${cards}</div>`);
}
