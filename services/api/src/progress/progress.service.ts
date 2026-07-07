import { Injectable } from "@nestjs/common";
import {
  ContentStatus,
  ProgressStatus,
  SubmissionKind,
  Visibility
} from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(userId: string) {
    const [problems, recentSubmissions] = await Promise.all([
      this.prisma.problem.findMany({
        where: {
          status: ContentStatus.PUBLISHED,
          visibility: Visibility.PUBLIC,
          deletedAt: null
        },
        orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          slug: true,
          title: true,
          difficulty: true,
          points: true,
          tags: { select: { tag: { select: { name: true, slug: true } } } },
          progress: {
            where: { userId },
            select: {
              status: true,
              attempts: true,
              solvedAt: true,
              lastAttemptedAt: true,
              bestSubmission: {
                select: {
                  id: true,
                  runtimeMs: true,
                  memoryKb: true,
                  language: { select: { name: true, slug: true } }
                }
              }
            }
          }
        }
      }),
      this.prisma.submission.findMany({
        where: { userId, kind: SubmissionKind.SUBMIT },
        orderBy: { submittedAt: "desc" },
        take: 6,
        select: {
          id: true,
          status: true,
          verdict: true,
          passedTestCases: true,
          totalTestCases: true,
          runtimeMs: true,
          submittedAt: true,
          problem: { select: { slug: true, title: true } },
          language: { select: { slug: true, name: true } }
        }
      })
    ]);

    const items = problems.map((problem) => {
      const progress = problem.progress[0];
      return {
        id: problem.id,
        slug: problem.slug,
        title: problem.title,
        difficulty: problem.difficulty,
        points: problem.points,
        tags: problem.tags.map(({ tag }) => tag),
        status: progress?.status ?? ProgressStatus.UNSOLVED,
        attempts: progress?.attempts ?? 0,
        solvedAt: progress?.solvedAt ?? null,
        lastAttemptedAt: progress?.lastAttemptedAt ?? null,
        bestSubmission: progress?.bestSubmission ?? null
      };
    });
    const solved = items.filter(
      (item) => item.status === ProgressStatus.SOLVED
    );
    const attempted = items.filter(
      (item) => item.status === ProgressStatus.ATTEMPTED
    );
    const stats = {
      totalProblems: items.length,
      solved: solved.length,
      attempted: attempted.length,
      remaining: items.length - solved.length,
      totalAttempts: items.reduce((sum, item) => sum + item.attempts, 0),
      pointsEarned: solved.reduce((sum, item) => sum + item.points, 0)
    };
    const streak = summarizeStreak(solved);
    const xp = summarizeXp(stats.pointsEarned, stats.totalAttempts, solved.length);

    return {
      stats,
      xp,
      streak,
      badges: summarizeBadges(stats, streak),
      weeklyActivity: summarizeWeeklyActivity(solved),
      difficulties: summarizeDifficulties(items),
      topics: summarizeTopics(items),
      problems: items,
      recentSubmissions
    };
  }
}

type ProgressItem = {
  difficulty: string;
  points: number;
  status: ProgressStatus;
  attempts: number;
  solvedAt: Date | null;
  tags: Array<{ name: string; slug: string }>;
};

type ProgressStats = {
  totalProblems: number;
  solved: number;
  attempted: number;
  remaining: number;
  totalAttempts: number;
  pointsEarned: number;
};

type StreakSummary = {
  current: number;
  longest: number;
  solvedToday: boolean;
  lastSolvedAt: Date | null;
};

function summarizeDifficulties(items: ProgressItem[]) {
  return ["EASY", "MEDIUM", "HARD", "EXPERT"].map((difficulty) => {
    const matching = items.filter((item) => item.difficulty === difficulty);
    return {
      difficulty,
      total: matching.length,
      solved: matching.filter((item) => item.status === ProgressStatus.SOLVED)
        .length
    };
  }).filter((item) => item.total > 0);
}

function summarizeTopics(items: ProgressItem[]) {
  const topics = new Map<string, { name: string; total: number; solved: number }>();
  for (const item of items) {
    for (const tag of item.tags) {
      const topic = topics.get(tag.slug) ?? { name: tag.name, total: 0, solved: 0 };
      topic.total += 1;
      if (item.status === ProgressStatus.SOLVED) topic.solved += 1;
      topics.set(tag.slug, topic);
    }
  }
  return Array.from(topics, ([slug, topic]) => ({ slug, ...topic }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
    .slice(0, 8);
}

function summarizeXp(pointsEarned: number, totalAttempts: number, solvedCount: number) {
  const totalXp = pointsEarned * 10 + solvedCount * 25 + totalAttempts * 2;
  const level = Math.floor(totalXp / 250) + 1;
  const currentLevelXp = totalXp - (level - 1) * 250;
  const nextLevelXp = 250;
  return {
    totalXp,
    level,
    currentLevelXp,
    nextLevelXp,
    progressPercent: Math.round((currentLevelXp / nextLevelXp) * 100)
  };
}

function summarizeStreak(solved: ProgressItem[]): StreakSummary {
  const solvedDays = uniqueSolvedDays(solved);
  if (solvedDays.length === 0) {
    return {
      current: 0,
      longest: 0,
      solvedToday: false,
      lastSolvedAt: null
    };
  }

  let longest = 1;
  let running = 1;
  for (let index = 1; index < solvedDays.length; index += 1) {
    if (daysBetween(solvedDays[index - 1], solvedDays[index]) === 1) {
      running += 1;
    } else {
      running = 1;
    }
    longest = Math.max(longest, running);
  }

  const today = startOfUtcDay(new Date());
  const latestDay = solvedDays[solvedDays.length - 1];
  const gapFromToday = daysBetween(latestDay, today);
  let current = 0;
  if (gapFromToday === 0 || gapFromToday === 1) {
    current = 1;
    for (let index = solvedDays.length - 1; index > 0; index -= 1) {
      if (daysBetween(solvedDays[index - 1], solvedDays[index]) !== 1) break;
      current += 1;
    }
  }

  return {
    current,
    longest,
    solvedToday: gapFromToday === 0,
    lastSolvedAt: solved
      .map((item) => item.solvedAt)
      .filter((date): date is Date => date != null)
      .sort((a, b) => b.getTime() - a.getTime())[0]
  };
}

function summarizeWeeklyActivity(solved: ProgressItem[]) {
  const counts = new Map<string, number>();
  for (const item of solved) {
    if (!item.solvedAt) continue;
    const key = dayKey(startOfUtcDay(item.solvedAt));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const today = startOfUtcDay(new Date());
  return Array.from({ length: 7 }, (_, offset) => {
    const date = addUtcDays(today, offset - 6);
    const key = dayKey(date);
    return {
      date: key,
      solved: counts.get(key) ?? 0,
      label: date.toLocaleDateString("en", {
        weekday: "short",
        timeZone: "UTC"
      })
    };
  });
}

function summarizeBadges(stats: ProgressStats, streak: StreakSummary) {
  const definitions = [
    {
      id: "first-accepted",
      title: "First accepted",
      description: "Solve your first judge-backed problem.",
      unlocked: stats.solved >= 1
    },
    {
      id: "five-solved",
      title: "Pattern scout",
      description: "Solve 5 published problems.",
      unlocked: stats.solved >= 5
    },
    {
      id: "ten-solved",
      title: "Momentum builder",
      description: "Solve 10 published problems.",
      unlocked: stats.solved >= 10
    },
    {
      id: "three-day-streak",
      title: "Three-day spark",
      description: "Keep an accepted-solution streak for 3 days.",
      unlocked: streak.longest >= 3
    },
    {
      id: "thousand-xp",
      title: "1K XP club",
      description: "Earn 1,000 XP from accepted work and attempts.",
      unlocked: summarizeXp(stats.pointsEarned, stats.totalAttempts, stats.solved).totalXp >= 1000
    },
    {
      id: "halfway",
      title: "Halfway map",
      description: "Complete at least half of the published catalogue.",
      unlocked:
        stats.totalProblems > 0 &&
        stats.solved / stats.totalProblems >= 0.5
    }
  ];

  return definitions;
}

function uniqueSolvedDays(solved: ProgressItem[]) {
  const days = new Map<string, Date>();
  for (const item of solved) {
    if (!item.solvedAt) continue;
    const date = startOfUtcDay(item.solvedAt);
    days.set(dayKey(date), date);
  }
  return Array.from(days.values()).sort((a, b) => a.getTime() - b.getTime());
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(left: Date, right: Date) {
  return Math.round(
    (startOfUtcDay(right).getTime() - startOfUtcDay(left).getTime()) /
      86_400_000
  );
}
