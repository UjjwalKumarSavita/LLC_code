import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  ComparisonMode,
  ContentStatus,
  Difficulty,
  Role,
  TestCaseType,
  TestCaseVisibility,
  Visibility
} from "../src/generated/prisma/enums";
import {
  additionalJudgeProblems,
  type JudgeProblemSeed
} from "./judge-problems";
import { judgeLanguageTemplates } from "./judge-language-templates";
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
import { seedCoreEditorials } from "./editorial-seeds";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

const languages = [
  {
    name: "C",
    slug: "c",
    version: "C17",
    fileExtension: ".c"
  },
  {
    name: "C++",
    slug: "cpp",
    version: "C++20",
    fileExtension: ".cpp"
  },
  {
    name: "Java",
    slug: "java",
    version: "21",
    fileExtension: ".java"
  },
  {
    name: "Python",
    slug: "python",
    version: "3.12",
    fileExtension: ".py"
  },
  {
    name: "JavaScript",
    slug: "javascript",
    version: "Node 22",
    fileExtension: ".js"
  },
  {
    name: "TypeScript",
    slug: "typescript",
    version: "5.x",
    fileExtension: ".ts"
  },
  {
    name: "SQL",
    slug: "sql",
    version: "PostgreSQL 17",
    fileExtension: ".sql"
  }
];

async function main() {
  const languageIds = new Map<string, string>();
  for (const language of languages) {
    const saved = await prisma.language.upsert({
      where: { slug: language.slug },
      create: language,
      update: {
        name: language.name,
        version: language.version,
        fileExtension: language.fileExtension,
        isActive: true
      }
    });
    languageIds.set(saved.slug, saved.id);
  }

  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 10) {
      throw new Error("BOOTSTRAP_ADMIN_PASSWORD must contain at least 10 characters");
    }
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const username = email.split("@")[0].replace(/[^a-z0-9_]/g, "_");
    await prisma.user.upsert({
      where: { email },
      create: {
        email,
        username,
        passwordHash,
        role: Role.SUPER_ADMIN,
        isEmailVerified: true
      },
      update: {
        passwordHash,
        role: Role.SUPER_ADMIN,
        isActive: true
      }
    });
  }

  const contentUser = await prisma.user.upsert({
    where: { email: "content@llc-code.local" },
    create: {
      email: "content@llc-code.local",
      username: "llc_code_content",
      fullName: "LLC_code Content System",
      passwordHash: await argon2.hash(randomUUID(), { type: argon2.argon2id }),
      role: Role.SUPER_ADMIN,
      isEmailVerified: true,
      isActive: false
    },
    update: {
      role: Role.SUPER_ADMIN,
      isEmailVerified: true,
      isActive: false
    }
  });

  await seedTwoSum(contentUser.id, languageIds);
  for (const problem of [
    ...additionalJudgeProblems,
    ...launchJudgeProblems,
    ...catalogueBatchTwoProblems,
    ...catalogueBatchThreeProblems,
    ...catalogueBatchFourProblems
  ]) {
    await seedJudgeProblem(problem, contentUser.id, languageIds);
  }
  await seedCoreEditorials(prisma, contentUser.id);
}

async function seedJudgeProblem(
  definition: JudgeProblemSeed,
  authorId: string,
  languageIds: Map<string, string>
) {
  const problem = await prisma.problem.upsert({
    where: { slug: definition.slug },
    create: {
      slug: definition.slug,
      title: definition.title,
      shortDescription: definition.shortDescription,
      statement: definition.statement,
      inputFormat: definition.inputFormat,
      outputFormat: definition.outputFormat,
      constraints: definition.constraints,
      difficulty: definition.difficulty,
      points: definition.points,
      timeLimitMs: definition.timeLimitMs ?? 3_000,
      memoryLimitMb: 256,
      comparisonMode: definition.comparisonMode ?? ComparisonMode.TOKEN,
      visibility: Visibility.PUBLIC,
      status: ContentStatus.PUBLISHED,
      createdById: authorId,
      reviewedById: authorId,
      examples: {
        create: definition.examples.map((example, index) => ({
          ...example,
          displayOrder: index + 1
        }))
      },
      hints: {
        create: definition.hints.map((content, index) => ({
          level: index + 1,
          content
        }))
      },
      testCases: {
        create: definition.tests.map((test) => ({
          input: test.input,
          expectedOutput: test.output,
          visibility: test.visibility,
          testType: test.testType ?? TestCaseType.NORMAL
        }))
      },
      tags: {
        create: definition.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { slug: slugify(name) },
              create: { name, slug: slugify(name) }
            }
          }
        }))
      }
    },
    update: {
      title: definition.title,
      shortDescription: definition.shortDescription,
      statement: definition.statement,
      inputFormat: definition.inputFormat,
      outputFormat: definition.outputFormat,
      constraints: definition.constraints,
      difficulty: definition.difficulty,
      points: definition.points,
      timeLimitMs: definition.timeLimitMs ?? 3_000,
      memoryLimitMb: 256,
      comparisonMode: definition.comparisonMode ?? ComparisonMode.TOKEN,
      status: ContentStatus.PUBLISHED,
      visibility: Visibility.PUBLIC,
      reviewedById: authorId,
      deletedAt: null
    }
  });

  const pythonId = languageIds.get("python");
  if (!pythonId) throw new Error("Python language seed is missing");
  await prisma.codeTemplate.upsert({
    where: {
      problemId_languageId: {
        problemId: problem.id,
        languageId: pythonId
      }
    },
    create: {
      problemId: problem.id,
      languageId: pythonId,
      starterCode: definition.python,
      functionSignature: "stdin -> stdout"
    },
    update: {
      starterCode: definition.python,
      functionSignature: "stdin -> stdout"
    }
  });

  const extraTemplates =
    judgeLanguageTemplates[definition.slug] ??
    launchLanguageTemplates[definition.slug] ??
    catalogueBatchTwoTemplates[definition.slug] ??
    catalogueBatchThreeTemplates[definition.slug] ??
    catalogueBatchFourTemplates[definition.slug];
  if (!extraTemplates) {
    throw new Error(`Missing extra language templates for ${definition.slug}`);
  }
  for (const [slug, starterCode] of Object.entries(extraTemplates)) {
    const languageId = languageIds.get(slug);
    if (!languageId) throw new Error(`${slug} language seed is missing`);
    await prisma.codeTemplate.upsert({
      where: {
        problemId_languageId: {
          problemId: problem.id,
          languageId
        }
      },
      create: {
        problemId: problem.id,
        languageId,
        starterCode,
        functionSignature: "stdin -> stdout"
      },
      update: {
        starterCode,
        functionSignature: "stdin -> stdout"
      }
    });
  }

  if ((await prisma.testCase.count({ where: { problemId: problem.id } })) === 0) {
    await prisma.testCase.createMany({
      data: definition.tests.map((test) => ({
        problemId: problem.id,
        input: test.input,
        expectedOutput: test.output,
        visibility: test.visibility,
        testType: test.testType ?? TestCaseType.NORMAL
      }))
    });
  }
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function seedTwoSum(
  authorId: string,
  languageIds: Map<string, string>
) {
  const problem = await prisma.problem.upsert({
    where: { slug: "two-sum" },
    create: {
      slug: "two-sum",
      title: "Two Sum",
      shortDescription: "Find two indices whose values add to the target.",
      statement:
        "Given a target integer and a list of integers, print the zero-based indices of the two distinct values whose sum equals the target. Exactly one valid answer exists.",
      inputFormat:
        "The first line contains target. The second line contains the space-separated array values.",
      outputFormat: "Print the two zero-based indices separated by one space.",
      constraints:
        "2 <= n <= 100000\n-1000000000 <= nums[i], target <= 1000000000",
      difficulty: Difficulty.EASY,
      points: 20,
      timeLimitMs: 3_000,
      memoryLimitMb: 256,
      comparisonMode: ComparisonMode.TOKEN,
      visibility: Visibility.PUBLIC,
      status: ContentStatus.PUBLISHED,
      createdById: authorId,
      reviewedById: authorId,
      examples: {
        create: [
          {
            input: "9\n2 7 11 15",
            output: "0 1",
            explanation: "nums[0] + nums[1] = 2 + 7 = 9.",
            displayOrder: 1
          },
          {
            input: "6\n3 2 4",
            output: "1 2",
            displayOrder: 2
          }
        ]
      },
      testCases: {
        create: [
          {
            input: "9\n2 7 11 15\n",
            expectedOutput: "0 1",
            visibility: TestCaseVisibility.SAMPLE,
            testType: TestCaseType.NORMAL,
            explanation: "Basic complement lookup"
          },
          {
            input: "6\n3 2 4\n",
            expectedOutput: "1 2",
            visibility: TestCaseVisibility.PUBLIC,
            testType: TestCaseType.NORMAL
          },
          {
            input: "6\n3 3\n",
            expectedOutput: "0 1",
            visibility: TestCaseVisibility.HIDDEN,
            testType: TestCaseType.EDGE
          },
          {
            input: "10\n-3 4 13 7\n",
            expectedOutput: "0 2",
            visibility: TestCaseVisibility.HIDDEN,
            testType: TestCaseType.EDGE
          }
        ]
      }
    },
    update: {
      title: "Two Sum",
      status: ContentStatus.PUBLISHED,
      visibility: Visibility.PUBLIC,
      reviewedById: authorId,
      deletedAt: null,
      comparisonMode: ComparisonMode.TOKEN,
      timeLimitMs: 3_000
    }
  });

  const templates: Record<string, { starterCode: string; signature: string }> = {
    python: {
      signature: "stdin -> stdout",
      starterCode: `import sys

values = list(map(int, sys.stdin.read().split()))
target, nums = values[0], values[1:]
seen = {}

for index, value in enumerate(nums):
    complement = target - value
    if complement in seen:
        print(seen[complement], index)
        break
    seen[value] = index`
    },
    javascript: {
      signature: "stdin -> stdout",
      starterCode: `const fs = require("fs");

const values = fs.readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);
const [target, ...nums] = values;
const seen = new Map();

for (let index = 0; index < nums.length; index++) {
  const complement = target - nums[index];
  if (seen.has(complement)) {
    console.log(seen.get(complement), index);
    break;
  }
  seen.set(nums[index], index);
}`
    },
    java: {
      signature: "stdin -> stdout",
      starterCode: `import java.util.*;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int target = input.nextInt();
        Map<Integer, Integer> seen = new HashMap<>();
        int index = 0;
        while (input.hasNextInt()) {
            int value = input.nextInt();
            int complement = target - value;
            if (seen.containsKey(complement)) {
                System.out.println(seen.get(complement) + " " + index);
                return;
            }
            seen.put(value, index++);
        }
    }
}`
    },
    cpp: {
      signature: "stdin -> stdout",
      starterCode: `#include <iostream>
#include <unordered_map>
using namespace std;

int main() {
    int target, value, index = 0;
    cin >> target;
    unordered_map<int, int> seen;
    while (cin >> value) {
        int complement = target - value;
        if (seen.count(complement)) {
            cout << seen[complement] << ' ' << index << '\\n';
            return 0;
        }
        seen[value] = index++;
    }
    return 0;
}`
    }
  };

  for (const [slug, template] of Object.entries(templates)) {
    const languageId = languageIds.get(slug);
    if (!languageId) continue;
    await prisma.codeTemplate.upsert({
      where: {
        problemId_languageId: {
          problemId: problem.id,
          languageId
        }
      },
      create: {
        problemId: problem.id,
        languageId,
        starterCode: template.starterCode,
        functionSignature: template.signature
      },
      update: {
        starterCode: template.starterCode,
        functionSignature: template.signature
      }
    });
  }

  for (const name of ["Array", "Hash Map"]) {
    const tag = await prisma.tag.upsert({
      where: { slug: slugify(name) },
      create: { name, slug: slugify(name) },
      update: { name }
    });
    await prisma.problemTag.upsert({
      where: {
        problemId_tagId: {
          problemId: problem.id,
          tagId: tag.id
        }
      },
      create: { problemId: problem.id, tagId: tag.id },
      update: {}
    });
  }

  if ((await prisma.hint.count({ where: { problemId: problem.id } })) === 0) {
    await prisma.hint.createMany({
      data: [
        {
          problemId: problem.id,
          level: 1,
          content: "For each value, compute the complement still needed."
        },
        {
          problemId: problem.id,
          level: 2,
          content: "Store previously seen values and their indices in a hash map."
        }
      ]
    });
  }

  if ((await prisma.testCase.count({ where: { problemId: problem.id } })) === 0) {
    await prisma.testCase.createMany({
      data: [
        {
          problemId: problem.id,
          input: "9\n2 7 11 15\n",
          expectedOutput: "0 1",
          visibility: TestCaseVisibility.SAMPLE
        },
        {
          problemId: problem.id,
          input: "6\n3 3\n",
          expectedOutput: "0 1",
          visibility: TestCaseVisibility.HIDDEN,
          testType: TestCaseType.EDGE
        }
      ]
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
