# Validator onboarding spec

This document describes the minimum contract for validators used in ThynkAI workflows.

## Required fields

A validator must provide:
- stable `validatorId`
- semantic version `validatorVersion`
- deterministic behavior given the same request + seed
- a `ValidationResult` with:
  - `status`: pass | fail | error
  - `score` in [0, 1] (optional for fail/error)
  - `evidence.metrics`: record<string, number> (may be empty, but should be meaningful)
  - `provenance`: validator id, version, and executedAt ISO timestamp

## Status semantics

- pass: the benchmark completed and produced a score
- fail: the benchmark completed but did not meet criteria (score may be omitted)
- error: validator crashed or could not execute (include error fields)

## Evidence expectations

Evidence is treated as untrusted input. Validators should:
- keep metrics numeric and bounded where possible
- include clear metric naming (avoid ambiguous abbreviations)
- provide links to artifacts externally when relevant (do not embed large blobs)

## Security

Validators should avoid:
- arbitrary code execution from model inputs
- network access unless required and documented
- leaking secrets in logs or evidence

## Compatibility

Breaking changes require bumping `validatorVersion` and publishing migration notes.

