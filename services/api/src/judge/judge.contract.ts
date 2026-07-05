import type { ComparisonMode, SubmissionKind, Verdict } from "../generated/prisma/enums";

export const JUDGE_QUEUE_NAME = "llc-code-judge-v1";
export const JUDGE_JOB_NAME = "evaluate-submission";
export const JUDGE_CONTRACT_VERSION = 1 as const;

export type JudgeJobData = {
  contractVersion: typeof JUDGE_CONTRACT_VERSION;
  submissionId: string;
  kind: SubmissionKind;
};

export type SandboxExecutionRequest = {
  contractVersion: typeof JUDGE_CONTRACT_VERSION;
  requestId: string;
  language: {
    slug: string;
    version: string | null;
    judgeLanguageId: number | null;
  };
  sourceCode: string;
  stdin: string;
  limits: {
    timeMs: number;
    memoryKb: number;
    outputKb: number;
    processes: number;
  };
};

export type SandboxExecutionStatus =
  | "OK"
  | "COMPILATION_ERROR"
  | "RUNTIME_ERROR"
  | "TIME_LIMIT_EXCEEDED"
  | "MEMORY_LIMIT_EXCEEDED"
  | "OUTPUT_LIMIT_EXCEEDED"
  | "INTERNAL_ERROR";

export type SandboxExecutionResponse = {
  contractVersion: typeof JUDGE_CONTRACT_VERSION;
  requestId: string;
  status: SandboxExecutionStatus;
  stdout: string;
  stderr?: string;
  runtimeMs?: number;
  memoryKb?: number;
  exitCode?: number;
};

export type JudgeCaseResult = {
  testCaseId: string;
  verdict: Verdict;
  actualOutput?: string;
  runtimeMs?: number;
  memoryKb?: number;
  stderr?: string;
};

export type ComparisonRequest = {
  actual: string;
  expected: string;
  mode: ComparisonMode;
};
