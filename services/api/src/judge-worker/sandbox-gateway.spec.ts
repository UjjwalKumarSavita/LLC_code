import type { SandboxExecutionRequest } from "../judge/judge.contract";
import { SandboxGateway } from "./sandbox-gateway";

const request: SandboxExecutionRequest = {
  contractVersion: 1,
  requestId: "submission:test",
  language: {
    slug: "python",
    version: "3.12",
    judgeLanguageId: null
  },
  sourceCode: "print(input())",
  stdin: "42",
  limits: {
    timeMs: 1_000,
    memoryKb: 262_144,
    outputKb: 256,
    processes: 32
  }
};

describe("SandboxGateway Piston adapter", () => {
  afterEach(() => jest.restoreAllMocks());

  it("maps a successful isolated execution to the LLC contract", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue(
      Response.json({
        language: "python",
        version: "3.12.0",
        run: {
          stdout: "42\n",
          stderr: "",
          code: 0,
          signal: null,
          status: null,
          wall_time: 18,
          memory: 12_697_600
        }
      })
    );

    const result = await new SandboxGateway(
      "http://localhost:2000",
      "",
      "piston"
    ).execute(request);

    expect(result).toEqual({
      contractVersion: 1,
      requestId: request.requestId,
      status: "OK",
      stdout: "42\n",
      stderr: "",
      runtimeMs: 18,
      memoryKb: 12_400,
      exitCode: 0
    });
    const init = fetchMock.mock.calls[0]?.[1];
    if (typeof init?.body !== "string") {
      throw new Error("Expected the Piston request body to be JSON");
    }
    const body = JSON.parse(init.body) as Record<string, unknown>;
    expect(body).toMatchObject({
      language: "python",
      version: "*",
      stdin: "42",
      run_timeout: 1_000,
      run_memory_limit: 268_435_456
    });
  });

  it("maps compile and timeout failures without exposing engine details", async () => {
    jest.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        Response.json({
          compile: {
            stdout: "",
            stderr: "syntax error",
            code: 1,
            status: "RE"
          },
          run: {
            stdout: "",
            stderr: "",
            code: null,
            status: null
          }
        })
      )
      .mockResolvedValueOnce(
        Response.json({
          run: {
            stdout: "",
            stderr: "",
            code: null,
            status: "TO"
          }
        })
      );
    const gateway = new SandboxGateway(
      "http://localhost:2000",
      "",
      "piston"
    );

    await expect(gateway.execute(request)).resolves.toMatchObject({
      status: "COMPILATION_ERROR"
    });
    await expect(gateway.execute(request)).resolves.toMatchObject({
      status: "TIME_LIMIT_EXCEEDED"
    });
  });
});
