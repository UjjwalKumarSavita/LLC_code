export type SubmissionKind = "RUN" | "SUBMIT";
export type SubmissionStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
export type SubmissionVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "MEMORY_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILATION_ERROR"
  | "PARTIALLY_ACCEPTED"
  | "INTERNAL_ERROR";

export type SubmissionSummary = {
  id: string;
  kind: SubmissionKind;
  status: SubmissionStatus;
  verdict: SubmissionVerdict | null;
  runtimeMs: number | null;
  memoryKb: number | null;
  passedTestCases: number;
  totalTestCases: number;
  errorMessage?: string | null;
  submittedAt: string;
  judgedAt?: string | null;
  problem?: { slug: string; title: string };
  language?: { slug: string; name: string };
};

export type SubmissionListResponse = {
  items: SubmissionSummary[];
  nextCursor: string | null;
  totalCount: number;
};

export type SubmissionTestResult = {
  id: string;
  status: SubmissionVerdict;
  runtimeMs: number | null;
  memoryKb: number | null;
  visibility: "SAMPLE" | "PUBLIC";
  input: string | null;
  explanation: string | null;
  actualOutput: string | null;
  expectedOutput: string | null;
  stderr: string | null;
};

export type SubmissionDetail = SubmissionSummary & {
  code: string;
  errorMessage: string | null;
  hiddenTestCount: number;
  testResults: SubmissionTestResult[];
  problem: { slug: string; title: string };
  language: { slug: string; name: string };
};

export const languageSlugs = {
  "Python 3": "python",
  Java: "java",
  "C++": "cpp",
  JavaScript: "javascript",
} as const;

export function verdictLabel(verdict: SubmissionVerdict | null) {
  if (!verdict) return "Pending";
  return verdict
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function submissionLabel(submission: SubmissionSummary) {
  if (submission.status === "QUEUED") return "Queued";
  if (submission.status === "PROCESSING") return "Processing";
  if (submission.status === "FAILED" && !submission.verdict) return "Judge unavailable";
  return verdictLabel(submission.verdict);
}

export function isFinished(status: SubmissionStatus) {
  return status === "COMPLETED" || status === "FAILED";
}

export async function apiErrorMessage(response: Response) {
  if (response.status === 429) {
    return "Too many requests. Let the judge breathe for a minute, then try again.";
  }
  if (response.status === 503) {
    return "The judge service is temporarily unavailable. Your draft is still saved.";
  }
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(payload.message)) return payload.message.join(" ");
    if (payload.message) return payload.message;
  } catch {
    // Use the safe fallback below when a proxy returns a non-JSON response.
  }
  return `Request failed (${response.status})`;
}
