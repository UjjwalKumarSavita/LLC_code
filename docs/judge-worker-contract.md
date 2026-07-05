# LLC_code Judge Queue and Worker Contract

## Security boundary

The web application and NestJS API never execute submitted code. The BullMQ
worker also does not use `eval`, child processes, Docker sockets, language
runtimes, or an in-process fallback. It sends execution requests only to the
separately configured `JUDGE_ENGINE_URL`.

The sandbox engine must be deployed independently and must enforce:

- a non-root runtime user;
- no outbound network (`--network none`);
- a read-only root filesystem with a small temporary workspace;
- CPU, memory, process, execution-time, and output-size limits;
- dropped Linux capabilities and `no-new-privileges`;
- workspace deletion after every execution;
- no host filesystem or Docker socket mounts.

If the engine is missing, unavailable, or returns an invalid response, the job
is retried and then marked `INTERNAL_ERROR`. No code runs elsewhere.

## Queue contract

Queue: `llc-code-judge-v1`

Job: `evaluate-submission`

Redis contains identifiers only:

```json
{
  "contractVersion": 1,
  "submissionId": "uuid",
  "kind": "RUN"
}
```

`kind` is `RUN` or `SUBMIT`. Source code, test input, expected output, user
details, and hidden-test metadata are not placed in Redis. The UUID is also the
BullMQ job ID, making enqueueing idempotent.

Jobs use three attempts with exponential backoff. Completed jobs are retained
briefly for operations, while failed jobs remain longer for diagnosis.

## Sandbox HTTP contract

The default `contract` provider calls:

```http
POST {JUDGE_ENGINE_URL}/v1/execute
Authorization: Bearer {JUDGE_ENGINE_SECRET}
Content-Type: application/json
```

Request:

```json
{
  "contractVersion": 1,
  "requestId": "submission-uuid:test-case-uuid",
  "language": {
    "slug": "python",
    "version": "3.13",
    "judgeLanguageId": 71
  },
  "sourceCode": "print(input())",
  "stdin": "42",
  "limits": {
    "timeMs": 1000,
    "memoryKb": 262144,
    "outputKb": 256,
    "processes": 32
  }
}
```

Response:

```json
{
  "contractVersion": 1,
  "requestId": "submission-uuid:test-case-uuid",
  "status": "OK",
  "stdout": "42\n",
  "stderr": "",
  "runtimeMs": 18,
  "memoryKb": 12400,
  "exitCode": 0
}
```

Allowed statuses:

- `OK`
- `COMPILATION_ERROR`
- `RUNTIME_ERROR`
- `TIME_LIMIT_EXCEEDED`
- `MEMORY_LIMIT_EXCEEDED`
- `OUTPUT_LIMIT_EXCEEDED`
- `INTERNAL_ERROR`

The worker rejects mismatched contract versions or request IDs and limits the
engine response body to 2 MiB.

## Local Piston provider

Local development uses the free, MIT-licensed, self-hosted Piston engine. Set:

```env
JUDGE_ENGINE_PROVIDER=piston
JUDGE_ENGINE_URL=http://127.0.0.1:2000
```

The worker translates the LLC_code request into Piston's `/api/v2/execute`
contract and maps execution results into the internal response. Piston remains
a separate process and the worker still never executes code itself.

The compose service is bound to Windows loopback only. Piston uses Isolate,
Linux namespaces, cgroup v2, per-job unprivileged users, disabled outbound
network access, resource limits, and per-execution cleanup. Its container is
privileged because Isolate needs namespace and cgroup control; production
deployments should run it on a dedicated judge host, never on the web/API host.

## Result rules

- `RUN` evaluates only sample/public test cases and does not affect official
  submission totals or learner progress.
- `SUBMIT` evaluates every active test case, including hidden cases.
- Expected output never leaves the worker except for persistence in the
  protected database.
- Student-facing API responses omit hidden actual output, expected output, and
  stderr.
- Official submission and progress counters update in one database transaction.
- Reprocessing an already finalized submission has no effect.

Comparison modes are `EXACT`, `TRIMMED`, `TOKEN`, and `FLOAT`. `CUSTOM` fails
closed until a dedicated checker sandbox is connected.

## Local services

Start the free self-hosted services:

```powershell
docker compose up -d postgres redis piston
```

Install the Python 3.12.0, Node 20.11.1, GCC 10.2.0, and Java 15.0.2 runtime
packages once through Piston's local `/api/v2/packages` endpoint.

Build and start the API:

```powershell
cd services\api
npm.cmd run build
npm.cmd run start:prod
```

Start the worker in a separate process after configuring a sandbox engine:

```powershell
npm.cmd run start:worker
```

Never point `JUDGE_ENGINE_URL` at the API or frontend process.
