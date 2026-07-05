import {
  Difficulty,
  TestCaseType,
  TestCaseVisibility
} from "../src/generated/prisma/enums";
import type { JudgeProblemSeed } from "./judge-problems";

type ExtraLanguage = "javascript" | "cpp" | "java";
type Templates = Record<string, Record<ExtraLanguage, string>>;

const sample = TestCaseVisibility.SAMPLE;
const visible = TestCaseVisibility.PUBLIC;
const hidden = TestCaseVisibility.HIDDEN;

export const launchJudgeProblems: JudgeProblemSeed[] = [
  {
    slug: "reverse-string",
    title: "Reverse a String",
    shortDescription: "Reverse every character without changing its value.",
    statement: "Given one line of text, print the characters in reverse order.",
    inputFormat: "One non-empty line of text.",
    outputFormat: "Print the reversed line.",
    constraints: "1 <= length <= 100000",
    difficulty: Difficulty.EASY,
    points: 15,
    tags: ["String", "Two Pointers"],
    hints: ["The first character swaps with the last.", "Two pointers can move toward the center."],
    examples: [{ input: "algorithm", output: "mhtirogla" }],
    tests: [
      { input: "algorithm\n", output: "mhtirogla", visibility: sample },
      { input: "LLC code\n", output: "edoc CLL", visibility: visible },
      { input: "a\n", output: "a", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "racecar\n", output: "racecar", visibility: hidden }
    ],
    python: `import sys
s = sys.stdin.read().rstrip("\\r\\n")
print(s[::-1])`
  },
  {
    slug: "palindrome-string",
    title: "Palindrome String",
    shortDescription: "Check whether a word reads identically in both directions.",
    statement: "Given a lowercase word, print true if it is a palindrome and false otherwise.",
    inputFormat: "One lowercase word.",
    outputFormat: "Print true or false.",
    constraints: "1 <= length <= 100000\nThe input contains lowercase English letters.",
    difficulty: Difficulty.EASY,
    points: 15,
    tags: ["String", "Two Pointers"],
    hints: ["Compare characters at mirrored positions."],
    examples: [{ input: "level", output: "true" }, { input: "code", output: "false" }],
    tests: [
      { input: "level\n", output: "true", visibility: sample },
      { input: "code\n", output: "false", visibility: visible },
      { input: "a\n", output: "true", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "abccba\n", output: "true", visibility: hidden }
    ],
    python: `s = input().strip()
print("true" if s == s[::-1] else "false")`
  },
  {
    slug: "fizz-buzz",
    title: "Fizz Buzz",
    shortDescription: "Generate a sequence using divisibility rules.",
    statement: "Given n, print values from 1 through n on one line. Replace multiples of 3 with Fizz, multiples of 5 with Buzz, and multiples of both with FizzBuzz.",
    inputFormat: "One integer n.",
    outputFormat: "Print the n space-separated sequence tokens.",
    constraints: "1 <= n <= 10000",
    difficulty: Difficulty.EASY,
    points: 15,
    tags: ["Math", "Simulation"],
    hints: ["Check divisibility by 15 before checking 3 or 5."],
    examples: [{ input: "5", output: "1 2 Fizz 4 Buzz" }],
    tests: [
      { input: "5\n", output: "1 2 Fizz 4 Buzz", visibility: sample },
      { input: "15\n", output: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz", visibility: visible },
      { input: "1\n", output: "1", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "3\n", output: "1 2 Fizz", visibility: hidden }
    ],
    python: `n = int(input())
answer = []
for value in range(1, n + 1):
    if value % 15 == 0: answer.append("FizzBuzz")
    elif value % 3 == 0: answer.append("Fizz")
    elif value % 5 == 0: answer.append("Buzz")
    else: answer.append(str(value))
print(" ".join(answer))`
  },
  {
    slug: "running-sum",
    title: "Running Sum",
    shortDescription: "Transform an array into its prefix sums.",
    statement: "Given an integer array, print an array where each position contains the sum of all values up to that position.",
    inputFormat: "One line of space-separated integers.",
    outputFormat: "Print the space-separated running sums.",
    constraints: "1 <= n <= 100000\n-100000 <= nums[i] <= 100000",
    difficulty: Difficulty.EASY,
    points: 20,
    tags: ["Array", "Prefix Sum"],
    hints: ["Carry the previous prefix forward."],
    examples: [{ input: "1 2 3 4", output: "1 3 6 10" }],
    tests: [
      { input: "1 2 3 4\n", output: "1 3 6 10", visibility: sample },
      { input: "3 1 2 10 1\n", output: "3 4 6 16 17", visibility: visible },
      { input: "-2\n", output: "-2", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "5 -5 5 -5\n", output: "5 0 5 0", visibility: hidden }
    ],
    python: `import sys
nums = list(map(int, sys.stdin.read().split()))
for index in range(1, len(nums)):
    nums[index] += nums[index - 1]
print(*nums)`
  },
  {
    slug: "contains-duplicate",
    title: "Contains Duplicate",
    shortDescription: "Detect whether any array value appears more than once.",
    statement: "Given an integer array, print true when at least one value occurs twice and false when every value is distinct.",
    inputFormat: "One line of space-separated integers.",
    outputFormat: "Print true or false.",
    constraints: "1 <= n <= 100000\n-1000000000 <= nums[i] <= 1000000000",
    difficulty: Difficulty.EASY,
    points: 20,
    tags: ["Array", "Hash Set"],
    hints: ["A set remembers which values have already appeared."],
    examples: [{ input: "1 2 3 1", output: "true" }, { input: "1 2 3 4", output: "false" }],
    tests: [
      { input: "1 2 3 1\n", output: "true", visibility: sample },
      { input: "1 2 3 4\n", output: "false", visibility: visible },
      { input: "9\n", output: "false", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "-1 0 -1\n", output: "true", visibility: hidden }
    ],
    python: `import sys
nums = list(map(int, sys.stdin.read().split()))
print("true" if len(nums) != len(set(nums)) else "false")`
  },
  {
    slug: "majority-element",
    title: "Majority Element",
    shortDescription: "Find the value occurring more than half the time.",
    statement: "Given a non-empty integer array with a guaranteed majority element, print that element.",
    inputFormat: "One line of space-separated integers.",
    outputFormat: "Print the majority element.",
    constraints: "1 <= n <= 100000\nA majority element always exists.",
    difficulty: Difficulty.EASY,
    points: 25,
    tags: ["Array", "Boyer-Moore"],
    hints: ["Opposing values can cancel each other.", "Track one candidate and a balance counter."],
    examples: [{ input: "2 2 1 1 1 2 2", output: "2" }],
    tests: [
      { input: "2 2 1 1 1 2 2\n", output: "2", visibility: sample },
      { input: "3 3 4\n", output: "3", visibility: visible },
      { input: "7\n", output: "7", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "-1 -1 2 -1 3\n", output: "-1", visibility: hidden }
    ],
    python: `import sys
candidate = None
balance = 0
for value in map(int, sys.stdin.read().split()):
    if balance == 0: candidate = value
    balance += 1 if value == candidate else -1
print(candidate)`
  },
  {
    slug: "missing-number",
    title: "Missing Number",
    shortDescription: "Recover the absent value from the range zero through n.",
    statement: "An array contains n distinct values chosen from 0 through n. Print the one value that is missing.",
    inputFormat: "One line of space-separated distinct integers.",
    outputFormat: "Print the missing integer.",
    constraints: "1 <= n <= 100000\n0 <= nums[i] <= n",
    difficulty: Difficulty.EASY,
    points: 25,
    tags: ["Array", "Math"],
    hints: ["Compare the expected range sum with the actual sum."],
    examples: [{ input: "3 0 1", output: "2" }],
    tests: [
      { input: "3 0 1\n", output: "2", visibility: sample },
      { input: "0 1\n", output: "2", visibility: visible },
      { input: "1\n", output: "0", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "9 6 4 2 3 5 7 0 1\n", output: "8", visibility: hidden }
    ],
    python: `import sys
nums = list(map(int, sys.stdin.read().split()))
n = len(nums)
print(n * (n + 1) // 2 - sum(nums))`
  },
  {
    slug: "move-zeroes",
    title: "Move Zeroes",
    shortDescription: "Move every zero to the end while preserving order.",
    statement: "Given an integer array, print its non-zero values in original order followed by all zero values.",
    inputFormat: "One line of space-separated integers.",
    outputFormat: "Print the transformed space-separated array.",
    constraints: "1 <= n <= 100000",
    difficulty: Difficulty.EASY,
    points: 25,
    tags: ["Array", "Two Pointers"],
    hints: ["Write non-zero values first, then fill the remaining positions with zero."],
    examples: [{ input: "0 1 0 3 12", output: "1 3 12 0 0" }],
    tests: [
      { input: "0 1 0 3 12\n", output: "1 3 12 0 0", visibility: sample },
      { input: "1 0\n", output: "1 0", visibility: visible },
      { input: "0\n", output: "0", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "0 0 2 0 5\n", output: "2 5 0 0 0", visibility: hidden }
    ],
    python: `import sys
nums = list(map(int, sys.stdin.read().split()))
answer = [value for value in nums if value != 0]
answer.extend([0] * (len(nums) - len(answer)))
print(*answer)`
  },
  {
    slug: "best-time-stock",
    title: "Best Time to Buy and Sell Stock",
    shortDescription: "Find the largest profit from one buy followed by one sale.",
    statement: "Given daily stock prices, print the maximum profit obtainable from one buy and one later sale. Print 0 when no profit is possible.",
    inputFormat: "One line of space-separated prices.",
    outputFormat: "Print the maximum profit.",
    constraints: "1 <= n <= 100000\n0 <= price <= 1000000",
    difficulty: Difficulty.EASY,
    points: 30,
    tags: ["Array", "Greedy"],
    hints: ["Remember the cheapest price seen before today."],
    examples: [{ input: "7 1 5 3 6 4", output: "5" }],
    tests: [
      { input: "7 1 5 3 6 4\n", output: "5", visibility: sample },
      { input: "7 6 4 3 1\n", output: "0", visibility: visible },
      { input: "5\n", output: "0", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "2 4 1 10\n", output: "9", visibility: hidden }
    ],
    python: `import sys
prices = list(map(int, sys.stdin.read().split()))
lowest = prices[0]
best = 0
for price in prices[1:]:
    best = max(best, price - lowest)
    lowest = min(lowest, price)
print(best)`
  },
  {
    slug: "single-number",
    title: "Single Number",
    shortDescription: "Find the only value that does not appear twice.",
    statement: "Every array value appears exactly twice except one. Print the value that appears once.",
    inputFormat: "One line of space-separated integers.",
    outputFormat: "Print the unique value.",
    constraints: "1 <= n <= 100000\nExactly one value appears once.",
    difficulty: Difficulty.EASY,
    points: 30,
    tags: ["Array", "Bit Manipulation"],
    hints: ["A value XOR itself becomes zero.", "XOR every value together."],
    examples: [{ input: "4 1 2 1 2", output: "4" }],
    tests: [
      { input: "4 1 2 1 2\n", output: "4", visibility: sample },
      { input: "2 2 1\n", output: "1", visibility: visible },
      { input: "-7\n", output: "-7", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "9 3 9 4 4\n", output: "3", visibility: hidden }
    ],
    python: `import sys
answer = 0
for value in map(int, sys.stdin.read().split()):
    answer ^= value
print(answer)`
  }
].map((problem) => ({ ...problem, timeLimitMs: 8_000 }));

const jsArray = (body: string) => `const nums = require("fs").readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);
${body}`;
const cppArray = (body: string) => `#include <algorithm>
#include <iostream>
#include <numeric>
#include <string>
#include <unordered_set>
#include <vector>
using namespace std;
int main() {
    vector<long long> nums; long long value;
    while (cin >> value) nums.push_back(value);
${body}
}`;
const javaArray = (body: string) => `import java.util.*;
class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        List<Long> nums = new ArrayList<>();
        while (input.hasNextLong()) nums.add(input.nextLong());
${body}
    }
}`;

export const launchLanguageTemplates: Templates = {
  "reverse-string": {
    javascript: `const text = require("fs").readFileSync(0, "utf8").replace(/[\\r\\n]+$/, "");
console.log([...text].reverse().join(""));`,
    cpp: `#include <algorithm>
#include <iostream>
#include <string>
using namespace std;
int main() { string text; getline(cin, text); reverse(text.begin(), text.end()); cout << text << '\\n'; }`,
    java: `import java.util.*;
class Main { public static void main(String[] args) { Scanner in = new Scanner(System.in); String s = in.nextLine(); System.out.println(new StringBuilder(s).reverse()); } }`
  },
  "palindrome-string": {
    javascript: `const s = require("fs").readFileSync(0, "utf8").trim();
console.log(s === [...s].reverse().join("") ? "true" : "false");`,
    cpp: `#include <algorithm>
#include <iostream>
#include <string>
using namespace std;
int main() { string s, reversed; cin >> s; reversed = s; reverse(reversed.begin(), reversed.end()); cout << (s == reversed ? "true" : "false") << '\\n'; }`,
    java: `import java.util.*;
class Main { public static void main(String[] args) { String s = new Scanner(System.in).next(); System.out.println(s.equals(new StringBuilder(s).reverse().toString()) ? "true" : "false"); } }`
  },
  "fizz-buzz": {
    javascript: jsArray(`const answer = [];
for (let i = 1; i <= nums[0]; i++) answer.push(i % 15 === 0 ? "FizzBuzz" : i % 3 === 0 ? "Fizz" : i % 5 === 0 ? "Buzz" : String(i));
console.log(answer.join(" "));`),
    cpp: cppArray(`    for (int i = 1; i <= nums[0]; i++) {
        if (i > 1) cout << ' ';
        if (i % 15 == 0) cout << "FizzBuzz"; else if (i % 3 == 0) cout << "Fizz"; else if (i % 5 == 0) cout << "Buzz"; else cout << i;
    }
    cout << '\\n';`),
    java: javaArray(`        List<String> answer = new ArrayList<>();
        for (int i = 1; i <= nums.get(0); i++) answer.add(i % 15 == 0 ? "FizzBuzz" : i % 3 == 0 ? "Fizz" : i % 5 == 0 ? "Buzz" : String.valueOf(i));
        System.out.println(String.join(" ", answer));`)
  },
  "running-sum": {
    javascript: jsArray(`for (let i = 1; i < nums.length; i++) nums[i] += nums[i - 1];
console.log(nums.join(" "));`),
    cpp: cppArray(`    for (size_t i = 1; i < nums.size(); i++) nums[i] += nums[i - 1];
    for (size_t i = 0; i < nums.size(); i++) cout << (i ? " " : "") << nums[i]; cout << '\\n';`),
    java: javaArray(`        for (int i = 1; i < nums.size(); i++) nums.set(i, nums.get(i) + nums.get(i - 1));
        for (int i = 0; i < nums.size(); i++) System.out.print((i > 0 ? " " : "") + nums.get(i));
        System.out.println();`)
  },
  "contains-duplicate": {
    javascript: jsArray(`console.log(new Set(nums).size !== nums.length ? "true" : "false");`),
    cpp: cppArray(`    unordered_set<long long> seen(nums.begin(), nums.end());
    cout << (seen.size() != nums.size() ? "true" : "false") << '\\n';`),
    java: javaArray(`        System.out.println(new HashSet<>(nums).size() != nums.size() ? "true" : "false");`)
  },
  "majority-element": {
    javascript: jsArray(`let candidate = 0, balance = 0;
for (const value of nums) { if (balance === 0) candidate = value; balance += value === candidate ? 1 : -1; }
console.log(candidate);`),
    cpp: cppArray(`    long long candidate = 0; int balance = 0;
    for (long long item : nums) { if (balance == 0) candidate = item; balance += item == candidate ? 1 : -1; }
    cout << candidate << '\\n';`),
    java: javaArray(`        long candidate = 0; int balance = 0;
        for (long value : nums) { if (balance == 0) candidate = value; balance += value == candidate ? 1 : -1; }
        System.out.println(candidate);`)
  },
  "missing-number": {
    javascript: jsArray(`const n = nums.length;
console.log(n * (n + 1) / 2 - nums.reduce((sum, value) => sum + value, 0));`),
    cpp: cppArray(`    long long n = nums.size(), expected = n * (n + 1) / 2;
    cout << expected - accumulate(nums.begin(), nums.end(), 0LL) << '\\n';`),
    java: javaArray(`        long n = nums.size(), expected = n * (n + 1) / 2, actual = 0;
        for (long value : nums) actual += value;
        System.out.println(expected - actual);`)
  },
  "move-zeroes": {
    javascript: jsArray(`const answer = nums.filter(value => value !== 0);
while (answer.length < nums.length) answer.push(0);
console.log(answer.join(" "));`),
    cpp: cppArray(`    vector<long long> answer;
    for (long long item : nums) if (item != 0) answer.push_back(item);
    answer.resize(nums.size(), 0);
    for (size_t i = 0; i < answer.size(); i++) cout << (i ? " " : "") << answer[i]; cout << '\\n';`),
    java: javaArray(`        List<Long> answer = new ArrayList<>();
        for (long value : nums) if (value != 0) answer.add(value);
        while (answer.size() < nums.size()) answer.add(0L);
        for (int i = 0; i < answer.size(); i++) System.out.print((i > 0 ? " " : "") + answer.get(i));
        System.out.println();`)
  },
  "best-time-stock": {
    javascript: jsArray(`let lowest = nums[0], best = 0;
for (const price of nums.slice(1)) { best = Math.max(best, price - lowest); lowest = Math.min(lowest, price); }
console.log(best);`),
    cpp: cppArray(`    long long lowest = nums[0], best = 0;
    for (size_t i = 1; i < nums.size(); i++) { best = max(best, nums[i] - lowest); lowest = min(lowest, nums[i]); }
    cout << best << '\\n';`),
    java: javaArray(`        long lowest = nums.get(0), best = 0;
        for (int i = 1; i < nums.size(); i++) { best = Math.max(best, nums.get(i) - lowest); lowest = Math.min(lowest, nums.get(i)); }
        System.out.println(best);`)
  },
  "single-number": {
    javascript: jsArray(`let answer = 0; for (const value of nums) answer ^= value; console.log(answer);`),
    cpp: cppArray(`    long long answer = 0; for (long long item : nums) answer ^= item; cout << answer << '\\n';`),
    java: javaArray(`        long answer = 0; for (long value : nums) answer ^= value; System.out.println(answer);`)
  }
};
