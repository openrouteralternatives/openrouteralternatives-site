import type { Target } from "./targets";
import { EXTRACTED_FIELDS, type Claim, type ExtractedField, type ExtractedGateway } from "./schema";

/**
 * Candidate claims: what an extraction said, where it read it, and when.
 * Pure data shaping shared by extract.ts and diff.ts, tested in claims.test.ts.
 */

export interface CandidateClaim {
  value: unknown;
  evidence: string | null;
  sourceUrl: string;
  sourceKind: string;
  retrieved: string;
}

export interface GatewayCandidates {
  gatewaySlug: string;
  gatewayName: string;
  generatedAt: string;
  /** Always "candidate": these values have not been verified. */
  status: "candidate";
  pagesQueried: string[];
  pagesFailed: { url: string; error: string }[];
  fields: Partial<Record<ExtractedField, CandidateClaim[]>>;
}

export function emptyCandidates(slug: string, name: string, generatedAt: string): GatewayCandidates {
  return {
    gatewaySlug: slug,
    gatewayName: name,
    generatedAt,
    status: "candidate",
    pagesQueried: [],
    pagesFailed: [],
    fields: {},
  };
}

/**
 * Append every claim a page made to the per-gateway candidate list. A claim
 * is kept only when the model marked it as found on the page and gave a
 * value; disagreements between pages are kept side by side, never resolved.
 */
export function collectClaims(
  extracted: ExtractedGateway,
  target: Pick<Target, "url" | "kind">,
  retrieved: string,
  into: GatewayCandidates["fields"],
): number {
  let added = 0;
  for (const field of EXTRACTED_FIELDS) {
    const claim = extracted[field] as Claim<unknown> | undefined;
    if (!claim?.found || claim.value === undefined || claim.value === null) continue;
    if (typeof claim.value === "string" && claim.value.trim() === "") continue;
    if (Array.isArray(claim.value) && claim.value.length === 0) continue;
    (into[field] ??= []).push({
      value: claim.value,
      evidence: claim.evidence?.trim() || null,
      sourceUrl: target.url,
      sourceKind: target.kind,
      retrieved,
    });
    added += 1;
  }
  return added;
}
