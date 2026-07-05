import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { ContentStatus, Visibility } from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import { SaveEditorialDto } from "./dto/save-editorial.dto";

@Injectable()
export class EditorialsService {
  constructor(private readonly prisma: PrismaService) {}

  list(search?: string) {
    return this.prisma.problem.findMany({
      where: {
        deletedAt: null,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                { slug: { contains: search, mode: "insensitive" as const } }
              ]
            }
          : {})
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        visibility: true,
        editorial: {
          select: {
            id: true,
            status: true,
            updatedAt: true,
            author: { select: { username: true } }
          }
        }
      }
    });
  }

  async find(problemId: string) {
    const problem = await this.prisma.problem.findFirst({
      where: { id: problemId, deletedAt: null },
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        editorial: true
      }
    });
    if (!problem) throw new NotFoundException("Problem not found");
    return problem;
  }

  async save(problemId: string, dto: SaveEditorialDto, actorId: string) {
    await this.assertProblem(problemId);
    const editorial = await this.prisma.editorial.upsert({
      where: { problemId },
      create: {
        problemId,
        authorId: actorId,
        ...dto,
        status: ContentStatus.DRAFT
      },
      update: {
        ...dto,
        authorId: actorId,
        status: ContentStatus.DRAFT
      }
    });
    await this.audit(actorId, "editorial.save", editorial.id, { problemId });
    return this.find(problemId);
  }

  async submitForReview(problemId: string, actorId: string) {
    const editorial = await this.assertEditorial(problemId);
    await this.prisma.editorial.update({
      where: { problemId },
      data: { status: ContentStatus.IN_REVIEW }
    });
    await this.audit(actorId, "editorial.submit_review", editorial.id, {
      problemId
    });
    return { success: true, status: ContentStatus.IN_REVIEW };
  }

  async publish(problemId: string, actorId: string) {
    const editorial = await this.assertEditorial(problemId);
    const missing = [
      !editorial.intuition?.trim() && "intuition",
      !editorial.optimizedApproach?.trim() && "optimized approach",
      !editorial.complexity?.trim() && "complexity"
    ].filter(Boolean);
    if (missing.length) {
      throw new BadRequestException(
        `Cannot publish: missing ${missing.join(", ")}`
      );
    }
    await this.prisma.$transaction([
      this.prisma.editorial.update({
        where: { problemId },
        data: { status: ContentStatus.PUBLISHED }
      }),
      this.prisma.problem.update({
        where: { id: problemId },
        data: { visibility: Visibility.PUBLIC }
      })
    ]);
    await this.audit(actorId, "editorial.publish", editorial.id, { problemId });
    return { success: true, status: ContentStatus.PUBLISHED };
  }

  async archive(problemId: string, actorId: string) {
    const editorial = await this.assertEditorial(problemId);
    await this.prisma.editorial.update({
      where: { problemId },
      data: { status: ContentStatus.ARCHIVED }
    });
    await this.audit(actorId, "editorial.archive", editorial.id, { problemId });
    return { success: true, status: ContentStatus.ARCHIVED };
  }

  private async assertProblem(problemId: string) {
    const problem = await this.prisma.problem.findFirst({
      where: { id: problemId, deletedAt: null },
      select: { id: true }
    });
    if (!problem) throw new NotFoundException("Problem not found");
  }

  private async assertEditorial(problemId: string) {
    const editorial = await this.prisma.editorial.findUnique({
      where: { problemId }
    });
    if (!editorial) throw new NotFoundException("Editorial not found");
    return editorial;
  }

  private audit(
    actorId: string,
    action: string,
    entityId: string,
    metadata: { problemId: string }
  ) {
    return this.prisma.auditLog.create({
      data: { actorId, action, entityType: "Editorial", entityId, metadata }
    });
  }
}
