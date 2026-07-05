import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { AuthenticatedUser } from "../common/auth.types";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SubmissionKind } from "../generated/prisma/enums";
import { CreateSubmissionDto } from "./dto/create-submission.dto";
import { SubmissionQueryDto } from "./dto/submission-query.dto";
import { SubmissionsService } from "./submissions.service";

@Controller("submissions")
@UseGuards(JwtAuthGuard)
export class SubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Post("run")
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  run(
    @Body() dto: CreateSubmissionDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.submissions.create(dto, user.id, SubmissionKind.RUN);
  }

  @Post("submit")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  submit(
    @Body() dto: CreateSubmissionDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.submissions.create(dto, user.id, SubmissionKind.SUBMIT);
  }

  @Get()
  list(
    @Query() query: SubmissionQueryDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.submissions.list(user.id, query);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.submissions.findOne(id, user.id);
  }
}
