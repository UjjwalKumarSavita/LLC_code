import { Injectable } from "@nestjs/common";
import {
  ContentStatus,
  ProgressStatus,
  Role,
  Visibility
} from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async topLearners() {
    const learners = await this.prisma.user.findMany({
      where: {
        isActive: true,
        role: Role.STUDENT,
        progress: {
          some: {
            status: ProgressStatus.SOLVED,
            problem: {
              status: ContentStatus.PUBLISHED,
              visibility: Visibility.PUBLIC,
              deletedAt: null
            }
          }
        }
      },
      take: 100,
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        level: true,
        createdAt: true,
        progress: {
          where: {
            problem: {
              status: ContentStatus.PUBLISHED,
              visibility: Visibility.PUBLIC,
              deletedAt: null
            }
          },
          select: {
            status: true,
            attempts: true,
            solvedAt: true,
            problem: {
              select: {
                points: true,
                difficulty: true,
                tags: { select: { tag: { select: { name: true, slug: true } } } }
              }
            }
          }
        }
      }
    });

    const ranked = learners
      .map((learner) => {
        const solved = learner.progress.filter(
          (item) => item.status === ProgressStatus.SOLVED
        );
        const pointsEarned = solved.reduce(
          (sum, item) => sum + item.problem.points,
          0
        );
        const totalAttempts = learner.progress.reduce(
          (sum, item) => sum + item.attempts,
          0
        );
        const streak = summarizeStreak(
          solved.map((item) => ({ solvedAt: item.solvedAt }))
        );
        const xp = summarizeXp(pointsEarned, totalAttempts, solved.length);
        return {
          id: learner.id,
          username: learner.username,
          displayName: learner.fullName ?? learner.username,
          avatarUrl: learner.avatarUrl,
          learnerLevel: learner.level,
          joinedAt: learner.createdAt,
          solved: solved.length,
          pointsEarned,
          totalAttempts,
          totalXp: xp.totalXp,
          xpLevel: xp.level,
          currentStreak: streak.current,
          longestStreak: streak.longest,
          lastSolvedAt: streak.lastSolvedAt,
          badgesUnlocked: countBadges({
            solved: solved.length,
            pointsEarned,
            totalAttempts,
            totalProblems: learner.progress.length,
            longestStreak: streak.longest
          }),
          topTopics: summarizeTopics(solved)
        };
      })
      .sort(
        (a, b) =>
          b.totalXp - a.totalXp ||
          b.solved - a.solved ||
          b.currentStreak - a.currentStreak ||
          a.joinedAt.getTime() - b.joinedAt.getTime()
      )
      .slice(0, 25)
      .map((learner, index) => ({
        rank: index + 1,
        ...learner
      }));

    return {
      generatedAt: new Date(),
      totalRanked: ranked.length,
      leaders: ranked
    };
  }
}

type SolvedProgress = {
  solvedAt: Date | null;
  problem: {
    points: number;
    tags: Array<{ tag: { name: string; slug: string } }>;
  };
};

function summarizeXp(pointsEarned: number, totalAttempts: number, solvedCount: number) {
  const totalXp = pointsEarned * 10 + solvedCount * 25 + totalAttempts * 2;
  return {
    totalXp,
    level: Math.floor(totalXp / 250) + 1
  };
}

function summarizeStreak(solved: Array<{ solvedAt: Date | null }>) {
  const solvedDays = uniqueSolvedDays(solved);
  if (solvedDays.length === 0) {
    return { current: 0, longest: 0, lastSolvedAt: null };
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
    lastSolvedAt: solved
      .map((item) => item.solvedAt)
      .filter((date): date is Date => date != null)
      .sort((a, b) => b.getTime() - a.getTime())[0]
  };
}

function summarizeTopics(solved: SolvedProgress[]) {
  const topics = new Map<string, { name: string; solved: number }>();
  for (const item of solved) {
    for (const { tag } of item.problem.tags) {
      const current = topics.get(tag.slug) ?? { name: tag.name, solved: 0 };
      current.solved += 1;
      topics.set(tag.slug, current);
    }
  }
  return Array.from(topics, ([slug, topic]) => ({ slug, ...topic }))
    .sort((a, b) => b.solved - a.solved || a.name.localeCompare(b.name))
    .slice(0, 3);
}

function countBadges(stats: {
  solved: number;
  pointsEarned: number;
  totalAttempts: number;
  totalProblems: number;
  longestStreak: number;
}) {
  const totalXp = summarizeXp(
    stats.pointsEarned,
    stats.totalAttempts,
    stats.solved
  ).totalXp;
  return [
    stats.solved >= 1,
    stats.solved >= 5,
    stats.solved >= 10,
    stats.longestStreak >= 3,
    totalXp >= 1000,
    stats.totalProblems > 0 && stats.solved / stats.totalProblems >= 0.5
  ].filter(Boolean).length;
}

function uniqueSolvedDays(solved: Array<{ solvedAt: Date | null }>) {
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

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(left: Date, right: Date) {
  return Math.round(
    (startOfUtcDay(right).getTime() - startOfUtcDay(left).getTime()) /
      86_400_000
  );
}
