import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { SubmissionDetail } from "@/components/submission-detail";

export const metadata: Metadata = {
  title: "Submission detail — LLC_code",
  description: "Inspect source code, judge metadata and safe test diagnostics.",
};

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="app-page submissions-page">
      <AppHeader active="submissions" />
      <SubmissionDetail submissionId={id} />
    </main>
  );
}
