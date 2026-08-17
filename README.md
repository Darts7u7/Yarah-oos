<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/logo-light.svg">
    <img src="assets/logo-light.svg" alt="Yarah" width="120">
  </picture>

  <h1>Yarah</h1>
  <p>The all-in-one backend platform for agentic coding.</p>
</div>

Yarah gives your coding agent — and your apps — a complete backend: **Postgres database, authentication, file storage, edge functions, realtime, AI gateway, payments, and scheduled jobs**, all operable through a visual dashboard, a REST API, an MCP server, and a CLI.

## Products

- **Authentication** — user management, sessions, email OTP, OAuth (Google, GitHub, and more)
- **Database** — Postgres with an auto-generated REST API and row-level security
- **Storage** — S3-compatible file storage with buckets and access keys
- **Edge Functions** — serverless JavaScript executed in an isolated Deno runtime
- **AI Gateway** — OpenAI-compatible API across multiple LLM providers
- **Realtime** — channels, presence, and live messages over WebSockets
- **Payments** — Stripe and Razorpay integration
- **Schedules** — cron jobs backed by pg_cron

## Quickstart (self-hosted)

Prerequisites: Docker with Compose v2.

```bash
git clone https://github.com/Darts7u7/Yarah-oos.git
cd Yarah-oos
cp .env.example .env
docker compose up -d
```

Then open the dashboard:

- **Development stack** (default `docker-compose.yml`): dashboard at http://localhost:7131, API at http://localhost:7130/api
- Default admin credentials come from `.env` (`ROOT_ADMIN_USERNAME` / `ROOT_ADMIN_PASSWORD`) — change them before exposing anything.

For production-style deployment, see `deploy/`.

## Repository structure

| Path | What it is |
|---|---|
| `backend/` | The API server (Express + TypeScript): auth, database gateway, storage, functions, AI, realtime, payments |
| `packages/dashboard/` | The admin dashboard (React) |
| `packages/ui/` | Design-system primitives |
| `packages/shared-schemas/` | Shared Zod contracts (`@yarahdev/shared-schemas`) |
| `frontend/` | Vite shell that mounts the dashboard |
| `functions/` | Deno runtime for edge functions |
| `deploy/` | Self-hosting installer and production compose files |
| `docs/` | Product documentation |

## Ecosystem

| Piece | Repo |
|---|---|
| JavaScript SDK | `Yarah-oos-sdk-js` |
| MCP server (agent integration) | `Yarah-oos-mcp` |
| CLI | `Yarah-oos-cli` |
| MCP installer | `Yarah-oos-install` |
| Agent skills | `Yarah-oos-skills` |
| Postgres image | `Yarah-oos-db` |
| App templates | `Yarah-oos-templates` |

## License

Apache-2.0. Yarah is a fork of [InsForge](https://github.com/InsForge/InsForge) (Apache-2.0) — see `NOTICE` for attribution.
