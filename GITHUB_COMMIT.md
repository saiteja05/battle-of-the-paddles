# Push to GitHub from your Mac

Repo: **https://github.com/saiteja05/battle-of-the-paddles**

Your code folder (use the one that contains `package.json`):

```bash
cd /Users/teja.boddapati/Downloads/battle-of-the-paddles/battle-of-the-paddles
```

## Push blocked by 100MB file?

You probably committed **`node_modules/`** or **`.next/`**. Fix:

```bash
chmod +x scripts/fix-github-push.sh
./scripts/fix-github-push.sh
git commit -m "Remove node_modules and build artifacts from git"
git push -u origin main
```

If push still fails, start fresh (repo never pushed successfully):

```bash
rm -rf .git
git init -b main
git remote add origin https://github.com/saiteja05/battle-of-the-paddles.git
git add -A
git status   # must NOT list node_modules or .next
git commit -m "Battle of the Paddles tournament app"
git push -u origin main
```

**Never commit:** `node_modules/`, `.next/`, `out/`, `.env`, `*.zip`

```bash
chmod +x scripts/init-github.sh
./scripts/init-github.sh
git commit -m "Battle of the Paddles tournament app"
git push -u origin main
```

When `git push` asks for credentials:
- **Username:** `saiteja05`
- **Password:** a GitHub **personal access token** (not your GitHub password)

Create token: https://github.com/settings/tokens/new → scope **repo**

## Missing `.env.example`?

If your zip was old, create it:

```bash
cat > .env.example << 'EOF'
STORE=file
OPERATOR_PIN=0909
EOF
cp .env.example .env
```

Or skip — defaults work without `.env`.

## Run the app

```bash
npm install
npm run dev
```

http://localhost:3000 — PIN **0909**

## GitHub Pages setup (your screenshot)

**Do not use “Deploy from a branch → main / (root)”.** That serves raw source code, not the app.

### Correct settings

1. **Settings → Pages → Build and deployment**
2. **Source:** **GitHub Actions** (not “Deploy from a branch”)
3. **Custom domain:** `battle.leafsteroids.net` (DNS check OK — good)
4. **Enforce HTTPS:** turns on automatically once the certificate is issued (can take up to 24 hours)

### After you push

The workflow `.github/workflows/deploy-pages.yml` builds the static site and deploys it.

Live URL: **https://battle.leafsteroids.net**  
PIN: **0909**

### Pull latest on your Mac and push

```bash
cd /Users/teja.boddapati/Downloads/battle-of-the-paddles/battle-of-the-paddles
git pull origin main
# or merge changes from this repo if diverged
git push origin main
```

Then check **Actions** tab — wait for “Deploy GitHub Pages” to go green.

## What gets committed

Included: source, tests, logos, sample CSV, GitHub Actions workflow  
Excluded (`.gitignore`): `node_modules/`, `.next/`, `.env`, `data/tournament.json`
