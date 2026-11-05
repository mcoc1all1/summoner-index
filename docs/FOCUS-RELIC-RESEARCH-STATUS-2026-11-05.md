# Stat Focus and Relic Research — 5 November 2026

**Status: expanded source-reviewed editorial trials, not complete combat certification or commercial source clearance.**

This pass is deliberately separated from the earlier source-compiled relic shortlist. It does **not** restore unpublished pairing arrays, guess Statcast primary/secondary variants from their statue names, or claim a 7-star Relic is objectively better than a 6-star Battlecast.

## What was completed in this pass

1. **71 existing Stat Focus recommendations** that previously relied on generic or missing champion explanations now have a dated, source-linked *attacker-versus-alternative* and *defender-versus-alternative* comparison. Rationale is keyed to the champion's actual previously reviewed combat sequence, likely resource bottlenecks and mismatched defensive stats. These are A/B plans, not new fight measurements. Crossbones's Critical Rating is explained as would-be critical hits becoming Fury, and Guillotine 2099's as the basic-attack Degeneration chance rather than ordinary critical damage.
2. **30 additional eligible 7-star champions** received original attacker and defender Focus explanations with a competing stat and specified fight condition. New reviewed trials include Nimrod, Kitty Pryde, Archangel, Absorbing Man, Abomination (Immortal), Agatha Harkness, Claire Voyant, Blue Marvel, Cassie Lang, Chee'ilth, Colossus (Age of Apocalypse), Count Nefaria, Cyclops (Blue Team), Daredevil (Hell's Kitchen), Dark Phoenix, Doctor Strange, Dracula, Ghost Rider, Gwenom, Hulkling, Hyperion, Ironheart, Jean Grey, Knull, Medusa, Nick Fury, Sandman, Scorpion, Spider-Woman and Spider-Gwen.
3. **One publisher-explicit focus choice:** Green Goblin (Stellar Forged) uses Kabam's stated offensive Adrenaline-or-Armor-Rating alternatives and defensive Block Penetration as editorial trial candidates, with no unsupported numerical improvement claim.
4. **12 original Relic attribute-comparison plans**: Hulkbuster, Kingpin, Guardian, Shuri, Lady Deathstrike, Jack O'Lantern, Mister Negative, Tigra, Guillotine (Deathless), Green Goblin (Stellar Forged), Jean Grey and Spider-Woman. Each records the target stat, Battlecast-vs-Statcast tradeoff, matching fight-test procedure, scope limitation and dated sources. Only the **Hulk Battlecast for Green Goblin (Stellar Forged)** is named as a publisher-recommended individual pairing.

The expected assembled-data totals, subject to CI: **139 source-reviewed Stat Focus trials**, **193 withheld drafts**, including approximately **132 already-eligible champions awaiting specific review**, and **12 original relic-attribute trials**. The other previously reviewed recommendations have not been measured by us. These counts measure *review records*, not confirmed best-in-slot optimization.

## Research decisions that must remain visible

- Stat Focus applies to eligible **7-star champions**; do not infer eligibility solely from an older roster tier or the relic's own rarity.
- Critical Rating, Critical Damage Rating, and Special Damage can affect **different hit channels**. Critical stats do not automatically increase damage-over-time ticks. Crossbones converts potential critical events into Fury, and Guillotine 2099 uses Critical Rating for ordinary basic-hit Degeneration chances.
- **Block Proficiency, Armor Rating and resistances** are survival options under relevant incoming damage. These do not turn into outgoing attack multipliers merely because the champion uses a long ramp.
- Defensive **Armor Penetration, Block Penetration and Special Damage** address *outgoing defender pressure*, not defensive mitigation. Use a matched attacker, node and defensive sequence to compare with a resistance or block setting.
- **Battlecasts and Statcasts occupy one binding slot**; you cannot use both simultaneously on one champion. Battlecast rune utility and Statcast attributes must be compared at a stated rank, rarity, secondary attribute and rune state. Kabam's later update confirms Statcasts operate on defense in PvP while Battlecasts do not.
- Statcast **statue identity is not the exact variant**. The current 52-record local relic directory is not a comprehensive list of Statcast primary/secondary combinations. A desired attribute must be checked on the actual owned in-game item.
- Community databases are useful to locate sources or form hypotheses, but **a public copy of their compiled champion-to-relic mappings is not permitted by this research**. Named pairings require direct, specific publisher support and explicit validation. No third-party relic labels or kit lists were imported back into public HTML/JSON.

## Remaining research and approval work

- **193 Stat Focus drafts remain withheld.** Roughly 132 of these concern currently eligible 7-stars. Each needs specific attack/defense reasoning, any actual recent kit changes, and a verified way to compare the alternative before promotion.
- **322 of 334 champion records** still lack an independently authored relic attribute-comparison plan; even the twelve new plans have not had their exact owned Statcast variant or Battlecast rune independently tested. Specific rune trigger, secondary stat, rarity, rank, investment and matchup interactions must be checked.
- No matchup time trials, in-game before/after tests, source-expression license approvals or AdSense clearance were performed. Existing privacy, rights and publication safeguards remain in force. If new reports contradict an editorial trial, correct or withhold the trial rather than increase confidence.
- Extend the public UI only with source-linked **original** comparisons, not original imported Scout or community pairing IDs; the existing source catalog is still in a public GitHub repository and the private-source migration remains uncompleted.

## Source anchors

- Kabam [Attacker and Defender Stat Focus balance note](https://forums.playcontestofchampions.com/en/discussion/397890/balance-update-to-attacker-defender-stat-focus/p1) — adjustments should not remove the identity of a matchup.
- Kabam [Statcast Relic developer diary](https://forums.playcontestofchampions.com/en/discussion/398489/dev-diary-statcast-relics/p1) — primary/secondary variants, one slot, and examples involving Guardian, Shuri, Jack O'Lantern, Hulkbuster, Kingpin, Lady Deathstrike, Tigra, Mister Negative and Deathless Guillotine.
- Kabam [Relics defensive activation update](https://forums.playcontestofchampions.com/en/discussion/403822/relics-titan-and-war-compensation-and-other-quick-updates) — Statcasts on defense, Battlecasts not.
- Kabam [Green Goblin (Stellar Forged) spotlight](https://playcontestofchampions.com/news/champion-spotlight-green-goblin-stellar-forged/) — explicit Focus options and Hulk Battlecast recommendation.
- Kabam [Crossbones critical replacement reference](https://forums.playcontestofchampions.com/en/discussion/28174/is-the-champion-spotlight-for-crossbones-still-available) — Fury rather than natural criticals.
- [Guillotine 2099 kit reference](https://www.mcoc.help/champions/guillotine-2099/) — natural critical restriction and critical-rating-dependent Degeneration chance (third-party fact-checking only; no copied ability text).

## Validation and deployment

Run `npm test`, `npm run build`, `npm run rights:inventory` and the GitHub Pages public-beta source-integrity check in CI. The new tests require source-linked rationales, exactly twelve independent relic trials and no newly exposed third-party pairing list. Do not merge on a failing test. The champion enrichment automation stays disabled, and no AdSense or indexing changes are authorized by this work.
