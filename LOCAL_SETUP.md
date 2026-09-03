# Battle of the Paddles — Run on Your Machine

Run the tournament app **locally on your laptop**. No VM, no tunnels, no Docker, no MongoDB required for event night.

Tournament data is saved to `data/tournament.json` on disk — works fully offline.

## Get the code first

**`/agent` is not on your Mac.** That path exists only on the Cursor Cloud Agent VM where the agent built this project. Running `cd agent` on your laptop will fail — there is no `agent` folder there.

You need to copy the project to your machine first. Pick one option below.

### Option A — Download the zip (recommended)

1. Open your Cursor agent run: [Agent run → files / artifacts](https://cursor.com/agents/bc-f329837e-2485-500e-90de-32ef9ef78da4)
2. Download **`battle-of-the-paddles.zip`** from the workspace (created at `/agent/battle-of-the-paddles.zip` on the VM; excludes `node_modules` and `.next`).
3. On your Mac, unzip and enter the folder:

```bash
cd ~/Downloads   # or wherever the zip landed
unzip battle-of-the-paddles.zip -d battle-of-the-paddles
cd battle-of-the-paddles
```

### Option B — Copy from Cursor file explorer

In the Cursor agent run, browse the workspace file tree, select the project files (or the whole tree), and export/download to your Mac. Name the folder `battle-of-the-paddles`, then:

```bash
cd ~/path/to/battle-of-the-paddles
```

### Option C — Git clone (not available yet)

This project has **no GitHub remote configured** on the agent VM. You cannot `git clone` it until someone pushes it to GitHub and gives you a URL.

To use git later: push the repo to your own GitHub account, then:

```bash
git clone <your-repo-url>
cd battle-of-the-paddles
```

### After you have the folder

Continue with **Requirements** and **Quick start** below. You will run `npm install` locally to recreate `node_modules` (the zip intentionally omits it).

## Requirements

- **Node.js 18+** ([nodejs.org](https://nodejs.org))
- npm (included with Node)

Check your version:

```bash
node -v   # should be v18.0.0 or higher
```

## Quick start (Mac / Linux)

```bash
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:3000** and enter PIN **`0909`**.

## Quick start (Windows)

In PowerShell or Command Prompt:

```powershell
npm install
copy .env.example .env
npm run dev
```

Open **http://localhost:3000** and enter PIN **`0909`**.

(Git Bash on Windows works the same as Mac/Linux commands above.)

## Production mode (event night)

Build once, then run the production server:

```bash
npm install
cp .env.example .env
npm run build
npm run start:local
```

Or without the helper script:

```bash
npm run build
STORE=file OPERATOR_PIN=0909 npm start
```

`npm run start:local` runs `scripts/start-local.sh` (Mac/Linux/Git Bash). It builds if needed, binds to port 3000, and uses the file store.

## Environment (`.env`)

```env
STORE=file
OPERATOR_PIN=0909
# MONGODB_URI=   # optional — only if you later use MongoDB Atlas
```

| Variable       | Default | Purpose                                      |
|----------------|---------|----------------------------------------------|
| `STORE`        | `file`  | `file` = local JSON; `mongo` = Atlas/MongoDB |
| `OPERATOR_PIN` | `0909`  | PIN for setup and board operators            |

## Verify

```bash
npm test
npm run build
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 3000 in use | `PORT=3001 npm run dev` then open http://localhost:3001 |
| `EACCES` on port | Use a port above 1024, or run without sudo |
| Data reset | Delete `data/tournament.json` or use **Full reset** in `/setup` |
| Wrong PIN | Set `OPERATOR_PIN` in `.env` and restart the server |

## Optional: MongoDB later

For two operators on separate machines syncing through Atlas, set `MONGODB_URI` and `STORE=mongo` in `.env`. For a single laptop running setup + boards, **`STORE=file` is all you need**.

## Optional: Docker

Docker is **not required**. If you want a container anyway:

```bash
docker compose up -d
```

The compose file defaults to `STORE=file` and mounts `./data` for persistence.
