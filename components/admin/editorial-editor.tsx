"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ContentStatus } from "@/lib/cms-types";
import type { EditorialRecord } from "@/lib/editorial-cms-types";

const emptyForm = {
  intuition: "",
  bruteForce: "",
  optimizedApproach: "",
  dryRun: "",
  complexity: "",
  commonMistakes: "",
};

export function EditorialEditor({ problemId }: { problemId: string }) {
  const [record, setRecord] = useState<EditorialRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch(`/api/cms/editorials/${problemId}`, { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as EditorialRecord & { message?: string };
        if (!response.ok) throw new Error(data.message ?? "Unable to load editorial");
        return data;
      })
      .then((data) => {
        setRecord(data);
        if (data.editorial) {
          setForm({
            intuition: data.editorial.intuition ?? "",
            bruteForce: data.editorial.bruteForce ?? "",
            optimizedApproach: data.editorial.optimizedApproach ?? "",
            dryRun: data.editorial.dryRun ?? "",
            complexity: data.editorial.complexity ?? "",
            commonMistakes: data.editorial.commonMistakes ?? "",
          });
        }
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load editorial"))
      .finally(() => setLoading(false));
  }, [problemId]);

  const completion = useMemo(() => {
    const ready = Object.values(form).filter((value) => value.trim().length >= 10).length;
    return Math.round((ready / Object.keys(form).length) * 100);
  }, [form]);

  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const save = async () => {
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/cms/editorials/${problemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as EditorialRecord & { message?: string };
      if (!response.ok) throw new Error(data.message ?? "Unable to save editorial");
      setRecord(data);
      setNotice("Editorial draft saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save editorial");
    } finally {
      setSaving(false);
    }
  };

  const transition = async (action: "review" | "publish" | "archive") => {
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch(
        `/api/cms/editorials/${problemId}${action === "archive" ? "" : `/${action}`}`,
        { method: action === "archive" ? "DELETE" : "POST" },
      );
      const data = (await response.json()) as { status?: ContentStatus; message?: string };
      if (!response.ok) throw new Error(data.message ?? `Unable to ${action} editorial`);
      setRecord((current) => current?.editorial && data.status
        ? { ...current, editorial: { ...current.editorial, status: data.status } }
        : current);
      setNotice(action === "review" ? "Editorial submitted for review." : action === "publish" ? "Editorial published to learners." : "Editorial archived.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Unable to ${action} editorial`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="admin-page editor-loading"><i /><span>LOADING EDITORIAL</span></main>;
  if (!record) return <main className="admin-page"><div className="cms-notice is-error">{error || "Editorial unavailable"}</div></main>;

  return (
    <main className="admin-page problem-editor editorial-editor">
      <section className="editor-head">
        <div><Link href="/admin/editorials">&lt;- EDITORIAL BANK</Link><span>EDITORIAL / {record.editorial?.status ?? "NOT STARTED"}</span><h1>{record.title}</h1></div>
        <div className="editor-head-actions">
          <span><i style={{ width: `${completion}%` }} />{completion}% COMPLETE</span>
          <button className="admin-secondary-action" disabled={saving} onClick={() => void save()} type="button">{saving ? "SAVING..." : "SAVE DRAFT"}</button>
          <button className="admin-primary-action" disabled={saving || !record.editorial} onClick={() => void transition("review")} type="button">SEND TO REVIEW</button>
        </div>
      </section>
      {(error || notice) && <div className={`cms-notice ${error ? "is-error" : "is-success"}`} role="status"><strong>{error ? "ACTION FAILED" : "EDITORIAL UPDATED"}</strong><span>{error || notice}</span></div>}
      <section className="editor-canvas">
        <div className="editor-section">
          <header><span>LEARNER EXPLANATION</span><h2>Build understanding in layers.</h2><p>Use one clear step per line in the optimized approach.</p></header>
          <div className="editor-field-grid">
            <Field label="INTUITION"><textarea rows={7} value={form.intuition} onChange={(event) => update("intuition", event.target.value)} /></Field>
            <Field label="BRUTE-FORCE BASELINE"><textarea rows={7} value={form.bruteForce} onChange={(event) => update("bruteForce", event.target.value)} /></Field>
            <Field label="OPTIMIZED APPROACH — ONE STEP PER LINE" wide><textarea rows={10} value={form.optimizedApproach} onChange={(event) => update("optimizedApproach", event.target.value)} /></Field>
            <Field label="DRY RUN" wide><textarea rows={7} value={form.dryRun} onChange={(event) => update("dryRun", event.target.value)} /></Field>
            <Field label="COMPLEXITY"><textarea rows={4} value={form.complexity} onChange={(event) => update("complexity", event.target.value)} /></Field>
            <Field label="COMMON MISTAKES"><textarea rows={4} value={form.commonMistakes} onChange={(event) => update("commonMistakes", event.target.value)} /></Field>
          </div>
        </div>
      </section>
      <footer className="editor-footer editorial-review-actions">
        <button onClick={() => void transition("archive")} disabled={saving || !record.editorial} type="button">ARCHIVE</button>
        <button onClick={() => void transition("review")} disabled={saving || !record.editorial} type="button">SUBMIT FOR REVIEW</button>
        <button className="admin-primary-action" onClick={() => void transition("publish")} disabled={saving || record.editorial?.status !== "IN_REVIEW"} type="button">PUBLISH EDITORIAL</button>
      </footer>
    </main>
  );
}

function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={wide ? "is-wide" : ""}><span>{label}</span>{children}</label>;
}
