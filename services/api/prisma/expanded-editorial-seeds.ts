import type { EditorialSeed } from "./editorial-seeds";

export const expandedEditorials: EditorialSeed[] = [
  {
    slug: "level-order-traversal",
    intuition: "Breadth-first search visits a tree one depth at a time, so each queue layer becomes one output row.",
    bruteForce: "Compute each node depth separately and then group nodes with equal depths.",
    optimizedApproach: ["Put the root in a queue.", "Save the current queue size as the level width.", "Remove exactly that many nodes and enqueue their children.", "Append the level and repeat."],
    dryRun: "For [3,9,20,null,null,15,7], the queue produces [3], then [9,20], then [15,7].",
    complexity: "O(n) time / O(n) space",
    commonMistakes: "Letting newly enqueued children join the current level mixes two depths."
  },
  {
    slug: "longest-substring",
    intuition: "A window grows while its characters are unique; a repeat moves the left boundary past the earlier copy.",
    bruteForce: "Start at every index and extend until the first duplicate.",
    optimizedApproach: ["Track each character's latest index.", "Move left past a repeated character inside the window.", "Record the current index.", "Update the maximum window length."],
    dryRun: "For abcabcbb, the first abc window has length 3; later repeats shift left but never produce length 4.",
    complexity: "O(n) time / O(k) space",
    commonMistakes: "Never move the left boundary backward for a repeat outside the current window."
  },
  {
    slug: "merge-intervals",
    intuition: "After sorting by start, a new interval can overlap only the most recently merged interval.",
    bruteForce: "Compare every pair and merge overlaps repeatedly until nothing changes.",
    optimizedApproach: ["Sort intervals by start.", "Seed the result with the first interval.", "Extend the last result when the next interval overlaps.", "Otherwise append a new interval."],
    dryRun: "[1,3] and [2,6] combine into [1,6], while [8,10] begins a separate group.",
    complexity: "O(n log n) time / O(n) output space",
    commonMistakes: "Merging before sorting can miss ranges connected through an intermediate interval."
  },
  {
    slug: "trapping-rain-water",
    intuition: "Water above a position is limited by the shorter of the tallest walls on its left and right.",
    bruteForce: "For every position, scan both directions to find its two boundaries.",
    optimizedApproach: ["Place pointers at both ends.", "Track the highest wall seen from each side.", "Advance the side with the lower boundary.", "Add boundary minus current height."],
    dryRun: "For [4,2,0,3,2,5], the left boundary contributes 2, 4, 1, and 2 units at the inner positions.",
    complexity: "O(n) time / O(1) space",
    commonMistakes: "Using the taller boundary instead of the shorter one overcounts water."
  },
  {
    slug: "median-two-sorted-arrays",
    intuition: "A valid partition leaves half the values on each side and every left value no greater than every right value.",
    bruteForce: "Merge both arrays and read the middle value or values.",
    optimizedApproach: ["Binary-search a partition in the shorter array.", "Derive the other partition.", "Move according to crossed partition boundaries.", "Calculate the median from neighboring values."],
    dryRun: "For [1,3] and [2], a partition around 2 leaves balanced halves, so the median is 2.",
    complexity: "O(log(min(m,n))) time / O(1) space",
    commonMistakes: "Use sentinel boundaries when a partition sits at an array edge."
  },
  {
    slug: "reverse-string",
    intuition: "Characters at mirrored positions swap while two pointers move toward the center.",
    bruteForce: "Build another string by reading the source from right to left.",
    optimizedApproach: ["Point to both ends.", "Swap the two characters.", "Move both pointers inward.", "Stop when they meet."],
    dryRun: "algorithm swaps a with m, then l with h, continuing inward to produce mhtirogla.",
    complexity: "O(n) time / O(1) extra space for mutable input",
    commonMistakes: "Scanning the entire string swaps every pair twice."
  },
  {
    slug: "palindrome-string",
    intuition: "A palindrome has matching characters at every pair of mirrored positions.",
    bruteForce: "Reverse the word and compare it with the original.",
    optimizedApproach: ["Point to the first and last characters.", "Reject a mismatch.", "Move inward after a match.", "Accept when the pointers meet."],
    dryRun: "level matches l with l and e with e before reaching the center v.",
    complexity: "O(n) time / O(1) space",
    commonMistakes: "Do not skip the final pair in an even-length word."
  },
  {
    slug: "fizz-buzz",
    intuition: "Each token depends only on divisibility by 3 and 5, with their shared case handled first.",
    bruteForce: "Build lists of multiples and search them for every value.",
    optimizedApproach: ["Iterate from 1 through n.", "Emit FizzBuzz for multiples of 15.", "Otherwise handle 3 and 5.", "Emit the number when no rule matches."],
    dryRun: "At 15 both divisibility rules apply, so emit FizzBuzz.",
    complexity: "O(n) time / O(n) output space",
    commonMistakes: "Checking 3 before 15 emits Fizz for common multiples."
  },
  {
    slug: "contains-duplicate",
    intuition: "A set records distinct values; finding an existing value proves a duplicate.",
    bruteForce: "Compare every pair of positions.",
    optimizedApproach: ["Create an empty set.", "Scan values left to right.", "Return true when a value is present.", "Otherwise insert it and finish with false."],
    dryRun: "For [1,2,3,1], the final 1 already exists in the set.",
    complexity: "O(n) expected time / O(n) space",
    commonMistakes: "Comparing only neighbors works only after sorting."
  },
  {
    slug: "missing-number",
    intuition: "Expected range sum minus actual array sum equals the missing value.",
    bruteForce: "Search the array for each number from zero through n.",
    optimizedApproach: ["Let n equal the array length.", "Calculate n(n+1)/2.", "Subtract every array value.", "Return the difference."],
    dryRun: "For [3,0,1], expected sum 6 minus actual sum 4 leaves 2.",
    complexity: "O(n) time / O(1) space",
    commonMistakes: "The source range includes n even though the array length is n."
  },
  {
    slug: "best-time-stock",
    intuition: "A sale today is best paired with the cheapest price seen before today.",
    bruteForce: "Evaluate every earlier buy and later sell pair.",
    optimizedApproach: ["Keep the minimum price so far.", "Calculate today's profit against it.", "Update the best profit.", "Update the minimum for future days."],
    dryRun: "For [7,1,5,3,6,4], buying at 1 and selling at 6 yields the best profit 5.",
    complexity: "O(n) time / O(1) space",
    commonMistakes: "Preserve buy-before-sell ordering when updating state."
  },
  {
    slug: "single-number",
    intuition: "XOR cancels equal pairs because x XOR x is zero, leaving the unpaired value.",
    bruteForce: "Count frequencies and return the value occurring once.",
    optimizedApproach: ["Start at zero.", "XOR every array value.", "Let equal pairs cancel.", "Return the accumulator."],
    dryRun: "For [4,1,2,1,2], both pairs cancel and leave 4.",
    complexity: "O(n) time / O(1) space",
    commonMistakes: "Addition cannot cancel pairs and may overflow."
  },
  {
    slug: "valid-anagram",
    intuition: "Anagrams contain the same count of every character.",
    bruteForce: "Generate permutations of one word and compare them with the other.",
    optimizedApproach: ["Reject unequal lengths.", "Count characters in the first word.", "Subtract while scanning the second.", "Accept when every count is zero."],
    dryRun: "anagram and nagaram contain identical counts for a, n, g, r, and m.",
    complexity: "O(n) time / O(k) space",
    commonMistakes: "Character presence alone ignores repeated-character counts."
  },
  {
    slug: "climbing-stairs",
    intuition: "Every route to step n arrives from step n-1 or step n-2.",
    bruteForce: "Recursively branch into one-step and two-step moves.",
    optimizedApproach: ["Initialize the two base counts.", "Add the previous two counts.", "Shift both saved values.", "Return the count for n."],
    dryRun: "Counts for steps 1 through 5 are 1, 2, 3, 5, and 8.",
    complexity: "O(n) time / O(1) space",
    commonMistakes: "Incorrect base cases make every later count wrong."
  },
  {
    slug: "product-except-self",
    intuition: "Each answer is the product left of its index times the product right of its index.",
    bruteForce: "At every index, multiply all other values.",
    optimizedApproach: ["Store running left products.", "Start a right product at one.", "Scan right to left.", "Multiply by the right product and then extend it."],
    dryRun: "For [1,2,3,4], prefix and suffix products combine into [24,12,8,6].",
    complexity: "O(n) time / O(1) extra space excluding output",
    commonMistakes: "Division fails with zeros and violates the intended constraint."
  }
];
