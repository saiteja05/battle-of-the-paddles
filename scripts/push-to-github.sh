#!/usr/bin/env bash
# Push to GitHub with plain git (uses your local credential helper / keychain).
set -euo pipefail
cd "$(dirname "$0")/.."

REMOTE="${REMOTE:-origin}"
BRANCH="${BRANCH:-main}"

echo "==> Pushing ${BRANCH} to ${REMOTE}..."
git push -u "${REMOTE}" "${BRANCH}" --force

echo ""
echo "Done. GitHub Pages (branch deploy) should serve index.html at:"
echo "  https://battle.leafsteroids.net/"
