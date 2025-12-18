# Contributing to thynkai-validators

This repo defines validator-facing workflows. Correctness and compatibility matter.

## Development

```bash
npm ci
npm run ci
```

## Standards

- Deterministic scoring (given the same inputs).
- Clear invariants: normalization rules are explicit and tested.
- Explainability: scoring reports include per-validator detail.
- Safety: never assume untrusted validator output is correct.

## Review process

Maintainers review for:
- backwards compatibility and migration notes
- test coverage (edge cases + robustness)
- clarity of scoring semantics
- documentation updates (specs)

## Proposals

Open an issue first for:
- breaking changes to scoring semantics
- changes to evidence interpretation
- changes to onboarding requirements

