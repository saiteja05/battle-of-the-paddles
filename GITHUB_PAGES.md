# GitHub Pages

The live static demo is deployed by GitHub Actions (not by committing `index.html` / `_next/` to this repo).

## One-time settings

In the GitHub repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Custom domain (optional): `public/CNAME` currently has `battle.leafsteroids.net`. Set the same domain under **Settings → Pages**.

## Deploy

Push to `main`. The workflow `.github/workflows/deploy-pages.yml` runs `npm run build:pages` and publishes the `out/` folder.

## Local preview

```bash
npm run build:pages
npx serve out
```

GitHub Pages uses browser `localStorage` (no sync between devices). For two operators, run `npm run dev` locally instead.
