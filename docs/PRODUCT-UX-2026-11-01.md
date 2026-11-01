# Decision-focused UX release — 1 November 2026

Continues main commit 29ece727 without changing the data collection or deployment architecture.

- Six primary destinations; new Guides and Tools hubs preserve existing routes.
- Searchable opponent picker distinguishes boss variants by chapter.
- Counter cards expose the reason, plan, conditions, awakening/signature, mode and risks. Evidence remains expandable.
- Automatic roster grouping, with unmet known requirements kept separate from eligible owned options.
- Immediate ownership saving; optional rarity, rank and ascension added to the existing version-1 backup format. Existing ownership/awakening/signature values remain compatible. Optional metadata does not infer power or quest eligibility.
- Champion quick summaries, boss preparation and counters before the fight loop, and Carina team jump links.
- Loadout search moved above educational material; compact global beta indicator.
- Strict immunity-plus-utility search supports “Poison immune with power control”; immunity matching does not use resistance text.
- Mobile navigation wraps into six visible choices; gameplay text is larger.

Validation: 97 automated tests passed; beta build checks 746 HTML files and project-relative module links. Browser checks cover counter search, ownership persistence, optional build persistence, owned-only filtering, champion filtering, save/remove shortlist, compare URL, combined search, loadout filtering, guides and Carina pages. Representative phone checks at 390 × 844 found no document overflow. Temporary roster and shortlist additions were removed without clearing existing local data.

Remaining limits: untested matchups, incomplete named counter coverage, missing exact awakening/signature thresholds, no node-aware ranking, and no performance-based ranking from optional rank/ascension notes. Data and current-client evidence, rather than extra UI scores, are the next priority.
