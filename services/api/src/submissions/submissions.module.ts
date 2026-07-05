import { Module } from "@nestjs/common";
import { JudgeQueueService } from "../judge/judge-queue.service";
import { SubmissionsController } from "./submissions.controller";
import { SubmissionsService } from "./submissions.service";

@Module({
  controllers: [SubmissionsController],
  providers: [SubmissionsService, JudgeQueueService]
})
export class SubmissionsModule {}
