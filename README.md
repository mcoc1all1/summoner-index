# Fieldguide — MCOC public beta

Independent fan companion with 334 champion records, 52 relics, stat-focus trials for 332 champions, 147 matchup records covering 70 defenders, 28 boss preparation guides and six Carina Volume 4 challenge guides. 7★ availability is dated across all 333 standard champion entries: 272 are listed as 7★ and 61 are not currently listed as 7★ in the reviewed directory; Summoned Symbioid remains an explicit special-case exception. Research and editorial advice remain provisional; this beta is not a claim of complete accuracy or rights clearance. No ads or third-party analytics are active.

The November 1–2, 2026 accuracy patches add Ghost Rider (Robbie Reyes), correct Scytalis phase labels, repair malformed generated initials, expand boss-guide preparation and troubleshooting, correct the Cerastes 1% finish, add the Act 10.4.4 Chronoserpent, split Act 9.4.6 Carina into a shared overview plus separate Mutant/Mystic Vulnerability, Science/Tech Vulnerability and Skill/Cosmic Vulnerability guides, expand Counter Finder coverage for difficult defenders including Arnim Zola, Jean Grey, High Evolutionary, Thanos (Deathless), Count Nefaria and Arcade, and complete current 7★ availability coverage. A second availability audit corrected six false negatives: Archangel, Cable, Colossus (Age of Apocalypse), Goldpool, Green Goblin (Stellar Forged), and Wolverine (X-23). The availability snapshot drives Stat Focus eligibility, Champion Database rarity filtering, champion-card/comparison labels, and 7★ validation in My Roster. Small reviewed corrections live in `content/accuracy-patches.json` and modular `content/boss-*-patches.json`, `content/counter-*-patches.json` and `content/rarity-*-patches.json` files so factual updates can be reviewed without rewriting the large research catalog by hand.

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

The beta has 756 routes, a feedback link on each page, and only the landing and methodology pages in its sitemap. Gameplay guides have noindex directives; this requests exclusion and does not restrict access. No data or sources are marked reviewed merely by publishing the beta. The separate `build:public` reviewed-pilot gate remains unchanged.

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

## Content and limitations

`content/catalog.json` contains the main source-linked records. `content/accuracy-patches.json` and the modular `content/boss-*-patches.json`, `content/counter-*-patches.json` and `content/rarity-*-patches.json` files contain reviewed corrections that are applied temporarily during builds and tests; the base catalog file is restored afterward. `src/` contains browser modules and presentation; `scripts/` builds static pages and validates release controls; `tests/` covers content and application rules. GitHub Pages does not apply the optional `_headers` file. This is a static site with no server-side writes, accounts or secret credentials.

The rarity pass completes current **7★ availability**, which is the rarity needed for Stat Focus and current endgame filtering. It does not claim a complete historical 1★–6★ availability matrix for every champion. Roster, saved champions and editorial drafts live in the visitor's browser. The editor cannot change the published site. Email feedback is explained in the privacy page. Source references, guide limitations and provisional labels remain visible. YouTube links open original videos; no player loads automatically.

Before an ad-supported launch, finish outstanding accuracy and reuse reviews and separately review advertising/privacy requirements. Publishing this testing beta does not resolve those reviews.
