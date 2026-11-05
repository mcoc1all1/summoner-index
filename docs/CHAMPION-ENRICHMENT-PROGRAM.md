# Champion enrichment program — entire roster

This is a **source-linked editorial research plan**, not an automatic assertion that a champion does or does not possess a mechanic.

## Baseline from production build on 4 November 2026

- **334 public champion records**, including **332 profiles with 3 recorded rotation steps** and two roster/identity exceptions: Summoned Symbioid and Ghost Rider (Robbie Reyes).
- **10** profiles already contain original decision-focused Field Notes (3 each), so **324** do not.
- **180** records have **no individually scoped protection claim** published. This does **not** mean they lack immunities.
- **37** profiles have reviewed and publishable Stat Focus metadata. Unreviewed or ineligible recommendations remain withheld.
- Most profiles already have structured utility labels and concise strengths/risks; this project must **improve their accuracy and practical depth**, not count a generic three-step rotation as automatically sufficient.

The tracker is generated from the **assembled catalog with all patches applied**, rather than the older base source file:

```bash
npm run enrichment:audit
npm run enrichment:tracker
```

The second command writes `docs/champion-enrichment-tracker.csv` and `docs/champion-enrichment-tracker.json`. Both contain only public-safe counts, review states, references count, topic gaps and batch assignments. They do **not** export the imported ability/protection compilations, unpublished focus selections or any copyright-dependent source prose.

## Assignment and acceptance

Every nonpilot champion joins a deterministically ranked work queue divided into **40-champion batches** from 5 November 2026 onward (previous cohorts used 20). Batch order considers missing decision notes and rotations, the depth of utility and scoped protection research, demand from recorded counter matchups, and whether it is a special roster-only identity. The two special identity records are excluded from publication work until identity and current-game eligibility can be verified; they remain in the tracker.

For each champion in a batch:
1. Confirm the exact champion identity, current kit and relevant game version; check source references, prefer official source notes and cross-check contradictions.
2. Add at least two **champion-specific, player-actionable, independently worded** decisions (usually three) with cited evidence, required setup, relevant opponent/node limitations and date. Do not invent match results.
3. Correct structural utility tags where supported; never convert resistance, Purify, opponent-applied Buff Immunity, or synergy mechanics into unqualified always-on self-immunity.
4. Add a structured protection claim **only** with evidence of the relevant effect, form, condition and activation. Missing records may be valid gaps.
5. Keep copied third-party kit and relic compilations withheld; record original citations instead. Do not restore a bulk imported source list.
6. Run `npm test`, `npm run build` and the public-beta checks, and merge only a passing focused PR.

The tracker is refreshed after each merged batch. Scores measure **research priority, not combat strength**; scores will change when a batch is completed. The source catalog is still in a public repository and remains a separate migration task.

AdSense, domain, advertising, consent and indexing settings are excluded from this program.

## Batch 01 result — 4 November 2026

- Added **60 original, source-linked decision notes** across **20** priority-ranked profiles: Silk, Falcon, Magneto, Shang-Chi, America Chavez, Jean Grey, Spider-Ham, Negasonic Teenage Warhead, Knull, Omega Sentinel, Omega Red, Immortal Abomination, Chee'ilth, Sersi, Gorr, Namor, Shathra, Archangel, Ebony Maw and Gladiator.
- Cumulative decision-note coverage: **30 of 334** champion records (10 previous + 20 this batch).
- The other **302** non-exception records are queued for **16 additional batches** of up to 20; Summoned Symbioid and Ghost Rider (Robbie Reyes) remain identity/availability review exceptions.
- Batch 01 includes only original player-facing editorial decisions supported by existing cited kit references, not copied source ability lists or new unqualified immunities. These descriptions are **not** independently gameplay-tested.
- Refresh the sorted CSV/JSON tracker after this batch with `npm run enrichment:tracker`; positions re-rank as content coverage changes.

## Batch 02 result — 5 November 2026

- Added 60 unique, source-linked decision notes across 20 more profiles: Kate Bishop, Red Guardian, Vision (Aarkus), Cyclops (New Xavier School), Deadpool, Drax, Guillotine (Deathless), Hela, Hercules, Scarlet Witch (Classic), Wolverine, Wiccan, Ant-Man (Future), Doctor Strange, Gamora, Guardian, Iron Fist, Nova, Tigra and Havok.
- Cumulative profiles with new field notes: 50 of 334. Two special identity exceptions remain and 282 further profiles remain in the main queue (15 later batches of 20 or fewer).
- Notes incorporate official clarification where available (e.g. Ant-Man (Future) SP2 requiring active Power Detonation, Hercules Immortality interaction with SP3), and explicitly distinguish source-linked editor guidance from measured gameplay tests.
- Aarkus's 2026 community stream recap describes proposed changes, not verified live kit; the note says to verify against the installed kit. Existing structured protection records and third-party reference compilations remain unchanged.
- Rebuild the tracker after merge: `npm run enrichment:tracker`.

## Batch 03 result — 5 November 2026

- Drafted 60 distinct decision-focused notes for the next 20 priority champions: Sunspot, Absorbing Man, Galan, Hulkling, Enchantress, Domino, Hulkbuster, Aegon, Black Cat, Killmonger, Mantis, Mojo, Mordo, Spider-Gwen, Spider-Man (Classic), Spider-Man (Supreme), Symbiote Supreme, Wasp, Corvus Glaive and Mister Sinister.
- Cumulative enriched profiles on successful merge: **70 of 334**. The nonexception queue becomes **262 profiles** across **14 batches** of 20 or fewer; two roster/identity exceptions remain.
- Source-linked explanations focus on action decisions, tradeoffs, and matchup mechanics. They do not assert independent gameplay tests, universal ability coverage, precise numerical performance or protected third-party kit reuse. Continue independently checking current versions and contradictory kit reports during future passes.

## Batch 04 result — 5 November 2026

- Prepared **60 original, source-linked field notes** for the next 20 high-priority champions: Colossus, Iceman, Beta Ray Bill, Kitty Pryde, Electro, Peni Parker, Photon, Rintrah, Emma Frost, Ironheart, Mephisto, Mysterio, Red Hulk, Shuri, Korg, Nimrod, Sentinel, Thing, Anti-Venom and Attuma.
- At successful merge: **90 of 334** records will have field notes, leaving **242** non-exception profiles across **13** further batches, plus **two** identity-review exceptions.
- Sources include existing champion reference links and seven additional Kabam or current community reference URLs. Official spotlight landing pages were only usable as links during research, not as readable full ability text. Commentary and older balance proposals are labeled as version context, not independent gameplay testing.
- Reviewed caveats include Colossus's conditional Armor Break interaction, awakened Kitty's Phase safety, Iceman's Ice Armor spend, Mysterio's helmet dependency, Nimrod's contested 2026 signature wording, and Shuri's tuned Shock ramp.
- No private source compilations, third-party ability text, unsupported full-immunity claims or relic shortlists are republished. The notes remain source-linked editorial guidance, not verified optimal gameplay.

## Batch 05 result — 5 November 2026

- Added **60 original fight-decision notes across 20 further profiles** in four small patch files: Scorpion, Titania, Void, Vox, Abomination, Apocalypse, Captain Marvel (Classic), Ms. Marvel, Ms. Marvel (Kamala Khan), Nick Fury, Vision, Annihilus, Captain Marvel (Movie roster entry), Dust, Iron Man, Iron Man (Infamous), Jack O’Lantern, Kingpin, Magik and Sasquatch.
- Upon passing checks and merging, the cumulative target is **110 of 334** champions with source-linked Field Notes; **222 remaining eligible** across **12** further batches of up to 20, plus two identity/availability exceptions.
- These notes separate awakened from base abilities, distinguish similarly named champion variants and identify resource, timer, opponent and node limitations. They are original editorial guidance, not independent gameplay tests or reproduced ability lists.
- Existing public-safety restrictions on unreviewed Stat Focus, third-party kit compilations and relic pairings remain in force. AdSense and unrelated launch/indexing decisions remain untouched.
- Source links support ongoing research rather than establish in-game testing or content-reuse permission. Follow up when live kit wording changes.

## Batch 06 result — 5 November 2026

- Added **60 independent, source-linked fight-decision notes** for **20** roster entries: Terrax, Bishop, Hyperion, Crossbones, Dormammu, Dragon Man, Guillotine 2099, Hulk, Man-Thing, Medusa, Morningstar, Red Skull, Sauron, Vulture, Agatha Harkness, Agent Venom, Air-Walker, Black Bolt, Blade and Captain America.
- After passing checks and merging, cumulative field-note coverage becomes **130 of 334** champion records; **202 eligible profiles** remain in **11** subsequent batches, plus **2** roster-identity exceptions.
- The notes include conditional resource/setup checks, awakened-only caveats, effect immunities, and version-sensitive references. They are editorial interpretations rather than independently benchmarked fight results, verified optimal rotations or copied ability lists.
- **Beast deferred** from this round: Kabam announced a November 2026 Beast update; existing older Freestyle/Acrobatic rotation content should not receive a new endorsement until the live rework/buff kit is checked. An additional candidate, Captain America, takes the twentieth slot.
- Existing third-party kit/relic compilations remain withheld. The existing legal audit, AdSense, indexing and domain settings are not changed by this content batch.

## Batch 07: doubled cohort — 5 November 2026

- The standard audit queue and scheduled enrichment handoff now prioritize **40 champions per batch**, doubling the prior 20-profile cohort. Individual patch files remain small so each champion can be reviewed and fixed without broad changes.
- This batch adds **120 new original, source-linked fight decisions across 40 profiles**: Captain America (WWII), Cassandra Nova, Cosmic Ghost Rider, Cyclops (Blue Team), Daredevil (Classic), Darkhawk, Dazzler, Deadpool (X-Force), Diablo, Doctor Octopus, Dracula, Elektra, Gambit, Gentle, Ghost, Green Goblin, Groot, Hulk (Ragnarok), Ikaris, Iron Fist (Immortal), Iron Man (Infinity War), Iron Patriot, Isophyne, Kang, Kindred, King Groot, Loki, Madelyne Pryor, Magneto (House of X), Mangog, Masacre, Nebula, Nico Minoru, Nightcrawler, Northstar, Odin, Pixie, Professor X, Proxima Midnight and Psycho-Man.
- After validation and merge, cumulative field-note coverage should be **170 / 334**: **162 eligible profiles** remain across **5 batches** of up to 40, and **two** identity-eligibility exceptions continue separately.
- **Beast remains deferred:** announced November 2026 rework replaces the old Freestyle/Acrobatic model; current notes should be authored from the verified released kit rather than republishing outdated source advice. Later queue assignments should keep Beast visible.
- These are independently worded editorial interpretations of referenced mechanics with resource, activation, matchup and version caveats. They are **not independent gameplay tests, guaranteed optimal rotations, or comprehensive per-champion kit verifications**. Missing protection records and unreviewed Stat Focus still require separate provenance work.
- The previous commercial-rights remediation safeguards remain active. No AdSense, advertising, indexing, private-source publication, boss guide or repository visibility settings were changed by this cohort.
 
## Batch 08: 40 champion profiles — 5 November 2026

- Drafted **120 original player-decision notes** for **40** additional champion profiles, in eight independently reviewable patch files: Psylocke, Punisher 2099, Purgatory, Quake, Rocket Raccoon, Rogue, Ronan, Sabretooth, Spot, Star-Lord (Stellar Forged), Thanos, Thor, Unstoppable Colossus, Vision (Age of Ultron), Yellow Jacket, Adam Warlock, Ant-Man, Arcade, Arnim Zola, Baron Zemo, Bastion, Black Panther, Black Panther (Civil War), Black Tarantula, Black Widow, Black Widow (Claire Voyant), Black Widow (Deadly Origin), Blade (Stellar Forged), Blue Marvel, Cable, Captain America (Infinity War), Captain America (Sam Wilson), Captain Britain, Carina Tivan, Carnage, Cassie Lang, Civil Warrior, Colossus (Age of Apocalypse), Count Nefaria and Cull Obsidian.
- When checks pass and the PR merges, cumulative field-note coverage becomes **210 of 334**: **122** eligible profiles remain in **4** batches of up to 40, plus the same **2** special roster identity exceptions.
- Source context includes official Kabam champion spotlight links for Carina Tivan, Blue Marvel, Blade (Stellar Forged) and Colossus (Age of Apocalypse), plus a Kabam balance update for Arnim Zola. The Colossus entry carefully labels a community complaint about double-tap Steel Burst timing as player-reported, not a verified universal failure.
- **Beast** is still queued for version-specific review because its November 2026 updated kit supersedes the older Freestyle/Acrobatic content in the current source catalog. Its profile is not falsely marked complete.
- These notes are original **editorial interpretations**, not verified optimal rotations, independent in-game testing, or legal clearance to republish external ability texts. They keep conditional activation, opponent/node limitations, signature states and resource tradeoffs visible. The separate Stat Focus, immunity, boss rights, publisher-source migration and AdSense workstreams are not changed.
- After merge, refresh the assembled-catalog audit using `npm run enrichment:tracker`; the tracker counts note presence, not independent factual verification or clearance of every ability.

## Batch 09: manual 40-champion cohort — 5 November 2026

- Added **120 original, source-linked player-decision notes for 40 further profiles**: Dani Moonstar, Daredevil (Hell's Kitchen), Dark Phoenix, Doctor Bong, Doctor Voodoo, Elsa Bloodstone, Falcon (Joaquin Torres), Franken-Castle, Ghost Rider, Goldpool, Green Goblin (Stellar Forged), Guillotine, Gwenom, Gwenpool, Hawkeye, Heimdall, High Evolutionary, Hit-Monkey, Hobgoblin, Howard the Duck, Hulk (Immortal), Imperiosa, Invisible Woman, Jabari Panther, Jessica Jones, Joe Fixit, Jubilee, Juggernaut, Karnak, Karolina Dean, King Groot (Deathless), Kraven, Lady Deathstrike, Lizard, Longshot, Luke Cage, Lumatrix, M'Baku, Maestro and Mister Fantastic.
- On a passing build and merge, cumulative note presence becomes **250 of 334 champion records**, with **82 eligible profiles** left across **3 batches** of up to 40, plus **2** separately reviewed identity exceptions.
- Current supporting sources include Kabam's Green Goblin (Stellar Forged) spotlight, the official Falcon (Joaquin Torres) balance discussion and community-labelled recaps for Gwenom and Imperiosa. Previously attached champion-specific references remain linked. These citations explain editorial provenance; they do not attest to independent live game testing.
- **Beast remains queued** for a version-specific follow-up because its November 2026 release/buff changes the earlier Freestyle and Acrobatic rotation in the base catalog; do not count obsolete kit directions as current without review.
- Coverage here means three written decisions with valid source identifiers, **not proven accuracy of every kit interaction, complete immunity reviews, guaranteed optimal rotations or rights clearance**. Existing blocked third-party kit compilations and withheld Stat Focus research stay unpublished.
- **Execution mode:** the separate scheduled champion-enrichment automation was disabled at the user's request. Continue later research only when prompted in the conversation; keep the 40-champion cohort, tests and staged merging, without restarting scheduling.
- No AdSense, indexing, advertising, source-rights bypass, site visibility or boss research changes are part of this PR.

## Batch 10: manual 40-champion cohort — 5 November 2026

- Drafted **120 original, source-linked fight decisions across 40 further champions**: Mister Negative, Misty Knight, MODOK, Mole Man, Moon Knight, Moondragon, Morbius, Mr. Knight, Night Thrasher, Okoye, Old Man Logan, Patriot, Phoenix, Phyla-Vell, Platinum Pool, Prowler, Punisher, Quicksilver, Red Goblin, Rhino, Ronin, Ruby Thursday, Sandman, Scarlet Witch (Sigil), Scream, Sentry, Shatterstar, She-Hulk, She-Hulk (Deathless), Silver Centurion, Silver Sable, Silver Samurai, Silver Surfer, Solvarch, Sorcerer Supreme, Spider-Man (Stark Enhanced), Spider-Man (Miles Morales), Spider-Man (Pavitr Prabhakar), Spider-Man (Stealth Suit) and Spider-Man (Symbiote).
- On a successful test run and merge, cumulative field-note coverage will be **290 of 334 profiles**, with **42** eligible champion records remaining in two cohorts and **two** separate roster-identity exceptions.
- The batch adds a first-party Kabam Shatterstar spotlight and labels player-reported Solvarch performance and Silver Samurai combo-shield timing separately from documented game mechanics. Source-linked editorial notes should not be mistaken for live test results or guaranteed optimal performance.
- **Beast remains queued**: the official November 2026 update announces a rebuilt kit, with general release scheduled for **19 November 2026**. As of this batch's date, the old Freestyle/Acrobatic guide is version-sensitive, and the forthcoming Rupture/Uncanny/Daunted kit should not be represented as a tested live attacker rotation.
- As before, missing scoped protection data must not be interpreted as absence of immunities. Unapproved Stat Focus, externally compiled kit descriptions, relic imports and any content awaiting separate rights review remain withheld.
- The user requested manual, on-demand progress: **the champion-enrichment automation remains disabled**. No AdSense, domain, indexing, publication visibility, boss research or automated schedule changes are in this batch.

## Batch 11: manual 40-champion cohort — 5 November 2026

- Drafted **120 original, source-linked fight decisions for 40 champions**: Spider-Man 2099, Spider-Man Noir, Spider-Punk, Spider-Slayer (J. Jonah Jameson), Spider-Woman, Spiral, Squirrel Girl, Star-Lord, Storm, Storm (Pyramid X), Stryfe, Super-Skrull, Superior Iron Man, Taskmaster, Thanos (Deathless), The Champion, The Destroyer, The Hood, The Leader, The Maker, The Overseer, Thor (Jane Foster), Thor (Ragnarok), Toad, Ultron, Ultron (Classic), Valkyrie, Venom the Duck, Venompool, Vision (Deathless), Viv Vision, War Machine, Wave, Werewolf by Night, White Tiger, Winter Soldier, Wolverine (Weapon X), Wolverine (X-23), Wong and Yelena Belova.
- On successful automated checks and merge, cumulative Field Note presence should reach **330 of 334 roster records (98.8%)**. **Beast** and **Yondu** remain eligible but not enriched, and **two** separate roster-identity/eligibility exceptions remain uncounted.
- The published original notes are tactical editorial guidance, not independently gameplay-tested optimal rotations or permission to copy third-party kit lists. They highlight activation conditions, fight duration, signature benefits, node limitations and immunity checks without treating missing reference data as proof that a protection does not exist.
- First-party supporting references include Kabam's v59.0 release notes (Spider-Man Noir Crumble fix) and The Champion spotlight. A May 2026 Wave recap is explicitly **community-reported**. For The Maker, an older *unofficial fan concept* found on the forums is intentionally excluded as an authoritative source.
- **Beast** remains deferred pending verification against his scheduled November 19, 2026 revised kit, rather than copying the outdated Freestyle/Acrobatic rotation. The remaining Yondu entry and both identity exceptions need their own scoped review.
- The user-requested champion-enrichment automation remains **disabled**; work is performed only when explicitly continued in chat. This batch does not change AdSense preparation, indexing, rights safeguards, Stat Focus publication, repository visibility, or boss content.

## Batch 12: Yondu and Robbie Reyes, with historical exception audit — 5 November 2026

- Added three original, source-linked fight decisions for **Yondu** based on his Yaka Arrow, Armor/Prowess removal, SP1 healing and power control, and SP2 Fury tradeoffs. This does not imply independent damage testing.
- Added three source-linked fight decisions and an original three-step, current-kit rotation for **Ghost Rider (Robbie Reyes)**. His October 2026 source-supported Speed, Gear Shift, Energy Vulnerability, Soul Barb and Ignition interactions are distinguished from signature-only starting resources.
- Added a **source-validated rotation patching mechanism** that permits a missing rotation to be completed only with dated sources, a substantive scope note and adequately detailed steps; it refuses silent replacement of an already existing rotation.
- Once tests pass and merge, the tracker should show **332 / 334 enriched profiles (99.4%)**, **one queued** ordinary champion (**Beast**), and **one separate historical identity exception** (**Summoned Symbioid**).
- **Beast remains intentionally queued.** The revised kit is publicly previewed, but its November 19, 2026 rollout has not occurred on this review date. Earlier Freestyle/Acrobatic advice is version-sensitive and must be revised against the released kit rather than being carried forward as verified.
- **Summoned Symbioid is not a conventional current-rarity champion guide.** Kabam's [2018 event announcement](https://forums.playcontestofchampions.com/en/discussion/98828/the-my-little-symbiote-event) describes a temporary, one-star, Universal-class event champion and uses both Symbioid and Symbiote terminology. Historical event identity and upgrade restrictions must be settled before assigning a normal current 7-star Stat Focus, relic pairing or rotation. It remains an explicit exception, not a falsely complete guide.
- This milestone measures source-linked **Field Note presence**, not full champion kit accuracy, complete immunity protection reviews, independent gameplay testing or copyright clearance. Existing safe publishing gates continue unchanged, and **AdSense preparation remains excluded**.
- The user-disabled champion enrichment automation remains **off**. No scheduled task, indexing, repository visibility, or monetization settings are changed.
