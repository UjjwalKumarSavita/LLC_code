import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import type { AuthenticatedUser } from "../common/auth.types";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Role } from "../generated/prisma/enums";
import { CreateProblemDto } from "./dto/create-problem.dto";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { CreateTestCaseDto } from "./dto/create-test-case.dto";
import {
  CmsProblemQueryDto,
  ProblemQueryDto
} from "./dto/problem-query.dto";
import { UpdateProblemDto } from "./dto/update-problem.dto";
import { ProblemsService } from "./problems.service";

const CONTENT_ROLES = [
  Role.CONTENT_WRITER,
  Role.REVIEWER,
  Role.ADMIN,
  Role.SUPER_ADMIN
];

@Controller("problems")
export class ProblemsController {
  constructor(private readonly problems: ProblemsService) {}

  @Get()
  list(@Query() query: ProblemQueryDto) {
    return this.problems.listPublic(query);
  }

  @Get("cms/list")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  listCms(@Query() query: CmsProblemQueryDto) {
    return this.problems.listCms(query);
  }

  @Get("cms/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  findCms(@Param("id") id: string) {
    return this.problems.findCmsById(id);
  }

  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.problems.findPublicBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  create(
    @Body() dto: CreateProblemDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.problems.create(dto, user.id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  update(
    @Param("id") id: string,
    @Body() dto: UpdateProblemDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.problems.update(id, dto, user.id);
  }

  @Post(":id/review")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  review(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.problems.submitForReview(id, user.id);
  }

  @Post(":id/publish")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.REVIEWER, Role.ADMIN, Role.SUPER_ADMIN)
  publish(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.problems.publish(id, user.id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  archive(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.problems.archive(id, user.id);
  }

  @Post(":id/test-cases")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  addTestCase(
    @Param("id") id: string,
    @Body() dto: CreateTestCaseDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.problems.addTestCase(id, dto, user.id);
  }

  @Delete(":problemId/test-cases/:testCaseId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  removeTestCase(
    @Param("problemId") problemId: string,
    @Param("testCaseId") testCaseId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.problems.removeTestCase(problemId, testCaseId, user.id);
  }

  @Post(":id/templates")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  upsertTemplate(
    @Param("id") id: string,
    @Body() dto: CreateTemplateDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.problems.upsertTemplate(id, dto, user.id);
  }
}
