"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Language, Problem } from "@/lib/problem-types";
import { languages } from "@/lib/problem-types";
import {
  apiErrorMessage,
  isFinished,
  languageSlugs,
  submissionLabel,
  type SubmissionListResponse,
  type SubmissionSummary,
} from "@/lib/submissions";
import { BrandMark } from "./brand-mark";
import { AlgorithmVisualizer } from "./algorithm-visualizer";
import { CheckIcon, MoonIcon, PlayIcon, SunIcon } from "./icons";
import {
  MonacoCodeEditor,
  type EditorSettings,
} from "./monaco-code-editor";

type ContentTab = "Description" | "Hints" | "Editorial" | "Submissions" | "Visualizer";
type ConsoleTab = "Test cases" | "Result" | "Console";
const contentTabs: ContentTab[] = ["Description", "Hints", "Editorial", "Submissions", "Visualizer"];
const POLL_INTERVAL_MS = 900;
const POLL_TIMEOUT_MS = 45_000;
const EDITOR_SETTINGS_KEY = "llc-code:editor-settings";
const defaultEditorSettings: EditorSettings = {
  fontSize: 14,
  minimap: true,
  tabSize: 4,
  wordWrap: false,
};

function readDraft(problem: Problem, language: Language) {
  const starter = problem.starterCode[language] ?? "";
  if (typeof window === "undefined") return starter;
  const key = `llc-code:draft:${problem.slug}:${languageSlugs[language]}`;
  return window.localStorage.getItem(key) ?? starter;
}

function readEditorSettings(): EditorSettings {
  if (typeof window === "undefined") return defaultEditorSettings;
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(EDITOR_SETTINGS_KEY) ?? "{}",
    ) as Partial<EditorSettings>;
    return {
      fontSize:
        typeof saved.fontSize === "number" &&
        saved.fontSize >= 12 &&
        saved.fontSize <= 22
          ? saved.fontSize
          : defaultEditorSettings.fontSize,
      minimap:
        typeof saved.minimap === "boolean"
          ? saved.minimap
          : defaultEditorSettings.minimap,
      tabSize: saved.tabSize === 2 ? 2 : 4,
      wordWrap:
        typeof saved.wordWrap === "boolean"
          ? saved.wordWrap
          : defaultEditorSettings.wordWrap,
    };
  } catch {
    return defaultEditorSettings;
  }
}

function waitForNextPoll(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      window.clearTimeout(timeout);
      reject(new DOMException("Polling cancelled", "AbortError"));
    };
    const timeout = window.setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, POLL_INTERVAL_MS);
    signal.addEventListener("abort", abort, { once: true });
  });
}

export function ProblemWorkspace({ problem }: { problem: Problem }) {
  const [contentTab, setContentTab] = useState<ContentTab>("Description");
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>("Test cases");
  const [language, setLanguage] = useState<Language>("Python 3");
  const [code, setCode] = useState(problem.starterCode["Python 3"] ?? "");
  const [customInput, setCustomInput] = useState(problem.examples[0]?.input ?? "");
  const [activeExample, setActiveExample] = useState(0);
  const [result, setResult] = useState<SubmissionSummary | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [history, setHistory] = useState<SubmissionSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [running, setRunning] = useState<"run" | "submit" | null>(null);
  const [draftSaved, setDraftSaved] = useState(true);
  const [editorSettings, setEditorSettings] = useState(defaultEditorSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(47);
  const [activeHint, setActiveHint] = useState(0);
  const [visualStep, setVisualStep] = useState(0);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const pollAbortRef = useRef<AbortController | null>(null);

  const lines = useMemo(() => code.split("\n").length, [code]);
  const availableLanguages = problem.availableLanguages?.length
    ? problem.availableLanguages
    : languages.filter((item) => Boolean(problem.starterCode[item]));
  const draftKey = `llc-code:draft:${problem.slug}:${languageSlugs[language]}`;

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch("/api/submissions?limit=50", { cache: "no-store" });
      if (response.status === 401) {
        setHistory([]);
        return;
      }
      if (!response.ok) throw new Error(await apiErrorMessage(response));
      const payload = (await response.json()) as SubmissionListResponse;
      setHistory(payload.items.filter((item) => item.problem?.slug === problem.slug));
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Submission history is unavailable.");
    } finally {
      setHistoryLoading(false);
    }
  }, [problem.slug]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setCode(readDraft(problem, language));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [language, problem]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(draftKey, code);
      setDraftSaved(true);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [code, draftKey]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setEditorSettings(readEditorSettings());
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(
        EDITOR_SETTINGS_KEY,
        JSON.stringify(editorSettings),
      );
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [editorSettings]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadHistory(), 0);
    return () => {
      window.clearTimeout(timeout);
      pollAbortRef.current?.abort();
    };
  }, [loadHistory]);

  const toggleTheme = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("llc-theme", next);
  };

  const selectLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    setCode(readDraft(problem, nextLanguage));
    setDraftSaved(true);
    setResult(null);
    setSubmissionError(null);
    setConsoleTab("Test cases");
  };

  const pollSubmission = async (
    submissionId: string,
    controller: AbortController,
  ) => {
    const startedAt = Date.now();
    while (!controller.signal.aborted) {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(await apiErrorMessage(response));
      const submission = (await response.json()) as SubmissionSummary;
      setResult(submission);
      if (isFinished(submission.status)) return;
      if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
        throw new Error(
          "The submission is still queued. Start the isolated judge worker and check again from Submissions.",
        );
      }
      await waitForNextPoll(controller.signal);
    }
  };

  const judge = async (mode: "run" | "submit") => {
    if (running) return;
    setRunning(mode);
    setConsoleTab("Result");
    setResult(null);
    setSubmissionError(null);
    pollAbortRef.current?.abort();
    const controller = new AbortController();
    pollAbortRef.current = controller;

    try {
      const response = await fetch(`/api/submissions/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemSlug: problem.slug,
          languageSlug: languageSlugs[language],
          code,
        }),
      });
      if (response.status === 401) {
        throw new Error("Log in before running or submitting code.");
      }
      if (!response.ok) throw new Error(await apiErrorMessage(response));
      const queued = (await response.json()) as SubmissionSummary;
      setResult(queued);
      await pollSubmission(queued.id, controller);
      await loadHistory();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setSubmissionError(error instanceof Error ? error.message : "The judge request failed.");
    } finally {
      setRunning(null);
    }
  };

  const beginResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (window.innerWidth < 900) return;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const resize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const bounds = workspaceRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const percentage = ((event.clientX - bounds.left) / bounds.width) * 100;
    setLeftWidth(Math.min(64, Math.max(34, percentage)));
  };

  const updateCode = (nextCode: string) => {
    setCode(nextCode);
    setDraftSaved(false);
  };

  return (
    <main className="solver-page">
      <header className="solver-header">
        <div className="solver-brand">
          <Link aria-label="LLC_code home" href="/"><BrandMark size={30} /></Link>
          <Link className="solver-back" href="/problems">← Problem bank</Link>
          <span>/</span>
          <strong>{String(problem.id).padStart(3, "0")} {problem.title}</strong>
        </div>
        <div className="solver-header-actions">
          <span className={draftSaved ? "save-state" : "save-state is-saving"}>
            {draftSaved ? "DRAFT SAVED" : "SAVING…"}
          </span>
          <button aria-label="Toggle color theme" className="icon-button solver-theme" onClick={toggleTheme} type="button">
            <span className="theme-icon theme-icon-sun"><SunIcon /></span>
            <span className="theme-icon theme-icon-moon"><MoonIcon /></span>
          </button>
          <Link aria-label="Open dashboard" className="solver-profile" href="/dashboard">UD</Link>
        </div>
      </header>

      <div
        className="solver-workspace"
        ref={workspaceRef}
        style={{ "--left-panel": `${leftWidth}%` } as React.CSSProperties}
      >
        <section className="problem-panel">
          <div className="content-tabs" role="tablist" aria-label="Problem content">
            {contentTabs.map((tab) => (
              <button
                aria-selected={contentTab === tab}
                className={contentTab === tab ? "is-active" : ""}
                key={tab}
                onClick={() => setContentTab(tab)}
                role="tab"
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="problem-content">
            {contentTab === "Description" && (
              <ProblemDescription problem={problem} />
            )}
            {contentTab === "Hints" && (
              <div className="hint-content">
                <span className="panel-kicker">PROGRESSIVE HINTS</span>
                <h2>Move one clue at a time.</h2>
                {problem.hints.map((hint, index) => (
                  <button
                    className={index <= activeHint ? "hint-card is-open" : "hint-card"}
                    key={hint}
                    onClick={() => setActiveHint(Math.max(activeHint, index))}
                    type="button"
                  >
                    <span>HINT {String(index + 1).padStart(2, "0")}</span>
                    <p>{index <= activeHint ? hint : "Unlock this clue"}</p>
                    <i>{index <= activeHint ? "−" : "+"}</i>
                  </button>
                ))}
              </div>
            )}
            {contentTab === "Editorial" && (
              <div className="editorial-content">
                {problem.editorial.isPublished ? (
                  <>
                    <span className="panel-kicker">EDITORIAL / REVIEWED</span>
                    <h2>Build the observation first.</h2>
                    <nav className="editorial-section-map" aria-label="Editorial sections">
                      <a href="#editorial-intuition">01 Intuition</a>
                      <a href="#editorial-baseline">02 Baseline</a>
                      <a href="#editorial-algorithm">03 Algorithm</a>
                      <a href="#editorial-dry-run">04 Dry run</a>
                    </nav>
                    <article className="editorial-section" id="editorial-intuition">
                      <span>01 / CORE OBSERVATION</span>
                      <h3>Intuition</h3>
                      <p>{problem.editorial.intuition}</p>
                    </article>
                    <article className="editorial-section" id="editorial-baseline">
                      <span>02 / STARTING POINT</span>
                      <h3>Brute-force baseline</h3>
                      <p>{problem.editorial.bruteForce}</p>
                    </article>
                    <article className="editorial-section" id="editorial-algorithm">
                      <span>03 / OPTIMIZED PATH</span>
                      <h3>Algorithm</h3>
                      <ol>{problem.editorial.approach.map((step) => <li key={step}>{step}</li>)}</ol>
                    </article>
                    <article className="editorial-section" id="editorial-dry-run">
                      <span>04 / TRACE</span>
                      <h3>Dry run</h3>
                      <p>{problem.editorial.dryRun}</p>
                    </article>
                    <div className="editorial-summary-grid">
                      <div className="complexity-box"><span>COMPLEXITY</span><strong>{problem.editorial.complexity}</strong></div>
                      <div className="editorial-mistakes"><span>COMMON MISTAKES</span><p>{problem.editorial.commonMistakes}</p></div>
                    </div>
                  </>
                ) : (
                  <div className="editorial-pending">
                    <span className="panel-kicker">EDITORIAL / IN REVIEW</span>
                    <h2>Explanation in progress.</h2>
                    <p>This problem is fully judge-ready, but its long-form editorial has not passed content review yet.</p>
                    <button onClick={() => setContentTab("Hints")} type="button">USE PROGRESSIVE HINTS</button>
                  </div>
                )}
              </div>
            )}
            {contentTab === "Submissions" && (
              <div className="submission-content">
                <span className="panel-kicker">ACCOUNT HISTORY</span>
                <h2>Submission history.</h2>
                {historyLoading && <p className="submission-empty">Loading your attempts…</p>}
                {!historyLoading && history.length === 0 && (
                  <p className="submission-empty">No server-backed attempts for this problem yet.</p>
                )}
                {history.map((submission) => (
                  <SubmissionEntry key={submission.id} submission={submission} />
                ))}
              </div>
            )}
            {contentTab === "Visualizer" && (
              <Visualizer problem={problem} step={visualStep} setStep={setVisualStep} />
            )}
          </div>
        </section>

        <button
          aria-label="Resize problem and editor panels"
          className="panel-resizer"
          onPointerDown={beginResize}
          onPointerMove={resize}
          type="button"
        ><i /></button>

        <section className="coding-panel">
          <div className="editor-toolbar">
            <label>
              <span>LANGUAGE</span>
              <select
                aria-label="Programming language"
                onChange={(event) => selectLanguage(event.target.value as Language)}
                value={language}
              >
                {availableLanguages.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <div className="editor-toolbar-actions">
              <span>{lines} LINES</span>
              <div className="editor-settings-wrap">
                <button
                  aria-expanded={settingsOpen}
                  aria-haspopup="dialog"
                  onClick={() => setSettingsOpen((open) => !open)}
                  type="button"
                >
                  Settings
                </button>
                {settingsOpen && (
                  <div
                    aria-label="Editor settings"
                    className="editor-settings-popover"
                    role="dialog"
                  >
                    <div className="editor-settings-heading">
                      <strong>EDITOR SETTINGS</strong>
                      <button
                        aria-label="Close editor settings"
                        onClick={() => setSettingsOpen(false)}
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                    <label>
                      <span>FONT SIZE</span>
                      <output>{editorSettings.fontSize}px</output>
                      <input
                        aria-label="Editor font size"
                        max="22"
                        min="12"
                        onChange={(event) =>
                          setEditorSettings((current) => ({
                            ...current,
                            fontSize: Number(event.target.value),
                          }))
                        }
                        type="range"
                        value={editorSettings.fontSize}
                      />
                    </label>
                    <label>
                      <span>TAB SIZE</span>
                      <select
                        aria-label="Editor tab size"
                        onChange={(event) =>
                          setEditorSettings((current) => ({
                            ...current,
                            tabSize: Number(event.target.value) as 2 | 4,
                          }))
                        }
                        value={editorSettings.tabSize}
                      >
                        <option value="2">2 spaces</option>
                        <option value="4">4 spaces</option>
                      </select>
                    </label>
                    <label className="editor-toggle-setting">
                      <span>WORD WRAP</span>
                      <input
                        checked={editorSettings.wordWrap}
                        onChange={(event) =>
                          setEditorSettings((current) => ({
                            ...current,
                            wordWrap: event.target.checked,
                          }))
                        }
                        type="checkbox"
                      />
                    </label>
                    <label className="editor-toggle-setting">
                      <span>MINIMAP</span>
                      <input
                        checked={editorSettings.minimap}
                        onChange={(event) =>
                          setEditorSettings((current) => ({
                            ...current,
                            minimap: event.target.checked,
                          }))
                        }
                        type="checkbox"
                      />
                    </label>
                    <div className="editor-shortcuts">
                      <span>RUN</span><kbd>Ctrl</kbd><b>+</b><kbd>Enter</kbd>
                      <span>SUBMIT</span><kbd>Ctrl</kbd><b>+</b><kbd>Shift</kbd><b>+</b><kbd>Enter</kbd>
                    </div>
                    <button
                      className="editor-settings-reset"
                      onClick={() => setEditorSettings(defaultEditorSettings)}
                      type="button"
                    >
                      Restore defaults
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => updateCode(problem.starterCode[language] ?? "")}
                type="button"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="code-editor">
            <MonacoCodeEditor
              language={language}
              onChange={updateCode}
              onRun={() => void judge("run")}
              onSubmit={() => void judge("submit")}
              settings={editorSettings}
              value={code}
            />
          </div>

          <div className="console-panel">
            <div className="console-tabs" role="tablist" aria-label="Execution panel">
              {(["Test cases", "Result", "Console"] as ConsoleTab[]).map((tab) => (
                <button
                  aria-selected={consoleTab === tab}
                  className={consoleTab === tab ? "is-active" : ""}
                  key={tab}
                  onClick={() => setConsoleTab(tab)}
                  role="tab"
                  type="button"
                >
                  {tab}
                  {tab === "Result" && result && <i className={result.verdict === "ACCEPTED" ? "" : "failed"} />}
                </button>
              ))}
            </div>

            <div className="console-content">
              {consoleTab === "Test cases" && (
                <div className="testcase-editor">
                  <div className="testcase-pills">
                    {problem.examples.map((example, index) => (
                      <button
                        aria-pressed={activeExample === index}
                        className={activeExample === index ? "is-active" : ""}
                        key={index}
                        onClick={() => {
                          setActiveExample(index);
                          setCustomInput(example.input);
                        }}
                        type="button"
                      >
                        Case {index + 1}
                      </button>
                    ))}
                  </div>
                  <label><span>SAMPLE INPUT PREVIEW</span><textarea readOnly value={customInput} /></label>
                </div>
              )}
              {consoleTab === "Result" && (
                <ResultPanel error={submissionError} result={result} running={running} />
              )}
              {consoleTab === "Console" && (
                <pre className="terminal-output">$ LLC submission client ready{"\n"}$ Run and Submit send authenticated jobs to the isolated queue.{"\n"}<span>The API server never executes student code.</span></pre>
              )}
            </div>

            <div className="run-actions">
              <span>ISOLATED JUDGE QUEUE</span>
              <button disabled={Boolean(running)} onClick={() => void judge("run")} type="button">
                <PlayIcon /> {running === "run" ? "Running..." : "Run samples"}
              </button>
              <button disabled={Boolean(running)} onClick={() => void judge("submit")} type="button">
                {running === "submit" ? "Judging hidden tests..." : "Submit solution"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ProblemDescription({ problem }: { problem: Problem }) {
  return (
    <div className="description-content">
      <div className="problem-heading-row">
        <div>
          <span className="panel-kicker">PROBLEM {String(problem.id).padStart(3, "0")}</span>
          <h1>{problem.title}</h1>
        </div>
        <span className={`difficulty difficulty-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
      </div>
      <div className="problem-meta">
        <span>{problem.acceptance}% ACCEPTANCE</span>
        <span>+{problem.points} XP</span>
        {problem.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      <p className="statement">{problem.statement}</p>
      {problem.inputFormat && (
        <>
          <h2>Input Format</h2>
          <p className="statement">{problem.inputFormat}</p>
        </>
      )}
      {problem.outputFormat && (
        <>
          <h2>Output Format</h2>
          <p className="statement">{problem.outputFormat}</p>
        </>
      )}
      <h2>Examples</h2>
      {problem.examples.map((example, index) => (
        <article className="example-card" key={`${example.input}-${index}`}>
          <span>EXAMPLE {String(index + 1).padStart(2, "0")}</span>
          <div><small>INPUT</small><code>{example.input}</code></div>
          <div><small>OUTPUT</small><code>{example.output}</code></div>
          {example.explanation && <p>{example.explanation}</p>}
        </article>
      ))}
      <h2>Constraints</h2>
      <ul className="constraints">
        {problem.constraints.map((constraint) => <li key={constraint}><code>{constraint}</code></li>)}
      </ul>
    </div>
  );
}

function ResultPanel({
  result,
  running,
  error,
}: {
  result: SubmissionSummary | null;
  running: "run" | "submit" | null;
  error: string | null;
}) {
  if (running && (!result || !isFinished(result.status))) {
    return (
      <div className="judging-state">
        <div className="judge-scanner"><i /></div>
        <span>{result?.status === "PROCESSING" ? "JUDGE PROCESSING" : "WAITING IN QUEUE"}</span>
        <strong>{running === "submit" ? "Preparing hidden tests…" : "Preparing visible tests…"}</strong>
      </div>
    );
  }

  if (error) {
    return (
      <div className="judge-result is-failed">
        <div>
          <span>REQUEST STATUS</span>
          <h3>Action needed</h3>
          <p>{error}</p>
          {error.startsWith("Log in") && <Link href="/login">Log in to continue →</Link>}
        </div>
      </div>
    );
  }

  if (!result) {
    return <div className="result-empty">Run your code to inspect the result.</div>;
  }

  const accepted = result.verdict === "ACCEPTED";
  const failed = !accepted;
  return (
    <div className={failed ? "judge-result is-failed" : "judge-result"}>
      <div>
        <span>VERDICT</span>
        <h3>{accepted ? "✓" : "×"} {submissionLabel(result)}</h3>
        <p>{result.errorMessage ?? resultMessage(result)}</p>
      </div>
      <dl>
        <div><dt>TESTS</dt><dd>{result.passedTestCases} / {result.totalTestCases}</dd></div>
        <div><dt>RUNTIME</dt><dd>{result.runtimeMs == null ? "—" : `${result.runtimeMs} ms`}</dd></div>
        <div><dt>MEMORY</dt><dd>{result.memoryKb == null ? "—" : `${(result.memoryKb / 1024).toFixed(1)} MB`}</dd></div>
      </dl>
    </div>
  );
}

function SubmissionEntry({ submission }: { submission: SubmissionSummary }) {
  const accepted = submission.verdict === "ACCEPTED";
  const details = [
    submission.language?.name ?? "Unknown language",
    `${submission.passedTestCases} / ${submission.totalTestCases} tests`,
    submission.runtimeMs == null ? null : `${submission.runtimeMs} ms`,
  ].filter(Boolean).join(" · ");

  return (
    <Link
      className={accepted ? "submission-entry" : "submission-entry is-failed"}
      href={`/submissions/${submission.id}`}
    >
      <i>{accepted ? <CheckIcon /> : "×"}</i>
      <div><strong>{submissionLabel(submission)}</strong><span>{details}</span></div>
      <time>{new Date(submission.submittedAt).toLocaleString()}</time>
    </Link>
  );
}

function resultMessage(result: SubmissionSummary) {
  if (result.verdict === "ACCEPTED") return "Every configured test case passed.";
  if (result.verdict === "WRONG_ANSWER") return "The output did not match the expected result.";
  if (result.verdict === "COMPILATION_ERROR") return "The submitted source could not be compiled.";
  if (result.verdict === "RUNTIME_ERROR") return "The program stopped with a runtime error.";
  if (result.verdict === "TIME_LIMIT_EXCEEDED") return "The program exceeded the configured time limit.";
  if (result.verdict === "MEMORY_LIMIT_EXCEEDED") return "The program exceeded the configured memory limit.";
  if (result.status === "FAILED") return "The judge could not complete this submission.";
  return "The submission is waiting for the isolated judge.";
}

function Visualizer({
  problem,
  step,
  setStep,
}: {
  problem: Problem;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <AlgorithmVisualizer
      problemSlug={problem.slug}
      problemTitle={problem.title}
      setStep={setStep}
      step={step}
    />
  );
}
