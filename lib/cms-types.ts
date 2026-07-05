export type ContentStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "CHANGES_REQUESTED"
  | "PUBLISHED"
  | "ARCHIVED";

export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

export type CmsProblemListItem = {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string | null;
  difficulty: Difficulty;
  status: ContentStatus;
  visibility: "PUBLIC" | "PRIVATE" | "UNLISTED";
  points?: number | null;
  updatedAt: string;
  createdBy?: { id: string; username: string } | null;
  tags: Array<{ tag: { name: string; slug: string } }>;
  _count?: {
    examples: number;
    testCases: number;
    codeTemplates: number;
    hints: number;
  };
};

export type CmsProblem = CmsProblemListItem & {
  statement: string;
  inputFormat?: string | null;
  outputFormat?: string | null;
  constraints?: string | null;
  timeLimitMs: number;
  memoryLimitMb: number;
  comparisonMode: "EXACT" | "TRIMMED" | "TOKEN" | "FLOAT" | "CUSTOM";
  examples: Array<{
    id: string;
    input: string;
    output: string;
    explanation?: string | null;
  }>;
  testCases: Array<{
    id: string;
    input?: string | null;
    expectedOutput?: string | null;
    visibility: "SAMPLE" | "PUBLIC" | "HIDDEN";
    testType?: "NORMAL" | "EDGE" | "STRESS";
    weight?: number;
  }>;
  codeTemplates: Array<{
    id: string;
    languageSlug?: string;
    starterCode: string;
    functionSignature?: string | null;
    language?: { slug: string; name: string };
  }>;
};

export type PaginatedProblems = {
  items: CmsProblemListItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
};
