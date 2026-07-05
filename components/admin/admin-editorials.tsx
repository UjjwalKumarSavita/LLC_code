"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { EditorialListItem } from "@/lib/editorial-cms-types";

export function AdminEditorials() {
  const [items, setItems] = useState<EditorialListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
        const response = await fetch(`/api/cms/editorials${query}`, { cache: "no-store" });
        const data = (await response.json()) as EditorialListItem[] & { message?: string };
        if (!response.ok) throw new Error(data.message ?? "Unable to load editorials");
        setItems(data);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to load editorials");
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [search]);

  const published = useMemo(
    () => items.filter((item) => item.editorial?.status === "PUBLISHED").length,
    [items],
  );

  return (
    <main className="admin-page">
      <section className="admin-page-head">
        <div>
          <span>CONTENT / LEARNING DEPTH</span>
          <h1>Editorial CMS</h1>
          <p>Author intuition, optimized explanations, dry runs, and review-ready guidance.</p>
        </div>
        <div className="editorial-coverage"><span>PUBLISHED COVERAGE</span><strong>{published} / {items.length}</strong></div>
      </section>
      <section className="cms-table-panel">
        <div className="cms-toolbar">
          <label><span>SEARCH PROBLEMS</span><input aria-label="Search editorial problems" onChange={(event) => setSearch(event.target.value)} placeholder="Title or slug..." value={search} /></label>
        </div>
        {error && <div className="cms-notice is-error" role="alert">{error}</div>}
        <div className="cms-table-wrap">
          <table className="cms-table">
            <thead><tr><th>PROBLEM</th><th>DIFFICULTY</th><th>EDITORIAL</th><th>AUTHOR</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {loading ? Array.from({ length: 6 }).map((_, index) => (
                <tr className="cms-loading-row" key={index}><td colSpan={5}><i /></td></tr>
              )) : items.map((item, index) => (
                <tr key={item.id}>
                  <td><span className="cms-row-number">{String(index + 1).padStart(2, "0")}</span><div><strong>{item.title}</strong><small>/{item.slug}</small></div></td>
                  <td><span className={`cms-difficulty is-${item.difficulty.toLowerCase()}`}>{item.difficulty}</span></td>
                  <td><span className={`cms-status is-${(item.editorial?.status ?? "not-started").toLowerCase()}`}>{item.editorial?.status.replaceAll("_", " ") ?? "NOT STARTED"}</span></td>
                  <td>{item.editorial?.author.username ?? "—"}</td>
                  <td><Link href={`/admin/editorials/${item.id}/edit`}>{item.editorial ? "EDIT" : "AUTHOR"}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
