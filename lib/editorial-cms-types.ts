import type { ContentStatus, Difficulty } from "@/lib/cms-types";

export type EditorialListItem = {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  visibility: "PUBLIC" | "PRIVATE" | "UNLISTED";
  editorial: {
    id: string;
    status: ContentStatus;
    updatedAt: string;
    author: { username: string };
  } | null;
};

export type EditorialRecord = {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  editorial: {
    id: string;
    status: ContentStatus;
    intuition?: string | null;
    bruteForce?: string | null;
    optimizedApproach?: string | null;
    dryRun?: string | null;
    complexity?: string | null;
    commonMistakes?: string | null;
  } | null;
};
