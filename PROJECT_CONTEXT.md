# LLC_code Project Context

## Product

LLC_code is a visual coding-learning and online-judge platform inspired by the
problem-solving flow of LeetCode and the concept depth of GeeksforGeeks, while
remaining visually original and beginner-friendly.

## Permanent project constraints

- Product name is **LLC_code**. “CodeFlow Academy” is an obsolete placeholder.
- The project must not require paid services, APIs, assets, infrastructure, or
  subscriptions. Use free and open-source dependencies or self-hosted options.
- Never execute user-submitted code on the main application server.
- Hidden test cases must never be exposed to students.
- Dark mode uses pure black and pure white; light mode uses pure white and pure
  black. Neutral gray may be used only for hierarchy, borders, and inactive UI.
- The experience should be highly animated, smooth, responsive, high-DPI, and
  usable from mobile through 4K displays.
- Motion must remain meaningful, performant, and compatible with
  `prefers-reduced-motion`.

## MVP priority

1. Authentication and roles
2. Problem CMS and test-case management
3. Problem listing and problem-solving workspace
4. Code editor
5. Isolated judge integration
6. Submission results and history
7. Editorials, hints, and basic progress tracking

## Current milestone

The application foundation, animated public landing experience, functional
problem bank, responsive problem-solving workspace, backend foundation,
frontend authentication, and admin problem CMS are complete.

The backend is an isolated NestJS service under `services/api` with a Prisma 7
PostgreSQL schema, Argon2id authentication, rotating refresh tokens, role-based
CMS access, publication gates, hidden test protection, audit logs, and problem,
test-case, and code-template APIs.

Frontend sessions use secure HttpOnly cookies through same-origin Next.js route
handlers, automatic access-token rotation, optimistic route protection, and
server-backed role verification. The admin CMS includes searchable problem
management, draft editing, examples, judge cases, starter templates, review,
publication, and archive controls.

The isolated judge queue and worker contract are complete. Authenticated run
and submit APIs create queued records, BullMQ carries identifier-only jobs over
self-hosted Redis, and a standalone worker evaluates protected test data through
a versioned external sandbox contract. The API and worker never execute user
code, hidden result details are redacted, and official progress updates are
transactional and idempotent.

The problem workspace now sends authenticated Run and Submit requests through
the same-origin submission proxy, polls real queue records to completion, and
renders real verdict, runtime, memory, and test-count data. Per-problem
submission history is account-backed, source drafts persist per language in
local storage, and authentication, queue, timeout, and sandbox failures are
shown honestly instead of being replaced with simulated verdicts.

The separately isolated, self-hosted Piston engine is now connected through a
provider adapter. Python, JavaScript, C++, and Java execute locally with no
subscription or external API. End-to-end tests verified Redis queueing,
isolated execution, hidden-case comparison, result persistence, and progress
updates in all four languages.

Fifty problems are now published as judge-ready database records. Every
problem has examples, visible/public/hidden tests, hints, tags, and executable
Python, JavaScript, C++, and Java stdin/stdout templates. The catalogue contains
200 language templates and 200 configured test cases. The four ten-problem
catalogue batches completed 640/640 reference executions through the real,
self-hosted Piston sandbox: forty problems, four languages, and four tests
each.

The public problem bank and problem workspace now source statements, formats,
constraints, examples, hints, tags, and available language templates from the
backend. The obsolete static problem catalog was removed.

Account-backed progress is complete. A protected summary API derives solved,
attempted, remaining, earned points, attempts, difficulty coverage, topic
coverage, best submissions, and recent activity from finalized judge records.
The problem bank merges the signed-in learner's real status, and `/dashboard`
provides a responsive progress, continuation, topic, and activity workspace.
Unauthenticated dashboard access redirects to login.

The problem workspace now uses the free, MIT-licensed Monaco Editor instead of
the textarea. It includes monochrome light/dark themes, syntax support for all
four judge languages, smooth scrolling, bracket guides, optional minimap and
word wrap, adjustable font and tab sizes, persisted editor preferences,
per-language drafts, animated save status, and keyboard shortcuts for Run and
Submit. Production build and desktop/mobile browser verification pass without
console errors.

The dedicated submission experience is complete. `/submissions` provides an
account-owned, cursor-paginated execution archive with debounced problem
search and server-side type, verdict, and language filters. Every history row
links to `/submissions/[id]`, and dashboard and problem-workspace activity
links now open the same canonical detail view.

Submission details include verdict messaging, runtime, memory, test totals,
language, timestamps, record identity, copyable source review, and visible
sample/public-case input and output diagnostics. Hidden result rows are removed
from the student response entirely and represented only by an aggregate hidden
case count; hidden inputs, outputs, stderr, explanations, and per-case outcomes
never leave the API. Ownership remains enforced by user ID.

The submission milestone passes 18 backend tests, the NestJS production build,
frontend lint, and the Next.js production build. The API production build also
disables the stale incremental emit cache so clean Nest builds always contain
every runtime module.

The first MVP release-hardening pass is complete. Route, root-shell, not-found,
and loading recovery surfaces preserve the monochrome visual language and tell
learners when locally saved drafts remain safe. Judge throttling and temporary
outages now produce deliberate recovery messages instead of generic HTTP
errors.

The web layer removes its framework signature and emits frame denial, MIME
sniffing protection, strict referrer behavior, locked camera/microphone/
geolocation/payment/USB permissions, and cross-origin opener isolation. API
startup now validates service URLs and rejects reused JWT access/refresh
secrets in addition to the existing required-variable and secret-length gates.

The root README and `docs/release-runbook.md` document a zero-subscription,
self-hosted production topology, trust boundaries, environment configuration,
build/migration/start order, reverse-proxy requirements, smoke checks, backup
and recovery, updates, and remaining launch gates.

The visual learning library now contains ten reusable, five-step visualizers.
In addition to hash-map lookup, stack matching, binary-search intervals, Kadane
dynamic programming, and grid flood fill, it covers prefix accumulation,
Boyer-Moore cancellation, stable zero compaction, take-or-skip house robber
dynamic programming, and lower-bound insertion search. Problems without a
reviewed visualization retain a deliberate fallback.

All fifty problems now have published, reviewed editorials stored in the
database. Each editorial includes intuition, a brute-force baseline, ordered
optimized steps, a concrete dry run, complexity, and common mistakes. The
learner workspace receives only published editorial records through the public
problem API. The richer reader exposes every reviewed section with a compact
section map, responsive summary cards, and language-specific reference
solutions that remain separate from learner starter code.

Local Playwright regression uses the installed Chrome browser with no hosted
service or subscription. Sixteen public critical-path checks cover
desktop/mobile problem discovery, authentication protection, designed route
recovery, problem workspaces, roadmap-to-workspace navigation, leaderboard
safety, legal links, and language-specific editorial reference solutions.
With local learner/admin credentials supplied, twenty-two checks pass and only
the two mobile duplicates of destructive admin CMS flows are intentionally
skipped. The suite has caught and fixed a pre-hydration login submission path
that could expose form values in the URL, a 20-item learner catalogue pagination
ceiling, a CMS session-response mismatch that redirected valid administrators,
a rolling-response editorial shape crash, a mobile canvas tap interception
issue, admin post-login navigation races, and destructive editorial-test cleanup
that could leave seeded coverage below 50/50.

Release regression currently passes frontend lint/build, backend lint/build,
25 backend tests, 640/640 catalogue sandbox executions, 22 credentialed browser
checks, API health checks, and a production dependency audit with zero known
vulnerabilities. The free Moby daemon is held by a persistent hidden WSL host
process; PostgreSQL and Redis are healthy, Piston exposes all four required
runtimes, and the standalone judge worker is running.

The editorial CMS milestone is complete. Administrators can search all 50
problems, see published coverage, author six structured explanation sections,
save drafts, submit review, publish to learners, and archive editorials. Role
guards, publication completeness gates, audit records, and the public
published-only boundary are enforced by the API.

The richer learner editorial milestone is complete. The next milestone is
remaining post-MVP scope such as contests, mentor batches, AI tutoring,
plagiarism detection, certificates, proctoring, and native mobile applications.
