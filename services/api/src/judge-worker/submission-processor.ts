import type { Job } from "bullmq";
import type { PrismaClient } from "../generated/prisma/client";
import {
  ProgressStatus,
  SubmissionKind,
  SubmissionStatus,
  TestCaseVisibility,
  Verdict
} from "../generated/prisma/enums";
import {
  JUDGE_CONTRACT_VERSION,
  type JudgeCaseResult,
  type JudgeJobData,
  type SandboxExecutionRequest,
  type SandboxExecutionStatus
} from "../judge/judge.contract";
import { outputsMatch } from "./output-comparator";
import { SandboxGateway } from "./sandbox-gateway";

type FinalizableSubmission = {
  id: string;
  userId: string;
  problemId: string;
  kind: SubmissionKind;
  problem: {
    testCases: Array<{
      id: string;
      expectedOutput: string | null;
    }>;
  };
};

export class SubmissionProcessor {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly sandbox: SandboxGateway,
    private readonly maxOutputKb: number
  ) {}

  async process(job: Job<JudgeJobData>) {
    assertJob(job.data);
    const submission = await this.prisma.submission.findUnique({
      where: { id: job.data.submissionId },
      include: {
        language: true,
        problem: {
          include: {
            testCases: {
              where: {
                isActive: true,
                visibility:
                  job.data.kind === SubmissionKind.RUN
                    ? {
                        in: [
                          TestCaseVisibility.SAMPLE,
                          TestCaseVisibility.PUBLIC
                        ]
                      }
                    : undefined
              },
              orderBy: { createdAt: "asc" }
            }
          }
        }
      }
    });
    if (!submission) return { skipped: "submission-not-found" };
    if (submission.kind !== job.data.kind) {
      throw new Error("Queue job kind does not match submission");
    }
    if (
      submission.status === SubmissionStatus.COMPLETED ||
      submission.status === SubmissionStatus.FAILED
    ) {
      return { skipped: "already-finalized" };
    }

    await this.prisma.submission.update({
      where: { id: submission.id },
      data: { status: SubmissionStatus.PROCESSING }
    });

    if (submission.problem.testCases.length === 0) {
      throw new Error("Submission has no eligible test cases");
    }

    const results: JudgeCaseResult[] = [];
    for (const testCase of submission.problem.testCases) {
      if (testCase.inputFileUrl || testCase.outputFileUrl) {
        throw new Error("External test data requires an object-storage adapter");
      }
      if (testCase.input == null || testCase.expectedOutput == null) {
        throw new Error("Inline test case data is incomplete");
      }

      const requestId = `${submission.id}:${testCase.id}`;
      const request: SandboxExecutionRequest = {
        contractVersion: JUDGE_CONTRACT_VERSION,
        requestId,
        language: {
          slug: submission.language.slug,
          version: submission.language.version,
          judgeLanguageId: submission.language.judgeLanguageId
        },
        sourceCode: submission.code,
        stdin: testCase.input,
        limits: {
          timeMs: testCase.timeLimitMs ?? submission.problem.timeLimitMs,
          memoryKb:
            (testCase.memoryLimitMb ?? submission.problem.memoryLimitMb) * 1024,
          outputKb: this.maxOutputKb,
          processes: 32
        }
      };
      const response = await this.sandbox.execute(request);
      const verdict =
        response.status === "OK"
          ? outputsMatch({
              actual: response.stdout,
              expected: testCase.expectedOutput,
              mode: submission.problem.comparisonMode
            })
            ? Verdict.ACCEPTED
            : Verdict.WRONG_ANSWER
          : sandboxStatusToVerdict(response.status);
      results.push({
        testCaseId: testCase.id,
        verdict,
        actualOutput: truncate(response.stdout, this.maxOutputKb * 1024),
        runtimeMs: response.runtimeMs,
        memoryKb: response.memoryKb,
        stderr: response.stderr
          ? truncate(response.stderr, 4 * 1024)
          : undefined
      });

      if (verdict === Verdict.COMPILATION_ERROR) break;
    }

    const verdict = aggregateVerdict(results);
    await this.finalize(submission, results, verdict);
    return { verdict, passed: countAccepted(results), total: results.length };
  }

  async failPermanently(submissionId: string) {
    await this.prisma.submission.updateMany({
      where: {
        id: submissionId,
        status: {
          in: [SubmissionStatus.QUEUED, SubmissionStatus.PROCESSING]
        }
      },
      data: {
        status: SubmissionStatus.FAILED,
        verdict: Verdict.INTERNAL_ERROR,
        errorMessage: "The judge could not complete this submission",
        judgedAt: new Date(),
        judgeResponse: { failureCategory: "WORKER_FAILURE" }
      }
    });
  }

  private async finalize(
    submission: FinalizableSubmission,
    results: JudgeCaseResult[],
    verdict: Verdict
  ) {
    const accepted = verdict === Verdict.ACCEPTED;
    const now = new Date();
    await this.prisma.$transaction(async (transaction) => {
      const current = await transaction.submission.findUnique({
        where: { id: submission.id },
        select: { status: true }
      });
      if (
        !current ||
        current.status === SubmissionStatus.COMPLETED ||
        current.status === SubmissionStatus.FAILED
      ) {
        return;
      }

      await transaction.submissionTestResult.deleteMany({
        where: { submissionId: submission.id }
      });
      await transaction.submissionTestResult.createMany({
        data: results.map((result) => ({
          submissionId: submission.id,
          testCaseId: result.testCaseId,
          status: result.verdict,
          actualOutput: result.actualOutput,
          expectedOutput:
            submission.problem.testCases.find(
              (testCase) => testCase.id === result.testCaseId
            )?.expectedOutput ?? null,
          stderr: result.stderr,
          runtimeMs: result.runtimeMs,
          memoryKb: result.memoryKb
        }))
      });
      await transaction.submission.update({
        where: { id: submission.id },
        data: {
          status: SubmissionStatus.COMPLETED,
          verdict,
          runtimeMs: maximum(results.map((result) => result.runtimeMs)),
          memoryKb: maximum(results.map((result) => result.memoryKb)),
          passedTestCases: countAccepted(results),
          totalTestCases: submission.problem.testCases.length,
          judgedAt: now,
          errorMessage: null,
          judgeResponse: {
            contractVersion: JUDGE_CONTRACT_VERSION,
            completedCases: results.length
          }
        }
      });

      if (submission.kind === SubmissionKind.SUBMIT) {
        await transaction.problem.update({
          where: { id: submission.problemId },
          data: {
            totalSubmissions: { increment: 1 },
            acceptedSubmissions: accepted ? { increment: 1 } : undefined
          }
        });
        const progress = await transaction.userProblemProgress.findUnique({
          where: {
            userId_problemId: {
              userId: submission.userId,
              problemId: submission.problemId
            }
          }
        });
        const wasSolved = progress?.status === ProgressStatus.SOLVED;
        await transaction.userProblemProgress.upsert({
          where: {
            userId_problemId: {
              userId: submission.userId,
              problemId: submission.problemId
            }
          },
          create: {
            userId: submission.userId,
            problemId: submission.problemId,
            status: accepted
              ? ProgressStatus.SOLVED
              : ProgressStatus.ATTEMPTED,
            bestSubmissionId: accepted ? submission.id : null,
            attempts: 1,
            solvedAt: accepted ? now : null,
            lastAttemptedAt: now
          },
          update: {
            status:
              accepted || wasSolved
                ? ProgressStatus.SOLVED
                : ProgressStatus.ATTEMPTED,
            bestSubmissionId: accepted
              ? submission.id
              : progress?.bestSubmissionId,
            attempts: { increment: 1 },
            solvedAt: accepted ? progress?.solvedAt ?? now : progress?.solvedAt,
            lastAttemptedAt: now
          }
        });
      }
    });
  }
}

function assertJob(data: JudgeJobData) {
  if (
    data.contractVersion !== JUDGE_CONTRACT_VERSION ||
    !data.submissionId ||
    !Object.values(SubmissionKind).includes(data.kind)
  ) {
    throw new Error("Judge job failed contract validation");
  }
}

function sandboxStatusToVerdict(status: SandboxExecutionStatus) {
  const verdicts: Record<SandboxExecutionStatus, Verdict> = {
    OK: Verdict.ACCEPTED,
    COMPILATION_ERROR: Verdict.COMPILATION_ERROR,
    RUNTIME_ERROR: Verdict.RUNTIME_ERROR,
    TIME_LIMIT_EXCEEDED: Verdict.TIME_LIMIT_EXCEEDED,
    MEMORY_LIMIT_EXCEEDED: Verdict.MEMORY_LIMIT_EXCEEDED,
    OUTPUT_LIMIT_EXCEEDED: Verdict.RUNTIME_ERROR,
    INTERNAL_ERROR: Verdict.INTERNAL_ERROR
  };
  return verdicts[status];
}

export function aggregateVerdict(results: JudgeCaseResult[]) {
  if (results.length === 0) return Verdict.INTERNAL_ERROR;
  if (results.every((result) => result.verdict === Verdict.ACCEPTED)) {
    return Verdict.ACCEPTED;
  }
  const accepted = countAccepted(results);
  if (accepted > 0) return Verdict.PARTIALLY_ACCEPTED;
  const priority = [
    Verdict.COMPILATION_ERROR,
    Verdict.TIME_LIMIT_EXCEEDED,
    Verdict.MEMORY_LIMIT_EXCEEDED,
    Verdict.RUNTIME_ERROR,
    Verdict.WRONG_ANSWER,
    Verdict.INTERNAL_ERROR
  ];
  return (
    priority.find((candidate) =>
      results.some((result) => result.verdict === candidate)
    ) ?? Verdict.INTERNAL_ERROR
  );
}

function countAccepted(results: JudgeCaseResult[]) {
  return results.filter((result) => result.verdict === Verdict.ACCEPTED).length;
}

function maximum(values: Array<number | undefined>) {
  const numbers = values.filter((value): value is number => value != null);
  return numbers.length ? Math.max(...numbers) : null;
}

function truncate(value: string, maxBytes: number) {
  const buffer = Buffer.from(value);
  return buffer.byteLength <= maxBytes
    ? value
    : `${buffer.subarray(0, maxBytes).toString("utf8")}\n[output truncated]`;
}
