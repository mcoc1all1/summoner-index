# Rights remediation and source separation — 4 November 2026

## Status

- **Technical public-beta data filter:** corrected before rendering all pages and JSON, including hashed assets.
- **Generic Stat Focus notes:** The previous queue had **75** source-linked recommendations using a common generic rationale. Four (Shocker, Venom, Galan, and Angela) now have source-linked kit-specific editorial tests; **71** remain in the rationale backlog. The public build withholds the remaining generic entries until an individually researched attacker/defender explanation is approved; the canonical research notes are preserved. These are not 75 proven incorrect recommendations.
- **Boss-guide expression rights:** 4 prominent guides have pending manual reviews, not clearance. All other published boss guides must enter the same rights review. Run `npm run build && npm run rights:guides` for a current source-linked queue. `npm run rights:require-cleared` deliberately fails while any are pending. This is separate from gameplay accuracy.
- **Public GitHub source catalog:** STILL EXPOSED. `content/catalog.json` and historical commits are visible because this repository is public. Publication filtering does not fix GitHub source/history exposure.
- **Advertising/AdSense:** deliberately out of scope. Do not change consent, indexing, domain, or ads settings as part of this work.

## Source and guide expression spot checks

**Scytalis 8.1.6**: Compare `/bosses/scytalis` against [MCOC MX](https://mcoc.mx/game/boss/8-1-6/), the MCOCHUB ability reference and dated player reports. Both explain SP1/SP2 traps and health-bar phase progression; these are ordinary gameplay mechanics and natural encounter order, not proof of infringement. The public guide adds trap-arming diagnostics and knockdown troubleshooting in different explanatory prose. Further passage-level review and provenance are required before marking the written guide independently authored.

**Bahamet 8.2.6**: Compare `/bosses/bahamet` against [MCOC MX](https://mcoc.mx/game/boss/8-2-6/), the MCOCHUB ability reference and forum reports. Both discuss Volatility/Removal charges, reflected radiation and phase transitions. The public guide gives additional decisions, red-blast warnings and recovery steps; shared game labels are not necessarily protected. Translated or structurally copied expressive summaries remain a concern pending fuller review.

**Gwenmaster 7.2 and Kang 7.3**: Their original publication records are **pending** as of this review. They reference ability transcripts and player accounts. No author permission or license clearance has been established for protected expression. Do not infer clearance from a source URL, a paraphrase or the absence of externally hosted graphics.

**Artwork and media**: Current champion images use letter/initial placeholders and the site links externally to videos rather than embedding or rehosting them. Continue to avoid unlicensed Marvel character artwork and screenshots in the site build.

## Remaining third-party research rights

- MCOC Scout: do not republish its organized kit and relic compilation by default; keep external references and independently reviewed facts.
- MCOCHUB: published terms expressly reserve rights in its code/layout/data compilation. Do not treat public availability or citations as a redistribution license.
- Fandom: where *actual wiki text* is reproduced or adapted, check page-level license and exceptions, attribution, change marking and applicable share-alike obligations. Game-owned art/text may be separately protected.
- mcoc.help, AuntM.ai, player forum posts and other communities: document where facts end and distinctive source expression or compilation selection begins. An MIT code license does not necessarily license upstream content.
- Marvel/Kabam names and distinctive marks: the independent fan disclaimer is not a blanket authorization. Prefer generic original site imagery and do not imply endorsement.

Run `npm run rights:inventory` to regenerate host-level source provenance. Neither a source inventory nor a rights-check command grants permission.

## Why the private-source move remains blocked

The GitHub connector used for this work supports reading, branches, PRs and file edits, but not creating a new private repository or configuring repository visibility/actions secrets. Silently deleting `content/catalog.json` would break the current build **and** leave the same material accessible in Git history. A legitimate separation needs a new private development repository and a clean public publishing repository.

### Assisted first step (Windows)

Once you have GitHub CLI (`gh`) authenticated and have reviewed the script, run `powershell -ExecutionPolicy Bypass -File scripts/prepare-private-source.ps1` **from your own trusted local clone**. It attempts only to create a new *private* `mcoc1all1/summoner-index-source` repository and mirror all source branches/tags into it, refusing to overwrite an existing destination. It verifies that the destination is private before copying the research data. The script does **not** change the existing public site or public history. The later publishing cutover remains a separate operation.

### Safe migration procedure (requires the repository owner's account)

1. Make a complete local backup of `mcoc1all1/summoner-index`, including issues, tags, branches and its current Pages settings. Verify you have the GitHub permissions needed to create a private repository.
2. Create a **private** repository, e.g. `mcoc1all1/summoner-index-source`, and mirror the current development repository there. Check its visibility before pushing research data.
3. Configure a trusted GitHub Actions deployment credential in the private repo with **write access only to the public distribution repository**, not a broad personal token. Restrict workflow permissions.
4. Publish only the verified `dist/` output into a fresh **public repository without the old source history**, preserving the `mcoc1all1.github.io/summoner-index/` path if the public repo retains that name. Do not push `content/`, `docs/` research workbench files, or intermediate build materials.
5. Move existing collaborator permissions and scheduled CI workflows to the private source repo. Update the connected automation and all PR/issue references before retiring the old development repo.
6. Recreate Pages from the clean public distribution repository, run a working-site smoke test and inspect raw public GitHub files, all JSON artifacts, images, provenance disclosures and archived links.
7. Treat forks, mirrors, GitHub's retained objects and third-party caches as potentially accessible. History rewriting is not a legal erasure guarantee; get rights-holder advice if old source material must be remediated.

**Do not make the existing repo private, rewrite history, delete the catalog or change the Pages publishing destination automatically until the replacement private source and public Pages destination are ready.** These operations can irreversibly affect the site, linked PRs and scheduled automation.

## Editorial clearance checklist for each boss

Record a dated reviewer, evidence URLs, a manual comparison of substantial prose passages/unique selection, treatment of any copied headings/diagrams, whether facts were independently written or licensed, and whether the content changed since the last review. Keep accuracy separately documented. Mark `rights.status='reviewed'` only with an actual supported legal basis and evidence; a comparison that finds no verbatim copy is not a blanket clearance.

## 5 November 2026 — preflight for a clean publishing repository

Before copying `dist/` to a new public distribution repo, run the current beta build followed by `npm run distribution:preflight`. This fails if the output includes raw source/research directories, internal editorial files, known private-key/token patterns, unfiltered third-party reference lists, named relic shortlists, indexed HTML, or sitemap URLs. GitHub Pages CI also runs it after the public-beta build.

**This is an artifact check, not migration.** The original research catalog and Git history are still present publicly in this repository; the owner must create a private source repository and intentionally cut over to a clean-history public distribution repository. Do not copy `content/`, `docs/`, `tests/`, `scripts/` or old `.git` history into the public publishing destination. Do not remove `noindex` until the owner approves the commercial launch.
