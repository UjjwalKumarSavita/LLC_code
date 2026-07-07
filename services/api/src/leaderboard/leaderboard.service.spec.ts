import {
  Difficulty,
  ProgressStatus,
  SkillLevel
} from "../generated/prisma/enums";
import type { PrismaService } from "../prisma/prisma.service";
import { LeaderboardService } from "./leaderboard.service";

describe("LeaderboardService", () => {
  const prisma = {
    user: { findMany: jest.fn() }
  };
  const service = new LeaderboardService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findMany.mockResolvedValue([
      {
        id: "slower",
        username: "slower",
        fullName: "Slower Learner",
        avatarUrl: null,
        level: SkillLevel.BEGINNER,
        createdAt: new Date("2026-01-01"),
        progress: [
          solvedProgress(10, "2026-07-05", "Array", "array"),
          attemptedProgress(3)
        ]
      },
      {
        id: "faster",
        username: "faster",
        fullName: null,
        avatarUrl: "https://example.local/avatar.png",
        level: SkillLevel.INTERMEDIATE,
        createdAt: new Date("2026-02-01"),
        progress: [
          solvedProgress(30, "2026-07-06", "Dynamic Programming", "dp"),
          solvedProgress(20, "2026-07-07", "Dynamic Programming", "dp")
        ]
      }
    ]);
  });

  it("returns public-safe ranked learners from solved progress", async () => {
    const result = await service.topLearners();

    expect(result.totalRanked).toBe(2);
    expect(result.leaders[0]).toMatchObject({
      rank: 1,
      id: "faster",
      username: "faster",
      displayName: "faster",
      solved: 2,
      pointsEarned: 50,
      totalAttempts: 2,
      totalXp: 554,
      xpLevel: 3,
      badgesUnlocked: 2,
      topTopics: [
        { slug: "dp", name: "Dynamic Programming", solved: 2 }
      ]
    });
    expect(result.leaders[1]).toMatchObject({
      rank: 2,
      id: "slower",
      displayName: "Slower Learner",
      solved: 1
    });
    expect(JSON.stringify(result)).not.toContain("email");
  });
});

function solvedProgress(
  points: number,
  solvedAt: string,
  tagName: string,
  tagSlug: string
) {
  return {
    status: ProgressStatus.SOLVED,
    attempts: 1,
    solvedAt: new Date(solvedAt),
    problem: {
      points,
      difficulty: Difficulty.EASY,
      tags: [{ tag: { name: tagName, slug: tagSlug } }]
    }
  };
}

function attemptedProgress(attempts: number) {
  return {
    status: ProgressStatus.ATTEMPTED,
    attempts,
    solvedAt: null,
    problem: {
      points: 10,
      difficulty: Difficulty.EASY,
      tags: [{ tag: { name: "Array", slug: "array" } }]
    }
  };
}
