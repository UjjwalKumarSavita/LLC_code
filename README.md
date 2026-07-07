# LLC_code

LLC_code is a free, self-hosted visual coding-learning platform and isolated
online judge. It combines a high-motion monochrome learner experience with
problem authoring, editorials, progress analytics, submissions, and safe
multi-language execution.

No paid API, managed database, subscription, telemetry service, or proprietary
asset is required.

## Submission snapshot

- 50 published, judge-ready problems
- Python, JavaScript, C++, and Java execution
- 200 language templates and 200 judge cases
- 25 reviewed six-section editorials
- 10 interactive algorithm visualizers
- 4 guided roadmaps with live account progress and 28 mapped problem nodes
- Monaco code editor with persistent drafts, preferences, and a no-stall fallback
- Account-owned progress, streaks, XP levels, badges, submission history, and diagnostics
- Public-safe learner leaderboard ranked by local solved progress and XP
- Problem and editorial admin review workflows
- Self-hosted PostgreSQL, Redis/BullMQ, Moby, and Piston
- 640/640 catalogue reference executions verified
- 25 backend tests and 14 public desktop/mobile browser checks passing

## Fast start on this machine

Prerequisites are Node.js and the existing free `LLC-Docker` WSL distribution.
The first setup installs dependencies, migrates and seeds the database, creates
an optional local administrator, and builds production bundles:

```powershell
scripts\start-local.cmd -Setup `
  -AdminEmail "admin@llc-code.local" `
  -AdminPassword "Choose-A-Local-Password"
```

Later starts are one command:

```powershell
scripts\start-local.cmd
```

Open [https://localhost:3000](https://localhost:3000).

Local HTTPS is free and self-hosted. `scripts\start-local.cmd` creates a
localhost-only certificate in ignored `.local-runtime/certs/` and serves the
browser through a TLS proxy. If Windows asks whether to trust the certificate,
accept it only for this local LLC_code certificate; otherwise the browser may
show a one-time self-signed-certificate warning.

If the browser still warns, run this once and approve the Windows certificate
prompt:

```powershell
scripts\trust-local-cert.cmd
```

Check every local service:

```powershell
scripts\check-local.cmd
```

Stop the application processes:

```powershell
scripts\stop-local.cmd
```

Stop the application and local infrastructure:

```powershell
scripts\stop-local.cmd -Infrastructure
```

Runtime logs and PID files are stored in ignored `.local-runtime/`.
The setup command generates database, JWT, worker secrets, and local TLS
certificate material inside ignored `.env` and `.local-runtime/` files. Only
sanitized `.env.example` templates belong in Git.

## Three-minute demo

1. Open the landing page and switch between pure-black and pure-white themes.
2. Register a learner account and browse the 50-problem catalogue.
3. Open **Roadmaps** and follow a structured path into a real problem workspace.
4. Open **Leaderboard** to show public-safe rankings from local progress.
5. Open **Two Sum**, inspect its full editorial and five-step visualizer.
6. Write code, run public tests, then submit against protected hidden tests.
7. Show the real verdict, safe diagnostics, submission archive, and gamified dashboard.
8. Sign in with the local administrator created during setup.
9. Open the Problem and Editorial CMS review/publish workflows.

## Architecture

```text
Next.js web
   |
NestJS API -- PostgreSQL
   |
Redis / BullMQ
   |
Standalone judge worker
   |
Self-hosted Piston sandbox
```

The API never executes submitted code. Queue jobs contain identifiers rather
than hidden judge data, and hidden inputs, outputs, stderr, and per-case results
never leave the protected backend boundary.

## Manual development start

```powershell
# Infrastructure
docker compose up -d postgres redis piston

# API
cd services\api
npm.cmd install
npm.cmd run prisma:generate
npm.cmd run db:deploy
npm.cmd run db:seed
npm.cmd run start:dev

# Judge worker in another terminal
npm.cmd run start:worker:dev

# Web from the repository root
cd ..\..
npm.cmd install
npm.cmd run dev
```

## Release gates

```powershell
# Web
npm.cmd run lint
npm.cmd run build

# API
cd services\api
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run verify:launch-content

# Production dependency audit
cd ..\..
npm.cmd audit --omit=dev
```

Authenticated browser checks use disposable local learner and administrator
accounts:

```powershell
$env:E2E_EMAIL="learner@example.local"
$env:E2E_PASSWORD="local-password"
$env:E2E_ADMIN_EMAIL="admin@example.local"
$env:E2E_ADMIN_PASSWORD="local-admin-password"
npm.cmd run test:e2e
```

Detailed operations are in [the release runbook](docs/release-runbook.md).
The security boundary is defined in
[the judge worker contract](docs/judge-worker-contract.md).
