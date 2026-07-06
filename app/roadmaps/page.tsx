import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { roadmaps } from "@/lib/roadmaps";
import { getMyProgress } from "@/lib/server/progress-api";

export const metadata: Metadata = {
  title: "Roadmaps — LLC_code",
  description: "Follow structured problem-solving paths and track your progress.",
};

export const dynamic = "force-dynamic";

export default async function RoadmapsPage() {
  const progress = await getMyProgress();
  const solved = new Set(
    progress?.problems
      .filter((problem) => problem.status === "SOLVED")
      .map((problem) => problem.slug) ?? [],
  );

  return (
    <main className="app-page roadmap-page">
      <AppHeader active="roadmaps" />
      <div className="roadmaps-shell">
        <section className="roadmaps-hero">
          <span className="app-eyebrow">GUIDED PATHS / V1</span>
          <h1>Learn patterns<br /><em>in the right order.</em></h1>
          <p>Each path connects a small sequence of real judge-backed problems. Your accepted submissions update progress automatically.</p>
        </section>

        <section className="roadmap-card-grid" aria-label="Available roadmaps">
          {roadmaps.map((roadmap) => {
            const solvedCount = roadmap.problemSlugs.filter((slug) => solved.has(slug)).length;
            const completion = Math.round((solvedCount / roadmap.problemSlugs.length) * 100);
            return (
              <Link className="roadmap-card" href={`/roadmaps/${roadmap.slug}`} key={roadmap.slug}>
                <header><span>{roadmap.number}</span><small>{roadmap.level}</small></header>
                <h2>{roadmap.title}</h2>
                <p>{roadmap.description}</p>
                <div className="roadmap-card-meta">
                  <span>{roadmap.problemSlugs.length} PROBLEMS</span>
                  <span>~{roadmap.estimatedHours} HOURS</span>
                </div>
                <div className="roadmap-card-progress">
                  <div><span>PROGRESS</span><strong>{solvedCount}/{roadmap.problemSlugs.length}</strong></div>
                  <i><b style={{ width: `${completion}%` }} /></i>
                </div>
                <footer><span>{completion ? "CONTINUE PATH" : "START PATH"}</span><strong>→</strong></footer>
              </Link>
            );
          })}
        </section>

        {!progress && (
          <aside className="roadmap-login-callout">
            <div><span>PROGRESS SYNC</span><h2>Make every solved problem count.</h2></div>
            <Link href="/login?next=/roadmaps">Log in to track progress →</Link>
          </aside>
        )}
      </div>
    </main>
  );
}
