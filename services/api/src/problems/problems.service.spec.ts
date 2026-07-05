import { BadRequestException } from "@nestjs/common";
import {
  ContentStatus,
  TestCaseVisibility
} from "../generated/prisma/enums";
import type { PrismaService } from "../prisma/prisma.service";
import { ProblemsService } from "./problems.service";

describe("ProblemsService publication gates", () => {
  const prisma = {
    problem: {
      findFirst: jest.fn(),
      update: jest.fn()
    },
    auditLog: {
      create: jest.fn()
    }
  };
  let service: ProblemsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProblemsService(prisma as unknown as PrismaService);
  });

  it("blocks publication when hidden tests are missing", async () => {
    prisma.problem.findFirst.mockResolvedValue({
      id: "problem-id",
      examples: [{ id: "example-id" }],
      testCases: [{ visibility: TestCaseVisibility.PUBLIC }],
      codeTemplates: [{ id: "template-id" }]
    });

    await expect(
      service.publish("problem-id", "reviewer-id")
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.problem.update).not.toHaveBeenCalled();
  });

  it("publishes complete problems and records the reviewer", async () => {
    prisma.problem.findFirst.mockResolvedValue({
      id: "problem-id",
      examples: [{ id: "example-id" }],
      testCases: [{ visibility: TestCaseVisibility.HIDDEN }],
      codeTemplates: [{ id: "template-id" }]
    });
    prisma.problem.update.mockResolvedValue({});
    prisma.auditLog.create.mockResolvedValue({});

    await expect(
      service.publish("problem-id", "reviewer-id")
    ).resolves.toEqual({
      success: true,
      status: ContentStatus.PUBLISHED
    });
    expect(prisma.problem.update).toHaveBeenCalledWith({
      where: { id: "problem-id" },
      data: {
        status: ContentStatus.PUBLISHED,
        reviewedById: "reviewer-id"
      }
    });
  });
});
