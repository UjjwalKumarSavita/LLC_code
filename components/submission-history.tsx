"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  apiErrorMessage,
  submissionLabel,
  type SubmissionKind,
  type SubmissionListResponse,
  type SubmissionSummary,
  type SubmissionVerdict,
} from "@/lib/submissions";

const verdicts: Array<{ label: string; value: SubmissionVerdict | "" }> = [
  { label: "All verdicts", value: "" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Wrong answer", value: "WRONG_ANSWER" },
  { label: "Compilation error", value: "COMPILATION_ERROR" },
  { label: "Runtime error", value: "RUNTIME_ERROR" },
  { label: "Time limit", value: "TIME_LIMIT_EXCEEDED" },
  { label: "Memory limit", value: "MEMORY_LIMIT_EXCEEDED" },
  { label: "Internal error", value: "INTERNAL_ERROR" },
];

const languages = [
  { label: "All languages", value: "" },
  { label: "Python 3", value: "python" },
  { label: "JavaScript", value: "javascript" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
];

export function SubmissionHistory() {
  const [items, setItems] = useState<SubmissionSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<SubmissionKind | "">("");
  const [verdict, setVerdict] = useState<SubmissionVerdict | "">("");
  const [language, setLanguage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (cursor: string | null, append: boolean, signal?: AbortSignal) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      const query = new URLSearchParams({ limit: "20" });
      if (cursor) query.set("cursor", cursor);
      if (search.trim()) query.set("search", search.trim());
      if (kind) query.set("kind", kind);
      if (verdict) query.set("verdict", verdict);
      if (language) query.set("language", language);

      try {
        const response = await fetch(`/api/submissions?${query}`, {
          cache: "no-store",
          signal,
        });
        if (response.status === 401) {
          window.location.assign("/login?next=/submissions");
          return;
        }
        if (!response.ok) throw new Error(await apiErrorMessage(response));
        const payload = (await response.json()) as SubmissionListResponse;
        setItems((current) =>
          append ? [...current, ...payload.items] : payload.items,
        );
        setNextCursor(payload.nextCursor);
        setTotalCount(payload.totalCount);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Submission history is unavailable.",
        );
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
      }
    },
    [kind, language, search, verdict],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => void fetchPage(null, false, controller.signal),
      220,
    );
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [fetchPage]);

  const filtersActive = Boolean(search || kind || verdict || language);

  return (
    <div className="submissions-shell">
      <section className="submissions-hero">
        <div>
          <span className="app-eyebrow">EXECUTION ARCHIVE / ACCOUNT</span>
          <h1>Every attempt,<br /><em>fully traceable.</em></h1>
          <p>Review your source, visible test diagnostics, runtime and memory without exposing protected judge data.</p>
        </div>
        <div className="submission-counter">
          <span>MATCHING RECORDS</span>
          <strong>{loading ? "—" : String(totalCount).padStart(2, "0")}</strong>
          <small>server-backed submissions</small>
        </div>
      </section>

      <section className="submission-filter-bar" aria-label="Submission filters">
        <label className="submission-search">
          <span>SEARCH PROBLEM</span>
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Title or slug"
            type="search"
            value={search}
          />
        </label>
        <label>
          <span>TYPE</span>
          <select
            aria-label="Submission type"
            onChange={(event) => setKind(event.target.value as SubmissionKind | "")}
            value={kind}
          >
            <option value="">Run + Submit</option>
            <option value="SUBMIT">Submissions</option>
            <option value="RUN">Sample runs</option>
          </select>
        </label>
        <label>
          <span>VERDICT</span>
          <select
            aria-label="Submission verdict"
            onChange={(event) => setVerdict(event.target.value as SubmissionVerdict | "")}
            value={verdict}
          >
            {verdicts.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>LANGUAGE</span>
          <select
            aria-label="Submission language"
            onChange={(event) => setLanguage(event.target.value)}
            value={language}
          >
            {languages.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        {filtersActive && (
          <button
            className="submission-clear-filters"
            onClick={() => {
              setSearch("");
              setKind("");
              setVerdict("");
              setLanguage("");
            }}
            type="button"
          >
            Clear filters
          </button>
        )}
      </section>

      <section className="submission-ledger" aria-busy={loading}>
        <div className="submission-ledger-head">
          <span>VERDICT / PROBLEM</span>
          <span>LANGUAGE</span>
          <span>TESTS</span>
          <span>RUNTIME</span>
          <span>SUBMITTED</span>
          <span />
        </div>

        {loading && (
          <div className="submission-history-loading" role="status">
            <i /><span>Reading execution archive…</span>
          </div>
        )}

        {!loading && error && (
          <div className="submission-history-state is-error">
            <strong>History unavailable</strong>
            <p>{error}</p>
            <button onClick={() => void fetchPage(null, false)} type="button">Try again</button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="submission-history-state">
            <strong>{filtersActive ? "No matching records" : "No submissions yet"}</strong>
            <p>{filtersActive ? "Adjust or clear the filters to widen the archive." : "Run a problem to create your first execution record."}</p>
            <Link href="/problems">{filtersActive ? "Browse problems" : "Solve your first problem"} →</Link>
          </div>
        )}

        {!loading && !error && items.map((submission, index) => (
          <SubmissionHistoryRow
            index={index}
            key={submission.id}
            submission={submission}
          />
        ))}

        {!loading && nextCursor && (
          <button
            className="submission-load-more"
            disabled={loadingMore}
            onClick={() => void fetchPage(nextCursor, true)}
            type="button"
          >
            {loadingMore ? "Loading…" : `Load more / ${items.length} of ${totalCount}`}
          </button>
        )}
      </section>
    </div>
  );
}

function SubmissionHistoryRow({
  submission,
  index,
}: {
  submission: SubmissionSummary;
  index: number;
}) {
  const accepted = submission.verdict === "ACCEPTED";
  const pending = !submission.verdict;
  return (
    <Link
      className={`submission-history-row${accepted ? " is-accepted" : ""}${pending ? " is-pending" : ""}`}
      href={`/submissions/${submission.id}`}
      style={{ "--row-index": index } as React.CSSProperties}
    >
      <div className="submission-history-problem">
        <i />
        <div>
          <strong>{submissionLabel(submission)}</strong>
          <span>{submission.problem?.title ?? "Unknown problem"}</span>
        </div>
        <small>{submission.kind === "RUN" ? "SAMPLE RUN" : "SUBMISSION"}</small>
      </div>
      <span>{submission.language?.name ?? "—"}</span>
      <span>{submission.passedTestCases}/{submission.totalTestCases}</span>
      <span>{formatRuntime(submission.runtimeMs)}</span>
      <time>{formatSubmissionDate(submission.submittedAt)}</time>
      <b aria-hidden="true">→</b>
    </Link>
  );
}

export function formatRuntime(runtimeMs: number | null) {
  return runtimeMs == null ? "—" : `${runtimeMs} ms`;
}

export function formatMemory(memoryKb: number | null) {
  return memoryKb == null ? "—" : `${(memoryKb / 1024).toFixed(1)} MB`;
}

export function formatSubmissionDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
