#!/usr/bin/env bash
# Build static export and copy to repo root for GitHub Pages branch deploy.
# Branch deploy from main/(root) serves index.html — not README — once published.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Building static site..."
npm run build:pages

echo "==> Publishing out/ to repo root (Pages branch deploy)..."
PUBLISH=(
  index.html
  404.html
  404
  _next
  board
  setup
  now
  finals
  tv
  logos
  manifest.json
  icon.svg
  sample-players.csv
  CNAME
  .nojekyll
)

for item in "${PUBLISH[@]}"; do
  if [[ -e "out/$item" ]]; then
    if [[ -d "out/$item" ]]; then
      rm -rf "$item"
      cp -a "out/$item" "$item"
    else
      cp -f "out/$item" "$item"
    fi
    echo "  published: $item"
  fi
done

echo ""
echo "Done. Commit and push:"
echo "  git add index.html 404.html 404 _next board setup now finals tv logos manifest.json icon.svg sample-players.csv CNAME .nojekyll"
echo "  git commit -m \"Publish static site for GitHub Pages\""
echo "  git push origin main"
