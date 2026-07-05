import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { SubmissionHistory } from "@/components/submission-history";

export const metadata: Metadata = {
  title: "Submissions — LLC_code",
  description: "Review your code submissions, verdicts, runtime and memory.",
};

export default function SubmissionsPage() {
  return (
    <main className="app-page submissions-page">
      <AppHeader active="submissions" />
      <SubmissionHistory />
    </main>
  );
}
