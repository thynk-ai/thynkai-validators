export type ValidationStatus = "pass" | "fail" | "error";

export interface Provenance {
  validatorId: string;
  validatorVersion: string;
  executedAt: string; // ISO
}

export interface ValidationEvidence {
  metrics: Readonly<Record<string, number>>;
  notes?: string;
}

export interface ValidationResult {
  runId: string;
  status: ValidationStatus;
  score?: number;
  evidence: ValidationEvidence;
  provenance: Provenance;
  errorCode?: string;
  errorMessage?: string;
}
