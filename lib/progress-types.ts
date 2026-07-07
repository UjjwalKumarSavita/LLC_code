export type ProgressStatus = "UNSOLVED" | "ATTEMPTED" | "SOLVED";

export type ProgressProblem = {
  id: string;
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  points: number;
  tags: Array<{ name: string; slug: string }>;
  status: ProgressStatus;
  attempts: number;
  solvedAt: string | null;
  lastAttemptedAt: string | null;
  bestSubmission: null | {
    id: string;
    runtimeMs: number | null;
    memoryKb: number | null;
    language: { name: string; slug: string };
  };
};

export type ProgressSummary = {
  stats: {
    totalProblems: number;
    solved: number;
    attempted: number;
    remaining: number;
    totalAttempts: number;
    pointsEarned: number;
  };
  xp: {
    totalXp: number;
    level: number;
    currentLevelXp: number;
    nextLevelXp: number;
    progressPercent: number;
  };
  streak: {
    current: number;
    longest: number;
    solvedToday: boolean;
    lastSolvedAt: string | null;
  };
  badges: Array<{
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
  }>;
  weeklyActivity: Array<{
    date: string;
    label: string;
    solved: number;
  }>;
  difficulties: Array<{
    difficulty: string;
    total: number;
    solved: number;
  }>;
  topics: Array<{
    slug: string;
    name: string;
    total: number;
    solved: number;
  }>;
  problems: ProgressProblem[];
  recentSubmissions: Array<{
    id: string;
    status: string;
    verdict: string | null;
    passedTestCases: number;
    totalTestCases: number;
    runtimeMs: number | null;
    submittedAt: string;
    problem: { slug: string; title: string };
    language: { slug: string; name: string };
  }>;
};
