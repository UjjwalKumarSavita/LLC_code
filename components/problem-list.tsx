"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Difficulty, Problem, ProblemStatus } from "@/lib/problem-types";

const difficulties: Array<"All" | Difficulty> = ["All", "Easy", "Medium", "Hard"];
const statuses: Array<"All" | ProblemStatus> = ["All", "Solved", "Attempted", "Unsolved"];

export function ProblemList({ problems }: { problems: Problem[] }) {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>("All");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");
  const [topic, setTopic] = useState("All topics");
  const [bookmarks, setBookmarks] = useState<Set<number>>(() => new Set([4, 9]));

  const topics = useMemo(
    () => ["All topics", ...Array.from(new Set(problems.flatMap((problem) => problem.tags))).sort()],
    [problems],
  );

  const visibleProblems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return problems.filter((problem) => {
      const matchesQuery =
        !normalized ||
        problem.title.toLowerCase().includes(normalized) ||
        problem.tags.some((tag) => tag.toLowerCase().includes(normalized));
      const matchesDifficulty = difficulty === "All" || problem.difficulty === difficulty;
      const matchesStatus = status === "All" || problem.status === status;
      const matchesTopic = topic === "All topics" || problem.tags.includes(topic);
      return matchesQuery && matchesDifficulty && matchesStatus && matchesTopic;
    });
  }, [difficulty, problems, query, status, topic]);

  const solved = problems.filter((problem) => problem.status === "Solved").length;
  const attempted = problems.filter((problem) => problem.status === "Attempted").length;

  const toggleBookmark = (id: number) => {
    setBookmarks((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setQuery("");
    setDifficulty("All");
    setStatus("All");
    setTopic("All topics");
  };

  return (
    <div className="problems-shell">
      <section className="problems-hero">
        <div>
          <span className="app-eyebrow">PROBLEM LAB / {String(problems.length).padStart(3, "0")}</span>
          <h1>Choose the next<br /><em>pattern to master.</em></h1>
        </div>
        <div className="problem-stats" aria-label="Problem progress">
          <div><strong>{solved}</strong><span>Solved</span></div>
          <div><strong>{attempted}</strong><span>In progress</span></div>
          <div><strong>{problems.length - solved}</strong><span>Remaining</span></div>
        </div>
      </section>

      <section className="problem-controls" aria-label="Problem filters">
        <label className="problem-search">
          <span>SEARCH</span>
          <input
            aria-label="Search problems"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Problem, topic, or pattern..."
            type="search"
            value={query}
          />
          <kbd>⌘ K</kbd>
        </label>
        <label>
          <span>TOPIC</span>
          <select aria-label="Filter by topic" onChange={(event) => setTopic(event.target.value)} value={topic}>
            {topics.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>STATUS</span>
          <select aria-label="Filter by status" onChange={(event) => setStatus(event.target.value as typeof status)} value={status}>
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </section>

      <div className="difficulty-filter" aria-label="Filter by difficulty">
        {difficulties.map((item) => (
          <button
            className={difficulty === item ? "is-active" : ""}
            key={item}
            onClick={() => setDifficulty(item)}
            type="button"
          >
            {item}
          </button>
        ))}
        <span>{visibleProblems.length} RESULTS</span>
      </div>

      <section className="problem-table" aria-live="polite">
        <div className="problem-table-head">
          <span>STATUS</span><span>PROBLEM</span><span>DIFFICULTY</span>
          <span>ACCEPTANCE</span><span>XP</span><span>SAVE</span>
        </div>

        {visibleProblems.map((problem) => (
          <article className="problem-row" key={problem.id}>
            <div className={`status-mark status-${problem.status.toLowerCase()}`} aria-label={problem.status}>
              <i>{problem.status === "Solved" ? "✓" : problem.status === "Attempted" ? "·" : ""}</i>
            </div>
            <Link className="problem-title" href={`/problems/${problem.slug}`}>
              <span>{String(problem.id).padStart(3, "0")}</span>
              <div>
                <h2>{problem.title}</h2>
                <p>{problem.tags.join(" · ")}</p>
              </div>
            </Link>
            <span className={`difficulty difficulty-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
            <div className="acceptance">
              <span>{problem.acceptance}%</span>
              <i><b style={{ width: `${problem.acceptance}%` }} /></i>
            </div>
            <strong className="problem-xp">+{problem.points}</strong>
            <button
              aria-label={`${bookmarks.has(problem.id) ? "Remove" : "Add"} bookmark for ${problem.title}`}
              className={bookmarks.has(problem.id) ? "bookmark is-active" : "bookmark"}
              onClick={() => toggleBookmark(problem.id)}
              type="button"
            >
              {bookmarks.has(problem.id) ? "◆" : "◇"}
            </button>
          </article>
        ))}

        {visibleProblems.length === 0 && (
          <div className="problem-empty">
            <span>NO MATCHING SIGNAL</span>
            <h2>Try a wider search.</h2>
            <button onClick={clearFilters} type="button">Reset all filters</button>
          </div>
        )}
      </section>
    </div>
  );
}
