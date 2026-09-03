#!/usr/bin/env bash
# Remove large folders from git before pushing to GitHub.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Removing from git index (files stay on disk):"
for path in node_modules .next out .env data/tournament.json *.zip battle-of-the-paddles*.zip; do
  if git ls-files --error-unmatch "$path" &>/dev/null 2>&1 || git ls-files "$path" 2>/dev/null | grep -q .; then
    git rm -r --cached "$path" 2>/dev/null || true
    echo "  removed: $path"
  fi
done

# Catch node_modules anywhere
if git ls-files | grep -q '^node_modules/'; then
  git rm -r --cached node_modules/
  echo "  removed: node_modules/"
fi

if git ls-files | grep -q '^\.next/'; then
  git rm -r --cached .next/
  echo "  removed: .next/"
fi

if git ls-files | grep -q '^out/'; then
  git rm -r --cached out/
  echo "  removed: out/"
fi

git add .gitignore

echo ""
echo "Large tracked files remaining:"
git ls-files -z | xargs -0 du -h 2>/dev/null | sort -rh | head -10 || true

echo ""
echo "Next:"
echo "  git commit -m \"Remove node_modules and build artifacts from git\""
echo "  git push -u origin main"
