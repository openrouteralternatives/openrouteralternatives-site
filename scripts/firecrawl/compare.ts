import type { Gateway } from "@/types";
import type { Field } from "@/types/field";
import type { Metric } from "@/types/metric";
import { metricDisplay } from "@/lib/metric";
import type { CandidateClaim, GatewayCandidates } from "./claims";
import type { ExtractedField } from "./schema";

/**
 * Pure comparison of a candidates file with a gateway record. No I/O, so the
 * verdict rules are unit-tested in compare.test.ts and the CLI in diff.ts only
 * formats what this returns.
 *
 * A verdict is a hint for the reviewer, never a decision:
 *  - "matches"          the candidate agrees with the recorded value
 *  - "differs"          it does not; open the cited page
 *  - "dataset-empty"    the dataset has no value here, so the candidate may close an open field
 *  - "review"           free text that cannot be compared automatically
 *  - "no-dataset-field" the schema collects it but the dataset has no column for it
 */
export type Verdict = "matches" | "differs" | "dataset-empty" | "review" | "no-dataset-field";

export interface CandidateVerdict {
  candidate: CandidateClaim;
  shown: string;
  verdict: Verdict;
}

export interface FieldComparison {
  field: ExtractedField;
  /** Name of the dataset field compared against, or null when there is none. */
  datasetField: string | null;
  datasetValue: string | null;
  datasetStatus: string | null;
  candidates: CandidateVerdict[];
}

type Kind = "enum" | "text" | "list" | "count" | "entity" | "none";

const MAPPING: Record<ExtractedField, { datasetField: keyof Gateway | null; kind: Kind }> = {
  openaiCompatible: { datasetField: "openaiCompatible", kind: "enum" },
  openaiCompatibleEndpoints: { datasetField: null, kind: "none" },
  modelCountClaim: { datasetField: "models", kind: "count" },
  providerCountClaim: { datasetField: "providers", kind: "count" },
  endpointCountClaim: { datasetField: "endpoints", kind: "count" },
  euResidencyClaim: { datasetField: "euResidency", kind: "text" },
  gatewayRegions: { datasetField: "gatewayLocations", kind: "list" },
  certifications: { datasetField: "certifications", kind: "list" },
  deploymentOptions: { datasetField: "deployment", kind: "list" },
  zeroDataRetention: { datasetField: "zeroDataRetention", kind: "enum" },
  pricingTransparency: { datasetField: "pricingTransparency", kind: "enum" },
  legalEntity: { datasetField: "legalEntity", kind: "entity" },
  governingLaw: { datasetField: null, kind: "none" },
};

/** Lower-case, alphanumerics only: "SOC 2 Type II" and "soc2-type-ii" compare equal. */
export function normalizeToken(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

/** Company names compare without legal-form punctuation: "B.V." equals "BV". */
export function normalizeEntity(value: unknown): string {
  return normalizeToken(value);
}

/** The first number in a vendor figure: "1,600+ endpoints" → 1600. Null when none. */
export function numberIn(value: unknown): number | null {
  const match = String(value ?? "").replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

export function sameSet(a: unknown[], b: unknown[]): boolean {
  const left = new Set(a.map(normalizeToken));
  const right = new Set(b.map(normalizeToken));
  if (left.size !== right.size) return false;
  for (const item of left) if (!right.has(item)) return false;
  return true;
}

function show(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (value === null || value === undefined) return "";
  return String(value);
}

function isField(value: unknown): value is Field<unknown> {
  return Boolean(value) && typeof value === "object" && "status" in (value as object) && "value" in (value as object);
}

function isMetric(value: unknown): value is Metric {
  return Boolean(value) && typeof value === "object" && "current" in (value as object);
}

function judge(kind: Kind, datasetValue: unknown, candidate: unknown): Verdict {
  if (kind === "none") return "no-dataset-field";
  if (datasetValue === null || datasetValue === undefined) return "dataset-empty";
  switch (kind) {
    case "enum":
      return normalizeToken(datasetValue) === normalizeToken(candidate) ? "matches" : "differs";
    case "entity":
      return normalizeEntity(datasetValue) === normalizeEntity(candidate) ? "matches" : "differs";
    case "list": {
      const left = Array.isArray(datasetValue) ? datasetValue : [datasetValue];
      const right = Array.isArray(candidate) ? candidate : [candidate];
      return sameSet(left, right) ? "matches" : "differs";
    }
    case "count": {
      const left = numberIn(datasetValue);
      const right = numberIn(candidate);
      if (left === null || right === null) return "review";
      return left === right ? "matches" : "differs";
    }
    case "text":
    default:
      return "review";
  }
}

export function compareCandidates(gateway: Gateway, candidates: GatewayCandidates): FieldComparison[] {
  const comparisons: FieldComparison[] = [];
  for (const [field, claims] of Object.entries(candidates.fields) as [ExtractedField, CandidateClaim[]][]) {
    if (!claims?.length) continue;
    const mapping = MAPPING[field];
    let datasetValue: unknown = null;
    let datasetShown: string | null = null;
    let datasetStatus: string | null = null;

    if (mapping.datasetField) {
      const recorded = gateway[mapping.datasetField];
      if (isMetric(recorded)) {
        datasetValue = recorded.current.value ?? recorded.current.display ?? null;
        datasetShown = metricDisplay(recorded.current);
        datasetStatus = recorded.current.status;
        // A route count is the closest thing to an endpoint count where no
        // endpoint figure is recorded, and the reviewer should see it.
        if (field === "endpointCountClaim" && datasetValue === null && isMetric(gateway.routes)) {
          const routes = gateway.routes;
          if (routes.current.value !== undefined) {
            datasetValue = routes.current.value;
            datasetShown = `${metricDisplay(routes.current)} (routes)`;
            datasetStatus = routes.current.status;
          }
        }
      } else if (isField(recorded)) {
        datasetValue = recorded.value;
        datasetShown = recorded.value === null ? null : show(recorded.value);
        datasetStatus = recorded.status;
      }
    }

    comparisons.push({
      field,
      datasetField: mapping.datasetField,
      datasetValue: datasetShown,
      datasetStatus,
      candidates: claims.map((candidate) => ({
        candidate,
        shown: show(candidate.value),
        verdict: judge(mapping.kind, datasetValue, candidate.value),
      })),
    });
  }
  return comparisons;
}
