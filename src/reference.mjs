import {escapeHtml as e} from './domain.mjs';
export function preparationNotes(facts){
 const has=pattern=>facts.abilities.some(a=>pattern.test(a));
 const notes=[];
 if(has(/bleed|poison|incinerate|shock|rupture|degen/i))notes.push('Check the opponent’s protection against your listed damage effects before choosing this attacker. Ability labels alone do not establish damage uptime.');
 if(has(/power (drain|burn|lock|steal)|enervate/i))notes.push('Check when the power-control effect activates and whether the opponent or node prevents it. Do not rely on an ability label as a guaranteed special-attack lock.');
 if(has(/nullify|stagger|neutralize|fate seal/i))notes.push('For buff-heavy opponents, check which buffs this kit can stop or remove and when that effect triggers. Account for immunity and ability-accuracy rules.');
 if(has(/evade|miss|autoblock|auto.block/i))notes.push('Distinguish defensive Evade, Miss or Auto-Block effects from effects that counter them. Read the trigger before planning an intercept or special.');
 if(has(/precision|cruelty|critical/i))notes.push('Before choosing a critical stat focus, check which hits can crit and whether their critical chance is already guaranteed.');
 if(has(/regeneration|heal/i))notes.push('Check the recovery trigger and healing restrictions. Plan around Heal Block or reversal effects on the opponent and nodes.');
 if(has(/armor break|armor shatter/i))notes.push('Check Armor Break immunity and whether removing armor enables an opposing ability before selecting the matchup.');
 return notes;
}
export function referencePanel(c){
 const f=c.referenceFacts;if(!f)return '';
 const list=items=>items.length?`<ul>${items.map(x=>`<li>${e(x)}</li>`).join('')}</ul>`:'<p>Not listed by this reference; this does not mean the champion lacks this property.</p>';
 return `<section class="panel" id="source-catalogue"><span class="eyebrow">SOURCE CATALOGUE · ${e(f.checkedAt)}</span><h2>Kit reference</h2><p>These labels are catalogued from MCOC Scout. They have not been individually checked in the game. Detailed guide notes take precedence where the reference differs.</p><div class="loadout-columns"><div><h3>Listed abilities</h3>${list(f.abilities)}</div><div><h3>${c.coverage==='curated'?'Protection notes':'Listed protections & conditions'}</h3>${c.coverage==='curated'&&c.resistanceNote?`<p>${e(c.resistanceNote)}</p><small>Guide clarification replaces the source’s broad immunity labels. See Useful tools above for the reviewed immunity subset.</small>`:list(f.protections)}<p class="muted">Resistance, duration reduction and conditional immunity are different effects. These source labels do not add a champion to the unconditional-immunity filter.</p></div></div>${preparationNotes(f).length?`<h3>Preparation checklist</h3><p class="muted">Editorial questions suggested by the listed abilities; not a verified rotation.</p>${list(preparationNotes(f))}`:''}<a class="text-link" href="${e(f.url)}" target="_blank" rel="noopener noreferrer">View ${e(c.name)}’s complete kit on MCOC Scout ↗</a></section>`;
}
export function referenceLoadout(c){
 const f=c.referenceFacts;if(!f)return '<p>No loadout guidance reviewed yet.</p>';
 return `<p class="eyebrow">SOURCE SHORTLIST · NOT GAMEPLAY-TESTED</p><dl><dt>Battlecast suggestion</dt><dd>${e(f.battlecast||'Not listed')}</dd><dt>Statcast suggestion</dt><dd>${e(f.statcast||'Not listed')}</dd></dl><p>These are the reference’s suggested relic names. Confirm class, binding eligibility and the exact item’s effects in game. No rune, rarity, rank or signature requirement has been established.</p>${c.focusTrial?'':"<h3>Stat focus decision</h3><p>No champion-specific focus recommendation has been verified. Compare your main damage source with the <a href=\"/loadouts#focus-glossary\">focus descriptions</a>; check critical-hit restrictions before selecting critical stats. For survival, test Block Proficiency against block damage or a resistance against the relevant damage type. Use the <a href=\"/loadouts#test-plan\">repeatable fight checklist</a> to compare one change at a time.</p>"}<a href="${e(f.url)}" target="_blank" rel="noopener noreferrer">Relic source · checked ${e(f.checkedAt)} ↗</a>`;
}
