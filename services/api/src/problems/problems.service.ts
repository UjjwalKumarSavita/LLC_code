import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  ContentStatus,
  TestCaseVisibility,
  Visibility
} from "../generated/prisma/enums";
import type { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateProblemDto, TestCaseDto } from "./dto/create-problem.dto";
import type { CreateTemplateDto } from "./dto/create-template.dto";
import type { CmsProblemQueryDto, ProblemQueryDto } from "./dto/problem-query.dto";
import type { UpdateProblemDto } from "./dto/update-problem.dto";

@Injectable()
export class ProblemsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(query: ProblemQueryDto) {
    const where = this.buildWhere(query, {
      status: ContentStatus.PUBLISHED,
      visibility: Visibility.PUBLIC
    });
    const [items, total] = await this.prisma.$transaction([
      this.prisma.problem.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ difficulty: "asc" }, { createdAt: "desc" }],
        select: this.problemListSelect
      }),
      this.prisma.problem.count({ where })
    ]);
    return this.paginate(items, total, query.page, query.limit);
  }

  async findPublicBySlug(slug: string) {
    const problem = await this.prisma.problem.findFirst({
      where: {
        slug,
        status: ContentStatus.PUBLISHED,
        visibility: Visibility.PUBLIC,
        deletedAt: null
      },
      include: {
        examples: { orderBy: { displayOrder: "asc" } },
        tags: { include: { tag: true } },
        hints: { orderBy: { level: "asc" } },
        codeTemplates: {
          include: { language: true },
          where: { language: { isActive: true } }
        },
        editorial: {
          include: {
            solutions: {
              include: { language: true },
              orderBy: { language: { name: "asc" } }
            }
          }
        }
      }
    });
    if (!problem) throw new NotFoundException("Problem not found");

    return {
      ...problem,
      editorial:
        problem.editorial?.status === ContentStatus.PUBLISHED
          ? problem.editorial
          : null
    };
  }

  async listCms(query: CmsProblemQueryDto) {
    const where = this.buildWhere(query, {
      status: query.status,
      visibility: query.visibility
    });
    const [items, total] = await this.prisma.$transaction([
      this.prisma.problem.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { updatedAt: "desc" },
        select: {
          ...this.problemListSelect,
          createdBy: { select: { id: true, username: true } },
          reviewedBy: { select: { id: true, username: true } },
          _count: {
            select: {
              examples: true,
              testCases: true,
              codeTemplates: true,
              hints: true
            }
          }
        }
      }),
      this.prisma.problem.count({ where })
    ]);
    return this.paginate(items, total, query.page, query.limit);
  }

  async findCmsById(id: string) {
    const problem = await this.prisma.problem.findFirst({
      where: { id, deletedAt: null },
      include: {
        examples: { orderBy: { displayOrder: "asc" } },
        tags: { include: { tag: true } },
        hints: { orderBy: { level: "asc" } },
        testCases: { orderBy: { createdAt: "asc" } },
        codeTemplates: { include: { language: true } },
        editorial: { include: { solutions: true } },
        createdBy: { select: { id: true, username: true } },
        reviewedBy: { select: { id: true, username: true } }
      }
    });
    if (!problem) throw new NotFoundException("Problem not found");
    return problem;
  }

  async create(dto: CreateProblemDto, actorId: string) {
    const slug = normalizeSlug(dto.slug);
    const exists = await this.prisma.problem.findUnique({
      where: { slug },
      select: { id: true }
    });
    if (exists) throw new ConflictException("Problem slug already exists");

    const problem = await this.prisma.problem.create({
      data: {
        slug,
        title: dto.title.trim(),
        shortDescription: dto.shortDescription?.trim(),
        statement: dto.statement,
        inputFormat: dto.inputFormat,
        outputFormat: dto.outputFormat,
        constraints: dto.constraints,
        difficulty: dto.difficulty,
        points: dto.points,
        timeLimitMs: dto.timeLimitMs,
        memoryLimitMb: dto.memoryLimitMb,
        comparisonMode: dto.comparisonMode,
        visibility: dto.visibility,
        createdById: actorId,
        examples: dto.examples?.length
          ? {
              create: dto.examples.map((example, index) => ({
                ...example,
                displayOrder: example.displayOrder ?? index + 1
              }))
            }
          : undefined,
        hints: dto.hints?.length ? { create: dto.hints } : undefined,
        testCases: dto.testCases?.length
          ? { create: dto.testCases }
          : undefined,
        tags: dto.tags?.length
          ? {
              create: dto.tags.map((name) => ({
                tag: {
                  connectOrCreate: {
                    where: { slug: normalizeSlug(name) },
                    create: {
                      name: name.trim(),
                      slug: normalizeSlug(name)
                    }
                  }
                }
              }))
            }
          : undefined
      },
      select: { id: true }
    });
    await this.audit(actorId, "problem.create", "Problem", problem.id, {
      slug
    });
    return this.findCmsById(problem.id);
  }

  async update(id: string, dto: UpdateProblemDto, actorId: string) {
    await this.assertExists(id);
    if (dto.slug) {
      const slug = normalizeSlug(dto.slug);
      const conflict = await this.prisma.problem.findFirst({
        where: { slug, NOT: { id } },
        select: { id: true }
      });
      if (conflict) throw new ConflictException("Problem slug already exists");
    }

    const { tags, examples, ...fields } = dto;
    await this.prisma.$transaction(async (transaction) => {
      if (tags) {
        await transaction.problemTag.deleteMany({ where: { problemId: id } });
      }
      if (examples) {
        await transaction.problemExample.deleteMany({ where: { problemId: id } });
      }
      await transaction.problem.update({
        where: { id },
        data: {
          ...fields,
          slug: fields.slug ? normalizeSlug(fields.slug) : undefined,
          version: { increment: 1 },
          status: ContentStatus.DRAFT,
          reviewedById: null,
          tags: tags
            ? {
                create: tags.map((name) => ({
                  tag: {
                    connectOrCreate: {
                      where: { slug: normalizeSlug(name) },
                      create: { name: name.trim(), slug: normalizeSlug(name) }
                    }
                  }
                }))
              }
            : undefined,
          examples: examples
            ? {
                create: examples.map((example, index) => ({
                  ...example,
                  displayOrder: example.displayOrder ?? index + 1
                }))
              }
            : undefined
        }
      });
    });
    await this.audit(actorId, "problem.update", "Problem", id, {
      fields: Object.keys(dto)
    });
    return this.findCmsById(id);
  }

  async submitForReview(id: string, actorId: string) {
    await this.assertExists(id);
    await this.prisma.problem.update({
      where: { id },
      data: { status: ContentStatus.IN_REVIEW }
    });
    await this.audit(actorId, "problem.submit_review", "Problem", id);
    return { success: true, status: ContentStatus.IN_REVIEW };
  }

  async publish(id: string, reviewerId: string) {
    const problem = await this.prisma.problem.findFirst({
      where: { id, deletedAt: null },
      include: {
        testCases: {
          where: { isActive: true },
          select: { visibility: true }
        },
        codeTemplates: { select: { id: true } },
        examples: { select: { id: true } }
      }
    });
    if (!problem) throw new NotFoundException("Problem not found");

    const hasSample =
      problem.examples.length > 0 ||
      problem.testCases.some(
        (testCase) => testCase.visibility === TestCaseVisibility.SAMPLE
      );
    const hasHidden = problem.testCases.some(
      (testCase) => testCase.visibility === TestCaseVisibility.HIDDEN
    );
    const failures = [
      !hasSample && "at least one sample",
      !hasHidden && "at least one hidden test",
      problem.codeTemplates.length === 0 && "at least one code template"
    ].filter(Boolean);
    if (failures.length) {
      throw new BadRequestException(
        `Cannot publish: missing ${failures.join(", ")}`
      );
    }

    await this.prisma.problem.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        reviewedById: reviewerId
      }
    });
    await this.audit(reviewerId, "problem.publish", "Problem", id);
    return { success: true, status: ContentStatus.PUBLISHED };
  }

  async archive(id: string, actorId: string) {
    await this.assertExists(id);
    await this.prisma.problem.update({
      where: { id },
      data: {
        status: ContentStatus.ARCHIVED,
        deletedAt: new Date()
      }
    });
    await this.audit(actorId, "problem.archive", "Problem", id);
    return { success: true };
  }

  async addTestCase(id: string, dto: TestCaseDto, actorId: string) {
    await this.assertExists(id);
    if (
      !dto.input &&
      !dto.expectedOutput
    ) {
      throw new BadRequestException(
        "Inline input and expected output are required for this endpoint"
      );
    }
    const testCase = await this.prisma.testCase.create({
      data: { problemId: id, ...dto }
    });
    await this.bumpVersion(id);
    await this.audit(actorId, "test_case.create", "TestCase", testCase.id, {
      problemId: id,
      visibility: dto.visibility
    });
    return testCase;
  }

  async removeTestCase(
    problemId: string,
    testCaseId: string,
    actorId: string
  ) {
    const result = await this.prisma.testCase.updateMany({
      where: { id: testCaseId, problemId },
      data: { isActive: false }
    });
    if (result.count === 0) throw new NotFoundException("Test case not found");
    await this.bumpVersion(problemId);
    await this.audit(actorId, "test_case.deactivate", "TestCase", testCaseId, {
      problemId
    });
    return { success: true };
  }

  async upsertTemplate(
    problemId: string,
    dto: CreateTemplateDto,
    actorId: string
  ) {
    await this.assertExists(problemId);
    const language = await this.prisma.language.findUnique({
      where: { slug: normalizeSlug(dto.languageSlug) },
      select: { id: true }
    });
    if (!language) throw new BadRequestException("Language is not configured");

    const template = await this.prisma.codeTemplate.upsert({
      where: {
        problemId_languageId: {
          problemId,
          languageId: language.id
        }
      },
      create: {
        problemId,
        languageId: language.id,
        starterCode: dto.starterCode,
        functionSignature: dto.functionSignature
      },
      update: {
        starterCode: dto.starterCode,
        functionSignature: dto.functionSignature
      }
    });
    await this.bumpVersion(problemId);
    await this.audit(actorId, "code_template.upsert", "CodeTemplate", template.id, {
      problemId,
      languageSlug: dto.languageSlug
    });
    return template;
  }

  private buildWhere(
    query: ProblemQueryDto,
    override: {
      status?: ContentStatus;
      visibility?: Visibility;
    }
  ): Prisma.ProblemWhereInput {
    return {
      deletedAt: null,
      status: override.status,
      visibility: override.visibility,
      difficulty: query.difficulty,
      OR: query.search
        ? [
            { title: { contains: query.search, mode: "insensitive" } },
            { slug: { contains: query.search, mode: "insensitive" } },
            {
              tags: {
                some: {
                  tag: {
                    name: { contains: query.search, mode: "insensitive" }
                  }
                }
              }
            }
          ]
        : undefined,
      tags: query.tag
        ? { some: { tag: { slug: normalizeSlug(query.tag) } } }
        : undefined
    };
  }

  private async assertExists(id: string) {
    const problem = await this.prisma.problem.findFirst({
      where: { id, deletedAt: null },
      select: { id: true }
    });
    if (!problem) throw new NotFoundException("Problem not found");
  }

  private async bumpVersion(id: string) {
    await this.prisma.problem.update({
      where: { id },
      data: {
        version: { increment: 1 },
        status: ContentStatus.DRAFT,
        reviewedById: null
      }
    });
  }

  private audit(
    actorId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: Prisma.InputJsonValue
  ) {
    return this.prisma.auditLog.create({
      data: { actorId, action, entityType, entityId, metadata }
    });
  }

  private paginate<T>(items: T[], total: number, page: number, limit: number) {
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  private readonly problemListSelect = {
    id: true,
    slug: true,
    title: true,
    shortDescription: true,
    difficulty: true,
    points: true,
    acceptanceRate: true,
    totalSubmissions: true,
    acceptedSubmissions: true,
    status: true,
    visibility: true,
    updatedAt: true,
    tags: { include: { tag: true } }
  } as const;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
