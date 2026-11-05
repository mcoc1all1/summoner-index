# Commercial launch preparation — 5 November 2026

**Current decision: PUBLIC BETA ONLY. Do not enable AdSense, remove noindex from ANY public-beta page (including the homepage), or mark protected expression cleared merely because code builds. The site owner has explicitly requested a complete indexing hold until commercial launch is ready.**

This is an actionable release checklist, not a legal opinion and not an assertion that any particular game fact is protected. Source-linked gameplay facts can be researched and described in new original writing; unique third-party prose, graphics, protected compilations or copied arrangements require case-by-case assessment.

## Automated checks added
- `npm run commercial:audit`: report current manual approvals, assembled boss-guide expression-review status, page-level title/description/canonical presence, beta indexing, short editorial page candidates, advertising tags, and inadvertently linked unpublished workbench pages.
- `npm run rights:triage`: inventory original content categories, source links, third-party provenance and review candidates (champions, counters, boss/Carina guides, relics, synergies, events and masteries). It does not establish copyright infringement or permission.
- `npm run commercial:enforce`: same checks, but fails if any pre-application blocker remains. **Do not substitute for Google's own site review or counsel.**
- The regular Pages workflow writes *advisory* GitHub Actions summaries for commercial readiness and the expanded rights triage, preserving existing public-beta deployment without unlocking ads or indexing.
- `node scripts/check-beta.mjs` fails the Pages build if **any generated HTML page** lacks the `noindex,follow` directive or if the sitemap lists even one URL. This is a search-engine directive, not access control; allow crawlers to see the noindex directive.
- A dated manual-approval register at `content/commercial-launch-register.json` documents what still needs a reviewer, decision and supporting evidence. Avoid fabricating approvals; if conditions change, record detailed evidence, reviewer and date.

## Fixes still required

### P0 — source rights / content integrity
1. Run `npm run rights:guides` and compare each cited boss guide with its sources **passage by passage**. Record source-page/section locators, a dated human judgment of expression, arrangement and compilation, and required license attribution when applicable. Pending guides are not automatically infringing. Keep the review pending if evidence cannot be inspected.
2. Review other published champion explanations, counter advice, immunity and relic source selection, guide prose, Fandom adaptations, screenshots/artwork, and any sourced content outside the boss register. Cite mechanics correctly, write original editorial value, and do not transplant third-party compiled mappings.
3. The canonical catalog and its old commits currently live in the public repository. Move research to an owner-created private source repo, and publish only verified built output into a clean public distribution repo. Follow `docs/RIGHTS-AND-SOURCE-SEPARATION-2026-11-04.md`; do not delete the catalog or rewrite history before backing it up and cutting over.

### P1 — useful indexed content
4. Manually check candidate index pages for useful, substantial, original decisions and functionality. The audit's <120-word threshold is only a triage heuristic; Google does not require a specific number of words.
5. Keep unreviewed Stat Focus settings and third-party relic pairing lists withheld. Source-linked trials are research hypotheses, not best-in-slot measurements.
6. **Do not index any page before explicit owner authorization for ad launch.** Every public-beta page has `noindex,follow` and the sitemap contains no page URLs. After rights and quality review, deliberately define which routes become indexable. Update the beta sitemap and verify canonical, meta-robots and internal links on the custom domain. Avoid switching all 750+ routes to indexable automatically. `PUBLIC_BETA=1` must remain until safe replacement publication gates are in place.

### P2 — domain, privacy, monetization
7. Buy/configure the chosen domain, verify DNS and HTTPS in GitHub Pages, confirm whether publishing uses the domain root or a subpath, and rebuild with matching `SITE_ORIGIN` and `SITE_BASE_PATH`. Recheck every canonical, Open Graph URL, sitemap entry, internal link, and redirects. Connect Search Console when the site is eligible for indexing.
8. Review and update Privacy, content disclosures, contact and cookies for actual ad/analytics behavior **before** adding any ad tag. Implement a consent flow if required for the audiences/ad products used. No ad or analytics script is currently authorized by this checklist.
9. Apply for AdSense only when original-content, site ownership, navigation, publisher policy and applicable privacy reviews pass. Wait for Google's own acceptance before loading ads. Configure the correct publisher-specific `ads.txt` after an AdSense account is assigned; never invent a publisher ID.

## Evidence required to change a pending status
Document: reviewer, date, exact scope/pages, current content revision, source URLs or primary evidence, expression/arrangement assessment and license obligations (where relevant), and any remaining uncertainty. An automated pass cannot provide an independent legal permission decision or prove current-game testing. If a meaningful blocker cannot be resolved, leave it pending and publish only the beta.

Useful references:
- https://support.google.com/adsense/answer/7299563
- https://support.google.com/adsense/answer/10502938
- https://developers.google.com/search/docs/crawling-indexing/block-indexing
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
