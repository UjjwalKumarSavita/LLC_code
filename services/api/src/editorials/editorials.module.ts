import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { RolesGuard } from "../common/guards/roles.guard";
import { EditorialsController } from "./editorials.controller";
import { EditorialsService } from "./editorials.service";

@Module({
  imports: [AuthModule],
  controllers: [EditorialsController],
  providers: [EditorialsService, RolesGuard]
})
export class EditorialsModule {}
