# Fieldguide — MCOC public beta

Independent fan companion with 334 champion records, 52 relics, stat-focus trials for 332 champions, 99 matchup records covering 56 defenders and 24 boss preparation guides and six Carina Volume 4 challenge guides. Research and editorial advice remain provisional; this beta is not a claim of complete accuracy or rights clearance. No ads or third-party analytics are active.

The November 1, 2026 accuracy patch adds Ghost Rider (Robbie Reyes), corrects Scytalis phase labels and repairs malformed generated initials for parenthetical champion names at build time. These corrections are kept in `content/accuracy-patches.json` so urgent factual updates can be reviewed without rewriting the large research catalog by hand.

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

The beta has 747 routes, a feedback link on each page, and only the landing and methodology pages in its sitemap. Gameplay guides have noindex directives; this requests exclusion and does not restrict access. No data or sources are marked reviewed merely by publishing the beta. The separate `build:public` reviewed-pilot gate remains unchanged.

Enable Settings → Pages → Source: GitHub Actions. Private-source Pages requires a supporting paid GitHub plan. Do not change repository visibility without the owner's approval. The workflow deploys on pushes to main and supports manual runs. Deployment is complete only after the Pages job succeeds and the live URL works.

To preview the GitHub paths locally in PowerShell:

```powershell
$env:SITE_ORIGIN='https://mcoc1all1.github.io'
$env:SITE_BASE_PATH='/summoner-index'
$env:PUBLIC_BETA='1'
npm run build
node scripts/check-beta.mjs
npm run dev
```

Then open http://127.0.0.1:4173/summoner-index/.

## Content and limitations

`content/catalog.json` contains the main source-linked records. `content/accuracy-patches.json` contains small reviewed corrections that are applied temporarily during builds and tests; the base catalog file is restored afterward. `src/` contains browser modules and presentation; `scripts/` builds static pages and validates release controls; `tests/` covers content and application rules. GitHub Pages does not apply the optional `_headers` file. This is a static site with no server-side writes, accounts or secret credentials.

Roster, saved champions and editorial drafts live in the visitor's browser. The editor cannot change the published site. Email feedback is explained in the privacy page. Source references, guide limitations and provisional labels remain visible. YouTube links open original videos; no player loads automatically.

Before an ad-supported launch, finish outstanding accuracy and reuse reviews and separately review advertising/privacy requirements. Publishing this testing beta does not resolve those reviews.
