# Summoner Index — MCOC public beta

Independent fan companion with 334 champion records, 52 relics, stat-focus trials for 332 champions, 147 matchup records covering 70 defenders, 28 boss preparation guides, six Carina Volume 4 challenge guides, structured matchup mechanics for a pilot group of difficult defenders, mastery setup guides, and an Events & News hub. 7★ availability is dated across all 333 standard champion entries: 272 are listed as 7★ and 61 are not currently listed as 7★ in the reviewed directory; Summoned Symbioid remains an explicit special-case exception. Research and editorial advice remain provisional; this beta is not a claim of complete accuracy or rights clearance. No ads or third-party analytics are active.

Recent accuracy and product work adds Ghost Rider (Robbie Reyes), corrects Scytalis phase labels, repairs malformed generated initials, expands boss-guide preparation and troubleshooting, corrects the Cerastes 1% finish, adds the Act 10.4.4 Chronoserpent, splits Act 9.4.6 Carina into a shared overview plus separate Mutant/Mystic Vulnerability, Science/Tech Vulnerability and Skill/Cosmic Vulnerability guides, expands Counter Finder coverage for difficult defenders including Arnim Zola, Jean Grey, High Evolutionary, Thanos (Deathless), Count Nefaria and Arcade, completes current 7★ availability coverage, adds matchup-mechanics summaries, mastery setup guidance, and current MCOC Events & News. Small reviewed corrections live in `content/accuracy-patches.json` and modular `content/boss-*-patches.json`, `content/counter-*-patches.json` and `content/rarity-*-patches.json` files so factual updates can be reviewed without rewriting the large research catalog by hand.

## Local use

Requires Node 22 or newer, with no package installation needed.

```text
npm run build
npm test
npm run dev
```

Open http://127.0.0.1:4173. Search, counter filters, comparisons, loadouts, saved champions, browser-local roster and the local content editor are available. Feedback prepares an email to mcoc1all1@proton.me; visitors must send it themselves.

## GitHub Pages beta

The Pages workflow builds and tests the research version, then builds the public beta with:

- SITE_ORIGIN=https://mcoc1all1.github.io
- SITE_BASE_PATH=/summoner-index
- PUBLIC_BETA=1

The beta contains more than 750 generated routes and a feedback link on each page. **All public-beta pages, including the homepage and methodology, now set `noindex,follow`, and the public-beta sitemap has zero page URLs** until the site owner explicitly authorizes an ad-supported indexing launch. Search engines must be able to crawl pages to see `noindex`; this is not access control, and already-indexed pages may persist until recrawled. No data or sources are marked reviewed merely by publishing the beta. The separate `build:public` reviewed-pilot gate remains unchanged.

The Events & News hub uses `/events` as its canonical route. `/live` remains as a compatibility redirect so older links continue to work.

Enable Settings → Pages → Source: GitHub Actions. Private-source Pages requires a supporting paid GitHub plan. Do not change repository visibility without the owner's approval. The workflow deploys on pushes to main and supports manual runs. Deployment is complete only after the Pages job succeeds and the live URL works.

To preview the GitHub paths locally in PowerShell:

```powershell
$env:SITE_ORIGIN='https://mcoc1all1.github.io'
$env:SITE_BASE_PATH='/summoner-index'
$env:PUBLIC_BETA=1
npm run build
node scripts/check-beta.mjs
npm run dev
```

Then open http://127.0.0.1:4173/summoner-index/.

## Copyright-risk controls for public beta

The public GitHub Pages build now **links out to MCOC Scout kit references rather than republishing its compiled ability lists or relic pairings**. These source-linked fields remain in the local canonical research catalog, but the public build filters them from the champion pages, full JSON response, and all compact browser datasets. The public content workbench is excluded. The existing independent champion analyses, battle tactics, filters and roster tools remain available, though some previously source-catalogued ability and relic searches will intentionally return fewer results until independently verified.

The public beta also withholds **all unapproved Stat Focus choices and alternatives across normal and hashed data assets**. The 5 November research expansion documents 139 source-reviewed trials while other drafts remain withheld; these are editorial trials, not measured optimization claims. Confirmed seven-star eligibility remains visible, but should never be confused with independently reviewed recommendations. The Pages workflow now checks every normal and hashed browser JSON payload for a leaked focus selection.

The Pages workflow runs source-compilation leak checks as part of the public beta check. This is a narrow technical mitigation, **not copyright/AdSense clearance**. Boss-guide expression comparison, full source-rights provenance, wiki licensing, and advertising/privacy requirements still need review before enabling ads. See [commercial content remediation status](docs/COMMERCIAL-CONTENT-REMEDIATION-2026-11-04.md). Run `npm run build && npm run rights:guides` to inspect the current guide-expression rights queue. The separate `npm run rights:require-cleared` check fails until all guides have recorded evidence. Run `npm run rights:inventory` to inspect the complete current base-and-patch source declarations; run `node scripts/source-rights-inventory.mjs --write` to save a local JSON snapshot. This is a provenance inventory, not a legal license decision.

See [the new rights and source-separation plan](docs/RIGHTS-AND-SOURCE-SEPARATION-2026-11-04.md) for the remaining manual boss comparisons and private-source migration prerequisites. The original unfiltered catalog remains publicly accessible in this repository and Git history until the owner creates a private source destination and a clean public publishing repository.

## Content and limitations

`content/catalog.json` contains the main source-linked records. `content/accuracy-patches.json` and the modular `content/boss-*-patches.json`, `content/counter-*-patches.json` and `content/rarity-*-patches.json` files contain reviewed corrections that are applied temporarily during builds and tests; the base catalog file is restored afterward. `content/live.json` contains reviewed Events & News data, and `content/masteries.json` contains mastery guidance. `src/` contains browser modules and presentation; `scripts/` builds static pages and validates release controls; `tests/` covers content and application rules. GitHub Pages does not apply the optional `_headers` file. This is a static site with no server-side writes, accounts or secret credentials.

The rarity pass completes current **7★ availability**, which is the rarity needed for Stat Focus and current endgame filtering. It does not claim a complete historical 1★–6★ availability matrix for every champion. Roster, saved champions and editorial drafts live in the visitor's browser. The saved-champion storage key remains the stable internal key `fieldguide:saved`; product branding changes do not rewrite storage identifiers. The editor cannot change the published site. Email feedback is explained in the privacy page. Source references, guide limitations and provisional labels remain visible. YouTube links open original videos; no player loads automatically.

Before an ad-supported launch, finish outstanding accuracy and reuse reviews and separately review advertising/privacy requirements. Publishing this testing beta does not resolve those reviews.
