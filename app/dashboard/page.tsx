import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { getMyProgress } from "@/lib/server/progress-api";

export const metadata: Metadata = {
  title: "Dashboard — LLC_code",
  description: "Track solved problems, attempts, topics, and recent submissions.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const progress = await getMyProgress();
  if (!progress) redirect("/login?next=/dashboard");

  const completion = progress.stats.totalProblems
    ? Math.round((progress.stats.solved / progress.stats.totalProblems) * 100)
    : 0;
  const continueProblem =
    progress.problems.find((problem) => problem.status === "ATTEMPTED") ??
    progress.problems.find((problem) => problem.status === "UNSOLVED") ??
    progress.problems[0];

  return (
    <main className="app-page dashboard-page">
      <AppHeader active="dashboard" />
      <div className="dashboard-shell">
        <section className="dashboard-hero">
          <div>
            <span className="app-eyebrow">LEARNER SIGNAL / LIVE</span>
            <h1>Your practice now has<br /><em>a memory.</em></h1>
            <p>Every accepted submission updates this view from the judge database.</p>
          </div>
          <div className="completion-orbit" style={{ "--completion": `${completion * 3.6}deg` } as React.CSSProperties}>
            <div><strong>{completion}%</strong><span>COMPLETE</span></div>
          </div>
        </section>

        <section className="dashboard-stats" aria-label="Progress summary">
          <article><span>01 / SOLVED</span><strong>{progress.stats.solved}</strong><small>of {progress.stats.totalProblems} problems</small></article>
          <article><span>02 / ATTEMPTS</span><strong>{progress.stats.totalAttempts}</strong><small>{progress.stats.attempted} currently in progress</small></article>
          <article><span>03 / POINTS</span><strong>{progress.stats.pointsEarned}</strong><small>earned from accepted work</small></article>
          <article><span>04 / REMAINING</span><strong>{progress.stats.remaining}</strong><small>patterns left to explore</small></article>
        </section>

        <div className="dashboard-grid">
          <section className="dashboard-panel dashboard-continue">
            <div className="dashboard-panel-heading">
              <div><span>NEXT MOVE</span><h2>Continue the signal.</h2></div>
              <Link href="/problems">View all →</Link>
            </div>
            {continueProblem ? (
              <Link className="continue-card" href={`/problems/${continueProblem.slug}`}>
                <div>
                  <span>{continueProblem.status.replace("_", " ")}</span>
                  <h3>{continueProblem.title}</h3>
                  <p>{continueProblem.tags.map((tag) => tag.name).join(" · ")}</p>
                </div>
                <div>
                  <strong>{continueProblem.attempts}</strong>
                  <small>ATTEMPTS</small>
                  <i>→</i>
                </div>
              </Link>
            ) : (
              <p className="dashboard-empty">New problems will appear here.</p>
            )}
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div><span>DIFFICULTY</span><h2>Coverage.</h2></div>
            </div>
            <div className="coverage-list">
              {progress.difficulties.map((item) => {
                const percent = item.total ? (item.solved / item.total) * 100 : 0;
                return (
                  <div key={item.difficulty}>
                    <div><span>{titleCase(item.difficulty)}</span><strong>{item.solved} / {item.total}</strong></div>
                    <i><b style={{ width: `${percent}%` }} /></i>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="dashboard-panel dashboard-topics">
            <div className="dashboard-panel-heading">
              <div><span>TOPIC MAP</span><h2>Pattern depth.</h2></div>
            </div>
            <div className="topic-grid">
              {progress.topics.map((topic) => (
                <div key={topic.slug}>
                  <span>{topic.name}</span>
                  <strong>{topic.solved}/{topic.total}</strong>
                  <i><b style={{ width: `${topic.total ? (topic.solved / topic.total) * 100 : 0}%` }} /></i>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-panel dashboard-activity">
            <div className="dashboard-panel-heading">
              <div><span>RECENT ACTIVITY</span><h2>Submission log.</h2></div>
            </div>
            <div className="activity-list">
              {progress.recentSubmissions.length ? progress.recentSubmissions.map((submission) => (
                <Link href={`/submissions/${submission.id}`} key={submission.id}>
                  <i className={submission.verdict === "ACCEPTED" ? "is-accepted" : ""} />
                  <div><strong>{submission.problem.title}</strong><span>{submission.language.name} · {submission.passedTestCases}/{submission.totalTestCases} tests</span></div>
                  <div><strong>{verdictLabel(submission.verdict)}</strong><time>{formatDate(submission.submittedAt)}</time></div>
                </Link>
              )) : <p className="dashboard-empty">Submit a solution to begin your activity log.</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function verdictLabel(value: string | null) {
  return value
    ? value.toLowerCase().split("_").map(titleCase).join(" ")
    : "Pending";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
