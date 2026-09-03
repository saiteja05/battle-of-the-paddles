# Fix battle.leafsteroids.net (shows README today)

## Why you see the README

GitHub Pages is set to **Deploy from a branch → main / (root)**. That publishes raw repo files. Jekyll turns `README.md` into the homepage — it does **not** run `next build`.

## Fix (one time)

### 1. Push this repo to GitHub

Local `/agent` has the Pages deploy config; GitHub `main` does not yet.

Histories diverged — use a **force push** after you confirm GitHub can be overwritten:

```bash
cd /path/to/battle-of-the-paddles
git remote add origin https://github.com/saiteja05/battle-of-the-paddles.git 2>/dev/null || true
git fetch origin

# Option A: token push (recommended)
GITHUB_USER=saiteja05 GITHUB_TOKEN=ghp_YOUR_TOKEN ./scripts/push-to-github.sh

# Option B: force push if histories diverged
git push -u origin main --force
```

Token: https://github.com/settings/tokens/new → scope **repo**

### 2. Switch Pages source to GitHub Actions

In https://github.com/saiteja05/battle-of-the-paddles/settings/pages :

1. **Build and deployment → Source:** **GitHub Actions** (not “Deploy from a branch”)
2. Save

### 3. Wait for the workflow

Push to `main` triggers `.github/workflows/deploy-pages.yml`. It builds a static export and deploys to Pages.

Check: **Actions** tab → “Deploy GitHub Pages” should go green.

### 4. Custom domain

`public/CNAME` contains `battle.leafsteroids.net`. After the first successful deploy:

- **Settings → Pages → Custom domain:** `battle.leafsteroids.net` (if not already set)
- DNS must point at GitHub Pages (you already did this)
- HTTPS may take up to ~24h after the first good deploy

Live app: **https://battle.leafsteroids.net/** — PIN **0909**

## Local event night (recommended)

GitHub Pages uses browser `localStorage` (no shared sync between two Macs). For two operators + physical boards, run locally:

```bash
npm install && cp .env.example .env && npm run dev
```

Open http://localhost:3000 — PIN **0909**. State in `data/tournament.json`.

## Verify build locally

```bash
npm run build:pages
# output in out/
```
