import "dotenv/config";
import { randomUUID } from "node:crypto";
import { JUDGE_CONTRACT_VERSION } from "../src/judge/judge.contract";
import { ComparisonMode } from "../src/generated/prisma/enums";
import { outputsMatch } from "../src/judge-worker/output-comparator";
import { SandboxGateway } from "../src/judge-worker/sandbox-gateway";
import {
  launchJudgeProblems,
  launchLanguageTemplates
} from "./launch-problems";
import {
  catalogueBatchTwoProblems,
  catalogueBatchTwoTemplates
} from "./catalogue-batch-two";
import {
  catalogueBatchThreeProblems,
  catalogueBatchThreeTemplates
} from "./catalogue-batch-three";
import {
  catalogueBatchFourProblems,
  catalogueBatchFourTemplates
} from "./catalogue-batch-four";

type VerificationTask = {
  problemSlug: string;
  languageSlug: string;
  sourceCode: string;
  input: string;
  expected: string;
  testIndex: number;
};

async function main() {
  const gateway = new SandboxGateway(
    process.env.JUDGE_ENGINE_URL ?? "http://127.0.0.1:2000",
    "",
    "piston"
  );
  const tasks: VerificationTask[] = [];
  const problems = [
    ...launchJudgeProblems,
    ...catalogueBatchTwoProblems,
    ...catalogueBatchThreeProblems,
    ...catalogueBatchFourProblems
  ];

  for (const problem of problems) {
    const templates = {
      python: problem.python,
      ...(launchLanguageTemplates[problem.slug] ??
        catalogueBatchTwoTemplates[problem.slug] ??
        catalogueBatchThreeTemplates[problem.slug] ??
        catalogueBatchFourTemplates[problem.slug])
    };
    for (const [languageSlug, sourceCode] of Object.entries(templates)) {
      problem.tests.forEach((test, testIndex) => {
        tasks.push({
          problemSlug: problem.slug,
          languageSlug,
          sourceCode,
          input: test.input,
          expected: test.output,
          testIndex
        });
      });
    }
  }

  const failures: string[] = [];
  let cursor = 0;
  let passed = 0;
  const workers = Array.from({ length: 2 }, async () => {
    while (cursor < tasks.length) {
      const task = tasks[cursor++];
      const definition = problems.find(
        (problem) => problem.slug === task.problemSlug
      );
      if (!definition) {
        throw new Error(`Missing launch definition for ${task.problemSlug}`);
      }
      const result = await gateway.execute({
        contractVersion: JUDGE_CONTRACT_VERSION,
        requestId: randomUUID(),
        language: {
          slug: task.languageSlug,
          version: null,
          judgeLanguageId: null
        },
        sourceCode: task.sourceCode,
        stdin: task.input,
        limits: {
          timeMs: definition.timeLimitMs ?? 3_000,
          memoryKb: 256 * 1024,
          outputKb: 256,
          processes: 64
        }
      });
      const matched =
        result.status === "OK" &&
        outputsMatch({
          actual: result.stdout,
          expected: task.expected,
          mode: definition.comparisonMode ?? ComparisonMode.TOKEN
        });
      if (matched) {
        passed++;
      } else {
        failures.push(
          `${task.problemSlug}/${task.languageSlug}/case-${task.testIndex + 1}: ` +
            `${result.status}; expected=${JSON.stringify(task.expected)}; ` +
            `actual=${JSON.stringify(result.stdout)}; stderr=${JSON.stringify(result.stderr ?? "")}`
        );
      }
    }
  });

  await Promise.all(workers);
  if (failures.length) {
    throw new Error(
      `Launch content verification failed (${failures.length}/${tasks.length}):\n` +
        failures.join("\n")
    );
  }
  console.log(
    `Verified ${passed}/${tasks.length} executions: ` +
      `${problems.length} problems x 4 languages x 4 tests.`
  );
}

void main();
