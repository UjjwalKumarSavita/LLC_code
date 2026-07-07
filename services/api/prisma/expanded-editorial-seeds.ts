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
  },
  {
    slug: "first-unique-character",
    intuition: "A character is unique only when its frequency is one; the answer asks for the earliest such position.",
    bruteForce: "For each character, scan the whole string to count its occurrences.",
    optimizedApproach: ["Count every character once.", "Scan the string from left to right.", "Return the first index whose count is one.", "Return -1 if no such character exists."],
    dryRun: "For leetcode, l appears once and is already at index 0, so the answer is 0.",
    complexity: "O(n) time / O(k) space",
    commonMistakes: "Using a set alone loses frequency information and cannot distinguish one occurrence from many."
  },
  {
    slug: "longest-common-prefix",
    intuition: "The shared prefix can only be as long as the shortest word and must match at every position.",
    bruteForce: "Try every possible prefix length and compare each candidate substring across all words.",
    optimizedApproach: ["Start with the first word as the candidate prefix.", "Compare the candidate with each next word.", "Shorten the candidate until the word starts with it.", "Stop early if the candidate becomes empty."],
    dryRun: "For flower, flow, and flight, the prefix shrinks from flower to flow and finally to fl.",
    complexity: "O(total characters compared) time / O(1) extra space",
    commonMistakes: "Sorting is optional; if used, compare only the first and last sorted words."
  },
  {
    slug: "merge-sorted-arrays",
    intuition: "Two sorted lists can be merged by repeatedly taking the smaller front value.",
    bruteForce: "Concatenate both arrays and sort the combined values.",
    optimizedApproach: ["Keep one pointer in each array.", "Append the smaller pointed value.", "Advance the pointer that supplied it.", "Append whichever tail remains after one array ends."],
    dryRun: "Merging [1,2,4] and [1,3,4] takes 1, 1, 2, 3, 4, 4 in order.",
    complexity: "O(n + m) time / O(n + m) output space",
    commonMistakes: "Forgetting to copy the remaining tail drops valid values after the other array is exhausted."
  },
  {
    slug: "array-intersection",
    intuition: "A value belongs to the intersection when it is present in both collections.",
    bruteForce: "Compare every value from the first array with every value from the second.",
    optimizedApproach: ["Put the first array into a set.", "Scan the second array.", "Emit a value only if it is in the set and not already emitted.", "Sort or preserve the required output convention."],
    dryRun: "For [1,2,2,1] and [2,2], the value 2 is found in both arrays and emitted once.",
    complexity: "O(n + m) expected time / O(n) space",
    commonMistakes: "If the problem asks for unique intersection, duplicate appearances must not be printed repeatedly."
  },
  {
    slug: "min-cost-climbing-stairs",
    intuition: "The cheapest way to stand on a step comes from the cheaper of the two previous reachable steps.",
    bruteForce: "Recursively try taking one or two steps from every position.",
    optimizedApproach: ["Track the minimum cost to reach the two previous steps.", "For each step, add its cost to the cheaper previous state.", "Shift the states forward.", "The top is reached from the cheaper of the last two states."],
    dryRun: "For [10,15,20], paying 15 and jumping to the top is cheaper than paying 10 then 20.",
    complexity: "O(n) time / O(1) space",
    commonMistakes: "The top is beyond the last index, so do not add an extra nonexistent cost."
  },
  {
    slug: "rotate-array",
    intuition: "Rotating by k moves each value to an index shifted by k modulo the array length.",
    bruteForce: "Move the last value to the front one step at a time, repeating k times.",
    optimizedApproach: ["Reduce k modulo n.", "Split the array into the last k values and the first n-k values.", "Concatenate those two parts.", "Print the rotated order."],
    dryRun: "Rotating [1,2,3,4,5,6,7] by 3 gives [5,6,7] followed by [1,2,3,4].",
    complexity: "O(n) time / O(n) output space",
    commonMistakes: "For large k, failing to use k modulo n performs unnecessary work and may index incorrectly."
  },
  {
    slug: "subarray-sum-k",
    intuition: "Two prefix sums differ by k exactly when the subarray between them sums to k.",
    bruteForce: "Try every start and end index and sum that range.",
    optimizedApproach: ["Maintain the running prefix sum.", "Count how many previous prefixes equal current minus k.", "Add that count to the answer.", "Record the current prefix for later ranges."],
    dryRun: "For [1,1,1] and k=2, prefixes reveal ranges [0,1] and [1,2].",
    complexity: "O(n) expected time / O(n) space",
    commonMistakes: "Initialize prefix count 0 to one so subarrays starting at index 0 are counted."
  },
  {
    slug: "power-of-two",
    intuition: "A positive power of two has exactly one set bit in binary.",
    bruteForce: "Repeatedly divide by two and reject any odd remainder before reaching one.",
    optimizedApproach: ["Reject non-positive values.", "Use n - 1 to clear the lowest set bit.", "Check whether n & (n - 1) is zero.", "Return true only for that single-set-bit case."],
    dryRun: "16 is 10000 in binary; 15 is 01111, so their AND is zero.",
    complexity: "O(1) time / O(1) space",
    commonMistakes: "Zero must be rejected because 0 & -1 is also zero in many integer models."
  },
  {
    slug: "count-set-bits",
    intuition: "The number of one bits can be counted by repeatedly removing the lowest set bit.",
    bruteForce: "Convert the number to binary text and count the character 1.",
    optimizedApproach: ["Start a counter at zero.", "While n is positive, replace n with n & (n - 1).", "Increment the counter each time.", "Return the counter."],
    dryRun: "For 13, binary 1101 loses bits as 1100, 1000, and 0, so the count is 3.",
    complexity: "O(number of set bits) time / O(1) space",
    commonMistakes: "Looping while n is not zero requires non-negative input or careful signed handling."
  },
  {
    slug: "greatest-common-divisor",
    intuition: "The greatest common divisor is unchanged when replacing the larger number by its remainder after division by the smaller.",
    bruteForce: "Test every number from min(a,b) downward until one divides both.",
    optimizedApproach: ["While b is not zero, compute a modulo b.", "Move b into a.", "Move the remainder into b.", "When b reaches zero, a is the gcd."],
    dryRun: "gcd(48,18) becomes gcd(18,12), then gcd(12,6), then gcd(6,0), so the answer is 6.",
    complexity: "O(log min(a,b)) time / O(1) space",
    commonMistakes: "Do not stop after one remainder; Euclid's algorithm repeats until the remainder is zero."
  },
  {
    slug: "fibonacci-number",
    intuition: "Each Fibonacci value depends only on the two values before it.",
    bruteForce: "Use the direct recursive definition and recompute overlapping subproblems.",
    optimizedApproach: ["Handle n equal to 0 or 1.", "Track the previous two Fibonacci values.", "Iteratively add them to get the next value.", "Shift the pair until reaching n."],
    dryRun: "Starting 0, 1 gives 1, 2, 3, 5 as the sequence advances to F(5).",
    complexity: "O(n) time / O(1) space",
    commonMistakes: "Off-by-one loop bounds often return F(n-1) instead of F(n)."
  },
  {
    slug: "sorted-squares",
    intuition: "The largest square comes from whichever end has the largest absolute value.",
    bruteForce: "Square every value and sort the results.",
    optimizedApproach: ["Place pointers at both ends.", "Fill the output from right to left.", "Compare absolute values at the two pointers.", "Write the larger square and move that pointer inward."],
    dryRun: "For [-4,-1,0,3,10], 10 produces 100, then -4 produces 16, filling the output from the back.",
    complexity: "O(n) time / O(n) output space",
    commonMistakes: "Writing from the front while choosing large squares reverses the required order."
  },
  {
    slug: "remove-sorted-duplicates",
    intuition: "In sorted order, duplicates are adjacent, so a slow write pointer can keep only new values.",
    bruteForce: "Use a set and sort the unique values again.",
    optimizedApproach: ["Handle an empty array.", "Keep a write pointer for the next unique slot.", "Scan from left to right.", "When the value differs from the previous unique value, write it and advance."],
    dryRun: "For [0,0,1,1,1,2], the unique prefix becomes [0,1,2].",
    complexity: "O(n) time / O(1) extra space",
    commonMistakes: "Compare against the last written unique value, not necessarily the immediately previous scanned value after writes."
  },
  {
    slug: "max-consecutive-ones",
    intuition: "A run grows while values are one and resets when a zero breaks it.",
    bruteForce: "For every start index, extend while the values remain one.",
    optimizedApproach: ["Track the current run length.", "Increase it for a one.", "Reset it for a zero.", "Update the best run after each one."],
    dryRun: "For [1,1,0,1,1,1], the first run reaches 2 and the final run reaches 3.",
    complexity: "O(n) time / O(1) space",
    commonMistakes: "Forgetting to update the best run at the end loses a run that reaches the final element."
  },
  {
    slug: "pivot-index",
    intuition: "At a pivot, the sum before it equals the total sum minus the left sum and current value.",
    bruteForce: "For each index, separately sum everything left and everything right.",
    optimizedApproach: ["Compute the total sum.", "Keep a running left sum.", "For each value, derive the right sum.", "Return the first index where left and right match."],
    dryRun: "For [1,7,3,6,5,6], index 3 has left sum 11 and right sum 11.",
    complexity: "O(n) time / O(1) space",
    commonMistakes: "Update the left sum after checking the current index, not before."
  },
  {
    slug: "valid-perfect-square",
    intuition: "Squares grow monotonically, so binary search can find whether any integer square equals n.",
    bruteForce: "Try every integer from 1 upward until its square reaches or passes n.",
    optimizedApproach: ["Search integers from 1 through n.", "Square the middle value.", "Return true on equality.", "Discard the lower or upper half based on the comparison."],
    dryRun: "For 16, binary search can test 8, then 4, and 4 squared equals 16.",
    complexity: "O(log n) time / O(1) space",
    commonMistakes: "Use multiplication carefully in fixed-width languages to avoid overflow."
  },
  {
    slug: "two-sum-sorted",
    intuition: "In a sorted array, a too-small pair needs a larger left value and a too-large pair needs a smaller right value.",
    bruteForce: "Try every pair until the target sum appears.",
    optimizedApproach: ["Place one pointer at the beginning and one at the end.", "Compare their sum with the target.", "Move the left pointer right when the sum is too small.", "Move the right pointer left when the sum is too large."],
    dryRun: "For target 9 and [2,7,11,15], the first pair already sums to 9.",
    complexity: "O(n) time / O(1) space",
    commonMistakes: "Moving both pointers after every comparison can skip the valid pair."
  },
  {
    slug: "plus-one",
    intuition: "Adding one propagates a carry through trailing nines.",
    bruteForce: "Convert the entire digit list to a number, add one, and convert back.",
    optimizedApproach: ["Scan from the last digit backward.", "If a digit is below 9, increment it and finish.", "Turn a 9 into 0 and continue carrying.", "If every digit was 9, prepend 1."],
    dryRun: "[1,2,9] becomes [1,3,0] because only the final 9 carries into the 2.",
    complexity: "O(n) time / O(1) extra space aside from output growth",
    commonMistakes: "Whole-number conversion can overflow and is unnecessary."
  },
  {
    slug: "happy-number",
    intuition: "Repeated digit-square sums either reach 1 or fall into a cycle.",
    bruteForce: "Keep applying the transform for a fixed large number of steps and guess the result.",
    optimizedApproach: ["Store previously seen values.", "Replace n by the sum of squared digits.", "Return true if n becomes 1.", "Return false if a value repeats."],
    dryRun: "19 becomes 82, then 68, then 100, then 1, so it is happy.",
    complexity: "O(log n) per transform with a small bounded cycle set",
    commonMistakes: "Without cycle detection, unhappy numbers can loop forever."
  },
  {
    slug: "integer-square-root",
    intuition: "The floor square root is the largest integer whose square is not greater than n.",
    bruteForce: "Increment a counter until its square would exceed n.",
    optimizedApproach: ["Binary-search the range from 0 through n.", "When mid squared is small enough, save mid and search higher.", "When it is too large, search lower.", "Return the saved answer."],
    dryRun: "For 8, 2 squared is 4 and 3 squared is 9, so the floor square root is 2.",
    complexity: "O(log n) time / O(1) space",
    commonMistakes: "Returning the lower bound blindly can be one too high after the loop ends."
  },
  {
    slug: "normalized-palindrome",
    intuition: "Only letters and digits matter, and case should not affect mirrored comparisons.",
    bruteForce: "Build a cleaned lowercase string, reverse it, and compare.",
    optimizedApproach: ["Place pointers at both ends.", "Skip non-alphanumeric characters.", "Compare lowercase characters.", "Move inward until all valid pairs match."],
    dryRun: "A man, a plan, a canal: Panama cleans to amanaplanacanalpanama, which mirrors perfectly.",
    complexity: "O(n) time / O(1) extra space",
    commonMistakes: "Comparing punctuation or case-sensitive letters rejects valid inputs."
  },
  {
    slug: "ransom-note",
    intuition: "The magazine must provide at least as many of each character as the note requires.",
    bruteForce: "For each note character, search and remove one matching magazine character.",
    optimizedApproach: ["Count magazine characters.", "Scan the ransom note.", "Consume one count for each needed character.", "Reject when any needed count is missing."],
    dryRun: "note aa with magazine aab consumes two a counts and succeeds.",
    complexity: "O(n + m) time / O(k) space",
    commonMistakes: "Checking only whether a character exists ignores repeated letters."
  },
  {
    slug: "isomorphic-strings",
    intuition: "Two strings are isomorphic when every character mapping is consistent in both directions.",
    bruteForce: "For every pair of positions, compare whether equality patterns match in both strings.",
    optimizedApproach: ["Maintain a map from first-string characters to second-string characters.", "Maintain the reverse map too.", "Reject any conflicting mapping.", "Accept after all pairs are consistent."],
    dryRun: "egg and add map e to a and g to d with no conflicts, so they are isomorphic.",
    complexity: "O(n) time / O(k) space",
    commonMistakes: "Only checking one direction allows two source characters to map to the same target character."
  },
  {
    slug: "pascal-row",
    intuition: "Each Pascal value is the sum of the two values above it; a row can be built in place from right to left.",
    bruteForce: "Generate the entire triangle up to the requested row.",
    optimizedApproach: ["Start with a row containing 1.", "For each next row, append 1.", "Update inner values from right to left.", "Return the completed requested row."],
    dryRun: "Rows progress [1], [1,1], [1,2,1], [1,3,3,1].",
    complexity: "O(k^2) time / O(k) space",
    commonMistakes: "Updating left to right overwrites values that are still needed for the next cell."
  },
  {
    slug: "find-peak-element",
    intuition: "If the slope rises to the right, some peak must exist on the right; otherwise a peak exists on the left side including mid.",
    bruteForce: "Scan every index and compare it with its neighbors.",
    optimizedApproach: ["Binary-search indices.", "Compare nums[mid] with nums[mid + 1].", "Move right when the slope rises.", "Otherwise keep the left half and return the converged index."],
    dryRun: "For [1,2,3,1], mid near 2 rises toward 3, then the search converges on index 2.",
    complexity: "O(log n) time / O(1) space",
    commonMistakes: "Accessing mid + 1 requires a loop condition that keeps mid before right."
  }
];
