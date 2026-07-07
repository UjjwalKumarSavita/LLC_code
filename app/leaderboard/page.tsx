import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { AppHeader } from "@/components/app-header";
import type { LeaderboardEntry } from "@/lib/leaderboard-types";
import { getLeaderboard } from "@/lib/server/leaderboard-api";

export const metadata: Metadata = {
  title: "Leaderboard — LLC_code",
  description: "See local learner rankings based on real accepted submissions.",
};

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();
  const podium = leaderboard.leaders.slice(0, 3);
  const rest = leaderboard.leaders.slice(3);

  return (
    <main className="app-page leaderboard-page">
      <AppHeader active="leaderboard" />
      <div className="leaderboard-shell">
        <section className="leaderboard-hero">
          <div>
            <span className="app-eyebrow">LOCAL RANKINGS / LIVE</span>
            <h1>Compete with momentum,<br /><em>not secrets.</em></h1>
            <p>Rankings use solved public problems, XP, attempts, badges, and streaks from your self-hosted database. Private identity fields and hidden judge data never appear here.</p>
          </div>
          <div className="leaderboard-orbit">
            <strong>{leaderboard.totalRanked}</strong>
            <span>RANKED LEARNERS</span>
          </div>
        </section>

        {podium.length ? (
          <section className="podium-grid" aria-label="Top ranked learners">
            {podium.map((entry) => (
              <LeaderboardCard entry={entry} key={entry.id} />
            ))}
          </section>
        ) : (
          <section className="leaderboard-empty-state">
            <h2>No ranked learners yet.</h2>
            <p>Submit an accepted solution to appear on the leaderboard.</p>
            <Link href="/problems">Start solving →</Link>
          </section>
        )}

        <section className="leaderboard-table-panel">
          <div className="dashboard-panel-heading">
            <div><span>FULL TABLE</span><h2>Ranking board.</h2></div>
            <Link href="/dashboard">My dashboard →</Link>
          </div>
          <div className="leaderboard-table" role="table" aria-label="Learner leaderboard">
            <div className="leaderboard-row leaderboard-row-head" role="row">
              <span>Rank</span>
              <span>Learner</span>
              <span>Solved</span>
              <span>XP</span>
              <span>Streak</span>
              <span>Badges</span>
            </div>
            {[...podium, ...rest].map((entry) => (
              <Link className="leaderboard-row" href="/dashboard" key={entry.id} role="row">
                <span>#{entry.rank}</span>
                <span>
                  <Avatar entry={entry} />
                  <i>
                    <strong>{entry.displayName}</strong>
                    <small>@{entry.username} · {titleCase(entry.learnerLevel)}</small>
                  </i>
                </span>
                <span>{entry.solved}</span>
                <span>{entry.totalXp}</span>
                <span>{entry.currentStreak}d</span>
                <span>{entry.badgesUnlocked}/6</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function LeaderboardCard({ entry }: { entry: LeaderboardEntry }) {
  return (
    <article className={`podium-card podium-rank-${entry.rank}`}>
      <div className="podium-rank">#{entry.rank}</div>
      <Avatar entry={entry} />
      <div>
        <span>{titleCase(entry.learnerLevel)} · Level {entry.xpLevel}</span>
        <h2>{entry.displayName}</h2>
        <p>@{entry.username}</p>
      </div>
      <dl>
        <div><dt>Solved</dt><dd>{entry.solved}</dd></div>
        <div><dt>XP</dt><dd>{entry.totalXp}</dd></div>
        <div><dt>Streak</dt><dd>{entry.currentStreak}d</dd></div>
      </dl>
      <div className="podium-topics">
        {entry.topTopics.length ? entry.topTopics.map((topic) => (
          <span key={topic.slug}>{topic.name} · {topic.solved}</span>
        )) : <span>First pattern loading</span>}
      </div>
    </article>
  );
}

function Avatar({ entry }: { entry: LeaderboardEntry }) {
  const initials = entry.displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className="leaderboard-avatar"
      style={
        entry.avatarUrl
          ? ({ "--avatar": `url(${entry.avatarUrl})` } as CSSProperties)
          : undefined
      }
      aria-hidden="true"
    >
      {initials || entry.username.slice(0, 2).toUpperCase()}
    </span>
  );
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
