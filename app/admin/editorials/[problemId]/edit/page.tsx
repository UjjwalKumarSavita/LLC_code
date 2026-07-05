import { EditorialEditor } from "@/components/admin/editorial-editor";

export default async function EditorialEditPage({
  params,
}: {
  params: Promise<{ problemId: string }>;
}) {
  const { problemId } = await params;
  return <EditorialEditor problemId={problemId} />;
}
