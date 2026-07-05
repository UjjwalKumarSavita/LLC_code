import { ComparisonMode, Verdict } from "../generated/prisma/enums";
import type { JudgeCaseResult } from "../judge/judge.contract";
import { outputsMatch } from "./output-comparator";
import { aggregateVerdict } from "./submission-processor";

describe("outputsMatch", () => {
  it("keeps exact comparison strict", () => {
    expect(
      outputsMatch({
        actual: "42\n",
        expected: "42",
        mode: ComparisonMode.EXACT
      })
    ).toBe(false);
  });

  it("supports trimmed and token comparisons", () => {
    expect(
      outputsMatch({
        actual: "  1  2 \n",
        expected: "1  2",
        mode: ComparisonMode.TRIMMED
      })
    ).toBe(true);
    expect(
      outputsMatch({
        actual: "1    2\n3",
        expected: "1 2 3",
        mode: ComparisonMode.TOKEN
      })
    ).toBe(true);
  });

  it("uses relative tolerance for floating-point output", () => {
    expect(
      outputsMatch({
        actual: "1000000.5",
        expected: "1000000",
        mode: ComparisonMode.FLOAT
      })
    ).toBe(true);
    expect(
      outputsMatch({
        actual: "1.1",
        expected: "1",
        mode: ComparisonMode.FLOAT
      })
    ).toBe(false);
  });
});

describe("aggregateVerdict", () => {
  const result = (verdict: Verdict): JudgeCaseResult => ({
    testCaseId: crypto.randomUUID(),
    verdict
  });

  it("returns accepted only when every case passes", () => {
    expect(
      aggregateVerdict([
        result(Verdict.ACCEPTED),
        result(Verdict.ACCEPTED)
      ])
    ).toBe(Verdict.ACCEPTED);
  });

  it("returns partial acceptance when at least one case passes", () => {
    expect(
      aggregateVerdict([
        result(Verdict.ACCEPTED),
        result(Verdict.WRONG_ANSWER)
      ])
    ).toBe(Verdict.PARTIALLY_ACCEPTED);
  });
});
