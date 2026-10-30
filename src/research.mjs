import {escapeHtml as e} from './domain.mjs';

export function researchGaps(db,c){
 const gaps=[];
 if(c.coverage!=='curated')gaps.push('Champion-specific kit and awakening guidance');
 else if(!c.awakening||/not (audited|reviewed|established)|remain\w* unreviewed/i.test(c.awakening))gaps.push('Awakening benefit review');
 if(!c.rotation?.length)gaps.push('Step-by-step fight sequence');
 if(c.loadoutException)gaps.push('Event identity and loadout eligibility confirmation');
 else if(!c.loadout&&!c.focusTrial)gaps.push('Champion-specific stat-focus trial');
 if(c.loadout&&(!c.loadout.battlecastId||!c.loadout.statcastId))gaps.push('Sourced named relic pairing');
 if(c.focusTrial&&!c.loadout)gaps.push('Defender stat-focus trial and sourced relic pairing');
 if(!db.synergies.some(s=>s.championId===c.id))gaps.push('Conditional team synergy recommendations');
 if(c.signatureTarget==null)gaps.push('Numeric signature investment breakpoint');
 gaps.push('Exact relic variant, rune and investment requirements');
 gaps.push('Current-game combat validation');
 return gaps;
}

export function researchPanel(db,c){
 const r=c.researchReview;
 return `<details class="panel" id="research-gaps"><summary>What still needs review for ${e(c.name)}</summary>${r?`<p>${e(r.note)}</p><p class="muted">Research checked ${e(r.checkedAt)}.</p>`:''}<ul>${researchGaps(db,c).map(g=>`<li>${e(g)}</li>`).join('')}</ul><p>Missing guidance is not evidence that an ability, synergy or viable build does not exist.</p></details>`;
}
