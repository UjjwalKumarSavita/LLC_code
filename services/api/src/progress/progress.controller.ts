import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthenticatedUser } from "../common/auth.types";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { ProgressService } from "./progress.service";

@Controller("progress")
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get()
  summary(@CurrentUser() user: AuthenticatedUser) {
    return this.progress.summary(user.id);
  }
}
