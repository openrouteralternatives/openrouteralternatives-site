import type { Gateway } from "@/types";
import { unverified } from "@/types/field";
import { noMetric } from "@/lib/metric";

/**
 * Fields every record must declare. Everything else defaults to
 * "needs verification" so that an unfilled field can never be mistaken for a
 * researched one.
 */
type RequiredGatewayFields = Pick<
  Gateway,
  | "id"
  | "slug"
  | "name"
  | "website"
  | "summary"
  | "differentiator"
  | "type"
  | "tier"
  | "categories"
  | "jurisdictionBucket"
  | "lastVerified"
>;

export type GatewayInput = RequiredGatewayFields & Partial<Gateway>;

/**
 * Builds a complete `Gateway` from a partial record.
 *
 * Adding a new gateway therefore means writing down only what is sourced; the
 * comparison table, profile pages and category rankings all read the same
 * canonical object.
 */
export function createGateway(input: GatewayInput): Gateway {
  return {
    logo: null,
    legalEntity: unverified(),
    country: unverified(),
    countryCode: unverified(),
    city: unverified(),
    euJurisdiction: unverified(),
    founded: unverified(),
    employees: unverified(),
    funding: unverified(),
    ownership: unverified(),
    ownershipStatus: unverified(),
    parentCompany: unverified(),
    productStatus: unverified(),
    social: {
      linkedinUrl: null,
      xUrl: null,
      linkedinFollowers: unverified(),
      xFollowers: unverified(),
      snapshotDate: null,
    },
    models: noMetric("No comparable public model count was found for this gateway."),
    providers: noMetric("No public provider count was found for this gateway."),
    routes: noMetric("No route count is published for this gateway."),
    endpoints: noMetric("No endpoint count is published for this gateway."),
    modalities: unverified(),
    openaiCompatible: unverified(
      "OpenAI API compatibility has not been read from the vendor's documentation for this dataset revision.",
    ),
    observability: unverified(
      "Built-in observability has not been read from the vendor's documentation for this dataset revision.",
    ),
    gatewayLocations: unverified(),
    inferenceLocations: unverified(),
    euResidency: unverified(),
    zeroDataRetention: unverified(),
    deployment: unverified(),
    byok: unverified(),
    byom: unverified(),
    vpc: unverified(),
    onPrem: unverified(),
    openSource: unverified(),
    license: unverified(),
    repository: unverified(),
    certifications: unverified(),
    dpa: unverified(),
    subprocessors: unverified(),
    pricingModel: unverified(),
    pricingTransparency: unverified(),
    strengths: [],
    limitations: [],
    bestFor: [],
    sources: [],
    ...input,
  };
}
