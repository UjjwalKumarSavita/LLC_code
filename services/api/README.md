# LLC_code API

NestJS + Prisma/PostgreSQL backend for LLC_code.

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

All dependencies are free and open source. No managed service is required.

## Local setup

1. Copy `.env.example` to `.env` and replace both JWT secrets.
2. Start PostgreSQL, Redis, and the local isolated judge:

   ```powershell
   docker compose -f ..\..\compose.yaml up -d postgres redis piston
   ```

   Docker is optional for PostgreSQL and Redis. Isolated code execution requires
   a compatible separately deployed sandbox.

3. Prepare the API:

   ```powershell
   npm.cmd install
   npm.cmd run prisma:generate
   npm.cmd run db:migrate -- --name init
   npm.cmd run db:seed
   npm.cmd run start:dev
   ```

The seed creates ten published judge-ready problems with verified Python,
JavaScript, C++, and Java templates.

The API listens at `http://localhost:4000/api`.

The Docker PostgreSQL service is exposed on Windows port `55432` to avoid
conflicts with locally installed PostgreSQL servers. Redis uses port `6379`.

## Implemented endpoints

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Public problem API

- `GET /api/problems`
- `GET /api/problems/:slug`

Hidden test cases are never selected by public endpoints.

### Protected CMS API

- `GET /api/problems/cms/list`
- `GET /api/problems/cms/:id`
- `POST /api/problems`
- `PATCH /api/problems/:id`
- `POST /api/problems/:id/review`
- `POST /api/problems/:id/publish`
- `DELETE /api/problems/:id`
- `POST /api/problems/:id/test-cases`
- `DELETE /api/problems/:problemId/test-cases/:testCaseId`
- `POST /api/problems/:id/templates`

Content mutations require content-writer, reviewer, admin, or super-admin
permissions. Publishing requires reviewer or admin permissions. Deletion is a
soft archive and requires admin access.

### Protected submission API

- `POST /api/submissions/run`
- `POST /api/submissions/submit`
- `GET /api/submissions`
- `GET /api/submissions/:id`

Every run and submission is queued. `RUN` jobs use only sample/public cases and
do not update official progress. `SUBMIT` jobs include hidden cases and update
progress transactionally after judging.

### Protected learner progress API

- `GET /api/progress`

The summary includes solved, attempted, and remaining counts, earned points,
total attempts, difficulty and topic coverage, best submissions, per-problem
state, and recent submission activity.

Build the API before starting the standalone worker:

```powershell
npm.cmd run build
npm.cmd run start:worker
```

Local development uses the separately isolated, self-hosted Piston service.
Python, JavaScript, C++, and Java runtimes must be installed once through its
local package API. The adapter, versioned contract, security boundary, and
production deployment rules are documented in
`../../docs/judge-worker-contract.md`.

## Security behavior

- Passwords use Argon2id.
- Access and refresh tokens use different secrets.
- Refresh tokens are hashed in the database, rotated on use, and revocable.
- Request DTOs use strict allow-list validation.
- Helmet, origin-restricted CORS, and global throttling are enabled.
- Published problems require samples, hidden tests, and a code template.
- CMS mutations generate audit-log records.
- Redis queue payloads contain only submission identifiers, never source code
  or hidden tests.
- The API and BullMQ worker never execute user code. The worker calls only the
  separately deployed sandbox engine and fails closed when it is unavailable.
