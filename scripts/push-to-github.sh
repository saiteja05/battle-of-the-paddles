#!/usr/bin/env bash
# Push battle-of-the-paddles to your GitHub account.
# Usage:
#   GITHUB_USER=yourusername GITHUB_TOKEN=ghp_xxx ./scripts/push-to-github.sh
# Or:
#   export GITHUB_USER=yourusername
#   export GITHUB_TOKEN=ghp_xxx
#   ./scripts/push-to-github.sh

set -euo pipefail
cd "$(dirname "$0")/.."

REPO_NAME="${REPO_NAME:-battle-of-the-paddles}"

if [[ -z "${GITHUB_USER:-}" || -z "${GITHUB_TOKEN:-}" ]]; then
  echo "Missing credentials."
  echo ""
  echo "1. Create a token: https://github.com/settings/tokens/new"
  echo "   Scope: repo (full control of private repositories)"
  echo ""
  echo "2. Run:"
  echo "   GITHUB_USER=YOUR_USERNAME GITHUB_TOKEN=ghp_xxx ./scripts/push-to-github.sh"
  exit 1
fi

export GH_TOKEN="$GITHUB_TOKEN"

echo "Creating repo ${GITHUB_USER}/${REPO_NAME} (if needed)..."
gh repo create "${REPO_NAME}" --private --source=. --remote=origin --push 2>/dev/null || {
  git remote remove origin 2>/dev/null || true
  git remote add origin "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"
  git push -u origin main
}

echo ""
echo "Done! Clone on your Mac:"
echo "  git clone https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
echo "  cd ${REPO_NAME}"
echo "  npm install && cp .env.example .env && npm run dev"
