#!/usr/bin/env bash
# Build a clean-history site-publish branch inside a CHECKOUT OF THE EXISTING
# PUBLIC repository. Only the checked static site directory is copied.
# Nothing is pushed unless PUBLISH_PUSH=1 is explicitly supplied.
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: write-publication-branch.sh ABSOLUTE_STAGED_SITE_DIRECTORY PUBLIC_REPO_CHECKOUT" >&2
  exit 2
fi
site="$(realpath "$1")"
dest="$(realpath "$2")"
branch="site-publish"
marker="Initialize Summoner Index noindex website-only branch"
if [ ! -d "$site" ] || [ ! -d "$dest/.git" ]; then
  echo "Both verified site directory and public repository checkout are required" >&2
  exit 1
fi
case "$site/" in
  "$dest/"*) echo "Staged site must be outside public repo checkout" >&2; exit 1 ;;
esac
if [ ! -f "$site/index.html" ] || [ ! -f "$site/catalog.json" ] ||
   [ ! -f "$site/sitemap.xml" ] || [ ! -f "$site/robots.txt" ] ||
   [ ! -f "$site/.nojekyll" ] || [ -s "$site/.nojekyll" ]; then
  echo "Checked public-beta site artifacts are missing or invalid" >&2
  exit 1
fi
if grep -q '<loc[ >]' "$site/sitemap.xml"; then
  echo "Public beta must have an empty sitemap" >&2; exit 1
fi
if find "$site" -type l -print -quit | grep -q .; then
  echo "Symlinks are not allowed in staged site" >&2; exit 1
fi
for banned in content src scripts tests docs .git .github research node_modules; do
  if [ -e "$site/$banned" ]; then
    echo "Blocked private/development path in site: $banned" >&2; exit 1
  fi
done
pages=0
while IFS= read -r -d '' html; do
  pages=$((pages+1))
  if ! grep -qi '<meta name="robots" content="noindex,follow">' "$html"; then
    echo "Refusing an indexable page: $html" >&2; exit 1
  fi
  if grep -Eqi 'adsbygoogle|pagead2\.googlesyndication\.com|google_ad_client' "$html"; then
    echo "Refusing advertising scripts before approval: $html" >&2; exit 1
  fi
done < <(find "$site" -name '*.html' -type f -print0)
if [ "$pages" -lt 1 ]; then
  echo "No HTML pages in publication input" >&2; exit 1
fi

# Never modify public main or rewrite the original repository history.
if git -C "$dest" ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
  git -C "$dest" fetch --no-tags origin "refs/heads/$branch:refs/remotes/origin/$branch"
  git -C "$dest" checkout -B "$branch" "refs/remotes/origin/$branch"
  mapfile -t roots < <(git -C "$dest" rev-list --max-parents=0 HEAD)
  if [ "${#roots[@]}" -ne 1 ] ||
     [ "$(git -C "$dest" show -s --format=%s "${roots[0]}")" != "$marker" ]; then
    echo "Refusing to alter an existing branch without the expected clean-history root" >&2
    exit 1
  fi
else
  git -C "$dest" checkout --orphan "$branch"
fi

git -C "$dest" rm -r -f --ignore-unmatch . >/dev/null
git -C "$dest" clean -f -d -x >/dev/null
cp -a "$site/." "$dest/"
git -C "$dest" add -A
if ! git -C "$dest" diff --cached --quiet; then
  git -C "$dest" config user.name "github-actions[bot]"
  git -C "$dest" config user.email "41898282+github-actions[bot]@users.noreply.github.com"
  if git -C "$dest" rev-parse --verify HEAD >/dev/null 2>&1 &&
      [ -n "$(git -C "$dest" rev-list --max-parents=1 HEAD)" ]; then
    git -C "$dest" commit -m "Update verified noindex beta website files" >/dev/null
  else
    git -C "$dest" commit -m "$marker" >/dev/null
  fi
fi

mapfile -t roots < <(git -C "$dest" rev-list --max-parents=0 HEAD)
if [ "${#roots[@]}" -ne 1 ] ||
   [ "$(git -C "$dest" show -s --format=%s "${roots[0]}")" != "$marker" ]; then
  echo "Clean-history verification failed; refusing to publish" >&2
  exit 1
fi
if git -C "$dest" cat-file -e HEAD:content/catalog.json 2>/dev/null; then
  echo "Raw research files detected in site-publish branch" >&2
  exit 1
fi
echo "Prepared $branch with $pages noindex pages, no raw source and a clean history."

if [ "${PUBLISH_PUSH:-0}" = "1" ]; then
  remote="$(git -C "$dest" remote get-url origin)"
  case "$remote" in
    https://github.com/mcoc1all1/summoner-index|https://github.com/mcoc1all1/summoner-index.git) ;;
    *) echo "Unexpected publishing destination $remote; refusing to push" >&2; exit 1 ;;
  esac
  git -C "$dest" push origin "HEAD:refs/heads/$branch"
  echo "Pushed only the new $branch branch. Public main and Pages settings were NOT changed."
else
  echo "Dry run only; nothing was pushed. Set PUBLISH_PUSH=1 only in approved manual Actions."
fi
