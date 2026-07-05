import { BadRequestException } from "@nestjs/common";
import { ContentStatus, Visibility } from "../generated/prisma/enums";
import type { PrismaService } from "../prisma/prisma.service";
import { EditorialsService } from "./editorials.service";

describe("EditorialsService publication gates", () => {
  const prisma = {
    editorial: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    problem: {
      update: jest.fn()
    },
    auditLog: {
      create: jest.fn()
    },
    $transaction: jest.fn()
  };
  let service: EditorialsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EditorialsService(prisma as unknown as PrismaService);
  });

  it("blocks publication when required learning content is missing", async () => {
    prisma.editorial.findUnique.mockResolvedValue({
      id: "editorial-id",
      problemId: "problem-id",
      intuition: "A useful intuition",
      optimizedApproach: "",
      complexity: null
    });

    await expect(
      service.publish("problem-id", "reviewer-id")
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("publishes complete content and exposes its problem", async () => {
    prisma.editorial.findUnique.mockResolvedValue({
      id: "editorial-id",
      problemId: "problem-id",
      intuition: "A useful intuition",
      optimizedApproach: "Step one\nStep two",
      complexity: "O(n) time"
    });
    prisma.editorial.update.mockReturnValue(Promise.resolve({}));
    prisma.problem.update.mockReturnValue(Promise.resolve({}));
    prisma.$transaction.mockResolvedValue([]);
    prisma.auditLog.create.mockResolvedValue({});

    await expect(
      service.publish("problem-id", "reviewer-id")
    ).resolves.toEqual({
      success: true,
      status: ContentStatus.PUBLISHED
    });
    expect(prisma.problem.update).toHaveBeenCalledWith({
      where: { id: "problem-id" },
      data: { visibility: Visibility.PUBLIC }
    });
  });
});
