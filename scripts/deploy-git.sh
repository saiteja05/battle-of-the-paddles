#!/usr/bin/env bash
# One-shot: build, publish to repo root, commit, push — plain git only.
set -euo pipefail
cd "$(dirname "$0")/.."

bash scripts/publish-pages-root.sh

git add \
  index.html \
  404.html \
  404 \
  _next \
  board \
  setup \
  now \
  finals \
  tv \
  logos \
  manifest.json \
  icon.svg \
  sample-players.csv \
  CNAME \
  .nojekyll \
  scripts/publish-pages-root.sh \
  scripts/deploy-git.sh \
  2>/dev/null || true

git add -u scripts/ .github/ next.config.ts package.json src/lib/static-mode.ts src/lib/client-store.ts src/lib/client-api.ts src/components/Providers.tsx src/components/PinGate.tsx 2>/dev/null || true

if git diff --cached --quiet; then
  echo "Nothing new to commit."
else
  git commit -m "Publish Battle of the Paddles static site for GitHub Pages"
fi

echo "==> Pushing to origin (plain git)..."
git push origin main --force

echo ""
echo "Site should update at https://battle.leafsteroids.net/ within a few minutes."
