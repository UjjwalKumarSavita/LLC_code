import "server-only";

import type { ProblemStatus } from "@/lib/problem-types";
import type { ProgressStatus, ProgressSummary } from "@/lib/progress-types";
import { authenticatedBackendFetch } from "@/lib/server/backend-auth";

export async function getMyProgress(): Promise<ProgressSummary | null> {
  const { response } = await authenticatedBackendFetch("/progress");
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Progress service is unavailable");
  return (await response.json()) as ProgressSummary;
}

export function problemStatus(status: ProgressStatus): ProblemStatus {
  if (status === "SOLVED") return "Solved";
  if (status === "ATTEMPTED") return "Attempted";
  return "Unsolved";
}
