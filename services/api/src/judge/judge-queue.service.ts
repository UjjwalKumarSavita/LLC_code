import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue } from "bullmq";
import type { SubmissionKind } from "../generated/prisma/enums";
import {
  JUDGE_CONTRACT_VERSION,
  JUDGE_JOB_NAME,
  JUDGE_QUEUE_NAME,
  type JudgeJobData
} from "./judge.contract";
import { redisConnectionFromUrl } from "./redis-connection";

@Injectable()
export class JudgeQueueService implements OnModuleDestroy {
  private readonly queue: Queue<JudgeJobData>;

  constructor(config: ConfigService) {
    this.queue = new Queue<JudgeJobData>(JUDGE_QUEUE_NAME, {
      connection: redisConnectionFromUrl(
        config.getOrThrow<string>("REDIS_URL"),
        "producer"
      ),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1_000 },
        removeOnComplete: { age: 3_600, count: 1_000 },
        removeOnFail: { age: 86_400, count: 5_000 }
      }
    });
  }

  async enqueue(submissionId: string, kind: SubmissionKind) {
    return this.queue.add(
      JUDGE_JOB_NAME,
      {
        contractVersion: JUDGE_CONTRACT_VERSION,
        submissionId,
        kind
      },
      {
        jobId: submissionId
      }
    );
  }

  async onModuleDestroy() {
    await this.queue.close();
  }
}
