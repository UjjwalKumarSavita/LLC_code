export type RoadmapDefinition = {
  slug: string;
  number: string;
  title: string;
  description: string;
  level: string;
  estimatedHours: number;
  problemSlugs: string[];
};

export const roadmaps: RoadmapDefinition[] = [
  {
    slug: "programming-foundations",
    number: "01",
    title: "Programming foundations",
    description: "Build confidence with input, loops, strings, arrays, and small state transitions.",
    level: "BEGINNER",
    estimatedHours: 8,
    problemSlugs: [
      "fizz-buzz",
      "reverse-string",
      "palindrome-string",
      "running-sum",
      "contains-duplicate",
      "majority-element",
      "missing-number",
      "move-zeroes",
    ],
  },
  {
    slug: "arrays-and-hashing",
    number: "02",
    title: "Arrays and hashing",
    description: "Learn lookup tables, prefix state, counting, and the patterns behind fast array solutions.",
    level: "BEGINNER → INTERMEDIATE",
    estimatedHours: 10,
    problemSlugs: [
      "two-sum",
      "valid-anagram",
      "first-unique-character",
      "array-intersection",
      "product-except-self",
      "subarray-sum-k",
      "two-sum-sorted",
      "longest-substring",
    ],
  },
  {
    slug: "search-and-greedy",
    number: "03",
    title: "Search and greedy",
    description: "Shrink search spaces, make locally useful choices, and reason about sorted structure.",
    level: "INTERMEDIATE",
    estimatedHours: 12,
    problemSlugs: [
      "binary-search",
      "search-insert-position",
      "maximum-subarray",
      "best-time-stock",
      "merge-sorted-arrays",
      "merge-intervals",
      "find-peak-element",
      "trapping-rain-water",
    ],
  },
  {
    slug: "dynamic-programming",
    number: "04",
    title: "Dynamic programming",
    description: "Turn repeated decisions into compact state and build answers from solved subproblems.",
    level: "INTERMEDIATE",
    estimatedHours: 8,
    problemSlugs: [
      "fibonacci-number",
      "climbing-stairs",
      "min-cost-climbing-stairs",
      "house-robber",
    ],
  },
];

export function getRoadmap(slug: string) {
  return roadmaps.find((roadmap) => roadmap.slug === slug);
}
