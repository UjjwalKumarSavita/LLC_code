"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CmsProblemListItem,
  ContentStatus,
  PaginatedProblems,
} from "@/lib/cms-types";

const statusOptions: Array<ContentStatus | "ALL"> = [
  "ALL",
  "DRAFT",
  "IN_REVIEW",
  "PUBLISHED",
  "CHANGES_REQUESTED",
  "ARCHIVED",
];

export function AdminProblems() {
  const [problems, setProblems] = useState<CmsProblemListItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContentStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProblems = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ limit: "100" });
    if (status !== "ALL") params.set("status", status);
    if (search.trim()) params.set("search", search.trim());
    try {
      const response = await fetch(`/api/cms/problems/cms/list?${params}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as PaginatedProblems & {
        message?: string | string[];
      };
      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message[0] : data.message,
        );
      }
      setProblems(data.items);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load problems");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProblems(), 250);
    return () => window.clearTimeout(timer);
  }, [loadProblems]);

  const counts = useMemo(
    () =>
      problems.reduce(
        (summary, problem) => {
          summary.total += 1;
          if (problem.status === "PUBLISHED") summary.published += 1;
          if (problem.status === "DRAFT") summary.drafts += 1;
          if (problem.status === "IN_REVIEW") summary.review += 1;
          return summary;
        },
        { total: 0, published: 0, drafts: 0, review: 0 },
      ),
    [problems],
  );

  const archiveProblem = async (problem: CmsProblemListItem) => {
    if (!window.confirm(`Archive "${problem.title}"?`)) return;
    const response = await fetch(`/api/cms/problems/${problem.id}`, {
      method: "DELETE",
    });
    if (response.ok) void loadProblems();
    else setError("Only administrators can archive problems.");
  };

  return (
    <main className="admin-page">
      <section className="admin-page-head">
        <div>
          <span>CONTENT / PROBLEM BANK</span>
          <h1>Problem CMS</h1>
          <p>Build, validate, review, and publish coding challenges.</p>
        </div>
        <Link className="admin-primary-action" href="/admin/problems/new">
          <span>+</span> NEW PROBLEM
        </Link>
      </section>

      <section className="admin-stat-grid" aria-label="Problem status summary">
        <article><span>TOTAL VISIBLE</span><strong>{counts.total.toString().padStart(2, "0")}</strong><i /></article>
        <article><span>PUBLISHED</span><strong>{counts.published.toString().padStart(2, "0")}</strong><i /></article>
        <article><span>DRAFTS</span><strong>{counts.drafts.toString().padStart(2, "0")}</strong><i /></article>
        <article><span>IN REVIEW</span><strong>{counts.review.toString().padStart(2, "0")}</strong><i /></article>
      </section>

      <section className="cms-table-panel">
        <div className="cms-toolbar">
          <label>
            <span>SEARCH</span>
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Title, slug, or tag..."
              value={search}
            />
          </label>
          <label>
            <span>STATUS</span>
            <select
              onChange={(event) => setStatus(event.target.value as ContentStatus | "ALL")}
              value={status}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>{option.replaceAll("_", " ")}</option>
              ))}
            </select>
          </label>
          <button onClick={() => void loadProblems()} type="button">REFRESH</button>
        </div>

        {error && (
          <div className="cms-notice is-error" role="alert">
            <strong>CMS CONNECTION FAILED</strong>
            <span>{error}</span>
            <button onClick={() => void loadProblems()} type="button">TRY AGAIN</button>
          </div>
        )}

        <div className="cms-table-wrap">
          <table className="cms-table">
            <thead>
              <tr><th>PROBLEM</th><th>DIFFICULTY</th><th>STATUS</th><th>TESTS</th><th>UPDATED</th><th aria-label="Actions" /></tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr className="cms-loading-row" key={index}>
                    <td colSpan={6}><i /></td>
                  </tr>
                ))
              ) : problems.length ? (
                problems.map((problem, index) => (
                  <tr key={problem.id}>
                    <td>
                      <span className="cms-row-number">{String(index + 1).padStart(2, "0")}</span>
                      <div><strong>{problem.title}</strong><small>/{problem.slug}</small></div>
                    </td>
                    <td><span className={`cms-difficulty is-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span></td>
                    <td><span className={`cms-status is-${problem.status.toLowerCase()}`}>{problem.status.replaceAll("_", " ")}</span></td>
                    <td><strong>{problem._count?.testCases ?? 0}</strong><small> CASES</small></td>
                    <td><time dateTime={problem.updatedAt}>{formatDate(problem.updatedAt)}</time></td>
                    <td>
                      <div className="cms-row-actions">
                        <Link href={`/admin/problems/${problem.id}/edit`}>EDIT</Link>
                        <button onClick={() => void archiveProblem(problem)} type="button">•••</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="cms-empty-row">
                  <td colSpan={6}>
                    <strong>NO PROBLEMS FOUND</strong>
                    <span>Adjust the filters or create the first challenge.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
