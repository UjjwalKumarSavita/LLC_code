import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { ProblemList } from "@/components/problem-list";
import { getPublicProblems } from "@/lib/server/problems-api";
import { getMyProgress, problemStatus } from "@/lib/server/progress-api";

export const metadata: Metadata = {
  title: "Problems — LLC_code",
  description: "Search and solve coding problems by topic and difficulty.",
};

export const dynamic = "force-dynamic";

export default async function ProblemsPage() {
  const [publicProblems, progress] = await Promise.all([
    getPublicProblems(),
    getMyProgress(),
  ]);
  const statuses = new Map(
    progress?.problems.map((problem) => [
      problem.slug,
      problemStatus(problem.status),
    ]),
  );
  const problems = publicProblems.map((problem) => ({
    ...problem,
    status: statuses.get(problem.slug) ?? "Unsolved",
  }));
  return (
    <main className="app-page">
      <AppHeader active="problems" />
      <ProblemList problems={problems} />
    </main>
  );
}
