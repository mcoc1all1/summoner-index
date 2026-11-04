# Commercial-content remediation status — 4 November 2026

**Disposition: public, ad-free beta only. Not commercial-use clearance.**
This update reduces the identified MCOC Scout compilation-mirroring risk, but is not a legal conclusion about the underlying gameplay facts, trademarks, third-party summaries, or Google AdSense eligibility.

## Controls now applied when PUBLIC_BETA=1

1. Full ability/protection lists and community relic pairings originating in each champion's `referenceFacts` are withheld from generated HTML and JSON. The source URL, reference date and links remain.
2. Source-linked `loadout.battlecastId`, `loadout.statcastId`, and `relicIds` are withheld in the public copy. Stat Focus trials are separate editorial research and retain their existing eligibility/review limitations.
3. `dist/catalog.json` and all route-specific `catalog-*.json` files are built from a publication-filtered dataset. The normal research source `content/catalog.json` is unchanged and is not copied to the public deployment.
4. The public content-workbench page is removed after building. Source editors remain usable locally.
5. The live Pages workflow runs `scripts/check-beta.mjs`, which now fails if a source list or relic pairing reappears in public JSON or if a champion page lacks its link-only kit reference.

These checks are specific to the known source-compilation risks. They do **not** label unrelated source-dependent material as cleared, and they do not grant any third-party reuse permission.

## Outstanding issues — do not enable ads yet

| Issue | Current state | Required for commercial review |
|---|---|---|
| CR-01 Scout compilation | Public bulk reference lists and pairings withheld; links retained | Review any remaining substantively replicated selections, or obtain written permission |
| CR-02 Source-rights inventory | Older 27 October host-level audit is stale | Regenerate an inventory from the complete merged build, including patch sources, field-level origins, and licensing decisions |
| CR-03 Boss-guide expression | Gwenmaster, Kang, Scytalis, Bahamet and other guides still require complete passage comparison | Independently check each high-traffic guide against cited writing; revise specifically identified text, or license as needed |
| CR-04 Fandom | Source links preserved, adaptations not individually classified | Check each adapted passage for CC BY-SA licensing, author attribution, change notice and applicable share-alike |
| CR-05 Third-party compilations | MCOCHUB, mcoc.help and others cited; not declared licensed | Separate factual mechanics from copied compiled arrangement or expressive text |
| CR-06 Stat Focus | Editor hypotheses remain source-linked and not independently gameplay-tested | Add champion-specific reasoning, alternate choices, and testing evidence; review bulk borrowed ranking patterns |
| CR-07 Art and media | Initial-based portraits, original SVGs and outbound video links retained | Re-review if new copyrighted game artwork or external media is introduced |
| CR-08 Trademark | Independent fan-project disclaimer retained | Avoid official-looking branding or statements implying endorsement |
| CR-09 Ads and release | Public beta is still noindex for most guide pages; no advertising enabled | Separate ad-policy, privacy, consent, domain, and SEO release approval before enabling monetization |

## How to validate the source restriction

```sh
npm test
SITE_ORIGIN=https://mcoc1all1.github.io SITE_BASE_PATH=/summoner-index PUBLIC_BETA=1 npm run build
SITE_BASE_PATH=/summoner-index node scripts/check-beta.mjs
```

**Important:** Neither a successful build nor a lack of visible infringement establishes permission to monetize. Keep the `PUBLIC_BETA=1` safeguard in place while rights review is pending. The repository's separate `npm run release:check` gate covers selected pilot boss content, not all published site material.
