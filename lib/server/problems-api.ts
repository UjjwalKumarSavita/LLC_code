import "server-only";

import type {
  Difficulty,
  Language,
  Problem,
  ProblemStatus,
} from "@/lib/problem-types";

const API_BASE_URL =
  process.env.API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";

type ApiProblemListItem = {
  slug: string;
  title: string;
  shortDescription: string | null;
  difficulty: string;
  points: number;
  acceptanceRate: string;
  tags: Array<{ tag: { name: string } }>;
};

type ApiProblemDetail = ApiProblemListItem & {
  statement: string;
  inputFormat: string | null;
  outputFormat: string | null;
  constraints: string | null;
  examples: Array<{
    input: string;
    output: string;
    explanation: string | null;
  }>;
  hints: Array<{ content: string }>;
  codeTemplates: Array<{
    starterCode: string;
    language: { slug: string };
  }>;
  editorial: null | {
    intuition: string | null;
    bruteForce: string | null;
    optimizedApproach: string | null;
    dryRun: string | null;
    complexity: string | null;
    commonMistakes: string | null;
    solutions?: Array<{
      code: string;
      explanation: string | null;
      language: { slug: string };
    }>;
  };
};

type ApiProblemListResponse = {
  items: ApiProblemListItem[];
};

const problemOrder = [
  "two-sum",
  "valid-parentheses",
  "binary-search",
  "maximum-subarray",
  "level-order-traversal",
  "longest-substring",
  "merge-intervals",
  "number-of-islands",
  "trapping-rain-water",
  "median-two-sorted-arrays",
  "reverse-string",
  "palindrome-string",
  "fizz-buzz",
  "running-sum",
  "contains-duplicate",
  "majority-element",
  "missing-number",
  "move-zeroes",
  "best-time-stock",
  "single-number",
  "valid-anagram",
  "first-unique-character",
  "longest-common-prefix",
  "merge-sorted-arrays",
  "array-intersection",
  "climbing-stairs",
  "min-cost-climbing-stairs",
  "rotate-array",
  "product-except-self",
  "subarray-sum-k",
  "power-of-two",
  "count-set-bits",
  "greatest-common-divisor",
  "fibonacci-number",
  "sorted-squares",
  "remove-sorted-duplicates",
  "max-consecutive-ones",
  "pivot-index",
  "valid-perfect-square",
  "two-sum-sorted",
  "search-insert-position",
  "house-robber",
  "plus-one",
  "happy-number",
  "integer-square-root",
  "normalized-palindrome",
  "ransom-note",
  "isomorphic-strings",
  "pascal-row",
  "find-peak-element",
];

const languageNames: Record<string, Language> = {
  python: "Python 3",
  java: "Java",
  cpp: "C++",
  javascript: "JavaScript",
};

export async function getPublicProblems(): Promise<Problem[]> {
  const response = await fetch(`${API_BASE_URL}/problems?limit=100`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Problem service is unavailable");
  const payload = (await response.json()) as ApiProblemListResponse;
  return payload.items
    .map((item) => listItemToProblem(item))
    .sort((a, b) => a.id - b.id);
}

export async function getPublicProblem(slug: string): Promise<Problem | null> {
  const response = await fetch(
    `${API_BASE_URL}/problems/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Problem service is unavailable");
  const item = (await response.json()) as ApiProblemDetail;
  const base = listItemToProblem(item);
  const starterCode: Problem["starterCode"] = {};
  const availableLanguages: Language[] = [];
  for (const template of item.codeTemplates) {
    const language = languageNames[template.language.slug];
    if (!language) continue;
    starterCode[language] = template.starterCode;
    availableLanguages.push(language);
  }

  return {
    ...base,
    statement: item.statement,
    inputFormat: item.inputFormat ?? "",
    outputFormat: item.outputFormat ?? "",
    constraints: item.constraints?.split(/\r?\n/).filter(Boolean) ?? [],
    examples: item.examples.map((example) => ({
      input: example.input,
      output: example.output,
      explanation: example.explanation ?? undefined,
    })),
    hints: item.hints.map((hint) => hint.content),
    editorial: {
      isPublished: Boolean(item.editorial),
      intuition: item.editorial?.intuition ?? "",
      bruteForce: item.editorial?.bruteForce ?? "",
      approach: item.editorial?.optimizedApproach
        ?.split(/\r?\n/)
        .filter(Boolean) ?? [],
      dryRun: item.editorial?.dryRun ?? "",
      complexity: item.editorial?.complexity ?? "",
      commonMistakes: item.editorial?.commonMistakes ?? "",
      solutions:
        item.editorial?.solutions
          ?.map((solution) => {
            const language = languageNames[solution.language.slug];
            if (!language) return null;
            return {
              language,
              code: solution.code,
              explanation: solution.explanation ?? "",
            };
          })
          .filter((solution): solution is NonNullable<typeof solution> =>
            Boolean(solution),
          ) ?? [],
    },
    starterCode,
    availableLanguages,
  };
}

function listItemToProblem(item: ApiProblemListItem): Problem {
  return {
    id: Math.max(1, problemOrder.indexOf(item.slug) + 1),
    slug: item.slug,
    title: item.title,
    difficulty: titleCase(item.difficulty) as Difficulty,
    acceptance: Number(item.acceptanceRate),
    points: item.points,
    status: "Unsolved" as ProblemStatus,
    tags: item.tags.map(({ tag }) => tag.name),
    summary: item.shortDescription ?? "",
    statement: "",
    inputFormat: "",
    outputFormat: "",
    constraints: [],
    examples: [],
    hints: [],
    editorial: {
      isPublished: false,
      intuition: "",
      bruteForce: "",
      approach: [],
      dryRun: "",
      complexity: "",
      commonMistakes: "",
      solutions: [],
    },
    starterCode: {},
    validationTokens: {},
  };
}

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
