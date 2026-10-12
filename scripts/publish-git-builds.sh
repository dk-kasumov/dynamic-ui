#!/usr/bin/env bash
#
# Publish the built libraries to dedicated git branches so they can be
# installed straight from GitHub without a registry:
#
#   npm i github:dk-kasumov/dynamic-ui#builds/ngx-studio
#
# Each branch's root IS the built package (its own package.json, fesm bundles,
# types). `@dynamic-ui/ngx-studio` declares `@dynamic-ui/studio` as a git
# dependency pointing at the sibling branch, so installing the Angular package
# pulls the core automatically.
#
# Branches are produced with git plumbing against this repo's object store and
# pushed through `origin`, so the push reuses your existing credentials and
# never disturbs the working tree or the current branch.
#
# Usage: npm run publish:git   (or: bash scripts/publish-git-builds.sh)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

GIT_DIR_ABS="$(git rev-parse --absolute-git-dir)"
REMOTE_URL="$(git remote get-url origin)"
# Normalise git@github.com:owner/repo.git | https://github.com/owner/repo.git -> owner/repo
SLUG="$(printf '%s' "$REMOTE_URL" | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')"

STUDIO_BRANCH="builds/studio"
NGX_BRANCH="builds/ngx-studio"
STUDIO_DEP="github:${SLUG}#${STUDIO_BRANCH}"

echo "▸ Building libraries…"
npx nx run-many -t build -p studio ngx-studio --skip-nx-cache

TMP="$ROOT/tmp/git-builds"
rm -rf "$TMP"
mkdir -p "$TMP"

publish () {
  local name="$1" dist="$2" branch="$3"
  local stage="$TMP/${name}"
  local index="$TMP/index-${name}"
  echo "▸ Publishing ${name} -> ${branch}"

  cp -R "$ROOT/$dist" "$stage"

  # The built package must be installable on its own: drop `private`, and for
  # the Angular package repoint the core dependency at its published branch.
  node -e '
    const fs = require("fs");
    const [file, dep] = process.argv.slice(1);
    const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
    delete pkg.private;
    if (pkg.dependencies && pkg.dependencies["@dynamic-ui/studio"]) {
      pkg.dependencies["@dynamic-ui/studio"] = dep;
    }
    fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
  ' "$stage/package.json" "$STUDIO_DEP"

  # Snapshot the staged dir into an orphan commit without touching the worktree.
  rm -f "$index"
  GIT_INDEX_FILE="$index" GIT_DIR="$GIT_DIR_ABS" GIT_WORK_TREE="$stage" git add -Af .
  local tree commit
  tree="$(GIT_INDEX_FILE="$index" GIT_DIR="$GIT_DIR_ABS" git write-tree)"
  commit="$(GIT_DIR="$GIT_DIR_ABS" git -c commit.gpgsign=false commit-tree "$tree" -m "build(${name}): $(date -u +%FT%TZ)")"
  git push -f origin "${commit}:refs/heads/${branch}"
}

publish studio      dist/libs/studio      "$STUDIO_BRANCH"
publish ngx-studio  dist/libs/ngx-studio  "$NGX_BRANCH"

rm -rf "$TMP"

cat <<EOF

✓ Done. Install in a consumer project with:

    npm i github:${SLUG}#${NGX_BRANCH}

  (this pulls github:${SLUG}#${STUDIO_BRANCH} automatically)

  Then add the peer dependencies — see README "Install from GitHub".
EOF
