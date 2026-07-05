export type VisualizerFrame = {
  title: string;
  description: string;
  values: string[];
  active: number[];
  settled?: number[];
  stateLabel: string;
  stateValue: string;
};

export type ProblemVisualizerSpec = {
  pattern: "array" | "binary-search" | "stack" | "dynamic-programming" | "grid";
  title: string;
  columns?: number;
  frames: VisualizerFrame[];
};

const twoSumValues = ["2", "7", "11", "15"];
const bracketValues = ["(", "[", "{", "}", "]", ")"];
const binaryValues = ["-1", "0", "3", "5", "9", "12"];
const kadaneValues = ["-2", "1", "-3", "4", "-1", "2", "1", "-5", "4"];
const islandValues = [
  "1", "1", "0", "0", "0",
  "1", "1", "0", "1", "0",
  "0", "0", "0", "1", "1",
  "0", "1", "0", "0", "0",
];
const runningSumValues = ["1", "2", "3", "4"];
const majorityValues = ["2", "2", "1", "1", "1", "2", "2"];
const moveZeroesValues = ["0", "1", "0", "3", "12"];
const robberValues = ["2", "7", "9", "3", "1"];
const insertValues = ["1", "3", "5", "6"];

export const problemVisualizers: Record<string, ProblemVisualizerSpec> = {
  "two-sum": {
    pattern: "array",
    title: "Complement hash map",
    frames: [
      { title: "Initialize memory", description: "Start with an empty map that will remember each visited value and index.", values: twoSumValues, active: [], stateLabel: "SEEN", stateValue: "{ }" },
      { title: "Inspect 2", description: "The complement is 9 − 2 = 7. It is not in the map yet.", values: twoSumValues, active: [0], stateLabel: "COMPLEMENT", stateValue: "7 / not found" },
      { title: "Remember 2", description: "Store the value and its index before moving forward.", values: twoSumValues, active: [0], settled: [0], stateLabel: "SEEN", stateValue: "{ 2: 0 }" },
      { title: "Inspect 7", description: "The complement is 2, which the map already remembers at index 0.", values: twoSumValues, active: [1], settled: [0], stateLabel: "COMPLEMENT", stateValue: "2 / found at 0" },
      { title: "Pair found", description: "Return the remembered index and the current index: [0, 1].", values: twoSumValues, active: [0, 1], settled: [0, 1], stateLabel: "ANSWER", stateValue: "[0, 1]" },
    ],
  },
  "valid-parentheses": {
    pattern: "stack",
    title: "Last-in, first-out stack",
    frames: [
      { title: "Push the parenthesis", description: "An opening token cannot match yet, so push it onto the stack.", values: bracketValues, active: [0], stateLabel: "STACK", stateValue: "( bottom" },
      { title: "Nest the square bracket", description: "The latest opening token must be the first one closed.", values: bracketValues, active: [1], settled: [0], stateLabel: "STACK", stateValue: "(  [ top" },
      { title: "Nest the brace", description: "The brace becomes the most recent unmatched opening token.", values: bracketValues, active: [2], settled: [0, 1], stateLabel: "STACK", stateValue: "(  [  { top" },
      { title: "Match the brace", description: "The closer matches the stack top, so pop the opening brace.", values: bracketValues, active: [2, 3], settled: [0, 1, 2, 3], stateLabel: "STACK", stateValue: "(  [ top" },
      { title: "Close every pair", description: "The remaining closers match in reverse order. An empty stack means valid.", values: bracketValues, active: [0, 1, 4, 5], settled: [0, 1, 2, 3, 4, 5], stateLabel: "RESULT", stateValue: "true / stack empty" },
    ],
  },
  "binary-search": {
    pattern: "binary-search",
    title: "Halving the search interval",
    frames: [
      { title: "Open the full range", description: "Target 9 begins with every sorted value as a candidate.", values: binaryValues, active: [0, 1, 2, 3, 4, 5], stateLabel: "BOUNDS", stateValue: "left 0 / right 5" },
      { title: "Compare the middle", description: "Index 2 contains 3. Discard it and everything to its left.", values: binaryValues, active: [2], settled: [0, 1, 2], stateLabel: "COMPARISON", stateValue: "3 < 9" },
      { title: "Search the right half", description: "Only indices 3 through 5 can still contain the target.", values: binaryValues, active: [3, 4, 5], settled: [0, 1, 2], stateLabel: "BOUNDS", stateValue: "left 3 / right 5" },
      { title: "Compare index 4", description: "The new middle value equals the target.", values: binaryValues, active: [4], settled: [0, 1, 2], stateLabel: "COMPARISON", stateValue: "9 = 9" },
      { title: "Return the index", description: "Binary search finds the target after only two comparisons.", values: binaryValues, active: [4], settled: [4], stateLabel: "ANSWER", stateValue: "index 4" },
    ],
  },
  "maximum-subarray": {
    pattern: "dynamic-programming",
    title: "Kadane running optimum",
    frames: [
      { title: "Start at −2", description: "The best segment ending here and the global best both begin at −2.", values: kadaneValues, active: [0], stateLabel: "CURRENT / BEST", stateValue: "-2 / -2" },
      { title: "Restart at 1", description: "Extending a negative prefix is worse than beginning a new segment.", values: kadaneValues, active: [1], settled: [0], stateLabel: "CURRENT / BEST", stateValue: "1 / 1" },
      { title: "Restart at 4", description: "After the running sum turns negative, value 4 starts a stronger segment.", values: kadaneValues, active: [3], settled: [0, 1, 2], stateLabel: "CURRENT / BEST", stateValue: "4 / 4" },
      { title: "Extend the segment", description: "Adding −1, 2, and 1 keeps improving the best total.", values: kadaneValues, active: [3, 4, 5, 6], settled: [0, 1, 2], stateLabel: "CURRENT / BEST", stateValue: "6 / 6" },
      { title: "Keep the global best", description: "Later values never beat the segment [4, −1, 2, 1].", values: kadaneValues, active: [3, 4, 5, 6], settled: [0, 1, 2, 7, 8], stateLabel: "ANSWER", stateValue: "6" },
    ],
  },
  "number-of-islands": {
    pattern: "grid",
    title: "Flood-fill connected land",
    columns: 5,
    frames: [
      { title: "Find unvisited land", description: "The first land cell starts island number one.", values: islandValues, active: [0], stateLabel: "ISLANDS / QUEUE", stateValue: "1 / [(0,0)]" },
      { title: "Flood the component", description: "Visit horizontal and vertical land neighbors until the queue is empty.", values: islandValues, active: [1, 5], settled: [0], stateLabel: "ISLANDS / QUEUE", stateValue: "1 / [(0,1),(1,0)]" },
      { title: "Finish island one", description: "The connected upper-left block is now fully visited.", values: islandValues, active: [6], settled: [0, 1, 5, 6], stateLabel: "ISLANDS / QUEUE", stateValue: "1 / empty" },
      { title: "Discover island two", description: "The next unvisited land cell starts a new flood fill.", values: islandValues, active: [8, 13, 14], settled: [0, 1, 5, 6], stateLabel: "ISLANDS / QUEUE", stateValue: "2 / [(1,3)]" },
      { title: "Count the final island", description: "The separate bottom land cell starts island three, then the scan ends.", values: islandValues, active: [16], settled: [0, 1, 5, 6, 8, 13, 14, 16], stateLabel: "ANSWER", stateValue: "3 islands" },
    ],
  },
  "running-sum": {
    pattern: "dynamic-programming",
    title: "Prefix accumulation",
    frames: [
      { title: "Start the prefix", description: "The first running sum is simply the first value.", values: runningSumValues, active: [0], stateLabel: "PREFIX / OUTPUT", stateValue: "1 / [1]" },
      { title: "Include 2", description: "Add the next value to the previous prefix: 1 + 2 = 3.", values: runningSumValues, active: [1], settled: [0], stateLabel: "PREFIX / OUTPUT", stateValue: "3 / [1, 3]" },
      { title: "Include 3", description: "Carry the accumulated total forward and add 3.", values: runningSumValues, active: [2], settled: [0, 1], stateLabel: "PREFIX / OUTPUT", stateValue: "6 / [1, 3, 6]" },
      { title: "Include 4", description: "The final value extends the prefix from 6 to 10.", values: runningSumValues, active: [3], settled: [0, 1, 2], stateLabel: "PREFIX / OUTPUT", stateValue: "10 / [1, 3, 6, 10]" },
      { title: "Return every prefix", description: "One pass produced the running sum at every position.", values: ["1", "3", "6", "10"], active: [0, 1, 2, 3], settled: [0, 1, 2, 3], stateLabel: "ANSWER", stateValue: "[1, 3, 6, 10]" },
    ],
  },
  "majority-element": {
    pattern: "dynamic-programming",
    title: "Boyer–Moore cancellation",
    frames: [
      { title: "Choose candidate 2", description: "A zero balance adopts the current value as candidate.", values: majorityValues, active: [0], stateLabel: "CANDIDATE / BALANCE", stateValue: "2 / 1" },
      { title: "Confirm candidate", description: "The next 2 agrees, so its balance increases.", values: majorityValues, active: [1], settled: [0], stateLabel: "CANDIDATE / BALANCE", stateValue: "2 / 2" },
      { title: "Cancel with ones", description: "Different values reduce the balance until it reaches zero.", values: majorityValues, active: [2, 3], settled: [0, 1], stateLabel: "CANDIDATE / BALANCE", stateValue: "2 / 0" },
      { title: "Choose candidate 1", description: "At zero balance, the next value becomes the temporary candidate.", values: majorityValues, active: [4], settled: [0, 1, 2, 3], stateLabel: "CANDIDATE / BALANCE", stateValue: "1 / 1" },
      { title: "Majority survives", description: "The final two values cancel the temporary candidate and leave 2.", values: majorityValues, active: [5, 6], settled: [0, 1, 2, 3, 4, 5, 6], stateLabel: "ANSWER", stateValue: "candidate 2" },
    ],
  },
  "move-zeroes": {
    pattern: "array",
    title: "Stable non-zero compaction",
    frames: [
      { title: "Open write position", description: "The first slot is ready for the next non-zero value.", values: moveZeroesValues, active: [0], stateLabel: "READ / WRITE", stateValue: "0 / 0" },
      { title: "Write value 1", description: "Skip the zero and compact 1 into the first output position.", values: ["1", "1", "0", "3", "12"], active: [0, 1], stateLabel: "READ / WRITE", stateValue: "1 / 0" },
      { title: "Write value 3", description: "The second zero is skipped; 3 moves behind 1.", values: ["1", "3", "0", "3", "12"], active: [1, 3], settled: [0], stateLabel: "READ / WRITE", stateValue: "3 / 1" },
      { title: "Write value 12", description: "The last non-zero value fills the third compacted slot.", values: ["1", "3", "12", "3", "12"], active: [2, 4], settled: [0, 1], stateLabel: "READ / WRITE", stateValue: "4 / 2" },
      { title: "Fill remaining zeroes", description: "Every slot after the write pointer is set to zero.", values: ["1", "3", "12", "0", "0"], active: [3, 4], settled: [0, 1, 2, 3, 4], stateLabel: "ANSWER", stateValue: "[1, 3, 12, 0, 0]" },
    ],
  },
  "house-robber": {
    pattern: "dynamic-programming",
    title: "Take-or-skip dynamic programming",
    frames: [
      { title: "Evaluate house 2", description: "Taking the first house beats skipping it.", values: robberValues, active: [0], stateLabel: "TWO-BACK / BEST", stateValue: "0 / 2" },
      { title: "Evaluate house 7", description: "Seven is better than keeping the previous total of two.", values: robberValues, active: [1], settled: [0], stateLabel: "TWO-BACK / BEST", stateValue: "2 / 7" },
      { title: "Combine with house 9", description: "Taking 9 plus the two-back total 2 produces 11.", values: robberValues, active: [0, 2], settled: [1], stateLabel: "TAKE / SKIP", stateValue: "11 / 7" },
      { title: "Skip house 3", description: "Taking 3 with 7 gives 10, so the best remains 11.", values: robberValues, active: [1, 3], settled: [0, 2], stateLabel: "TAKE / SKIP", stateValue: "10 / 11" },
      { title: "Take the final house", description: "One plus the two-back total 11 produces the final optimum 12.", values: robberValues, active: [0, 2, 4], settled: [0, 1, 2, 3, 4], stateLabel: "ANSWER", stateValue: "12" },
    ],
  },
  "search-insert-position": {
    pattern: "binary-search",
    title: "Lower-bound binary search",
    frames: [
      { title: "Open a half-open range", description: "Target 2 may be inserted at any position from 0 through 4.", values: insertValues, active: [0, 1, 2, 3], stateLabel: "BOUNDS", stateValue: "[0, 4)" },
      { title: "Compare middle 5", description: "Five is not smaller than 2, so the answer remains at or left of index 2.", values: insertValues, active: [2], stateLabel: "BOUNDS", stateValue: "[0, 2)" },
      { title: "Compare middle 3", description: "Three is also not smaller than 2, so keep the left half.", values: insertValues, active: [1], settled: [2, 3], stateLabel: "BOUNDS", stateValue: "[0, 1)" },
      { title: "Compare value 1", description: "One is smaller than 2, so insertion must be immediately after it.", values: insertValues, active: [0], settled: [2, 3], stateLabel: "BOUNDS", stateValue: "[1, 1)" },
      { title: "Return insertion index", description: "The interval closes at index 1, between values 1 and 3.", values: insertValues, active: [1], settled: [0, 1, 2, 3], stateLabel: "ANSWER", stateValue: "index 1" },
    ],
  },
};
