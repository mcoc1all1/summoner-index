export default [
{
 id:'abyss-heroes',
 difficulty:{overall:'High',mechanics:'Medium',rosterBreadth:'Medium',resourceRisk:'High at Nameless Collector',mainRisks:['Venom the Duck Power Rate','Invisible Woman Power Sting','route-specific Armor Break needs','Nameless Collector Tenacity/Evade/Unstoppable'],note:'Modern 7-stars make much of the path manageable; the Collector remains the main resource and execution risk.'},
 roles:[
  ['Long-form general damage',['sentry'],'The featured report used Sentry for most of the Easy Path and reached Collector itemless.'],
  ['Buff control / Cosmic coverage',['kushala'],'Useful for Cosmic roadblocks and also a reported Collector option.'],
  ['Passive Stun prefight',['magneto-house-of-x'],'A route-support slot for fights such as Mordo and the Collector.'],
  ['Collector Unstoppable answer',['beta-ray-bill','kushala','sentry'],'Grit, reliable control or Halt can matter more than raw path damage in the final fight.'],
  ['Sentry synergy support',['mister-fantastic'],'The featured build uses Mister Fantastic primarily to improve Sentry’s long-form output.']
 ],
 requirements:[
  ['sentry','Ramp plan','Treat the first fights as ramp. Community reports commonly use Thing/Omega Red to establish Sentry before asking him to carry the route.'],
  ['mister-fantastic','Support slot','This slot is primarily synergy value. If you replace it, re-evaluate Sentry’s pace rather than assuming the same path performance.'],
  ['magneto-house-of-x','Prefight allocation','Decide where each prefight matters before entry; Collector and Mordo are common destinations in community plans.'],
  ['beta-ray-bill','Collector role','Grit is valuable because it lives on the attacker and is not removed by Tenacity, but it does not bypass the rest of the Collector fight.']
 ],
 routePlans:[
  {name:'Easy Path / Path 1',status:'recommended-starting-point',sequence:['Thing','Omega Red','Quake','Medusa','Mephisto','Captain Marvel (Movie)','Ghost','Iron Man (Infinity War)','Joe Fixit','Mordo','Venom the Duck','Howard the Duck','Hyperion','The Champion','Cyclops','Loki','Ægon','Invisible Woman','Cull Obsidian','Nameless Collector'],note:'A common first-completion route. Build your team around this order before entering; another path may fit a different roster better.'},
  {name:'Alternative route choice',status:'roster-dependent',sequence:[],note:'The challenge accepts any completed Abyss path. Do not copy Path 1 assignments onto another route without remapping defenders and utility checks.'}
 ],
 fights:[
  ['Thing','sentry',[],'Use the opening fight to begin Sentry’s ramp rather than judging his final-route damage immediately.','This can be one of the longest Sentry fights because the ramp is still low.'],
  ['Omega Red','sentry',[],'Continue the Sentry ramp; several reports describe him becoming fully online by or shortly after this fight.','Do not spend resources trying to force peak damage before the ramp is ready.'],
  ['Captain Marvel (Movie)','kushala',[],'Use a Mystic/buff-control assignment so the fight does not become an Energy-damage and Special-spam problem.','A generic damage dealer can struggle if you ignore her buff interaction.'],
  ['Venom the Duck','kushala',[],'Control buffs and Power Rate instead of letting repeated Specials push you into the corner.','This is repeatedly reported as a sleeper roadblock if your buff control is weak.'],
  ['Invisible Woman','sentry',[],'Keep a debuff active often enough to manage the passive Power Sting expiry condition, or use another attacker who can do so reliably.','Launching Specials carelessly while a Power Sting is active can end the attempt.'],
  ['Cull Obsidian','kushala',[],'Use buff control only if it still lets the fight’s buff-removal damage condition function.','Neutralize can sometimes deny the very buff you wanted to remove.'],
  ['Nameless Collector','kushala',['beta-ray-bill','sentry'],'Use the first large damage push with a control option you know; keep Beta Ray Bill or Sentry available as a second style of Unstoppable control.','Tenacity can remove debuffs, so passive Slow, Grit or reliable attacker-side control is valuable.']
 ],
 finalBoss:{name:'Nameless Collector',primary:['kushala'],backup:['beta-ray-bill','sentry'],plan:'Enter with at least two viable control styles. Expect Tenacity, Evade and Unstoppable to disrupt ordinary rotations; use attacker-side Grit, a passive/control effect that can stick, or a carefully maintained Halt plan.',failurePoints:['Reaching Collector with only one functional attacker','Assuming debuff-based control will always survive Tenacity','Spending the whole path team before the last 10%']},
 planSource:'https://www.reddit.com/r/ContestOfChampions/comments/1s3c9dp/good_v_evil_carinas_challenges_3_abyss_heroes/'
},
{
 id:'abyss-villains',
 difficulty:{overall:'High',mechanics:'Medium',rosterBreadth:'Medium–High',resourceRisk:'High at Nameless Collector',mainRisks:['Purgatory soul routing','Venom the Duck Power Rate','Cull Obsidian Nullify-vs-Neutralize interaction','Nameless Collector'],note:'The featured plan is intentionally a four-champion core plus a flex slot; the flex should solve a route weakness or provide a second Collector option.'},
 roles:[
  ['Collector plan / soul route',['purgatory'],'The featured route builds Mutant, Cosmic, Mystic, Tech and especially Skill souls before the final boss.'],
  ['Science / difficult utility fights',['attuma'],'Used for Quake and Mordo in the featured Easy Path plan.'],
  ['General path / healing-control utility',['she-hulk-deathless'],'Used for Thing, Joe Fixit, Cyclops, Invisible Woman and Cull Obsidian.'],
  ['Tech / Armor Break coverage',['knull'],'Used for Iron Man (Infinity War) and Howard the Duck, with Cull as an optional assignment.'],
  ['Flex slot',['onslaught','serpent','spider-slayer-j-jonah-jameson','mojo'],'Choose for Collector insurance, route-specific coverage or cleanup. These are community-reported possibilities, not a ranked list.']
 ],
 requirements:[
  ['purgatory','Soul checklist','If Purgatory is your Collector plan, deliberately secure Mutant, Cosmic, Mystic, Tech and Skill souls. Ægon is the critical Skill-soul opportunity on the featured Easy Path.'],
  ['knull','Cull interaction','For Cull Obsidian, Neutralize prevention and Nullify removal are not equivalent. Preventing the buff can deny node damage that expects a buff to be removed.'],
  ['she-hulk-deathless','Cyclops plan','The featured plan avoids leaning on Wither if doing so prevents the Special cycle needed to maintain meaningful Trauma.']
 ],
 flexSlot:{label:'Fifth slot · choose for your roster',candidates:['onslaught','serpent','spider-slayer-j-jonah-jameson','mojo'],note:'The source plan was published as a four-champion core. Do not invent a fixed fifth member; use the slot for Collector insurance or a route-specific weakness.'},
 routePlans:[
  {name:'Easy Path / Path 1',status:'featured-plan',sequence:['Thing','Omega Red','Quake','Medusa','Mephisto','Captain Marvel (Movie)','Ghost','Iron Man (Infinity War)','Joe Fixit','Mordo','Venom the Duck','Howard the Duck','Hyperion','The Champion','Cyclops','Loki','Ægon','Invisible Woman','Cull Obsidian','Nameless Collector'],note:'This route supports the featured Purgatory soul plan. Changing routes also changes where the required souls can be collected.'}
 ],
 fights:[
  ['Thing','she-hulk-deathless',[],'Use Deathless She-Hulk as the featured opener and preserve Purgatory for soul targets.','Do not spend Purgatory before the soul route begins.'],
  ['Omega Red','purgatory',[],'Take the knockout with Purgatory to secure the Mutant soul.','The soul is part of the Collector setup, not optional flavor.'],
  ['Quake','attuma',[],'Use Attuma as the featured Quake answer and avoid diverting Purgatory from her route setup.','Maintain the Abyss-specific fight mechanics rather than treating Quake as a normal defender.'],
  ['Medusa','purgatory',[],'Use Purgatory for the knockout and collect the Cosmic soul.','Track the soul acquisition before moving on.'],
  ['Mephisto','purgatory',[],'Use Purgatory to secure the Mystic soul; Incinerate pressure was reported as manageable in the featured route.','Do not accidentally give the knockout to a backup if you need the soul.'],
  ['Captain Marvel (Movie)','purgatory',[],'Use Purgatory as the featured buff-control answer and preserve the soul route.','Watch Energy damage if the fight drags.'],
  ['Ghost','purgatory',[],'Take the knockout with Purgatory to secure the Tech soul.','This is a key part of the Collector setup.'],
  ['Iron Man (Infinity War)','knull',[],'Use Knull for the first IMIW-style Tech roadblock.','Preserve enough health for later Tech assignments.'],
  ['Joe Fixit','she-hulk-deathless',[],'Use Deathless She-Hulk and keep the fight stable through his card/regen variance.','Do not rely on a lucky card roll.'],
  ['Mordo','attuma',[],'Use Attuma as the featured Mordo answer.','Respect Mordo’s defensive timing instead of forcing Parry patterns.'],
  ['Venom the Duck','purgatory',[],'Use Purgatory, but expect a long fight and watch increased Ability Accuracy if the fight reaches later Skirmish cycles.','Neutralize becomes less reliable if the fight drags.'],
  ['Howard the Duck','knull',[],'Use Knull for the featured Tech assignment.','Keep a second Tech answer healthy if your route differs.'],
  ['Hyperion','purgatory',[],'Use Purgatory to control the buff-heavy Cosmic fight.','Do not let Power Gain dictate the whole tempo.'],
  ['The Champion','purgatory',[],'Use Purgatory and keep Unstoppable/buff control central to the plan.','Avoid turning this into a raw damage race.'],
  ['Cyclops','she-hulk-deathless',[],'Use Deathless She-Hulk without overusing the Wither shortcut if it stops the Special cycle you need for Trauma.','Keep the intended Trauma build moving.'],
  ['Loki','purgatory',[],'Use Purgatory as the featured Mystic assignment.','Manage Power safely; the route is already long enough without an SP3 mistake.'],
  ['Ægon','purgatory',[],'Take this knockout with Purgatory to secure the Skill soul before Collector.','This is the crucial Skill-soul opportunity on the featured path.'],
  ['Invisible Woman','she-hulk-deathless',[],'Use Deathless She-Hulk and maintain enough debuff presence to keep Power Sting expiry manageable.','Do not launch Specials into an active Power Sting.'],
  ['Cull Obsidian','she-hulk-deathless',['knull'],'Use Deathless She-Hulk as the safer featured choice; Knull is an optional backup.','Do not use Neutralize in a way that prevents buffs needed for buff-removal damage.'],
  ['Nameless Collector','purgatory',['onslaught','serpent','spider-slayer-j-jonah-jameson'],'Use the prepared soul package for high passive Slow uptime and sustain. Keep the flex slot or another surviving attacker as insurance.','Reaching the boss without the Skill and Tech souls weakens the entire reason for this route.']
 ],
 finalBoss:{name:'Nameless Collector',primary:['purgatory'],backup:['onslaught','serpent','spider-slayer-j-jonah-jameson'],plan:'Arrive with Purgatory’s planned souls already collected. Use passive Slow and sustain to manage Unstoppable/Tenacity, while keeping the flex slot as a second boss plan rather than an unused synergy slot.',failurePoints:['Missing the Ægon Skill soul','Using another attacker for a planned soul knockout','Choosing a flex champion that adds no Collector or route coverage']},
 planSource:'https://www.reddit.com/r/ContestOfChampions/comments/1s9lp8g/good_v_evil_carinas_challenges_4_abyss_villains/'
}
];
