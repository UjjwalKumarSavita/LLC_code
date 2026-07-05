"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  apiErrorMessage,
  isFinished,
  submissionLabel,
  verdictLabel,
  type SubmissionDetail as SubmissionDetailData,
  type SubmissionTestResult,
} from "@/lib/submissions";
import {
  formatMemory,
  formatRuntime,
  formatSubmissionDate,
} from "./submission-history";

export function SubmissionDetail({ submissionId }: { submissionId: string }) {
  const [submission, setSubmission] = useState<SubmissionDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadSubmission = useCallback(async () => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        cache: "no-store",
      });
      if (response.status === 401) {
        window.location.assign(`/login?next=/submissions/${submissionId}`);
        return;
      }
      if (response.status === 404) {
        setError("This submission does not exist or does not belong to your account.");
        return;
      }
      if (!response.ok) throw new Error(await apiErrorMessage(response));
      const payload = (await response.json()) as SubmissionDetailData;
      setSubmission(payload);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Submission details are unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    const initial = window.setTimeout(() => void loadSubmission(), 0);
    return () => window.clearTimeout(initial);
  }, [loadSubmission]);

  useEffect(() => {
    if (!submission || isFinished(submission.status)) return;
    const interval = window.setInterval(() => void loadSubmission(), 1000);
    return () => window.clearInterval(interval);
  }, [loadSubmission, submission]);

  if (loading) {
    return (
      <div className="submission-detail-shell">
        <div className="submission-detail-loading" role="status"><i />Loading execution record…</div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="submission-detail-shell">
        <section className="submission-detail-error">
          <span>RECORD UNAVAILABLE</span>
          <h1>We could not open this submission.</h1>
          <p>{error}</p>
          <Link href="/submissions">← Return to submission history</Link>
        </section>
      </div>
    );
  }

  const accepted = submission.verdict === "ACCEPTED";
  return (
    <div className="submission-detail-shell">
      <div className="submission-detail-breadcrumb">
        <Link href="/submissions">← Submission history</Link>
        <span>/</span>
        <Link href={`/problems/${submission.problem.slug}`}>{submission.problem.title}</Link>
        <span>/</span>
        <code>{submission.id.slice(0, 8)}</code>
      </div>

      <section className={`submission-verdict-hero${accepted ? " is-accepted" : ""}`}>
        <div>
          <span>{submission.kind === "RUN" ? "SAMPLE RUN" : "OFFICIAL SUBMISSION"}</span>
          <h1>{submissionLabel(submission)}</h1>
          <p>{verdictMessage(submission)}</p>
        </div>
        <div className="submission-verdict-mark" aria-hidden="true">
          {accepted ? "✓" : submission.verdict ? "×" : "…"}
        </div>
      </section>

      <section className="submission-metrics" aria-label="Submission metrics">
        <article><span>01 / TESTS PASSED</span><strong>{submission.passedTestCases}<small> / {submission.totalTestCases}</small></strong></article>
        <article><span>02 / RUNTIME</span><strong>{formatRuntime(submission.runtimeMs)}</strong></article>
        <article><span>03 / MEMORY</span><strong>{formatMemory(submission.memoryKb)}</strong></article>
        <article><span>04 / LANGUAGE</span><strong>{submission.language.name}</strong></article>
      </section>

      <div className="submission-detail-grid">
        <section className="submission-source-panel">
          <div className="submission-section-heading">
            <div><span>SOURCE REVIEW</span><h2>Your submitted code.</h2></div>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(submission.code);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1400);
              }}
              type="button"
            >
              {copied ? "Copied ✓" : "Copy source"}
            </button>
          </div>
          <div className="submission-code-meta">
            <span>{submission.language.name}</span>
            <span>{submission.code.split("\n").length} lines</span>
            <span>{submission.kind}</span>
          </div>
          <pre><code>{submission.code}</code></pre>
        </section>

        <aside className="submission-record-panel">
          <div className="submission-section-heading">
            <div><span>RECORD</span><h2>Judge metadata.</h2></div>
          </div>
          <dl>
            <div><dt>Submitted</dt><dd>{formatSubmissionDate(submission.submittedAt)}</dd></div>
            <div><dt>Judged</dt><dd>{submission.judgedAt ? formatSubmissionDate(submission.judgedAt) : "Pending"}</dd></div>
            <div><dt>Type</dt><dd>{submission.kind === "RUN" ? "Sample run" : "Hidden judge"}</dd></div>
            <div><dt>Status</dt><dd>{submission.status}</dd></div>
            <div><dt>Record ID</dt><dd><code>{submission.id}</code></dd></div>
          </dl>
          <Link href={`/problems/${submission.problem.slug}`}>Open problem workspace →</Link>
        </aside>
      </div>

      <section className="submission-diagnostics">
        <div className="submission-section-heading">
          <div><span>SAFE DIAGNOSTICS</span><h2>Visible test evidence.</h2></div>
          <p>Protected inputs and expected outputs never leave the judge service.</p>
        </div>

        {submission.testResults.length > 0 ? (
          <div className="diagnostic-grid">
            {submission.testResults.map((result, index) => (
              <DiagnosticCard index={index} key={result.id} result={result} />
            ))}
          </div>
        ) : (
          <div className="diagnostic-empty">
            <strong>No visible diagnostics for this record.</strong>
            <p>{submission.kind === "SUBMIT" ? "Official submissions are judged against protected cases. Only aggregate verdict data is shown." : "The judge did not return a visible case result."}</p>
          </div>
        )}

        {submission.hiddenTestCount > 0 && (
          <div className="hidden-test-summary">
            <div><i /><span>PROTECTED JUDGE SET</span></div>
            <strong>{submission.hiddenTestCount} hidden {submission.hiddenTestCount === 1 ? "case" : "cases"}</strong>
            <p>Inputs, expected outputs, stderr and per-case outcomes are intentionally withheld.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function DiagnosticCard({
  result,
  index,
}: {
  result: SubmissionTestResult;
  index: number;
}) {
  const accepted = result.status === "ACCEPTED";
  return (
    <article className={`diagnostic-card${accepted ? " is-accepted" : ""}`}>
      <header>
        <div><i /><strong>CASE {String(index + 1).padStart(2, "0")}</strong><span>{result.visibility}</span></div>
        <b>{verdictLabel(result.status)}</b>
      </header>
      <div className="diagnostic-values">
        <div><span>INPUT</span><pre>{result.input || "—"}</pre></div>
        <div><span>EXPECTED</span><pre>{result.expectedOutput || "—"}</pre></div>
        <div><span>YOUR OUTPUT</span><pre>{result.actualOutput || "—"}</pre></div>
        {result.stderr && <div className="is-stderr"><span>STDERR</span><pre>{result.stderr}</pre></div>}
      </div>
      <footer>
        <span>{formatRuntime(result.runtimeMs)}</span>
        <span>{formatMemory(result.memoryKb)}</span>
        {result.explanation && <p>{result.explanation}</p>}
      </footer>
    </article>
  );
}

function verdictMessage(submission: SubmissionDetailData) {
  if (submission.errorMessage) return submission.errorMessage;
  if (submission.status === "QUEUED") return "This record is waiting for an isolated judge worker.";
  if (submission.status === "PROCESSING") return "The isolated worker is evaluating this source now.";
  if (submission.verdict === "ACCEPTED") return "Every configured judge case passed.";
  if (submission.verdict === "WRONG_ANSWER") return "At least one output did not match the expected result.";
  if (submission.verdict === "COMPILATION_ERROR") return "The source could not be compiled.";
  if (submission.verdict === "RUNTIME_ERROR") return "The program stopped during execution.";
  if (submission.verdict === "TIME_LIMIT_EXCEEDED") return "The program exceeded its execution time limit.";
  if (submission.verdict === "MEMORY_LIMIT_EXCEEDED") return "The program exceeded its memory limit.";
  return "The judge could not complete this submission.";
}
