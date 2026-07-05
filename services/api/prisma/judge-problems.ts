import {
  ComparisonMode,
  Difficulty,
  TestCaseType,
  TestCaseVisibility
} from "../src/generated/prisma/enums";

export type JudgeProblemSeed = {
  slug: string;
  title: string;
  shortDescription: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  difficulty: Difficulty;
  points: number;
  timeLimitMs?: number;
  comparisonMode?: ComparisonMode;
  tags: string[];
  hints: string[];
  examples: Array<{ input: string; output: string; explanation?: string }>;
  tests: Array<{
    input: string;
    output: string;
    visibility: TestCaseVisibility;
    testType?: TestCaseType;
  }>;
  python: string;
};

export const additionalJudgeProblems: JudgeProblemSeed[] = [
  {
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    shortDescription: "Check whether brackets close in the correct order.",
    statement:
      "Given a string containing only parentheses, square brackets, and braces, print true when every opening bracket is closed by the matching type in the correct order. Otherwise print false.",
    inputFormat: "One line containing the bracket string.",
    outputFormat: "Print true or false.",
    constraints: "1 <= length <= 100000\nThe string contains only ()[]{}.",
    difficulty: Difficulty.EASY,
    points: 20,
    tags: ["String", "Stack"],
    hints: [
      "The most recently opened bracket must close first.",
      "Use a stack and a map from closing to opening brackets."
    ],
    examples: [
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" }
    ],
    tests: [
      { input: "()[]{}\n", output: "true", visibility: TestCaseVisibility.SAMPLE },
      { input: "(]\n", output: "false", visibility: TestCaseVisibility.PUBLIC },
      { input: "([{}])\n", output: "true", visibility: TestCaseVisibility.HIDDEN },
      {
        input: "((({[]}))\n",
        output: "false",
        visibility: TestCaseVisibility.HIDDEN,
        testType: TestCaseType.EDGE
      }
    ],
    python: `import sys

s = sys.stdin.read().strip()
stack = []
pairs = {')': '(', ']': '[', '}': '{'}

for char in s:
    if char in pairs.values():
        stack.append(char)
    elif not stack or stack.pop() != pairs[char]:
        print("false")
        break
else:
    print("true" if not stack else "false")`
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    shortDescription: "Find a target in a sorted array in logarithmic time.",
    statement:
      "Given a target and a sorted array of distinct integers, print the zero-based index of the target, or -1 when it is absent.",
    inputFormat:
      "The first line contains target. The second line contains sorted space-separated integers.",
    outputFormat: "Print the target index or -1.",
    constraints: "1 <= n <= 100000\nAll values are distinct and sorted ascending.",
    difficulty: Difficulty.EASY,
    points: 25,
    tags: ["Array", "Binary Search"],
    hints: ["Compare with the middle value.", "Discard half of the search range."],
    examples: [
      { input: "9\n-1 0 3 5 9 12", output: "4" },
      { input: "2\n-1 0 3 5 9 12", output: "-1" }
    ],
    tests: [
      {
        input: "9\n-1 0 3 5 9 12\n",
        output: "4",
        visibility: TestCaseVisibility.SAMPLE
      },
      {
        input: "2\n-1 0 3 5 9 12\n",
        output: "-1",
        visibility: TestCaseVisibility.PUBLIC
      },
      { input: "1\n1\n", output: "0", visibility: TestCaseVisibility.HIDDEN },
      {
        input: "-5\n-10 -5 0 5 10\n",
        output: "1",
        visibility: TestCaseVisibility.HIDDEN,
        testType: TestCaseType.EDGE
      }
    ],
    python: `import sys

values = list(map(int, sys.stdin.read().split()))
target, nums = values[0], values[1:]
left, right = 0, len(nums) - 1

while left <= right:
    middle = (left + right) // 2
    if nums[middle] == target:
        print(middle)
        break
    if nums[middle] < target:
        left = middle + 1
    else:
        right = middle - 1
else:
    print(-1)`
  },
  {
    slug: "maximum-subarray",
    title: "Maximum Subarray",
    shortDescription: "Find the contiguous segment with the largest sum.",
    statement:
      "Given a non-empty integer array, print the largest sum obtainable from one contiguous subarray.",
    inputFormat: "One line containing space-separated integers.",
    outputFormat: "Print the maximum contiguous sum.",
    constraints: "1 <= n <= 100000\n-10000 <= nums[i] <= 10000",
    difficulty: Difficulty.MEDIUM,
    points: 40,
    tags: ["Array", "Dynamic Programming"],
    hints: ["A negative running prefix cannot improve a future subarray."],
    examples: [
      {
        input: "-2 1 -3 4 -1 2 1 -5 4",
        output: "6",
        explanation: "The subarray 4 -1 2 1 has sum 6."
      },
      { input: "1", output: "1" }
    ],
    tests: [
      {
        input: "-2 1 -3 4 -1 2 1 -5 4\n",
        output: "6",
        visibility: TestCaseVisibility.SAMPLE
      },
      { input: "1\n", output: "1", visibility: TestCaseVisibility.PUBLIC },
      { input: "-8 -3 -6 -2 -5 -4\n", output: "-2", visibility: TestCaseVisibility.HIDDEN },
      { input: "5 -2 3 4\n", output: "10", visibility: TestCaseVisibility.HIDDEN }
    ],
    python: `import sys

nums = list(map(int, sys.stdin.read().split()))
current = best = nums[0]
for value in nums[1:]:
    current = max(value, current + value)
    best = max(best, current)
print(best)`
  },
  {
    slug: "level-order-traversal",
    title: "Binary Tree Level Order Traversal",
    shortDescription: "Visit a binary tree one depth level at a time.",
    statement:
      "Given a binary tree in level-order form using null for missing children, print one tree level per line with values separated by spaces.",
    inputFormat: "One line of level-order tokens. Use null for a missing child.",
    outputFormat: "Print each non-empty level on its own line.",
    constraints: "0 <= nodes <= 2000\n-1000 <= value <= 1000",
    difficulty: Difficulty.MEDIUM,
    points: 45,
    tags: ["Tree", "BFS", "Queue"],
    hints: ["A queue naturally processes nodes in arrival order."],
    examples: [
      { input: "3 9 20 null null 15 7", output: "3\n9 20\n15 7" },
      { input: "1", output: "1" }
    ],
    tests: [
      {
        input: "3 9 20 null null 15 7\n",
        output: "3\n9 20\n15 7",
        visibility: TestCaseVisibility.SAMPLE
      },
      { input: "1\n", output: "1", visibility: TestCaseVisibility.PUBLIC },
      { input: "1 2 3 4 5 null 6\n", output: "1\n2 3\n4 5 6", visibility: TestCaseVisibility.HIDDEN },
      { input: "null\n", output: "", visibility: TestCaseVisibility.HIDDEN, testType: TestCaseType.EDGE }
    ],
    python: `import sys
from collections import deque

tokens = sys.stdin.read().split()
if not tokens or tokens[0] == "null":
    raise SystemExit

root = [int(tokens[0]), None, None]
queue = deque([root])
index = 1
while queue and index < len(tokens):
    node = queue.popleft()
    for side in (1, 2):
        if index >= len(tokens):
            break
        token = tokens[index]
        index += 1
        if token != "null":
            child = [int(token), None, None]
            node[side] = child
            queue.append(child)

queue = deque([root])
lines = []
while queue:
    level = []
    for _ in range(len(queue)):
        node = queue.popleft()
        level.append(str(node[0]))
        if node[1]:
            queue.append(node[1])
        if node[2]:
            queue.append(node[2])
    lines.append(" ".join(level))
print("\\n".join(lines))`
  },
  {
    slug: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    shortDescription: "Find the longest window containing unique characters.",
    statement:
      "Given one line of text, print the length of its longest substring containing no repeated character.",
    inputFormat: "One line containing the string. Spaces are part of the string.",
    outputFormat: "Print one integer.",
    constraints: "0 <= length <= 50000",
    difficulty: Difficulty.MEDIUM,
    points: 50,
    tags: ["String", "Sliding Window", "Hash Map"],
    hints: ["Move the left boundary beyond the previous copy of a repeated character."],
    examples: [
      { input: "abcabcbb", output: "3" },
      { input: "bbbbb", output: "1" }
    ],
    tests: [
      { input: "abcabcbb\n", output: "3", visibility: TestCaseVisibility.SAMPLE },
      { input: "bbbbb\n", output: "1", visibility: TestCaseVisibility.PUBLIC },
      { input: "pwwkew\n", output: "3", visibility: TestCaseVisibility.HIDDEN },
      { input: "\n", output: "0", visibility: TestCaseVisibility.HIDDEN, testType: TestCaseType.EDGE }
    ],
    python: `import sys

s = sys.stdin.read()
if s.endswith("\\n"):
    s = s[:-1]
last = {}
left = best = 0
for right, char in enumerate(s):
    if char in last and last[char] >= left:
        left = last[char] + 1
    last[char] = right
    best = max(best, right - left + 1)
print(best)`
  },
  {
    slug: "merge-intervals",
    title: "Merge Intervals",
    shortDescription: "Combine all overlapping intervals.",
    statement:
      "Given one interval per line, merge every overlap and print the non-overlapping result ordered by start.",
    inputFormat: "Each line contains start and end.",
    outputFormat: "Print each merged interval as start end on its own line.",
    constraints: "1 <= intervals <= 10000\nstart <= end",
    difficulty: Difficulty.MEDIUM,
    points: 55,
    tags: ["Array", "Sorting"],
    hints: ["Sort intervals by their starting value first."],
    examples: [
      { input: "1 3\n2 6\n8 10\n15 18", output: "1 6\n8 10\n15 18" }
    ],
    tests: [
      {
        input: "1 3\n2 6\n8 10\n15 18\n",
        output: "1 6\n8 10\n15 18",
        visibility: TestCaseVisibility.SAMPLE
      },
      {
        input: "1 4\n4 5\n",
        output: "1 5",
        visibility: TestCaseVisibility.PUBLIC
      },
      {
        input: "5 7\n1 2\n3 6\n",
        output: "1 2\n3 7",
        visibility: TestCaseVisibility.HIDDEN
      },
      { input: "2 2\n", output: "2 2", visibility: TestCaseVisibility.HIDDEN }
    ],
    python: `import sys

values = list(map(int, sys.stdin.read().split()))
intervals = sorted(zip(values[::2], values[1::2]))
merged = []
for start, end in intervals:
    if not merged or start > merged[-1][1]:
        merged.append([start, end])
    else:
        merged[-1][1] = max(merged[-1][1], end)
print("\\n".join(f"{start} {end}" for start, end in merged))`
  },
  {
    slug: "number-of-islands",
    title: "Number of Islands",
    shortDescription: "Count connected land components in a grid.",
    statement:
      "Given a rectangular grid of 0 and 1 characters, print the number of horizontally or vertically connected land components.",
    inputFormat: "The first line contains rows and columns. The next rows lines contain the grid.",
    outputFormat: "Print the island count.",
    constraints: "1 <= rows, columns <= 300",
    difficulty: Difficulty.MEDIUM,
    points: 60,
    tags: ["Matrix", "DFS", "BFS"],
    hints: ["Each traversal from unvisited land discovers exactly one island."],
    examples: [
      { input: "3 3\n110\n100\n001", output: "2" }
    ],
    tests: [
      { input: "3 3\n110\n100\n001\n", output: "2", visibility: TestCaseVisibility.SAMPLE },
      { input: "2 2\n11\n11\n", output: "1", visibility: TestCaseVisibility.PUBLIC },
      { input: "3 4\n1010\n0101\n1010\n", output: "6", visibility: TestCaseVisibility.HIDDEN },
      { input: "1 5\n00000\n", output: "0", visibility: TestCaseVisibility.HIDDEN }
    ],
    python: `import sys
from collections import deque

lines = sys.stdin.read().splitlines()
rows, columns = map(int, lines[0].split())
grid = [list(line.strip()) for line in lines[1:1 + rows]]
count = 0

for row in range(rows):
    for column in range(columns):
        if grid[row][column] != "1":
            continue
        count += 1
        grid[row][column] = "0"
        queue = deque([(row, column)])
        while queue:
            r, c = queue.popleft()
            for nr, nc in ((r-1,c), (r+1,c), (r,c-1), (r,c+1)):
                if 0 <= nr < rows and 0 <= nc < columns and grid[nr][nc] == "1":
                    grid[nr][nc] = "0"
                    queue.append((nr, nc))
print(count)`
  },
  {
    slug: "trapping-rain-water",
    title: "Trapping Rain Water",
    shortDescription: "Calculate water retained between elevation bars.",
    statement:
      "Given non-negative bar heights, print the total number of water units trapped after raining.",
    inputFormat: "One line containing space-separated heights.",
    outputFormat: "Print the trapped-water total.",
    constraints: "1 <= n <= 20000\n0 <= height[i] <= 100000",
    difficulty: Difficulty.HARD,
    points: 90,
    tags: ["Array", "Two Pointers", "Stack"],
    hints: ["Advance the side with the lower maximum boundary."],
    examples: [
      { input: "0 1 0 2 1 0 1 3 2 1 2 1", output: "6" }
    ],
    tests: [
      {
        input: "0 1 0 2 1 0 1 3 2 1 2 1\n",
        output: "6",
        visibility: TestCaseVisibility.SAMPLE
      },
      { input: "4 2 0 3 2 5\n", output: "9", visibility: TestCaseVisibility.PUBLIC },
      { input: "1 2 3 4\n", output: "0", visibility: TestCaseVisibility.HIDDEN },
      { input: "5\n", output: "0", visibility: TestCaseVisibility.HIDDEN }
    ],
    python: `import sys

height = list(map(int, sys.stdin.read().split()))
left, right = 0, len(height) - 1
left_max = right_max = water = 0
while left < right:
    if height[left] <= height[right]:
        left_max = max(left_max, height[left])
        water += left_max - height[left]
        left += 1
    else:
        right_max = max(right_max, height[right])
        water += right_max - height[right]
        right -= 1
print(water)`
  },
  {
    slug: "median-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    shortDescription: "Find the combined median without merging both arrays.",
    statement:
      "Given two sorted arrays, print the median of all their values. The expected solution uses a binary partition of the smaller array.",
    inputFormat: "The first line is the first array. The second line is the second array.",
    outputFormat: "Print the median as a number.",
    constraints: "0 <= m, n <= 1000\n1 <= m + n",
    difficulty: Difficulty.HARD,
    points: 100,
    comparisonMode: ComparisonMode.FLOAT,
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    hints: ["Binary-search a partition in the smaller array."],
    examples: [
      { input: "1 3\n2", output: "2.0" },
      { input: "1 2\n3 4", output: "2.5" }
    ],
    tests: [
      { input: "1 3\n2\n", output: "2.0", visibility: TestCaseVisibility.SAMPLE },
      { input: "1 2\n3 4\n", output: "2.5", visibility: TestCaseVisibility.PUBLIC },
      { input: "0 0\n0 0\n", output: "0.0", visibility: TestCaseVisibility.HIDDEN },
      { input: "-5 -3 -1\n2 4\n", output: "-1.0", visibility: TestCaseVisibility.HIDDEN }
    ],
    python: `import sys

lines = sys.stdin.read().splitlines()
a = list(map(int, lines[0].split())) if lines and lines[0].strip() else []
b = list(map(int, lines[1].split())) if len(lines) > 1 and lines[1].strip() else []
if len(a) > len(b):
    a, b = b, a

total = len(a) + len(b)
half = (total + 1) // 2
left, right = 0, len(a)
while left <= right:
    i = (left + right) // 2
    j = half - i
    a_left = a[i - 1] if i else float("-inf")
    a_right = a[i] if i < len(a) else float("inf")
    b_left = b[j - 1] if j else float("-inf")
    b_right = b[j] if j < len(b) else float("inf")
    if a_left <= b_right and b_left <= a_right:
        if total % 2:
            print(float(max(a_left, b_left)))
        else:
            print((max(a_left, b_left) + min(a_right, b_right)) / 2)
        break
    if a_left > b_right:
        right = i - 1
    else:
        left = i + 1`
  }
];
