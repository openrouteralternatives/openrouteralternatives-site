/**
 * Extraction schema for gateway research.
 *
 * Every extracted value is a *candidate*: it carries the quote it was read
 * from and the page it came from, and it is written to
 * `research/firecrawl/candidates/`, never to the canonical dataset. A human
 * (or a later verification agent) compares each candidate with the primary
 * source before anything reaches `data/gateways.ts`.
 *
 * To collect a new field, add a property here and to `ExtractedGateway`; the
 * collect and extract scripts need no change.
 */

/** One claim with the evidence it rests on. */
const claim = (description: string, valueSchema: Record<string, unknown>) => ({
  type: "object",
  description,
  properties: {
    value: valueSchema,
    evidence: {
      type: "string",
      description: "Verbatim quote from the page that supports the value. Empty if not found.",
    },
    found: {
      type: "boolean",
      description: "True only if the page states this explicitly. Never infer.",
    },
  },
  required: ["found"],
});

export const GATEWAY_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    openaiCompatible: claim(
      "Whether the vendor documents an OpenAI-compatible API. 'partial' if only some endpoints are covered or a compatibility layer is required.",
      { type: "string", enum: ["yes", "partial", "no", "unknown"] },
    ),
    openaiCompatibleEndpoints: claim(
      "Which OpenAI API endpoints are documented as compatible (e.g. chat completions, responses, embeddings, audio).",
      { type: "array", items: { type: "string" } },
    ),
    modelCountClaim: claim(
      "A model count the vendor states about its own catalogue, exactly as written (e.g. '500+'). Not routes or endpoints.",
      { type: "string" },
    ),
    providerCountClaim: claim(
      "An upstream provider count the vendor states, exactly as written (e.g. '60+').",
      { type: "string" },
    ),
    endpointCountClaim: claim(
      "An endpoint or route count the vendor states, exactly as written, with what the vendor calls it.",
      { type: "string" },
    ),
    euResidencyClaim: claim(
      "What the vendor states about processing requests in the EU: default, optional region, specific routes, enterprise-only, or nothing.",
      { type: "string" },
    ),
    gatewayRegions: claim(
      "Regions where the gateway itself is documented to run.",
      { type: "array", items: { type: "string" } },
    ),
    certifications: claim(
      "Security or compliance certifications the vendor claims (SOC 2, ISO/IEC 27001, HIPAA...).",
      { type: "array", items: { type: "string" } },
    ),
    deploymentOptions: claim(
      "Documented deployment options: hosted, VPC, on-prem, self-hosted.",
      { type: "array", items: { type: "string", enum: ["hosted", "vpc", "on-prem", "self-hosted"] } },
    ),
    zeroDataRetention: claim(
      "Whether a zero-data-retention option is documented.",
      { type: "string", enum: ["yes", "no", "enterprise", "unknown"] },
    ),
    pricingTransparency: claim(
      "Whether pricing is public, public with an enterprise tier, or contact-sales only.",
      { type: "string", enum: ["public", "public-with-enterprise", "contact-sales", "unresolved"] },
    ),
    legalEntity: claim(
      "The operating legal entity named in terms, privacy policy or imprint, exactly as written.",
      { type: "string" },
    ),
    governingLaw: claim("Governing law or jurisdiction named in the terms.", { type: "string" }),
  },
} as const;

export const EXTRACTION_PROMPT =
  "You are extracting facts about an AI gateway / model routing product from one of its own public pages. " +
  "Report only what the page states explicitly, quoting the supporting text verbatim in `evidence`. " +
  "Set `found` to false and omit `value` when the page does not address a field. Never infer, estimate or fill from general knowledge.";

export interface Claim<T> {
  found: boolean;
  value?: T;
  evidence?: string;
}

export interface ExtractedGateway {
  openaiCompatible?: Claim<"yes" | "partial" | "no" | "unknown">;
  openaiCompatibleEndpoints?: Claim<string[]>;
  modelCountClaim?: Claim<string>;
  providerCountClaim?: Claim<string>;
  endpointCountClaim?: Claim<string>;
  euResidencyClaim?: Claim<string>;
  gatewayRegions?: Claim<string[]>;
  certifications?: Claim<string[]>;
  deploymentOptions?: Claim<("hosted" | "vpc" | "on-prem" | "self-hosted")[]>;
  zeroDataRetention?: Claim<"yes" | "no" | "enterprise" | "unknown">;
  pricingTransparency?: Claim<"public" | "public-with-enterprise" | "contact-sales" | "unresolved">;
  legalEntity?: Claim<string>;
  governingLaw?: Claim<string>;
}

export type ExtractedField = keyof ExtractedGateway;

export const EXTRACTED_FIELDS = Object.keys(
  GATEWAY_EXTRACTION_SCHEMA.properties,
) as ExtractedField[];
