# Push to GitHub (one time)

Repo: https://github.com/saiteja05/battle-of-the-paddles

## 1. Create a token

https://github.com/settings/tokens/new → check **repo** → Generate

## 2. Push from your Mac Terminal

```bash
cd /path/to/battle-of-the-paddles   # this project folder
git remote add origin https://github.com/saiteja05/battle-of-the-paddles.git
git push -u origin main
```

When prompted: username `saiteja05`, password = your **token** (not GitHub password).

Or one line:

```bash
GITHUB_USER=saiteja05 GITHUB_TOKEN=ghp_YOUR_TOKEN ./scripts/push-to-github.sh
```

## 3. Enable GitHub Pages

In the repo on GitHub:

1. **Settings → Pages**
2. **Build and deployment → Source:** GitHub Actions
3. After the workflow runs, the site is live at:

**https://saiteja05.github.io/battle-of-the-paddles/**

PIN: **0909**
