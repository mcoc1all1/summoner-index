# Summoner Index — research provenance follow-up (4 November 2026)

**Status:** editorial review queue only. These counts are NOT findings of inaccurate gameplay data, plagiarism, copyright infringement, or an obligation to license game facts.

## What was inspected

- `content/immunity-roster-audit-patches.json` adds **86 champion/effect pairs** across **55 champion patches**. **85 of those new pairs originally had no explicit activation/form scope record in that patch**. A separate reviewed follow-up records six scoped additions plus removal of The Serpent's broad Death immunity ID, leaving **78 flagged origin-patch claims requiring follow-up**. Existing base data or other patches may already contain a reviewed scope. Cross-check the *merged* catalog before concluding a claim is unreviewed.
- The six `stat-focus-*-reviewed-*-patches.json` / current-refresh files contain **116 champion Stat Focus recommendation entries**. **107 still lack a champion-specific attack and defense rationale in those recommendation records** (eight prominent selections were given decision-specific explanations on 4 November 2026), relying on a generic community-corroboration fallback. This is not evidence the settings are incorrect.
- The source lists include community databases, player reports and official spotlights. Their use as *evidence* does not itself authorize reuse of protected writing or compilations; source attribution does not establish a gameplay test.

## Safe remediation

1. **Immunity scope:** For each flagged effect, inspect the merged champion record and cited underlying gameplay mechanics. Record `forms`, `availability`, `condition`, `checkedAt` and claim-specific `sourceIds` only after verification. Until then, do not promote a source-listed protection to always-on immunity.
2. **Stat Focus:** Keep provisional source-linked choices as starting points. Where possible document the champion's kit interaction, alternative choice and game mode. Do not mark a community selection "gameplay-tested" without a recorded test.
3. **Source-expression comparison:** Compare the high-priority boss guide prose with each source before clearing rights review. The encounter's natural phase order and ordinary mechanic names are facts, not by themselves evidence of copying.
4. **Do not delete the catalog:** Retain accurate factual records and citations unless an individual claim is disproven or restricted reuse of protected expression is identified.

## Repeatable report

Run `node scripts/provenance-review.mjs --summary` for counts or `node scripts/provenance-review.mjs` to print each record. This report checks metadata in the originating patch, not the complete accuracy of the assembled champion data.

**Next manual checks:** prioritize broad terms such as Buff, Nullify, Stun and Reversed Controls (which often have precise limitations) and the most prominent Stat Focus recommendations. Resolve one claim at a time with evidence; never infer absent protection merely because a source did not list it.

## Changes in this pass

- Scoped and linked **Peni Parker's Stun protection** to Sync-Shield state and synergy; this is not always-on immunity.
- Scoped **Titania's Bleed protection** to the Absorbing Man synergy.
- Documented **Bullseye's Fatigue protection** and **The Serpent's Fate Seal/Special Lock/Power Lock/Heal Block protection** while excluding The Serpent's Death Immunity buff from ordinary immunity filtering.
- Scoped **The Champion's regeneration-modification protection** to signature and final-node conditions. Historical node/kit differences remain relevant.
- Added champion-specific *editorial hypotheses* for eight commonly sought Stat Focus choices (Kushala, Onslaught, Serpent, Human Torch, Warlock, High Evolutionary, Black Panther (Civil War), Bullseye). **These are not experimental findings**, and the selections remain medium-confidence research starting points.

Updated source patches: `content/immunity-verified-20261104-patches.json` and `content/stat-focus-60-current-refresh-patches.json`.

## 4 November follow-up — effect-level protection and source limitations

- Added the **effect** form category to the domain validator, patch validator, UI filters and protection labels. Nullify, Fate Seal, Stagger, reversed controls and Buff immunity should not automatically be presented as debuff-only or passive-only effects. The form filter now includes **Other effects**.
- Added specific conditions for Red Skull's protection from **champion-sourced** Nullify, Fate Seal and Stagger (not all quest-node effects), Rintrah's Stun Immunity at 15+ Mystical Charges, Nick Fury's post-Decoy Stun Immunity and Auto-Block interaction, Juggernaut's Gem-dependent reversed controls protection, and Titania's self-Buff immunity with Neutralize caveat.
- Updated provenance queue to consolidate all `immunity-verified-*-patches.json` follow-ups. **71** originally broad immunity additions remain flagged for claim-level scope review (previously 78). This reduction means supporting conditions were recorded, not that independent gameplay testing was completed.
- These are research and editorial corrections, **not** clearance to copy website text or a universal assertion that a node can never bypass an immunity.

## 4 November follow-up — opposing Buff Immunity and effective Stat Focus coverage

- Corrected **Black Widow (Claire Voyant)** and **Nico Minoru**: their Buff Immunity ability is applied to the opponent and does not establish innate self-Buff immunity. Removed the misleading `buff` immunity IDs.
- Scoped **Nico Minoru** Poison/Rupture immunity to the Ward pre-fight spell, **Hulk** self-Buff/Nullify/Fate Seal/Stagger/Reversed Controls protection to named synergies, **Lizard** self-Buff immunity to his specials and Heal Block immunity to active Buff/Unstoppable, and **High Evolutionary** self protection only against opponent-granted Buffs. His Neutralize and Rupture protections are separately documented.
- Second batch resolves **13** more broad catalog assertions or removes misleading IDs. **58** original-patch immunity effects remain queued for individual review (down from 71). The report counts review metadata, not confirmed incorrect mechanics.
- Wrote eight more original, source-linked **Stat Focus test rationales** (Shang-Chi, Colossus, Corvus Glaive, Domino, Dust, Enchantress, Hit-Monkey, Titania). Recommended settings are unchanged; no measured gameplay claim has been added.
- Improved the audit to distinguish **124 historical recommendation patch entries** from **108 distinct champions' effective latest settings**. Of these latest entries, **91 still lack an explicit champion-specific attacker and defender rationale**. A raw count of missing older patch entries overstates the current live editorial queue because newer records override them.

The source-specific review state, current-client gameplay test status, and copyright/expression clearance remain distinct and are not certified by these patches.

## Fourth claim-scope batch — Armor Up, helmet state and synergy requirements

- Ironheart's Coldsnap and Reversed Controls protections are documented as conditional on an active Armor Up; the broad Ability Accuracy Reduction immunity ID was removed because the cited kit protects only narrower circumstances.
- Mysterio's Poison and Ability Accuracy Reduction protections depend on an intact helmet; his reversed-controls protection requires Emma Frost's Mental Immunity synergy.
- The Moondragon `death` label was removed because the cited effect is a situational Death Immunity/second-chance mechanic, not ordinary immunity to an incoming Death status effect.
- Bullseye's Precision protection is classified as an effect-level interaction, not an incoming debuff immunity.
- **51** originally unscoped broad immunity claims remain in the originating audit (down from 58). Documented corrections are not equivalent to independent gameplay testing, and any uncertain source claim stays subject to review.

## Further Stat Focus editorial rationale

- Added eight kit-specific trial explanations for Iceman, Havok, Baron Zemo, Bishop, Blade, Rintrah, Shuri, and Wiccan in `content/stat-focus-80-editorial-rationale-patches.json`.
- There are now **132 historical focus patch entries** but only **108 distinct current recommendations**; of the latter, **83** lack explicit champion-specific attack and defense explanations. The counter does not independently validate the recommendation itself.


## Fifth immunity batch — source / synergy boundaries

- Doctor Bong: recorded source-based Nullify and Power Sting protection as a **kit claim** with named scope; unrelated control mechanics not inferred.
- Crossbones: Nullify and Stagger require the **Hydra Recruitment** synergy and a qualifying Contempt interaction; not always-on standalone immunities.
- Prowler: reversed-controls immunity requires the **Spider-Punk synergy and selected pre-fight**; the pre-fight has an inverted-input tradeoff.
- The Hood: Stun immunity is **conditional on awakening and Invisibility**; no blanket Stun label.
- **45** original broad immunity records remain unresolved (previously 51); resolving provenance does not itself establish a verified current-client gameplay test or source-reuse permission.


## Further Stat Focus evidence review (round 9)

- Added eight kit-specific, **unverified comparison hypotheses** for Captain America (Infinity War), Carnage, Cassandra Nova, Dragon Man, Hulkbuster, Iron Man, Silver Surfer and White Tiger. Recorded focus selections remain the source-linked community choices; rationales identify eligible direct hits, setup prerequisites and mechanics that the focus cannot be assumed to modify.
- New effective-rationale backlog: **75 of 108** distinct current champion recommendations, not 75 confirmed wrong selections. Total historical patch entries increased to **140** because each revision is preserved for provenance.
- Source-checked means the cited kit was considered; current gameplay, reuse rights and actual stat calculations still require separate verification.


## Focus evidence pass — Shocker, Venom, Galan, Angela (4 November)

Four source-linked, independently worded attacker/defender Stat Focus explanations have been added in `content/stat-focus-95-editorial-rationale-patches.json`. Shocker's Critical Rating must **not** be described as increasing crit chance: his kit cannot crit and instead converts the stat into opponent Armor Rating reduction. Venom's crit chance can influence Bleed opportunity, while its incremental effect depends on active Precision; Galan's critical-hit trial must be distinguished from his Harvest payout; Angela's critical-hit frequency interacts with her active Huntress buff cycle. All four explanations include comparison conditions and defender-side alternatives. These are game-mechanics hypotheses, not independent gameplay test results or proof that the suggested option is best. The effective queue now contains **71 of 108** distinct recommendations needing individual rationales (previously 75). The source patch-history count is **144** entries, including superseded records.
