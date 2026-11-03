# Summoner Index — research provenance follow-up (4 November 2026)

**Status:** editorial review queue only. These counts are NOT findings of inaccurate gameplay data, plagiarism, copyright infringement, or an obligation to license game facts.

## What was inspected

- `content/immunity-roster-audit-patches.json` adds **86 champion/effect pairs** across **55 champion patches**. **85 of those new pairs have no explicit activation/form scope record in that patch**. Existing base data or other patches may already contain a reviewed scope. Cross-check the *merged* catalog before concluding a claim is unreviewed.
- The six `stat-focus-*-reviewed-*-patches.json` / current-refresh files contain **116 champion Stat Focus recommendation entries**. **115 lack a champion-specific attack and defense rationale in those recommendation records**, relying on a generic community-corroboration fallback. This is not evidence the settings are incorrect.
- The source lists include community databases, player reports and official spotlights. Their use as *evidence* does not itself authorize reuse of protected writing or compilations; source attribution does not establish a gameplay test.

## Safe remediation

1. **Immunity scope:** For each flagged effect, inspect the merged champion record and cited underlying gameplay mechanics. Record `forms`, `availability`, `condition`, `checkedAt` and claim-specific `sourceIds` only after verification. Until then, do not promote a source-listed protection to always-on immunity.
2. **Stat Focus:** Keep provisional source-linked choices as starting points. Where possible document the champion's kit interaction, alternative choice and game mode. Do not mark a community selection "gameplay-tested" without a recorded test.
3. **Source-expression comparison:** Compare the high-priority boss guide prose with each source before clearing rights review. The encounter's natural phase order and ordinary mechanic names are facts, not by themselves evidence of copying.
4. **Do not delete the catalog:** Retain accurate factual records and citations unless an individual claim is disproven or restricted reuse of protected expression is identified.

## Repeatable report

Run `node scripts/provenance-review.mjs --summary` for counts or `node scripts/provenance-review.mjs` to print each record. This report checks metadata in the originating patch, not the complete accuracy of the assembled champion data.

**Next manual checks:** prioritize broad terms such as Buff, Nullify, Stun and Reversed Controls (which often have precise limitations) and the most prominent Stat Focus recommendations. Resolve one claim at a time with evidence; never infer absent protection merely because a source did not list it.
