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

Every nonpilot champion joins a deterministically ranked work queue divided into **20-champion batches**. Batch order considers missing decision notes and rotations, the depth of utility and scoped protection research, demand from recorded counter matchups, and whether it is a special roster-only identity. The two special identity records are excluded from publication work until identity and current-game eligibility can be verified; they remain in the tracker.

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
