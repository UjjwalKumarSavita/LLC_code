import {
  JUDGE_CONTRACT_VERSION,
  type SandboxExecutionRequest,
  type SandboxExecutionResponse,
  type SandboxExecutionStatus
} from "../judge/judge.contract";

const RESPONSE_LIMIT_BYTES = 2 * 1024 * 1024;
const VALID_STATUSES = new Set<SandboxExecutionStatus>([
  "OK",
  "COMPILATION_ERROR",
  "RUNTIME_ERROR",
  "TIME_LIMIT_EXCEEDED",
  "MEMORY_LIMIT_EXCEEDED",
  "OUTPUT_LIMIT_EXCEEDED",
  "INTERNAL_ERROR"
]);

export type SandboxProvider = "contract" | "piston";

export class SandboxGateway {
  constructor(
    private readonly baseUrl: string,
    private readonly secret: string,
    private readonly provider: SandboxProvider = "contract"
  ) {
    if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      throw new Error("JUDGE_ENGINE_URL must use http:// or https://");
    }
    if (provider === "contract" && secret.length < 32) {
      throw new Error("JUDGE_ENGINE_SECRET must contain at least 32 characters");
    }
  }

  async execute(request: SandboxExecutionRequest) {
    if (this.provider === "piston") return this.executeWithPiston(request);

    const response = await fetch(
      `${this.baseUrl.replace(/\/$/, "")}/v1/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.secret}`
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(request.limits.timeMs + 5_000)
      }
    );
    if (!response.ok) {
      throw new Error(`Sandbox engine rejected request with ${response.status}`);
    }

    const payload = await readLimitedJson(response);
    assertSandboxResponse(payload, request.requestId);
    return payload;
  }

  private async executeWithPiston(
    request: SandboxExecutionRequest
  ): Promise<SandboxExecutionResponse> {
    const response = await fetch(
      `${this.baseUrl.replace(/\/$/, "")}/api/v2/execute`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: pistonLanguage(request.language.slug),
          version: "*",
          files: [
            {
              name: sourceFilename(request.language.slug),
              content: request.sourceCode
            }
          ],
          stdin: request.stdin,
          compile_timeout: 10_000,
          compile_cpu_time: 10_000,
          compile_memory_limit: request.limits.memoryKb * 1024,
          run_timeout: request.limits.timeMs,
          run_cpu_time: request.limits.timeMs,
          run_memory_limit: request.limits.memoryKb * 1024
        }),
        signal: AbortSignal.timeout(request.limits.timeMs + 15_000)
      }
    );
    if (!response.ok) {
      throw new Error(`Piston rejected request with ${response.status}`);
    }
    const payload = (await readLimitedJson(response)) as PistonResponse;
    return pistonResponse(request.requestId, payload);
  }
}

type PistonStage = {
  stdout?: string;
  stderr?: string;
  code?: number | null;
  signal?: string | null;
  status?: "RE" | "SG" | "TO" | "OL" | "EL" | "XX" | null;
  wall_time?: number;
  memory?: number;
};

type PistonResponse = {
  compile?: PistonStage;
  run?: PistonStage;
};

function pistonResponse(
  requestId: string,
  payload: PistonResponse
): SandboxExecutionResponse {
  if (!payload || typeof payload !== "object" || !payload.run) {
    throw new Error("Piston response failed contract validation");
  }
  if (
    payload.compile &&
    (payload.compile.code !== 0 || payload.compile.status != null)
  ) {
    return {
      contractVersion: JUDGE_CONTRACT_VERSION,
      requestId,
      status: "COMPILATION_ERROR",
      stdout: payload.compile.stdout ?? "",
      stderr: payload.compile.stderr ?? "",
      runtimeMs: payload.compile.wall_time,
      memoryKb: bytesToKb(payload.compile.memory),
      exitCode: payload.compile.code ?? undefined
    };
  }

  const run = payload.run;
  return {
    contractVersion: JUDGE_CONTRACT_VERSION,
    requestId,
    status: pistonStatus(run),
    stdout: run.stdout ?? "",
    stderr: run.stderr ?? "",
    runtimeMs: run.wall_time,
    memoryKb: bytesToKb(run.memory),
    exitCode: run.code ?? undefined
  };
}

function pistonStatus(stage: PistonStage): SandboxExecutionStatus {
  if (stage.status === "TO") return "TIME_LIMIT_EXCEEDED";
  if (stage.status === "OL" || stage.status === "EL") {
    return "OUTPUT_LIMIT_EXCEEDED";
  }
  if (stage.status === "XX") return "INTERNAL_ERROR";
  if (stage.status === "RE" || stage.status === "SG") return "RUNTIME_ERROR";
  return stage.code === 0 ? "OK" : "RUNTIME_ERROR";
}

function pistonLanguage(slug: string) {
  return slug === "cpp" ? "c++" : slug;
}

function sourceFilename(slug: string) {
  const extensions: Record<string, string> = {
    c: "c",
    cpp: "cpp",
    java: "java",
    javascript: "js",
    python: "py",
    typescript: "ts"
  };
  return `main.${extensions[slug] ?? "txt"}`;
}

function bytesToKb(value: number | undefined) {
  return value == null ? undefined : Math.ceil(value / 1024);
}

async function readLimitedJson(response: Response): Promise<unknown> {
  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > RESPONSE_LIMIT_BYTES) {
    throw new Error("Sandbox response exceeded the transport limit");
  }
  if (!response.body) throw new Error("Sandbox response body is missing");

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > RESPONSE_LIMIT_BYTES) {
      await reader.cancel();
      throw new Error("Sandbox response exceeded the transport limit");
    }
    chunks.push(value);
  }

  const body = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(body) as unknown;
}

function assertSandboxResponse(
  value: unknown,
  requestId: string
): asserts value is SandboxExecutionResponse {
  if (!value || typeof value !== "object") {
    throw new Error("Sandbox response is not an object");
  }
  const candidate = value as Partial<SandboxExecutionResponse>;
  if (
    candidate.contractVersion !== JUDGE_CONTRACT_VERSION ||
    candidate.requestId !== requestId ||
    typeof candidate.status !== "string" ||
    !VALID_STATUSES.has(candidate.status) ||
    typeof candidate.stdout !== "string"
  ) {
    throw new Error("Sandbox response failed contract validation");
  }
}
