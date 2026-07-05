"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="system-state-page">
          <section>
            <span>LLC_CODE / ROOT RECOVERY</span>
            <h1>The application shell stopped.</h1>
            <p>Reload the shell to reconnect. Your locally saved code drafts are not removed.</p>
            <div><button onClick={reset} type="button">Reload application</button></div>
          </section>
        </main>
      </body>
    </html>
  );
}
