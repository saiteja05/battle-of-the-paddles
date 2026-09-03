#!/usr/bin/env bash
# One-time setup to push this folder to GitHub.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f package.json ]]; then
  echo "Run this from the battle-of-the-paddles project root (where package.json lives)."
  exit 1
fi

if [[ ! -f .env.example ]]; then
  cat > .env.example << 'EOF'
STORE=file
OPERATOR_PIN=0909
EOF
  echo "Created .env.example"
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

if [[ ! -d .git ]]; then
  git init -b main
fi

git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/saiteja05/battle-of-the-paddles.git

git add -A
git status

echo ""
echo "Next: commit and push"
echo "  git commit -m \"Battle of the Paddles tournament app\""
echo "  git push -u origin main"
echo ""
echo "Then enable GitHub Pages: repo Settings → Pages → Source: GitHub Actions"
