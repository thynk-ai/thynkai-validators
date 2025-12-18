# thynkai-validators

Validation and scoring workflows for ThynkAI.

This repository contains:
- validator onboarding specs (how validators should behave and report results)
- scoring algorithms (v1) and reference implementations
- test harnesses for validators and result normalization
- simulation fixtures for scoring robustness tests

This repo is protocol-facing: changes should be deliberate and easy to audit.

## Layout

- `src/scoring/` — scoring algorithms (v1+)
- `src/harness/` — local harness for running validators against fixtures
- `src/spec/` — onboarding specs and contracts
- `fixtures/` — simulation data and example validation results
- `tests/` — unit + integration tests

## Quickstart

```bash
npm ci
npm run ci
```

## Links

- Org: https://github.com/thynkai
- Core protocol primitives: https://github.com/thynkai/thynkai-core
- Models registry: https://github.com/thynkai/thynkai-models
- Tooling: https://github.com/thynkai/thynkai-toolkits
- Docs hub: https://github.com/thynkai/thynkai-docs

