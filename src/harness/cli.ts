import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { scoreContributionV1 } from "../scoring/scoringV1.js";
import type { ValidationResult } from "../types.js";

const help = `
thynkai-validators harness

Usage:
  node dist/harness/cli.js score --fixtures ./fixtures/simulations/basic
  node dist/harness/cli.js score --fixtures ./fixtures/simulations/adversarial --trim 0.1 --weights ./fixtures/weights.json
`;

function argValue(args: string[], name: string, fallback?: string) {
  const i = args.indexOf(name);
  return i >= 0 ? (args[i + 1] ?? fallback) : fallback;
}

function hasFlag(args: string[], name: string) {
  return args.includes(name);
}

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || hasFlag(args, "--help") || hasFlag(args, "-h")) {
    console.log(help);
    process.exit(0);
  }

  const [cmd, ...rest] = args;

  if (cmd !== "score") {
    console.error("Unknown command.");
    console.log(help);
    process.exit(1);
  }

  const fixturesDir = argValue(rest, "--fixtures");
  if (!fixturesDir) {
    console.error("Missing --fixtures");
    process.exit(1);
  }

  const trim = Number(argValue(rest, "--trim", "0.1"));
  const weightsPath = argValue(rest, "--weights");

  const files = walk(fixturesDir).filter((p) => p.endsWith(".json"));
  const results: ValidationResult[] = files.map((p) => JSON.parse(readFileSync(p, "utf8")));

  const weights = weightsPath ? JSON.parse(readFileSync(weightsPath, "utf8")) : undefined;

  const report = scoreContributionV1({ results, validatorWeights: weights, trimFraction: trim });

  console.log(JSON.stringify(report, null, 2));
}

main();
