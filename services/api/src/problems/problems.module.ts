import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { RolesGuard } from "../common/guards/roles.guard";
import { ProblemsController } from "./problems.controller";
import { ProblemsService } from "./problems.service";

@Module({
  imports: [AuthModule],
  controllers: [ProblemsController],
  providers: [ProblemsService, RolesGuard]
})
export class ProblemsModule {}
