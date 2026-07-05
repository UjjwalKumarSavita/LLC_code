import Link from "next/link";
import { AppHeader } from "@/components/app-header";

export default function NotFound() {
  return (
    <main className="app-page">
      <AppHeader />
      <div className="system-state-page">
        <div className="system-state-code" aria-hidden="true">404</div>
        <section>
          <span>ROUTE NOT FOUND</span>
          <h1>This path has<br /><em>no algorithm yet.</em></h1>
          <p>The requested page may have moved, expired, or never existed.</p>
          <div>
            <Link href="/problems">Browse problems</Link>
            <Link href="/">Return home</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
