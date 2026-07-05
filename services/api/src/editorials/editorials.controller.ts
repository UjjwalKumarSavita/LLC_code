import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthenticatedUser } from "../common/auth.types";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { Role } from "../generated/prisma/enums";
import { SaveEditorialDto } from "./dto/save-editorial.dto";
import { EditorialsService } from "./editorials.service";

const CONTENT_ROLES = [
  Role.CONTENT_WRITER,
  Role.REVIEWER,
  Role.ADMIN,
  Role.SUPER_ADMIN
];

@Controller("editorials")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...CONTENT_ROLES)
export class EditorialsController {
  constructor(private readonly editorials: EditorialsService) {}

  @Get()
  list(@Query("search") search?: string) {
    return this.editorials.list(search?.trim());
  }

  @Get(":problemId")
  find(@Param("problemId") problemId: string) {
    return this.editorials.find(problemId);
  }

  @Put(":problemId")
  save(
    @Param("problemId") problemId: string,
    @Body() dto: SaveEditorialDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.editorials.save(problemId, dto, user.id);
  }

  @Post(":problemId/review")
  review(
    @Param("problemId") problemId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.editorials.submitForReview(problemId, user.id);
  }

  @Post(":problemId/publish")
  @Roles(Role.REVIEWER, Role.ADMIN, Role.SUPER_ADMIN)
  publish(
    @Param("problemId") problemId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.editorials.publish(problemId, user.id);
  }

  @Delete(":problemId")
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  archive(
    @Param("problemId") problemId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.editorials.archive(problemId, user.id);
  }
}
