import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { scoreContributionV1 } from "../src/scoring/scoringV1.js";
import type { ValidationResult } from "../src/types.js";

function load(dir: string): ValidationResult[] {
  const a = JSON.parse(readFileSync(join(dir, "a.json"), "utf8"));
  const b = JSON.parse(readFileSync(join(dir, "b.json"), "utf8"));
  const c = JSON.parse(readFileSync(join(dir, "c.json"), "utf8"));
  return [a, b, c];
}

describe("harness fixtures", () => {
  it("basic fixtures produce stable score", () => {
    const results = load("fixtures/simulations/basic");
    const r = scoreContributionV1({ results, trimFraction: 0 });
    expect(r.aggregate).toBeGreaterThan(0.5);
    expect(r.aggregate).toBeLessThan(1);
  });
});
