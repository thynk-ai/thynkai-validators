import { describe, it, expect } from "vitest";
import { scoreContributionV1 } from "../src/scoring/scoringV1.js";
import type { ValidationResult } from "../src/types.js";

function vr(p: Partial<ValidationResult> & { vid: string }): ValidationResult {
  return {
    runId: "run-1",
    status: p.status ?? "pass",
    score: p.score,
    evidence: p.evidence ?? { metrics: { a: 1, b: 2, c: 3, d: 4, e: 5 } },
    provenance: {
      validatorId: p.vid,
      validatorVersion: "1.0.0",
      executedAt: "2025-01-02T00:00:00.000Z",
    },
    errorCode: p.errorCode,
    errorMessage: p.errorMessage,
  };
}

describe("scoreContributionV1", () => {
  it("empty results -> 0", () => {
    const r = scoreContributionV1({ results: [] });
    expect(r.aggregate).toBe(0);
  });

  it("fail/error are excluded from aggregation", () => {
    const r = scoreContributionV1({
      results: [
        vr({ vid: "v1", status: "fail", score: 1 }),
        vr({ vid: "v2", status: "error", score: 1 }),
      ],
    });
    expect(r.aggregate).toBe(0);
    expect(r.diagnostics.included).toBe(0);
  });

  it("completeness penalizes missing metrics", () => {
    const r = scoreContributionV1({
      results: [vr({ vid: "v1", score: 1, evidence: { metrics: {} } })],
    });
    // completenessFactor(0)=0.5 so final=0.5
    expect(r.aggregate).toBeCloseTo(0.5, 8);
  });

  it("trimmed mean is robust to outliers", () => {
    const r = scoreContributionV1({
      results: [
        vr({ vid: "a", score: 0.7 }),
        vr({ vid: "b", score: 0.71 }),
        vr({ vid: "c", score: 0.69 }),
        vr({ vid: "hi", score: 1.0 }),
        vr({ vid: "lo", score: 0.0 }),
      ],
      trimFraction: 0.1,
    });
    expect(r.aggregate).toBeGreaterThan(0.6);
    expect(r.aggregate).toBeLessThan(0.8);
  });

  it("weights can shift aggregate", () => {
    const r = scoreContributionV1({
      results: [vr({ vid: "light", score: 0.2 }), vr({ vid: "heavy", score: 0.9 })],
      validatorWeights: { heavy: 10, light: 1 },
      trimFraction: 0,
    });
    expect(r.aggregate).toBeCloseTo(0.9, 8);
  });
});
