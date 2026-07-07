import { Difficulty, ProgressStatus } from "../generated/prisma/enums";
import type { PrismaService } from "../prisma/prisma.service";
import { ProgressService } from "./progress.service";

describe("ProgressService", () => {
  const prisma = {
    problem: { findMany: jest.fn() },
    submission: { findMany: jest.fn() }
  };
  const service = new ProgressService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.submission.findMany.mockResolvedValue([]);
    prisma.problem.findMany.mockResolvedValue([
      {
        id: "one",
        slug: "one",
        title: "One",
        difficulty: Difficulty.EASY,
        points: 20,
        tags: [{ tag: { name: "Array", slug: "array" } }],
        progress: [
          {
            status: ProgressStatus.SOLVED,
            attempts: 2,
            solvedAt: new Date("2026-01-01"),
            lastAttemptedAt: new Date("2026-01-01"),
            bestSubmission: null
          }
        ]
      },
      {
        id: "two",
        slug: "two",
        title: "Two",
        difficulty: Difficulty.EASY,
        points: 30,
        tags: [{ tag: { name: "Array", slug: "array" } }],
        progress: [
          {
            status: ProgressStatus.ATTEMPTED,
            attempts: 1,
            solvedAt: null,
            lastAttemptedAt: new Date("2026-01-02"),
            bestSubmission: null
          }
        ]
      },
      {
        id: "three",
        slug: "three",
        title: "Three",
        difficulty: Difficulty.MEDIUM,
        points: 40,
        tags: [{ tag: { name: "Stack", slug: "stack" } }],
        progress: []
      }
    ]);
  });

  it("summarizes solved, attempted, remaining, points, and topics", async () => {
    const result = await service.summary("user-id");

    expect(result.stats).toEqual({
      totalProblems: 3,
      solved: 1,
      attempted: 1,
      remaining: 2,
      totalAttempts: 3,
      pointsEarned: 20
    });
    expect(result.difficulties).toEqual([
      { difficulty: "EASY", total: 2, solved: 1 },
      { difficulty: "MEDIUM", total: 1, solved: 0 }
    ]);
    expect(result.topics[0]).toEqual({
      slug: "array",
      name: "Array",
      total: 2,
      solved: 1
    });
    expect(result.xp).toEqual({
      totalXp: 231,
      level: 1,
      currentLevelXp: 231,
      nextLevelXp: 250,
      progressPercent: 92
    });
    expect(result.streak).toMatchObject({
      current: 0,
      longest: 1,
      solvedToday: false
    });
    expect(result.badges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "first-accepted",
          unlocked: true
        }),
        expect.objectContaining({
          id: "five-solved",
          unlocked: false
        })
      ])
    );
    expect(result.weeklyActivity).toHaveLength(7);
    expect(result.problems[2]?.status).toBe(ProgressStatus.UNSOLVED);
  });
});
