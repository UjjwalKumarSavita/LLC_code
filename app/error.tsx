"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("LLC_code route error", error);
  }, [error]);

  return (
    <main className="system-state-page">
      <div className="system-state-orbit" aria-hidden="true"><i /><i /><i /></div>
      <section>
        <span>RECOVERABLE APPLICATION ERROR</span>
        <h1>The signal broke.<br /><em>Your work did not.</em></h1>
        <p>The current screen could not finish loading. Saved editor drafts remain in this browser.</p>
        {error.digest && <code>REFERENCE / {error.digest}</code>}
        <div>
          <button onClick={reset} type="button">Try this screen again</button>
          <Link href="/dashboard">Return to dashboard</Link>
        </div>
      </section>
    </main>
  );
}
