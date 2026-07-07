export type Difficulty = "Easy" | "Medium" | "Hard";
export type ProblemStatus = "Solved" | "Attempted" | "Unsolved";
export type Language = "Python 3" | "Java" | "C++" | "JavaScript";

export type ProblemExample = {
  input: string;
  output: string;
  explanation?: string;
};

export type Problem = {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  acceptance: number;
  points: number;
  status: ProblemStatus;
  tags: string[];
  summary: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: ProblemExample[];
  hints: string[];
  editorial: {
    isPublished: boolean;
    intuition: string;
    bruteForce: string;
    approach: string[];
    dryRun: string;
    complexity: string;
    commonMistakes: string;
    solutions: Array<{
      language: Language;
      code: string;
      explanation: string;
    }>;
  };
  starterCode: Partial<Record<Language, string>>;
  availableLanguages?: Language[];
  validationTokens: Partial<Record<Language, string[]>>;
};

export const languages: Language[] = ["Python 3", "Java", "C++", "JavaScript"];
