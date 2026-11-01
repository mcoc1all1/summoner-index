export default [
{
 id:'ordeal-heroes',
 difficulty:{overall:'High',mechanics:'Medium',rosterBreadth:'High',resourceRisk:'Medium–High',mainRisks:['Terrax opening damage','Korg Heavy / Mix Master sequence','Black Panther (Civil War) control windows','Sasquatch healing + Lifecycle','Thanos final phases'],note:'The main challenge is covering many different utility checks across 21 fights, not one exceptionally complex boss.'},
 roles:[
  ['Armor Shatter / robot control',['medusa'],'Used for Vision, MODOK, Spider-Gwen, Killmonger and other Armor-based matchups.'],
  ['Non-debuff Evade control',['professor-x'],'Important for Spider-Ham and Korg where ordinary debuff-based control is awkward.'],
  ['Buff control / Neutralize',['wiccan'],'Covers Terrax sustain and Black Panther (Civil War) buff-heavy windows.'],
  ['Unstoppable / long-form utility',['falcon-joaquin-torres'],'Used repeatedly through Weapon X, Dragon Man, Apocalypse and Sasquatch.'],
  ['Cleanse / safer debuff management',['cheeilth'],'Useful for Doom and especially Void.'],
  ['Final-boss closer',['falcon-joaquin-torres','medusa'],'The featured completion leaned heavily on Joaquin for Thanos.']
 ],
 requirements:[
  ['cheeilth','Doom setup','Build to SP3 before settling into SP1/Heavy pressure so the featured plan has its Vicious/Grit setup.'],
  ['wiccan','Terrax sustain','The reported approach relies on repeated SP1 use to recover through Rock Field pressure.'],
  ['professor-x','Korg execution','Use parryless Heavy openings and Evade control rather than relying on a Stun Debuff that Korg can Purify.'],
  ['falcon-joaquin-torres','Sasquatch healing control','Despair is part of the featured plan; check your mastery setup before assuming the same healing control.']
 ],
 fights:[
  ['Doctor Doom','cheeilth',[],'Build the opening setup, then use Heavy attacks and SP1 to keep the fight controlled.','Do not rush the first Special cycle; this assignment is safe rather than fast.'],
  ['Terrax','wiccan',[],'Cycle SP1 while managing Rock Field; the featured run used the healing from this loop to survive the early pressure.','Rock Field damage starts immediately.'],
  ['Vision','medusa',[],'Get Armor Shatter established, then treat the rest as a simple control fight.','Do not let the opening become a Power-control race.'],
  ['MODOK','medusa',[],'Reach SP1 and establish Armor Shatter to remove much of the Auto-Block pressure.','Opening Auto-Block can make the first Special awkward.'],
  ['Spider-Ham','professor-x',[],'Use Professor X for Evade control without relying on debuffs; throw Specials only when the Taunt timing is safe.','Debuff immunity makes many normal Evade counters unsuitable.'],
  ['Weapon X','falcon-joaquin-torres',[],'Use Joaquin’s Unstoppable control and sustain-friendly play to manage the long pressure cycle.','Do not let Weapon X’s Unstoppable timing trap you in the corner.'],
  ['Thing','falcon-joaquin-torres',[],'Play the Rock Stack cycle patiently; Joaquin is safe but not especially fast into the Physical Resistance.','Expect a slower fight.'],
  ['Korg','professor-x',[],'Use non-contact/parryless Heavy access plus Evade control to satisfy the fight without depending on Parry Stun.','Respect Thorns and Mix Master.'],
  ['Dragon Man','falcon-joaquin-torres',[],'Use Joaquin as the safer featured option and control the pace around Dragon Man’s Power Gain.','The original Wiccan idea was abandoned in the completed run.'],
  ['Black Panther (Civil War)','wiccan',[],'Use Neutralize to suppress the buff-heavy Footloose/Armored Assault windows and create safer openings.','Watch Stun Reflection, Cleanse, Unblockable and Unstoppable states.'],
  ['Nightcrawler','falcon-joaquin-torres',[],'Use Slow/control to keep Nightcrawler’s avoidance manageable and maintain a normal attack rhythm.','Avoid letting the fight become an Evade lottery.'],
  ['Spider-Gwen','medusa',[],'Build to SP1 carefully, then establish Armor Shatter before her Evade ramps out of control.','The opening is the dangerous part; controlled Block Damage may be preferable to uncontrolled Evades.'],
  ['Domino','professor-x',[],'Use Professor X and capitalize on Power Shield for burst damage while avoiding unnecessary RNG-dependent interactions.','Do not treat normal Critical interactions as reliable into Domino.'],
  ['Mojo','falcon-joaquin-torres',[],'Use Joaquin without feeding Precision Buffs and keep the prompt loop under control.','Repeated deaths can make Mojo harder through Followers.'],
  ['Immortal Abomination','medusa',[],'Use Medusa and keep the fight controlled around Return to Sender; avoid unnecessary Light-hit patterns if they make the Bleed/Heal Block cycle uncomfortable.','Player reports differ on how comfortable this sequence feels, so do not assume it is trivial.'],
  ['Apocalypse','falcon-joaquin-torres',[],'Lean on Joaquin’s survivability and control while managing the heavy Block Damage from Specials.','Do not underestimate chip damage.'],
  ['Sasquatch','falcon-joaquin-torres',[],'Use anti-Unstoppable utility and Despair-based healing control; finish damage during valid Lifecycle windows.','Healing below 40% can erase progress if Despair/control is insufficient.'],
  ['Killmonger','medusa',[],'Build Armor Shatter with controlled Medium sequences before committing to normal Power building.','The opening can be slow if Killmonger does not cooperate.'],
  ['Void','cheeilth',[],'Use Cleanse to make the debuff pressure safer; accept that damage may slow when Bleed is suppressed.','Prioritize survival over forcing Bleed damage.'],
  ['Nick Fury','medusa',[],'Use Medusa as the featured finisher and manage his life cycle normally rather than saving a specialist only for this fight.','Keep enough health for the second phase.'],
  ['Thanos','falcon-joaquin-torres',['medusa'],'Use Joaquin for most of the boss and keep Medusa available to clean up. Execute each phase rather than trying to brute-force the finale.','Deathtouch is the main late failure point; Joaquin’s Special-based healing can help with the forced health-loss phase.']
 ],
 finalBoss:{name:'Thanos',primary:['falcon-joaquin-torres'],backup:['medusa'],plan:'Preserve a healthy Joaquin for the final encounter, read each phase condition before attacking, and keep Medusa available as cleanup.',failurePoints:['Entering with no healthy closer','Forgetting the phase-specific action before attacking','Losing the run late to Deathtouch rather than normal damage']},
 planSource:'https://www.reddit.com/r/ContestOfChampions/comments/1rq3dov/good_v_evil_carina_challenges_1_ordeal_hero/'
},
{
 id:'ordeal-villains',
 difficulty:{overall:'High',mechanics:'Medium',rosterBreadth:'High',resourceRisk:'Medium–High',mainRisks:['Spider-Ham without Stun access','Korg Heavy/Purify interaction','Black Panther (Civil War) overlap','Sasquatch healing','Void attrition','Thanos finale'],note:'The featured team is safe through many fights, but several assignments are slow and still punish execution errors.'},
 roles:[
  ['Safe generalist / unblockable control',['mister-sinister'],'Featured for Doom, Terrax, Weapon X, Thing, Domino, iAbom, Void and Nick Fury.'],
  ['Avoidance / difficult defender coverage',['serpent'],'Used for Spider-Ham, BPCW, Nightcrawler, Apocalypse and Thanos.'],
  ['Power / healing control',['scorpion'],'Used for Vision cleanup, Dragon Man, Mojo and Sasquatch.'],
  ['Spider-Gwen / Killmonger damage',['venom'],'Focused damage slot that also benefits from Scorpion synergy.'],
  ['Support / cleanup',['arnim-zola'],'Primarily a Sinister synergy slot; the featured run used him only to finish a few low-health opponents.'],
  ['Final-boss closer',['serpent'],'Serpent did most of the reported Thanos damage before cleanup.']
 ],
 requirements:[
  ['mister-sinister','Rotation familiarity','The featured run repeatedly uses Parry/Heavy/SP1 spacing. Practice it before committing.'],
  ['scorpion','Prefight check','The Vision plan used Shock; confirm the chosen prefight before entering.'],
  ['venom','Killmonger execution','Venom can cover the fight, but Special Attack dex timing is still the main risk.'],
  ['arnim-zola','Support slot','Zola was not a primary counter in the featured run. Keep his role labelled as synergy/cleanup.']
 ],
 fights:[
  ['Doctor Doom','mister-sinister',[],'Use the standard Sinister Heavy/SP1 control loop and create spacing before charging Heavy.','This is a fundamentals check more than a damage check.'],
  ['Terrax','mister-sinister',[],'Repeat the safe Sinister loop and accept early Rock Field damage rather than forcing tempo.','Health can drop substantially before the fight stabilizes.'],
  ['Vision','serpent',['scorpion'],'Open with Serpent, then use Scorpion as backup with Shock prefight and SP1 pressure if needed.','Do not push Vision into an uncontrolled SP3 cycle.'],
  ['MODOK','mister-sinister',[],'Use Sinister’s normal rotation and keep the fight methodical around Auto-Block.','Execution errors, not matchup coverage, are the main danger.'],
  ['Spider-Ham','serpent',[],'Play slowly, bait SP1 and avoid throwing Specials into unsafe Power Sting windows.','No-Stun play and unblockable SP2 timing make this a real roadblock.'],
  ['Weapon X','mister-sinister',[],'Use Sinister’s sustain/control loop and let the matchup stay slow if necessary.','Do not panic into Weapon X’s Unstoppable windows.'],
  ['Thing','mister-sinister',[],'Control Rock Stacks, then use SP1 during safe offensive windows while maintaining the Heavy loop.','Expect a longer fight.'],
  ['Korg','mister-sinister',[],'Use Sinister carefully and be ready for Stun Purify to break the usual Heavy setup.','Rock Shield plus Purify can invalidate autopilot Parry/Heavy play.'],
  ['Dragon Man','scorpion',['arnim-zola'],'Cycle SP1, keep Dragon Man below SP3 and use the safer Special pattern for your comfort level.','Zola is only emergency cleanup here.'],
  ['Black Panther (Civil War)','serpent',['mister-sinister'],'Wait out overlapping Unblockable/Unstoppable windows instead of forcing openings.','This fight punishes impatience.'],
  ['Nightcrawler','serpent',['mister-sinister'],'Use Serpent first and keep the fight controlled around avoidance.','Do not overcommit into Evade.'],
  ['Spider-Gwen','venom',['serpent'],'Use Venom as the primary damage option and keep Serpent available if the fight goes wrong.','The main risk is execution, not a lack of coverage.'],
  ['Domino','mister-sinister',[],'Use Sinister’s safer loop rather than relying on Crit-heavy interactions.','Avoid unnecessary RNG exposure.'],
  ['Mojo','scorpion',[],'Use SP1 pressure and avoid feeding Mojo extra prompt/Follower value.','A death can make the next attempt worse.'],
  ['Immortal Abomination','mister-sinister',[],'Use Sinister’s standard loop and sustain; prioritize a clean fight over speed.','Do not get careless just because the matchup is favorable.'],
  ['Apocalypse','serpent',['arnim-zola'],'Use Serpent and manage Special timing carefully; block the safer portion of SP2 if that is more reliable for you.','Zola is cleanup only.'],
  ['Sasquatch','scorpion',[],'Use SP2 Petrify/healing control and keep Lifecycle in mind.','Healing can erase progress if you miss the control window.'],
  ['Killmonger','venom',['arnim-zola'],'Use Venom for the bulk of the fight, bait predictable Specials and keep Zola only as emergency cleanup.','The main risk is mistiming Killmonger’s Specials.'],
  ['Void','mister-sinister',[],'Enter healthy, maintain spacing and use the Heavy/SP1 loop to manage attrition.','This is a health-management fight.'],
  ['Nick Fury','mister-sinister',[],'Use Sinister and time SP1 around his self-Bleed cycle while preserving health for Fury’s second life.','The first knockout is not the finish.'],
  ['Thanos','serpent',['mister-sinister','scorpion','venom'],'Lead with Serpent and preserve the rest of the team for final-phase cleanup if necessary.','Learn the boss mechanics rather than budgeting around another player’s revives.']
 ],
 finalBoss:{name:'Thanos',primary:['serpent'],backup:['mister-sinister','scorpion','venom'],plan:'Start with Serpent, keep the rest of the team healthy enough to finish the final phase, and read the phase-specific instructions before every damage push.',failurePoints:['Burning the whole team before the final phase','Treating the final phase as ordinary combat','Entering with only low-health support slots']},
 planSource:'https://www.reddit.com/r/ContestOfChampions/comments/1rx57ic/good_v_evil_carinas_challenges_2_ordeal_villain/'
}
];
