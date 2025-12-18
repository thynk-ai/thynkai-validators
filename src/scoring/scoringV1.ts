import type { ValidationResult } from "../types.js";

export type ScoringMethodV1 = "trimmed_mean_weighted_v1";

export interface ScoreDetailV1 {
  validatorId: string;
  validatorVersion: string;
  status: "pass" | "fail" | "error";
  base: number;
  completeness: number;
  weight: number;
  final: number;
}

export interface ScoreReportV1 {
  method: ScoringMethodV1;
  aggregate: number;
  details: readonly ScoreDetailV1[];
  diagnostics: Readonly<{
    included: number;
    excluded: number;
    trimFraction: number;
    totalWeight: number;
  }>;
}

/**
 * scoring v1:
 * - ignore fail/error (final=0)
 * - base = clamp01(score ?? 0.5)
 * - completeness = function(metricsCount)
 * - final = base * completeness
 * - aggregate = weighted trimmed mean (robust to outliers)
 */
export function scoreContributionV1(input: {
  results: readonly ValidationResult[];
  validatorWeights?: Readonly<Record<string, number>>;
  trimFraction?: number; // default 0.1 trims top/bottom 10% by weight
}): ScoreReportV1 {
  const trimFraction = clamp01(input.trimFraction ?? 0.1);

  const details: ScoreDetailV1[] = input.results.map((r) => {
    const validatorId = r.provenance.validatorId;
    const validatorVersion = r.provenance.validatorVersion;
    const weight = clamp01(input.validatorWeights?.[validatorId] ?? 1);

    if (r.status !== "pass") {
      return {
        validatorId,
        validatorVersion,
        status: r.status,
        base: 0,
        completeness: 0,
        weight,
        final: 0,
      };
    }

    const base = clamp01(r.score ?? 0.5);
    const metricsCount = Object.keys(r.evidence.metrics ?? {}).length;
    const completeness = completenessFactor(metricsCount);
    const final = clamp01(base * completeness);

    return { validatorId, validatorVersion, status: r.status, base, completeness, weight, final };
  });

  const passItems = details
    .filter((d) => d.status === "pass" && d.weight > 0)
    .map((d) => ({ x: d.final, w: d.weight }));

  const aggregate = weightedTrimmedMean(passItems, trimFraction);

  const totalWeight = passItems.reduce((s, i) => s + i.w, 0);
  const excluded = input.results.length - passItems.length;

  return {
    method: "trimmed_mean_weighted_v1",
    aggregate,
    details: Object.freeze(details),
    diagnostics: Object.freeze({
      included: passItems.length,
      excluded,
      trimFraction,
      totalWeight,
    }),
  };
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function completenessFactor(metricsCount: number): number {
  if (metricsCount >= 5) return 1;
  if (metricsCount === 4) return 0.95;
  if (metricsCount === 3) return 0.9;
  if (metricsCount === 2) return 0.8;
  if (metricsCount === 1) return 0.65;
  return 0.5;
}

/**
 * Weighted trimmed mean:
 * - sort by x
 * - trim trimFraction of total weight from both tails
 * - average remaining x using weights
 */
function weightedTrimmedMean(items: { x: number; w: number }[], trimFraction: number): number {
  if (items.length === 0) return 0;

  const xs = items
    .filter((i) => i.w > 0)
    .map((i) => ({ x: clamp01(i.x), w: i.w }))
    .sort((a, b) => a.x - b.x);

  const total = xs.reduce((s, i) => s + i.w, 0);
  if (total <= 0) return 0;

  const trimW = total * trimFraction;

  // trim low tail
  let lo = 0;
  let accLo = 0;
  while (lo < xs.length && accLo + xs[lo]!.w <= trimW) {
    accLo += xs[lo]!.w;
    lo++;
  }

  // trim high tail
  let hi = xs.length - 1;
  let accHi = 0;
  while (hi >= 0 && accHi + xs[hi]!.w <= trimW) {
    accHi += xs[hi]!.w;
    hi--;
  }

  if (lo > hi) return 0;

  let sum = 0;
  let wsum = 0;
  for (let i = lo; i <= hi; i++) {
    sum += xs[i]!.x * xs[i]!.w;
    wsum += xs[i]!.w;
  }
  return wsum > 0 ? sum / wsum : 0;
}
