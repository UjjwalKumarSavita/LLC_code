import { ServiceUnavailableException } from "@nestjs/common";
import {
  SubmissionKind,
  SubmissionStatus,
  TestCaseVisibility,
  Verdict
} from "../generated/prisma/enums";
import type { JudgeQueueService } from "../judge/judge-queue.service";
import type { PrismaService } from "../prisma/prisma.service";
import { SubmissionsService } from "./submissions.service";

describe("SubmissionsService", () => {
  const prisma = {
    problem: { findFirst: jest.fn() },
    language: { findFirst: jest.fn() },
    submission: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn()
    }
  };
  const queue = { enqueue: jest.fn() };
  let service: SubmissionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SubmissionsService(
      prisma as unknown as PrismaService,
      queue as unknown as JudgeQueueService
    );
    prisma.problem.findFirst.mockResolvedValue({
      id: "problem-id",
      testCases: [{ id: "test-id" }]
    });
    prisma.language.findFirst.mockResolvedValue({ id: "language-id" });
    prisma.submission.create.mockResolvedValue({
      id: "submission-id",
      kind: SubmissionKind.SUBMIT,
      status: SubmissionStatus.QUEUED,
      submittedAt: new Date(),
      totalTestCases: 1
    });
    queue.enqueue.mockResolvedValue({ id: "submission-id" });
  });

  it("queues only the persisted submission identity", async () => {
    await service.create(
      {
        problemSlug: "two-sum",
        languageSlug: "javascript",
        code: "console.log(1)"
      },
      "user-id",
      SubmissionKind.SUBMIT
    );

    expect(queue.enqueue).toHaveBeenCalledWith(
      "submission-id",
      SubmissionKind.SUBMIT
    );
    expect(queue.enqueue.mock.calls[0]).not.toContain("console.log(1)");
  });

  it("runs only sample and public test cases", async () => {
    await service.create(
      {
        problemSlug: "two-sum",
        languageSlug: "python",
        code: "print('attempt')"
      },
      "user-id",
      SubmissionKind.RUN
    );

    expect(prisma.problem.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          testCases: expect.objectContaining({
            where: expect.objectContaining({
              visibility: {
                in: [
                  TestCaseVisibility.SAMPLE,
                  TestCaseVisibility.PUBLIC
                ]
              }
            })
          })
        })
      })
    );
  });

  it("includes hidden test cases only in a final submission", async () => {
    await service.create(
      {
        problemSlug: "two-sum",
        languageSlug: "python",
        code: "print('attempt')"
      },
      "user-id",
      SubmissionKind.SUBMIT
    );

    const query = prisma.problem.findFirst.mock.calls[0][0];
    expect(query.select.testCases.where.visibility).toBeUndefined();
  });

  it("fails closed when Redis cannot accept the job", async () => {
    queue.enqueue.mockRejectedValue(new Error("offline"));
    prisma.submission.update.mockResolvedValue({});

    await expect(
      service.create(
        {
          problemSlug: "two-sum",
          languageSlug: "javascript",
          code: "console.log(1)"
        },
        "user-id",
        SubmissionKind.SUBMIT
      )
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(prisma.submission.update).toHaveBeenCalledWith({
      where: { id: "submission-id" },
      data: expect.objectContaining({
        status: SubmissionStatus.FAILED,
        verdict: Verdict.INTERNAL_ERROR
      })
    });
  });

  it("never returns hidden test input or output", async () => {
    prisma.submission.findFirst.mockResolvedValue({
      id: "submission-id",
      testResults: [
        {
          id: "result-id",
          status: Verdict.WRONG_ANSWER,
          actualOutput: "secret actual",
          expectedOutput: "secret expected",
          stderr: "secret log",
          runtimeMs: 5,
          memoryKb: 100,
          testCase: {
            visibility: TestCaseVisibility.HIDDEN,
            input: "secret input",
            explanation: "secret explanation"
          }
        }
      ]
    });

    const result = await service.findOne("submission-id", "user-id");
    expect(result.testResults).toEqual([]);
    expect(result.hiddenTestCount).toBe(1);
    expect(JSON.stringify(result)).not.toContain("secret");
  });

  it("returns safe diagnostics for visible test cases", async () => {
    prisma.submission.findFirst.mockResolvedValue({
      id: "submission-id",
      code: "print('mine')",
      testResults: [
        {
          id: "result-id",
          status: Verdict.WRONG_ANSWER,
          actualOutput: "3",
          expectedOutput: "4",
          stderr: null,
          runtimeMs: 5,
          memoryKb: 100,
          testCase: {
            visibility: TestCaseVisibility.PUBLIC,
            input: "2 2",
            explanation: "Visible diagnostic"
          }
        }
      ]
    });

    const result = await service.findOne("submission-id", "user-id");
    expect(result.code).toBe("print('mine')");
    expect(result.hiddenTestCount).toBe(0);
    expect(result.testResults[0]).toEqual(
      expect.objectContaining({
        input: "2 2",
        actualOutput: "3",
        expectedOutput: "4",
        visibility: TestCaseVisibility.PUBLIC
      })
    );
  });
});
