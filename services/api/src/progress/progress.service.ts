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

    return {
      stats: {
        totalProblems: items.length,
        solved: solved.length,
        attempted: attempted.length,
        remaining: items.length - solved.length,
        totalAttempts: items.reduce((sum, item) => sum + item.attempts, 0),
        pointsEarned: solved.reduce((sum, item) => sum + item.points, 0)
      },
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
  tags: Array<{ name: string; slug: string }>;
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
