"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CmsProblem, Difficulty } from "@/lib/cms-types";

type EditorTab = "details" | "content" | "examples" | "tests" | "templates" | "review";
type ExampleDraft = { input: string; output: string; explanation: string };
type TestDraft = {
  id?: string;
  input: string;
  expectedOutput: string;
  visibility: "SAMPLE" | "PUBLIC" | "HIDDEN";
  testType: "NORMAL" | "EDGE" | "STRESS";
  weight: number;
};

const emptyExample: ExampleDraft = { input: "", output: "", explanation: "" };
const emptyTest: TestDraft = {
  input: "",
  expectedOutput: "",
  visibility: "HIDDEN",
  testType: "NORMAL",
  weight: 10,
};

export function ProblemEditor({ problemId }: { problemId?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<EditorTab>("details");
  const [loading, setLoading] = useState(Boolean(problemId));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [existing, setExisting] = useState<CmsProblem | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    difficulty: "MEDIUM" as Difficulty,
    points: 100,
    visibility: "PRIVATE" as "PUBLIC" | "PRIVATE" | "UNLISTED",
    statement: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    tags: "",
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    comparisonMode: "TRIMMED" as "EXACT" | "TRIMMED" | "TOKEN" | "FLOAT" | "CUSTOM",
  });
  const [examples, setExamples] = useState<ExampleDraft[]>([{ ...emptyExample }]);
  const [tests, setTests] = useState<TestDraft[]>([{ ...emptyTest }]);
  const [template, setTemplate] = useState({
    languageSlug: "javascript",
    functionSignature: "function solve(input)",
    starterCode: "function solve(input) {\n  // Write your solution here\n}\n",
  });

  useEffect(() => {
    if (!problemId) return;
    let active = true;
    void fetch(`/api/cms/problems/cms/${problemId}`, { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as CmsProblem & { message?: string };
        if (!response.ok) throw new Error(data.message ?? "Unable to load problem");
        return data;
      })
      .then((problem) => {
        if (!active) return;
        setExisting(problem);
        setForm({
          title: problem.title,
          slug: problem.slug,
          shortDescription: problem.shortDescription ?? "",
          difficulty: problem.difficulty,
          points: problem.points ?? 100,
          visibility: problem.visibility,
          statement: problem.statement,
          inputFormat: problem.inputFormat ?? "",
          outputFormat: problem.outputFormat ?? "",
          constraints: problem.constraints ?? "",
          tags: problem.tags.map(({ tag }) => tag.name).join(", "),
          timeLimitMs: problem.timeLimitMs,
          memoryLimitMb: problem.memoryLimitMb,
          comparisonMode: problem.comparisonMode,
        });
        if (problem.examples.length) {
          setExamples(problem.examples.map((item) => ({
            input: item.input,
            output: item.output,
            explanation: item.explanation ?? "",
          })));
        }
        if (problem.testCases.length) {
          setTests(problem.testCases.map((item) => ({
            id: item.id,
            input: item.input ?? "",
            expectedOutput: item.expectedOutput ?? "",
            visibility: item.visibility,
            testType: item.testType ?? "NORMAL",
            weight: item.weight ?? 10,
          })));
        }
        const firstTemplate = problem.codeTemplates[0];
        if (firstTemplate) {
          setTemplate({
            languageSlug: firstTemplate.language?.slug ?? firstTemplate.languageSlug ?? "javascript",
            functionSignature: firstTemplate.functionSignature ?? "",
            starterCode: firstTemplate.starterCode,
          });
        }
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load problem"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [problemId]);

  const completion = useMemo(() => {
    const checks = [
      form.title.length >= 3,
      form.slug.length >= 3,
      form.statement.length >= 20,
      examples.some((item) => item.input && item.output),
      tests.some((item) => item.expectedOutput),
      template.starterCode.length >= 5,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [examples, form, template, tests]);

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError("");
    setNotice("");
    const validExamples = examples.filter((item) => item.input && item.output);
    const validTests = tests.filter((item) => item.expectedOutput);
    const payload = {
      ...form,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      examples: validExamples,
      ...(!problemId && { testCases: validTests }),
    };
    try {
      const response = await fetch(
        problemId ? `/api/cms/problems/${problemId}` : "/api/cms/problems",
        {
          method: problemId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json()) as CmsProblem & { message?: string | string[] };
      if (!response.ok) {
        throw new Error(Array.isArray(data.message) ? data.message[0] : data.message);
      }
      const savedId = data.id;
      if (problemId) {
        const newTests = validTests.filter((test) => !test.id);
        const createdTests: Array<{ draft: TestDraft; id: string }> = [];
        for (const test of newTests) {
          const testResponse = await fetch(`/api/cms/problems/${savedId}/test-cases`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(test),
          });
          if (!testResponse.ok) {
            throw new Error("Problem saved, but one or more new test cases could not be added.");
          }
          const created = (await testResponse.json()) as { id: string };
          createdTests.push({ draft: test, id: created.id });
        }
        if (createdTests.length) {
          setTests((items) =>
            items.map((item) => {
              const created = createdTests.find(({ draft }) => draft === item);
              return created ? { ...item, id: created.id } : item;
            }),
          );
        }
      }
      if (template.starterCode.trim()) {
        const templateResponse = await fetch(`/api/cms/problems/${savedId}/templates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(template),
        });
        if (!templateResponse.ok) {
          setNotice("Problem saved. Add a valid active language before saving the template.");
        }
      }
      if (!problemId) {
        router.replace(`/admin/problems/${savedId}/edit`);
        router.refresh();
      } else {
        setExisting(data);
        setNotice("Draft saved successfully.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save draft");
    } finally {
      setSaving(false);
    }
  };

  const transition = async (action: "review" | "publish") => {
    if (!problemId) {
      setError("Save this draft before changing its review state.");
      return;
    }
    setSaving(true);
    setError("");
    const response = await fetch(`/api/cms/problems/${problemId}/${action}`, { method: "POST" });
    const data = (await response.json()) as { status?: string; message?: string | string[] };
    if (!response.ok) {
      setError(Array.isArray(data.message) ? data.message[0] : data.message ?? `Unable to ${action}`);
    } else {
      setNotice(action === "review" ? "Submitted for review." : "Problem published.");
      setExisting((current) => current ? { ...current, status: data.status as CmsProblem["status"] } : current);
    }
    setSaving(false);
  };

  if (loading) {
    return <main className="admin-page editor-loading"><i /><span>LOADING DRAFT</span></main>;
  }

  return (
    <main className="admin-page problem-editor">
      <section className="editor-head">
        <div>
          <Link href="/admin/problems">&lt;- PROBLEM BANK</Link>
          <span>{problemId ? `EDIT / ${existing?.status ?? "DRAFT"}` : "CREATE / NEW DRAFT"}</span>
          <h1>{form.title || "Untitled problem"}</h1>
        </div>
        <div className="editor-head-actions">
          <span><i style={{ width: `${completion}%` }} />{completion}% COMPLETE</span>
          <button className="admin-secondary-action" onClick={() => void save()} disabled={saving} type="button">
            {saving ? "SAVING..." : "SAVE DRAFT"}
          </button>
          <button className="admin-primary-action" onClick={() => void transition("review")} disabled={saving} type="button">
            SEND TO REVIEW
          </button>
        </div>
      </section>

      <nav className="editor-tabs" aria-label="Problem editor sections">
        {(["details", "content", "examples", "tests", "templates", "review"] as EditorTab[]).map((item, index) => (
          <button className={tab === item ? "is-active" : ""} key={item} onClick={() => setTab(item)} type="button">
            <span>{String(index + 1).padStart(2, "0")}</span>{item.toUpperCase()}
          </button>
        ))}
      </nav>

      {(error || notice) && (
        <div className={`cms-notice ${error ? "is-error" : "is-success"}`} role="status">
          <strong>{error ? "ACTION FAILED" : "DRAFT UPDATED"}</strong>
          <span>{error || notice}</span>
        </div>
      )}

      <section className="editor-canvas">
        {tab === "details" && (
          <EditorSection eyebrow="FOUNDATION" title="Problem details" description="The identity, difficulty, and public metadata learners will see.">
            <div className="editor-field-grid">
              <Field label="TITLE" wide><input value={form.title} onChange={(event) => setField("title", event.target.value)} onBlur={() => !form.slug && setField("slug", slugify(form.title))} /></Field>
              <Field label="URL SLUG"><input value={form.slug} onChange={(event) => setField("slug", slugify(event.target.value))} /></Field>
              <Field label="DIFFICULTY"><select value={form.difficulty} onChange={(event) => setField("difficulty", event.target.value as Difficulty)}>{["EASY", "MEDIUM", "HARD", "EXPERT"].map((value) => <option key={value}>{value}</option>)}</select></Field>
              <Field label="POINTS"><input min={0} type="number" value={form.points} onChange={(event) => setField("points", Number(event.target.value))} /></Field>
              <Field label="VISIBILITY"><select value={form.visibility} onChange={(event) => setField("visibility", event.target.value as typeof form.visibility)}>{["PRIVATE", "UNLISTED", "PUBLIC"].map((value) => <option key={value}>{value}</option>)}</select></Field>
              <Field label="SHORT DESCRIPTION" wide><textarea rows={3} value={form.shortDescription} onChange={(event) => setField("shortDescription", event.target.value)} /></Field>
              <Field label="TAGS — COMMA SEPARATED" wide><input placeholder="arrays, hash-map, interview" value={form.tags} onChange={(event) => setField("tags", event.target.value)} /></Field>
            </div>
          </EditorSection>
        )}

        {tab === "content" && (
          <EditorSection eyebrow="LEARNER BRIEF" title="Statement & constraints" description="Markdown-ready problem copy and execution boundaries.">
            <div className="editor-field-grid">
              <Field label="PROBLEM STATEMENT" wide><textarea className="editor-large-textarea" rows={12} value={form.statement} onChange={(event) => setField("statement", event.target.value)} /></Field>
              <Field label="INPUT FORMAT"><textarea rows={6} value={form.inputFormat} onChange={(event) => setField("inputFormat", event.target.value)} /></Field>
              <Field label="OUTPUT FORMAT"><textarea rows={6} value={form.outputFormat} onChange={(event) => setField("outputFormat", event.target.value)} /></Field>
              <Field label="CONSTRAINTS" wide><textarea rows={5} value={form.constraints} onChange={(event) => setField("constraints", event.target.value)} /></Field>
            </div>
          </EditorSection>
        )}

        {tab === "examples" && (
          <EditorSection eyebrow="VISIBLE CASES" title="Worked examples" description="Examples explain expected input and output to the learner.">
            <RepeatRows items={examples} onAdd={() => setExamples((items) => [...items, { ...emptyExample }])} onRemove={(index) => setExamples((items) => items.filter((_, itemIndex) => itemIndex !== index))} render={(item, index) => (
              <div className="editor-field-grid">
                <Field label="INPUT"><textarea rows={5} value={item.input} onChange={(event) => updateArray(setExamples, index, "input", event.target.value)} /></Field>
                <Field label="EXPECTED OUTPUT"><textarea rows={5} value={item.output} onChange={(event) => updateArray(setExamples, index, "output", event.target.value)} /></Field>
                <Field label="EXPLANATION" wide><textarea rows={3} value={item.explanation} onChange={(event) => updateArray(setExamples, index, "explanation", event.target.value)} /></Field>
              </div>
            )} />
          </EditorSection>
        )}

        {tab === "tests" && (
          <EditorSection eyebrow="JUDGE DATA" title="Test cases" description="Include hidden, public, and edge cases before review. Additions and removals persist with the draft.">
            <RepeatRows items={tests} onAdd={() => setTests((items) => [...items, { ...emptyTest }])} onRemove={(index) => void removeTest(index)} render={(item, index) => (
              <div className="editor-field-grid">
                <Field label="INPUT"><textarea rows={5} value={item.input} onChange={(event) => updateArray(setTests, index, "input", event.target.value)} /></Field>
                <Field label="EXPECTED OUTPUT"><textarea rows={5} value={item.expectedOutput} onChange={(event) => updateArray(setTests, index, "expectedOutput", event.target.value)} /></Field>
                <Field label="VISIBILITY"><select value={item.visibility} onChange={(event) => updateArray(setTests, index, "visibility", event.target.value)}>{["SAMPLE", "PUBLIC", "HIDDEN"].map((value) => <option key={value}>{value}</option>)}</select></Field>
                <Field label="CASE TYPE"><select value={item.testType} onChange={(event) => updateArray(setTests, index, "testType", event.target.value)}>{["NORMAL", "EDGE", "STRESS"].map((value) => <option key={value}>{value}</option>)}</select></Field>
              </div>
            )} />
          </EditorSection>
        )}

        {tab === "templates" && (
          <EditorSection eyebrow="STARTER CODE" title="Language template" description="Upsert a starter function for any active language slug.">
            <div className="editor-field-grid">
              <Field label="LANGUAGE SLUG"><input value={template.languageSlug} onChange={(event) => setTemplate((current) => ({ ...current, languageSlug: event.target.value }))} /></Field>
              <Field label="FUNCTION SIGNATURE"><input value={template.functionSignature} onChange={(event) => setTemplate((current) => ({ ...current, functionSignature: event.target.value }))} /></Field>
              <Field label="STARTER CODE" wide><textarea className="editor-code" rows={16} spellCheck={false} value={template.starterCode} onChange={(event) => setTemplate((current) => ({ ...current, starterCode: event.target.value }))} /></Field>
            </div>
          </EditorSection>
        )}

        {tab === "review" && (
          <EditorSection eyebrow="QUALITY GATE" title="Review & publish" description="Check completeness before exposing the challenge to learners.">
            <div className="review-grid">
              {[
                ["Core metadata", form.title.length >= 3 && form.slug.length >= 3],
                ["Statement", form.statement.length >= 20],
                ["Worked example", examples.some((item) => item.input && item.output)],
                ["Judge case", tests.some((item) => item.expectedOutput)],
                ["Code template", template.starterCode.length >= 5],
              ].map(([label, ready]) => <div key={String(label)}><i className={ready ? "is-ready" : ""}>{ready ? "✓" : "!"}</i><span>{label}</span><strong>{ready ? "READY" : "NEEDS WORK"}</strong></div>)}
            </div>
            <div className="review-actions">
              <button className="admin-secondary-action" onClick={() => void transition("review")} disabled={saving} type="button">SUBMIT FOR REVIEW</button>
              <button className="admin-primary-action" onClick={() => void transition("publish")} disabled={saving || existing?.status !== "IN_REVIEW"} type="button">PUBLISH PROBLEM</button>
            </div>
          </EditorSection>
        )}
      </section>

      <footer className="editor-footer">
        <span>Changes stay private until publication.</span>
        <button onClick={() => void save()} disabled={saving} type="button">{saving ? "SAVING..." : "SAVE CURRENT DRAFT"}</button>
      </footer>
    </main>
  );

  async function removeTest(index: number) {
    const test = tests[index];
    if (problemId && test.id) {
      const response = await fetch(`/api/cms/problems/${problemId}/test-cases/${test.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setError("The test case could not be removed.");
        return;
      }
    }
    setTests((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }
}

function EditorSection({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <div className="editor-section"><header><span>{eyebrow}</span><h2>{title}</h2><p>{description}</p></header><div>{children}</div></div>;
}

function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={wide ? "is-wide" : ""}><span>{label}</span>{children}</label>;
}

function RepeatRows<T>({ items, onAdd, onRemove, render }: { items: T[]; onAdd: () => void; onRemove: (index: number) => void; render: (item: T, index: number) => React.ReactNode }) {
  return <div className="editor-repeat">{items.map((item, index) => <article key={index}><header><span>CASE {String(index + 1).padStart(2, "0")}</span>{items.length > 1 && <button onClick={() => onRemove(index)} type="button">REMOVE</button>}</header>{render(item, index)}</article>)}<button className="editor-add-row" onClick={onAdd} type="button">+ ADD ANOTHER</button></div>;
}

function updateArray<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number, key: keyof T, value: unknown) {
  setter((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
