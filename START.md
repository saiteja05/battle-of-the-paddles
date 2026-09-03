# Production start (local machine)

See **[LOCAL_SETUP.md](./LOCAL_SETUP.md)** for full setup on your laptop.

## Quick production start

```bash
npm install
cp .env.example .env
npm run build
npm run start:local
```

Open **http://localhost:3000** — PIN **0909**.

## Environment

| Variable       | Default | Purpose                          |
|----------------|---------|----------------------------------|
| `STORE`        | `file`  | Persistence (`file` or `mongo`)  |
| `OPERATOR_PIN` | `0909`  | Operator gate PIN                |
| `HOST`         | `0.0.0.0` | Bind address (start-local.sh)  |
| `PORT`         | `3000`  | Listen port (start-local.sh)     |

## Optional: Docker

Not required for event night. File store works without any containers.

```bash
docker compose up -d
```
