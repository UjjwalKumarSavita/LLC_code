import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProblemWorkspace } from "@/components/problem-workspace";
import { getPublicProblem } from "@/lib/server/problems-api";

type ProblemPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProblemPageProps): Promise<Metadata> {
  const { slug } = await params;
  const problem = await getPublicProblem(slug);
  return {
    title: problem ? `${problem.title} — LLC_code` : "Problem not found — LLC_code",
    description: problem?.summary,
  };
}

export const dynamic = "force-dynamic";

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { slug } = await params;
  const problem = await getPublicProblem(slug);
  if (!problem) notFound();
  return <ProblemWorkspace problem={problem} />;
}
