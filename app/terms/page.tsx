import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="legal-page">
      <Link href="/">← LLC_code</Link>
      <span>TERMS</span>
      <h1>Learn, experiment, and build responsibly.</h1>
      <p>
        LLC_code is a free, self-hosted learning project provided without a
        paid service guarantee. Use it for lawful coding practice and avoid
        attempts to bypass judge isolation or disrupt other users.
      </p>
      <p>
        Problem statements and editorials should only be published when you
        have the right to use them. Your submitted source code remains yours.
      </p>
    </main>
  );
}
