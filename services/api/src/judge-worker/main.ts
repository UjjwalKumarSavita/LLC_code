import "dotenv/config";
import "reflect-metadata";
import { PrismaPg } from "@prisma/adapter-pg";
import { Worker } from "bullmq";
import { PrismaClient } from "../generated/prisma/client";
import {
  JUDGE_JOB_NAME,
  JUDGE_QUEUE_NAME,
  type JudgeJobData
} from "../judge/judge.contract";
import { redisConnectionFromUrl } from "../judge/redis-connection";
import {
  SandboxGateway,
  type SandboxProvider
} from "./sandbox-gateway";
import { SubmissionProcessor } from "./submission-processor";

async function bootstrap() {
  const databaseUrl = required("DATABASE_URL");
  const redisUrl = required("REDIS_URL");
  const engineUrl = required("JUDGE_ENGINE_URL");
  const engineProvider = sandboxProvider();
  const engineSecret =
    engineProvider === "contract" ? required("JUDGE_ENGINE_SECRET") : "";
  const concurrency = positiveInteger("JUDGE_WORKER_CONCURRENCY", 2);
  const maxOutputKb = positiveInteger("JUDGE_MAX_OUTPUT_KB", 256);

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
    log: ["warn", "error"]
  });
  await prisma.$connect();

  const processor = new SubmissionProcessor(
    prisma,
    new SandboxGateway(engineUrl, engineSecret, engineProvider),
    maxOutputKb
  );
  const worker = new Worker<JudgeJobData>(
    JUDGE_QUEUE_NAME,
    async (job) => {
      if (job.name !== JUDGE_JOB_NAME) {
        throw new Error("Unsupported judge job");
      }
      try {
        return await processor.process(job);
      } catch (error) {
        const attempts = job.opts.attempts ?? 1;
        if (job.attemptsMade + 1 >= attempts) {
          await processor.failPermanently(job.data.submissionId);
        }
        throw error;
      }
    },
    {
      connection: redisConnectionFromUrl(redisUrl, "worker"),
      concurrency,
      lockDuration: 300_000
    }
  );

  worker.on("completed", (job) => {
    console.info(
      JSON.stringify({
        event: "judge.completed",
        jobId: job.id,
        submissionId: job.data.submissionId
      })
    );
  });
  worker.on("failed", (job) => {
    console.error(
      JSON.stringify({
        event: "judge.failed",
        jobId: job?.id,
        submissionId: job?.data.submissionId,
        attempt: job?.attemptsMade
      })
    );
  });
  worker.on("error", () => {
    console.error(JSON.stringify({ event: "judge.worker_error" }));
  });

  const shutdown = async () => {
    await worker.close();
    await prisma.$disconnect();
  };
  process.once("SIGINT", () => void shutdown().finally(() => process.exit(0)));
  process.once("SIGTERM", () => void shutdown().finally(() => process.exit(0)));
  console.info(
    JSON.stringify({
      event: "judge.ready",
      queue: JUDGE_QUEUE_NAME,
      provider: engineProvider,
      concurrency
    })
  );
}

function sandboxProvider(): SandboxProvider {
  const value = process.env.JUDGE_ENGINE_PROVIDER?.trim() ?? "contract";
  if (value !== "contract" && value !== "piston") {
    throw new Error("JUDGE_ENGINE_PROVIDER must be contract or piston");
  }
  return value;
}

function required(key: string) {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function positiveInteger(key: string, fallback: number) {
  const value = Number(process.env[key] ?? fallback);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${key} must be a positive integer`);
  }
  return value;
}

void bootstrap();
