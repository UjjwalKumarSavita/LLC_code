# LLC_code MVP release runbook

This runbook describes a zero-subscription deployment. Every component can run
on hardware you control using free and open-source software.

## 1. Runtime topology

Keep the trust boundaries separate:

```text
Internet
   |
reverse proxy (HTTPS)
   |
Next.js web :3000  --->  NestJS API :4000  ---> PostgreSQL :5432
                              |              ---> Redis :6379
                              |
                         BullMQ identifiers only
                              |
                        judge worker  ---> isolated Piston :2000
```

- Expose only the HTTPS reverse proxy publicly.
- Use a trusted HTTPS certificate, such as a free Let's Encrypt certificate,
  for any non-local deployment.
- Do not expose PostgreSQL, Redis, or Piston to the internet.
- Run Piston on a separate VM or host when serving untrusted users.
- The API and worker must never execute submitted source directly.
- Queue jobs contain submission IDs only; source and hidden tests remain in
  PostgreSQL and are loaded by the worker.

## 2. Free software stack

- Node.js, Next.js, NestJS and Prisma
- PostgreSQL
- Redis
- Moby Engine or Docker Engine
- Piston
- Caddy or Nginx for HTTPS
- Operating-system logs plus PostgreSQL-native backups

No hosted judge, analytics, email, monitoring, storage, or error-tracking
subscription is required for the MVP.

## 3. Production environment

Web:

```env
NODE_ENV=production
API_BASE_URL=http://127.0.0.1:4000/api
```

API and worker:

```env
NODE_ENV=production
PORT=4000
WEB_ORIGIN=https://your-domain.example
DATABASE_URL=postgresql://USER:STRONG_PASSWORD@127.0.0.1:5432/llc_code?schema=public
REDIS_URL=redis://127.0.0.1:6379
JWT_ACCESS_SECRET=GENERATE_AT_LEAST_32_RANDOM_CHARACTERS
JWT_REFRESH_SECRET=GENERATE_A_DIFFERENT_RANDOM_SECRET
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
JUDGE_ENGINE_PROVIDER=piston
JUDGE_ENGINE_URL=http://PRIVATE_PISTON_HOST:2000
JUDGE_WORKER_CONCURRENCY=2
JUDGE_MAX_OUTPUT_KB=256
```

Generate secrets locally with a cryptographically secure operating-system
tool. Never commit real secrets or reuse the access and refresh secrets.

## 4. Build and migrate

Pin the Node.js major version in the host image or service configuration.

```powershell
# Web
npm.cmd ci
npm.cmd run lint
npm.cmd run build

# API and worker
cd services\api
npm.cmd ci
npm.cmd run prisma:generate
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run db:deploy
```

Seed only on a new environment. Configure `BOOTSTRAP_ADMIN_EMAIL` and
`BOOTSTRAP_ADMIN_PASSWORD` temporarily, run `npm.cmd run db:seed`, then remove
both variables from the service environment.

## 5. Start services

Run these as separate restricted operating-system users or services:

```powershell
# Web
npm.cmd start

# API
cd services\api
npm.cmd run start:prod

# Worker
npm.cmd run start:worker
```

The worker and API may share database and Redis access, but only the worker may
reach the private sandbox endpoint. Piston must not reach the application
database or Redis network.

## 6. Reverse proxy requirements

- Terminate HTTPS with a valid certificate.
- Proxy `/` to the web service.
- Keep the API private because the web application already provides
  same-origin proxies.
- Preserve `Host` and forwarding headers.
- Set a request-body limit appropriate for source submissions.
- Apply connection and request-rate limits at the edge in addition to NestJS
  throttling.

The web app emits frame denial, MIME sniffing protection, restrictive browser
permissions, referrer policy, and cross-origin opener headers. The API uses
Helmet, strict DTO allow-listing, origin-restricted CORS, and global throttling.

## 7. Health and smoke checks

Before routing traffic:

```powershell
Invoke-RestMethod http://127.0.0.1:4000/api/health
Invoke-WebRequest https://your-domain.example/login -UseBasicParsing
```

Then verify:

1. Register and log in.
2. Open the problem bank and a problem.
3. Run one visible sample.
4. Submit in Python, JavaScript, C++, and Java.
5. Confirm results appear in `/submissions`.
6. Confirm a detail page never shows hidden input, output, stderr, explanation,
   or per-hidden-case verdict.
7. Confirm admin routes reject a student account.
8. Confirm API and worker logs contain no source code or hidden test payload.

## 8. Backups and recovery

- Take encrypted daily PostgreSQL dumps with `pg_dump`.
- Retain at least one off-host copy.
- Test restoration before launch and on a regular schedule.
- Redis persistence helps queue recovery but is not the source of truth;
  PostgreSQL submission state is authoritative.
- Back up environment secrets separately from database dumps.
- Do not back up ephemeral sandbox work directories.

## 9. Update procedure

1. Back up PostgreSQL.
2. Build and test the candidate release.
3. Stop the worker so it does not acquire new jobs.
4. Allow active jobs to finish or time out.
5. Apply Prisma migrations with `db:deploy`.
6. Restart API, web, then worker.
7. Run health and smoke checks.
8. Roll back application binaries if checks fail; never reverse a database
   migration without a reviewed recovery plan.

## 10. Current launch gates

The submission-ready local MVP currently includes 50 published judge-ready
problems, 50 reviewed editorials, 200 language starter templates, 200 editorial
reference solutions, 10 reviewed visualizers, account progress, submission
history, leaderboard, roadmap flows, and problem/editorial CMS workflows.

Before a public internet launch, still complete:

- accessibility and responsive checks on representative physical devices;
- a sandbox isolation review on the actual production host;
- backup restoration and load tests;
- production-domain terms and privacy pages appropriate to the deployment jurisdiction;
- edge rate limits and operational monitoring using free/self-hosted tooling.
