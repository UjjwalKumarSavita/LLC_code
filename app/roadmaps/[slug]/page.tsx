import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { getRoadmap, roadmaps } from "@/lib/roadmaps";
import { getMyProgress } from "@/lib/server/progress-api";
import { getPublicProblems } from "@/lib/server/problems-api";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return roadmaps.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const roadmap = getRoadmap((await params).slug);
  return {
    title: roadmap ? `${roadmap.title} Roadmap — LLC_code` : "Roadmap — LLC_code",
    description: roadmap?.description,
  };
}

export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const roadmap = getRoadmap((await params).slug);
  if (!roadmap) notFound();

  const [catalogue, progress] = await Promise.all([
    getPublicProblems(),
    getMyProgress(),
  ]);
  const bySlug = new Map(catalogue.map((problem) => [problem.slug, problem]));
  const statusBySlug = new Map(
    progress?.problems.map((problem) => [problem.slug, problem.status]) ?? [],
  );
  const problems = roadmap.problemSlugs
    .map((slug) => bySlug.get(slug))
    .filter((problem) => problem !== undefined);
  const solvedCount = problems.filter(
    (problem) => statusBySlug.get(problem.slug) === "SOLVED",
  ).length;
  const nextProblem =
    problems.find((problem) => statusBySlug.get(problem.slug) === "ATTEMPTED") ??
    problems.find((problem) => statusBySlug.get(problem.slug) !== "SOLVED") ??
    problems[0];
  const completion = problems.length
    ? Math.round((solvedCount / problems.length) * 100)
    : 0;

  return (
    <main className="app-page roadmap-detail-page">
      <AppHeader active="roadmaps" />
      <div className="roadmap-detail-shell">
        <Link className="roadmap-back" href="/roadmaps">← All roadmaps</Link>
        <section className="roadmap-detail-hero">
          <div>
            <span className="app-eyebrow">PATH {roadmap.number} / {roadmap.level}</span>
            <h1>{roadmap.title}</h1>
            <p>{roadmap.description}</p>
          </div>
          <div className="roadmap-completion">
            <strong>{completion}%</strong>
            <span>{solvedCount} OF {problems.length} SOLVED</span>
            <i><b style={{ width: `${completion}%` }} /></i>
          </div>
        </section>

        <section className="roadmap-node-list" aria-label={`${roadmap.title} problems`}>
          {problems.map((problem, index) => {
            const status = statusBySlug.get(problem.slug) ?? "UNSOLVED";
            return (
              <article className={`roadmap-node is-${status.toLowerCase()}`} key={problem.slug}>
                <div className="roadmap-node-index">
                  <span>{status === "SOLVED" ? "✓" : String(index + 1).padStart(2, "0")}</span>
                  {index < problems.length - 1 && <i />}
                </div>
                <div className="roadmap-node-copy">
                  <span>{problem.difficulty} · {problem.points} XP</span>
                  <h2>{problem.title}</h2>
                  <p>{problem.summary}</p>
                  <div>{problem.tags.map((tag) => <small key={tag}>{tag}</small>)}</div>
                </div>
                <Link href={`/problems/${problem.slug}`}>
                  {status === "SOLVED" ? "REVISIT" : status === "ATTEMPTED" ? "CONTINUE" : "SOLVE"} →
                </Link>
              </article>
            );
          })}
        </section>

        {nextProblem && (
          <section className="roadmap-next">
            <div><span>NEXT RECOMMENDED MOVE</span><h2>{nextProblem.title}</h2></div>
            <Link href={`/problems/${nextProblem.slug}`}>Open workspace →</Link>
          </section>
        )}
      </div>
    </main>
  );
}
