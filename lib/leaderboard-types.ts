export type LeaderboardEntry = {
  rank: number;
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  learnerLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  joinedAt: string;
  solved: number;
  pointsEarned: number;
  totalAttempts: number;
  totalXp: number;
  xpLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastSolvedAt: string | null;
  badgesUnlocked: number;
  topTopics: Array<{
    slug: string;
    name: string;
    solved: number;
  }>;
};

export type LeaderboardResponse = {
  generatedAt: string;
  totalRanked: number;
  leaders: LeaderboardEntry[];
};
