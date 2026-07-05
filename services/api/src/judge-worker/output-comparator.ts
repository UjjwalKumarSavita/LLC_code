import { ComparisonMode } from "../generated/prisma/enums";
import type { ComparisonRequest } from "../judge/judge.contract";

const FLOAT_TOLERANCE = 1e-6;

export function outputsMatch(request: ComparisonRequest) {
  const actual = normalizeLineEndings(request.actual);
  const expected = normalizeLineEndings(request.expected);

  switch (request.mode) {
    case ComparisonMode.EXACT:
      return actual === expected;
    case ComparisonMode.TRIMMED:
      return actual.trim() === expected.trim();
    case ComparisonMode.TOKEN:
      return tokens(actual).join("\u0000") === tokens(expected).join("\u0000");
    case ComparisonMode.FLOAT:
      return compareFloatTokens(tokens(actual), tokens(expected));
    case ComparisonMode.CUSTOM:
      throw new Error("Custom checkers require a dedicated checker sandbox");
  }
}

function normalizeLineEndings(value: string) {
  return value.replace(/\r\n?/g, "\n");
}

function tokens(value: string) {
  return value.trim().split(/\s+/).filter(Boolean);
}

function compareFloatTokens(actual: string[], expected: string[]) {
  if (actual.length !== expected.length) return false;
  return actual.every((token, index) => {
    const actualNumber = Number(token);
    const expectedNumber = Number(expected[index]);
    if (!Number.isFinite(actualNumber) || !Number.isFinite(expectedNumber)) {
      return token === expected[index];
    }
    const scale = Math.max(1, Math.abs(expectedNumber));
    return Math.abs(actualNumber - expectedNumber) <= FLOAT_TOLERANCE * scale;
  });
}
