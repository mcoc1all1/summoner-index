# Safe source separation: clean artifact staging and owner cutover

**Status: migration prepared, not executed (5 November 2026).** The current `mcoc1all1/summoner-index` repository and its original Git history are still public. Pages remains publicly accessible but every HTML page has `noindex,follow`. No ads are enabled. No owned custom domain is configured by this document.

## What automation now does

The standard public-beta build continues to run all content and rights-integrity checks. A new `distribution:stage` tool:

1. Refuses to operate until the public `dist/` passes the existing source-leak, all-page-noindex and empty-sitemap preflight.
2. Refuses a staging destination inside the source repository or one that already exists, and does not run Git or contact GitHub.
3. Copies only the generated public site to a fresh `site/` directory, adds an empty `.nojekyll` marker for future branch-based Pages, and checks the result again.
4. Writes a checksum/file-count manifest and migration instructions **outside** the site directory. No source files, review registers, historical commits or credentials are included in `site/`.
5. Deletes incomplete staging outputs on failure. It neither creates a GitHub repository nor changes the existing live site.

GitHub Pages Actions also publishes a **three-day** downloadable `clean-noindex-beta-site` artifact after the checks pass. The contents are clean site files only. This is a backup/staging aid, not a switch of hosting.

## Offline Windows walkthrough (optional)

From a trusted local clone with Node 22+:

```powershell
$env:SITE_ORIGIN='https://mcoc1all1.github.io'
$env:SITE_BASE_PATH='/summoner-index'
$env:PUBLIC_BETA='1'
npm run build
node scripts/check-beta.mjs
npm run distribution:preflight
npm run distribution:stage -- --output "$env:TEMP\summoner-clean-site-20261105"
```

The destination must not already exist; choose a new name if repeating the command. Inspect `site/` and the adjacent `manifest.json`. Do not copy either the old source repository's `.git` folder or its `content/`, `scripts/`, `tests/` or review files into a publishing repository.

## Owner action required before migration

The currently available GitHub connector **cannot create a private repository, rename an existing repository, configure GitHub secrets or manage repository visibility**. The existing `scripts/prepare-private-source.ps1` offers a guarded first step for a locally authenticated owner using `gh` and `git`:

1. Create and verify `mcoc1all1/summoner-index-source` as **private**, and mirror the existing source history. Inspect the result and preserve a separate backup.
2. Decide whether to transfer project issues, branch protections and collaborators. Verify the source repository is complete and private before changing existing publishing or visibility.
3. Test the isolated `site/` output on a clean public distribution repository with **no inherited source history**. For a temporary preview repository, rebuild URLs with that repository's actual subpath instead of publishing the `/summoner-index` build at the wrong path.
4. At an explicitly approved maintenance cutover, free the `summoner-index` name without exposing or deleting sensitive research history, create a fresh clean-history public repository with that exact name, publish **site files only** from a clean initial commit, and configure GitHub Pages. This preserves the expected default URL `https://mcoc1all1.github.io/summoner-index/` once Pages succeeds.
5. Add a least-privilege publish credential to the private development repository. Use an approved credential with write access **only to the clean public distribution repo**; never log it, embed it in HTML, or give the public repo broad access to private source data. GitHub Actions commits made with a `GITHUB_TOKEN` do not necessarily trigger branch-based Pages builds; confirm that the chosen authentication and deployment workflow trigger correctly.
6. Verify every new public file and URL, the all-page `noindex` state, empty sitemap, `.nojekyll`, static asset hashes, and a successful Pages deployment before retiring any old deployment workflow.

**Do not execute steps 4–6 automatically.** Renaming or privatizing the current public source repo prematurely could break Pages and existing links, and rewriting the old public Git history cannot undo forks or caches. A clean distribution repo separates **future publication**, but the historical source exposure needs its own assessment.

## Release gates that must remain closed

- All site pages: `noindex,follow`; no page URLs in the sitemap.
- Advertising/analytics and AdSense tags: disabled.
- Third-party expression licensing/independent-source reviews: pending.
- No claim of current-client gameplay testing without recorded test evidence.
- Do not treat a successful staged snapshot, compliance script or site scan as commercial clearance.

Relevant official GitHub documentation:
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
