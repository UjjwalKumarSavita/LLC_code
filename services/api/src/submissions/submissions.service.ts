import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException
} from "@nestjs/common";
import {
  ContentStatus,
  SubmissionKind,
  SubmissionStatus,
  TestCaseVisibility,
  Verdict,
  Visibility
} from "../generated/prisma/enums";
import { JudgeQueueService } from "../judge/judge-queue.service";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateSubmissionDto } from "./dto/create-submission.dto";
import type { SubmissionQueryDto } from "./dto/submission-query.dto";

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly judgeQueue: JudgeQueueService
  ) {}

  async create(
    dto: CreateSubmissionDto,
    userId: string,
    kind: SubmissionKind
  ) {
    const problem = await this.prisma.problem.findFirst({
      where: {
        slug: dto.problemSlug,
        status: ContentStatus.PUBLISHED,
        visibility: Visibility.PUBLIC,
        deletedAt: null
      },
      select: {
        id: true,
        testCases: {
          where: {
            isActive: true,
            visibility:
              kind === SubmissionKind.RUN
                ? { in: [TestCaseVisibility.SAMPLE, TestCaseVisibility.PUBLIC] }
                : undefined
          },
          select: { id: true }
        }
      }
    });
    if (!problem) throw new NotFoundException("Problem not found");
    if (problem.testCases.length === 0) {
      throw new BadRequestException(
        kind === SubmissionKind.RUN
          ? "No runnable sample cases are configured"
          : "No judge cases are configured"
      );
    }

    const language = await this.prisma.language.findFirst({
      where: { slug: dto.languageSlug, isActive: true },
      select: { id: true }
    });
    if (!language) throw new BadRequestException("Language is not available");

    const submission = await this.prisma.submission.create({
      data: {
        userId,
        problemId: problem.id,
        languageId: language.id,
        code: dto.code,
        kind,
        totalTestCases: problem.testCases.length
      },
      select: {
        id: true,
        kind: true,
        status: true,
        submittedAt: true,
        totalTestCases: true
      }
    });

    try {
      await this.judgeQueue.enqueue(submission.id, kind);
    } catch {
      await this.prisma.submission.update({
        where: { id: submission.id },
        data: {
          status: SubmissionStatus.FAILED,
          verdict: Verdict.INTERNAL_ERROR,
          errorMessage: "Submission queue is temporarily unavailable",
          judgedAt: new Date(),
          judgeResponse: {
            failureCategory: "QUEUE_UNAVAILABLE"
          }
        }
      });
      throw new ServiceUnavailableException(
        "Judge queue is temporarily unavailable"
      );
    }

    return submission;
  }

  async list(userId: string, query: SubmissionQueryDto) {
    const where = {
      userId,
      kind: query.kind,
      verdict: query.verdict,
      language: query.language ? { slug: query.language } : undefined,
      problem: query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" as const } },
              { slug: { contains: query.search, mode: "insensitive" as const } }
            ]
          }
        : undefined
    };
    const [items, totalCount] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        take: query.limit + 1,
        cursor: query.cursor ? { id: query.cursor } : undefined,
        skip: query.cursor ? 1 : undefined,
        orderBy: [{ submittedAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          kind: true,
          status: true,
          verdict: true,
          runtimeMs: true,
          memoryKb: true,
          passedTestCases: true,
          totalTestCases: true,
          submittedAt: true,
          judgedAt: true,
          problem: { select: { slug: true, title: true } },
          language: { select: { slug: true, name: true } }
        }
      }),
      this.prisma.submission.count({ where })
    ]);
    const hasMore = items.length > query.limit;
    const page = hasMore ? items.slice(0, query.limit) : items;
    return {
      items: page,
      nextCursor: hasMore ? page.at(-1)?.id ?? null : null,
      totalCount
    };
  }

  async findOne(id: string, userId: string) {
    const submission = await this.prisma.submission.findFirst({
      where: { id, userId },
      select: {
        id: true,
        kind: true,
        status: true,
        verdict: true,
        runtimeMs: true,
        memoryKb: true,
        passedTestCases: true,
        totalTestCases: true,
        code: true,
        errorMessage: true,
        submittedAt: true,
        judgedAt: true,
        problem: { select: { slug: true, title: true } },
        language: { select: { slug: true, name: true } },
        testResults: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            status: true,
            actualOutput: true,
            expectedOutput: true,
            stderr: true,
            runtimeMs: true,
            memoryKb: true,
            testCase: {
              select: {
                visibility: true,
                input: true,
                explanation: true
              }
            }
          }
        }
      }
    });
    if (!submission) throw new NotFoundException("Submission not found");

    const visibleResults = submission.testResults.filter(
      (result) => result.testCase.visibility !== TestCaseVisibility.HIDDEN
    );
    const hiddenTestCount =
      submission.testResults.length - visibleResults.length;

    return {
      ...submission,
      hiddenTestCount,
      testResults: visibleResults.map((result) => ({
        id: result.id,
        status: result.status,
        runtimeMs: result.runtimeMs,
        memoryKb: result.memoryKb,
        visibility: result.testCase.visibility,
        input: result.testCase.input,
        explanation: result.testCase.explanation,
        actualOutput: result.actualOutput,
        expectedOutput: result.expectedOutput,
        stderr: result.stderr
      }))
    };
  }
}
