import type { PrismaClient } from "../src/generated/prisma/client";
import { ContentStatus } from "../src/generated/prisma/enums";

export type EditorialSeed = {
  slug: string;
  intuition: string;
  bruteForce: string;
  optimizedApproach: string[];
  dryRun: string;
  complexity: string;
  commonMistakes: string;
};
import { expandedEditorials } from "./expanded-editorial-seeds";

export const coreEditorials: EditorialSeed[] = [
  {
    slug: "two-sum",
    intuition: "Every value needs one exact complement. Remembering values already visited turns that question into a constant-time lookup.",
    bruteForce: "Try every pair of indices and return the pair whose values add to the target.",
    optimizedApproach: ["Create an empty value-to-index map.", "For each value, compute target minus value.", "Return the remembered complement index when it exists.", "Otherwise store the current value and index."],
    dryRun: "For target 9 and [2, 7, 11, 15], store 2 at index 0. At index 1, value 7 needs 2, which is already stored, so return 0 1.",
    complexity: "O(n) time · O(n) space",
    commonMistakes: "Storing the current value before checking can accidentally reuse the same index."
  },
  {
    slug: "valid-parentheses",
    intuition: "Nested brackets must close in reverse opening order, which is exactly the behavior of a stack.",
    bruteForce: "Repeatedly remove adjacent valid pairs until the text stops changing.",
    optimizedApproach: ["Push every opening bracket.", "For a closing bracket, require the matching opener at the stack top.", "Pop a successful match.", "Accept only when the stack is empty after the scan."],
    dryRun: "For ([{}]), the three openers are pushed. Each closer matches and removes the latest opener, leaving an empty stack.",
    complexity: "O(n) time · O(n) space",
    commonMistakes: "Checking whether an opener exists anywhere in the stack ignores nesting order."
  },
  {
    slug: "binary-search",
    intuition: "Sorted order lets one comparison eliminate half of the remaining candidates.",
    bruteForce: "Scan every value from left to right until the target appears.",
    optimizedApproach: ["Set left and right to the full array bounds.", "Compare the middle value with the target.", "Move left above middle when the target is larger; otherwise move right below middle.", "Return the matching index or -1."],
    dryRun: "Searching 9 in [-1,0,3,5,9,12] first compares 3, then narrows right and compares 9 at index 4.",
    complexity: "O(log n) time · O(1) space",
    commonMistakes: "Using inconsistent inclusive and exclusive bounds can skip the final candidate."
  },
  {
    slug: "maximum-subarray",
    intuition: "A negative running prefix can only hurt every future segment, so discard it and restart.",
    bruteForce: "Enumerate every start and end index and calculate each contiguous sum.",
    optimizedApproach: ["Track the best sum ending at the current position.", "Either extend the previous segment or restart at the current value.", "Update the best sum seen anywhere.", "Return the global best."],
    dryRun: "In [-2,1,-3,4,-1,2,1,-5,4], the running segment restarts at 4 and grows to 6 with [4,-1,2,1].",
    complexity: "O(n) time · O(1) space",
    commonMistakes: "Initializing the best sum to zero gives the wrong answer for an all-negative array."
  },
  {
    slug: "number-of-islands",
    intuition: "Each unvisited land cell begins one connected component; flood filling marks that entire island before scanning onward.",
    bruteForce: "For every land cell, repeatedly compare it with every other cell to rebuild connectivity.",
    optimizedApproach: ["Scan the grid cell by cell.", "When unvisited land is found, increment the island count.", "Flood fill its horizontal and vertical land neighbors.", "Continue until every cell has been considered."],
    dryRun: "The sample grid reveals an upper-left component, a right-side component, and one isolated lower cell, for three islands.",
    complexity: "O(rows × columns) time · O(rows × columns) worst-case space",
    commonMistakes: "Including diagonal neighbors changes the definition of connected land."
  },
  {
    slug: "running-sum",
    intuition: "Each prefix answer is the previous prefix plus the current value.",
    bruteForce: "For every index, sum the array again from index zero through that position.",
    optimizedApproach: ["Start a running total at zero.", "Add each value to the total.", "Write or emit the total for the current position.", "Continue through the array once."],
    dryRun: "For [1,2,3,4], the accumulated totals are 1, 3, 6, and 10.",
    complexity: "O(n) time · O(1) extra space when updating in place",
    commonMistakes: "Resetting the accumulator inside the loop loses the previous prefix."
  },
  {
    slug: "majority-element",
    intuition: "Pairing the majority value against different values cannot cancel all of its occurrences.",
    bruteForce: "Count every value with a frequency map and return the one above half the array length.",
    optimizedApproach: ["Keep a candidate and balance counter.", "Choose the current value whenever balance is zero.", "Increase balance for the candidate and decrease it for another value.", "Return the final candidate because a majority is guaranteed."],
    dryRun: "For [2,2,1,1,1,2,2], cancellations remove opposing pairs and leave 2 as the candidate.",
    complexity: "O(n) time · O(1) space",
    commonMistakes: "Boyer–Moore returns a candidate; without the guarantee, a second pass must verify its frequency."
  },
  {
    slug: "move-zeroes",
    intuition: "Stable compaction writes non-zero values first; every remaining slot must then be zero.",
    bruteForce: "Remove each zero and append it to the end, repeatedly shifting later elements.",
    optimizedApproach: ["Maintain the next write position.", "Scan values from left to right.", "Write each non-zero value and advance the write position.", "Fill all remaining positions with zero."],
    dryRun: "For [0,1,0,3,12], compaction writes [1,3,12] and the two remaining positions become zero.",
    complexity: "O(n) time · O(1) extra space",
    commonMistakes: "Swapping without care can change the relative order of non-zero values."
  },
  {
    slug: "house-robber",
    intuition: "At each house, the best result either skips it or combines its value with the best result two houses back.",
    bruteForce: "Recursively explore taking or skipping every house.",
    optimizedApproach: ["Track the best totals for the previous two positions.", "For each value, compare skipping it with taking it after the two-back total.", "Shift the two saved states forward.", "Return the final best total."],
    dryRun: "For [2,7,9,3,1], the best totals progress 2, 7, 11, 11, 12.",
    complexity: "O(n) time · O(1) space",
    commonMistakes: "Adding the current house to the previous state selects adjacent houses."
  },
  {
    slug: "search-insert-position",
    intuition: "The answer is the first index whose value is greater than or equal to the target.",
    bruteForce: "Scan from the beginning until reaching a value that is not smaller than the target.",
    optimizedApproach: ["Use a half-open search interval [left, right).", "Compare the middle value with the target.", "Discard the left side when middle is smaller.", "Otherwise keep middle in the right-side candidate interval.", "Return left when the interval closes."],
    dryRun: "For target 2 in [1,3,5,6], index 0 is too small and index 1 is the first valid insertion point.",
    complexity: "O(log n) time · O(1) space",
    commonMistakes: "Discarding middle when it equals the target can return a later position."
  }
];

export async function seedCoreEditorials(
  prisma: PrismaClient,
  authorId: string
) {
  for (const editorial of [...coreEditorials, ...expandedEditorials]) {
    const problem = await prisma.problem.findUnique({
      where: { slug: editorial.slug },
      select: { id: true }
    });
    if (!problem) throw new Error(`Editorial problem missing: ${editorial.slug}`);
    const data = {
      intuition: editorial.intuition,
      bruteForce: editorial.bruteForce,
      optimizedApproach: editorial.optimizedApproach.join("\n"),
      dryRun: editorial.dryRun,
      complexity: editorial.complexity,
      commonMistakes: editorial.commonMistakes,
      authorId,
      status: ContentStatus.PUBLISHED
    };
    await prisma.editorial.upsert({
      where: { problemId: problem.id },
      create: { problemId: problem.id, ...data },
      update: data
    });
  }
}
