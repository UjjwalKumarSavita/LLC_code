import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <Link href="/">← LLC_code</Link>
      <span>PRIVACY</span>
      <h1>Your code stays under your control.</h1>
      <p>
        LLC_code stores account details, saved drafts, and submissions only to
        provide the learning experience. It does not sell personal data or use
        paid advertising trackers.
      </p>
      <p>
        Code submissions run in the self-hosted isolated judge configured by
        the project operator. Do not submit secrets, credentials, or private
        production source code.
      </p>
    </main>
  );
}
