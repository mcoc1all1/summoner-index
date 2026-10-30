# Fieldguide — MCOC companion MVP

A working companion website with local development updates. The hosted private preview is an older version; current changes have not been deployed.

## Run

Requires Node 22+. No runtime package installation is necessary.

```text
npm run build
npm test
npm run dev
```

Preview: http://127.0.0.1:4173. Set `SITE_ORIGIN` before building for another domain.

## What works

- 333 source-linked champion records: 332 curated profiles and 1 source catalogues awaiting detailed guides, including Universal class support.
- 33 structured matchup recommendations, with mode filters, rationale, strategy, risk, and provisional suitability scores.
- Global name/ability/immunity search, class and immunity filters, including basic natural-language queries.
- Comparison of up to three champions with shareable URL state.
- Relic and stat-focus trials for 332 champions, with searchable cards, profile and comparison integration, editable sources and labeled editorial trials.
- 24 boss preparation guides across Acts 5–9 and Necropolis, grouped by collection. Carina coverage is partial; some Act 6 node guidance is provisional.
- Browser-local saved champions.
- Form editing for champions, counters, sources and videos, local draft persistence, relationship validation and candidate download in `/content-workbench`.
- 734 pre-rendered routes, with 381 indexable routes, unique titles/descriptions, canonical links, sitemap, robots, breadcrumbs and WebSite schema.
- Local analytics events with no active collection, ads or accounts.

## Architecture

This MVP has no user accounts or shared user writes, so a dependency-free static content compiler is a practical first architecture. It provides real HTML for search engines and low-cost CDN delivery. Vanilla ES modules progressively enhance the pages. Content, domain logic, presentation components, styles, build pipeline and tests are separate.

`content/catalog.json` is the active datastore. It uses stable IDs and normalized relationship arrays. The same relationship drives counter pages, champion connections, filters and comparison. This is not a manually coded page per champion.

`docs/schema.sql` is a PostgreSQL migration blueprint for an authenticated CMS. It is not an installed backend. Content can move to PostgreSQL/Supabase or another CMS without changing public URLs; an exporter can preserve the catalog contract. Introduce server endpoints when accounts, editorial writes or cross-device roster sync become necessary. Do not add secrets to the browser.

## Content updates

1. Use the workbench forms to save local edits and export a validated candidate. Advanced JSON editing remains available.
2. Have a reviewer confirm game mechanics and evidence. Structural validation does not establish accuracy.
3. Replace `content/catalog.json` with the reviewed candidate. No application source changes are needed for a new champion.
4. Run build and tests and inspect affected pages. Deployment remains deferred until requested.
5. Keep revisions in Git. Roll back to a previous catalog and rebuild if needed.

Add IDs to the ability/immunity/tag/source collections before referring to them. Never label resistance or Cleanse as unconditional immunity. Unknown signature levels and ratings remain unreviewed. Relic shortlists and focus trials are labeled separately from tested recommendations. See docs/RELICS-STAT-FOCUS.md for evidence limits. For creator videos, add a `videos` record and its ID to the appropriate boss. Champion/guide video joins are in the database blueprint; the starter UI currently renders videos on bosses.

## Files

- `src/domain.mjs`: search, relationships, validation and escaping.
- `src/components.mjs`: shared rendering.
- `src/app.mjs`: browser interactions and analytics adapter.
- `src/styles.css`: responsive interface.
- `scripts/build.mjs`: static route generation and metadata.
- `tests/domain.test.mjs`: behavioral and generated-link checks.
- `docs/PRODUCT.md`: research, editorial workflow, monetization and roadmap.
- `docs/schema.sql`: database expansion path.

## Production boundaries

The private preview is not discoverable by Google until public access is enabled. Do not treat the starter data as an authoritative current-season database. Official pages were checked, but several exposed no readable ability text; the kit facts here are secondary references, explicitly labeled. No recommendations were independently battle-tested.

The workbench edits locally and exports a file; it is not an authenticated live CMS. Favorites do not sync between devices. Node-specific solving, comprehensive relic/synergy coverage, season ratings, accounts, ad serving and analytics collection are not implemented. The OG image is SVG; use a raster social card before public promotion because social crawlers vary in SVG support. CSS uses Google Fonts with local fallbacks.

Security headers are supplied in `dist/_headers`; confirm the target host applies them before public launch. The app escapes dynamic content and validates catalog IDs and HTTPS source links.

## Analytics contract

Listen for `fieldguide:analytics` on `window`. Event detail is `{ name, properties }`. Events: `pageview`, `search` (on submit), `counter_search`, `counter_tool`, `compare`, `outbound_youtube`. No collector, identifiers, retention or remote transmission is enabled. Configure consent, redaction, aggregation and retention before connecting an analytics service.

## Local development v0.2

This version has not been uploaded or deployed. My roster stores ownership, awakening and signature levels locally, supports JSON backup import/export, and filters counter recommendations by ownership and known requirements. Unknown requirements remain explicitly unreviewed. Ratings of 4–5 require dated, versioned test evidence in the catalog. Editorial validation checks structure, not truth.


### Matchup review workflow

The workbench includes a review queue and form fields for awakening requirements, minimum signature, review status, date and game version. Blank signature and unreviewed awakening remain unknown. Tested status requires a valid calendar date, game version, a linked test source and an editor confirmation for the current revision. A completed form does not independently prove gameplay accuracy. The source catalog remains unchanged until a candidate is reviewed and adopted.


### Guide editing and previews

Bosses, quests and fight conditions now have editor forms. Boss phases can be added and removed, with source and video selectors and one mistake per line. Assigning a boss to a quest updates both collections automatically. Preview unsaved changes validates and renders the record without saving it. Quest links and listings derive from the catalog rather than assuming Act 8. This release expands authoring tools; it does not add verified gameplay content.




## Content coverage (27 October 2026)

The checked community roster has 333 records, 332 detailed community-sourced profiles, 332 step-by-step fight plans, 85 editorial stat-focus trials and 11 conditional synergy notes. This is not an official census of every current champion.

Build regenerates content/coverage-report.json and docs/coverage-report.md from the active catalog. The /coverage page exposes the same progress. Remaining detailed profiles: 1. The report records source gaps separately from completed guides. Every champion page lists its remaining research needs.

Exact relic variants, numeric investment breakpoints, current-season results and in-game validation remain open where not documented. Source numeric anomalies are not imported as damage or duration recommendations. Rotation and synergy metadata can be edited through the advanced JSON workbench and is preserved by ordinary form edits.

## Launch audit — 27 October 2026

See `docs/LAUNCH-AUDIT.md` before publication. The local engineering checks pass, but commercial content rights, operator/contact details, ad approval and production-host verification remain unresolved. Do not interpret source links or automated tests as legal clearance. No new version was deployed during the audit.

## Loadout browsing update

Relic/stat-focus browsing now uses 12 entries per page, combined search/class/availability filters, and shareable page URLs. Initial HTML is about 94% smaller; the full catalog transfer is unchanged. Editing tools load only on the workbench. See `docs/LOADOUT-BROWSING-UPDATE.md` for verification and limits. The launch audit's rights and hosting blockers remain open.


## Public content release

The full `dist` is a research preview, not a cleared public release. Run `npm run release:check` for the current publication hold report. `npm run build:public` builds an isolated boss-guide pilot only after dated accuracy and reuse reviews are recorded; currently no guide is approved. See docs/CONTENT-RELEASE-REVIEW-2026-10-30.md.
