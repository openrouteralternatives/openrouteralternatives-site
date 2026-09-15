import type { Field } from "./field";
import type { Source } from "./source";
import type { Metric } from "./metric";

/** Product shape, used by the "Gateway type" filter. */
export type GatewayType = "managed" | "enterprise" | "self-hosted" | "hyperscaler";

/** Dataset grouping from the project brief. */
export type GatewayTier = "primary" | "additional" | "self-hosted" | "hyperscaler";

/** Jurisdiction bucket used by the table filter. */
export type JurisdictionBucket = "eu" | "uk" | "us" | "other" | "unresolved";

/**
 * EU data residency labels. These describe the *gateway*, never the company's
 * place of incorporation — the two are separate attributes.
 */
export type EuResidency =
  | "eu-by-default"
  | "eu-available"
  | "eu-routes"
  | "enterprise-only"
  | "not-stated"
  | "self-hosted"
  | "needs-verification";

export type Modality =
  | "llm"
  | "vision"
  | "ocr"
  | "stt"
  | "tts"
  | "audio"
  | "image"
  | "video"
  | "translation"
  | "embeddings"
  | "documents"
  | "agents"
  | "mcp"
  | "reranking";

export type Deployment = "hosted" | "vpc" | "on-prem" | "self-hosted";

/** Who controls the company today. Material when evaluating a dependency. */
export type OwnershipStatus =
  | "independent"
  | "acquired"
  | "subsidiary"
  | "community"
  | "unresolved";

/** Whether the product is still actively developed. */
export type ProductStatus = "active" | "maintenance" | "unresolved";

/** How much of the pricing a prospect can see without contacting sales. */
export type PricingTransparency =
  | "public"
  | "public-with-enterprise"
  | "contact-sales"
  | "unresolved";

/** Yes/no questions where "we don't know" is a real and common answer. */
export type Capability = "yes" | "no" | "enterprise" | "unknown";

export interface EmployeeBand {
  /** LinkedIn company-size band, e.g. "11-50". */
  band: string;
  min: number;
  max: number | null;
}

export interface SocialSnapshot {
  linkedinUrl: string | null;
  xUrl: string | null;
  linkedinFollowers: Field<number>;
  xFollowers: Field<number>;
  /** ISO date both values were captured, so they stay comparable. */
  snapshotDate: string | null;
}

export interface Gateway {
  id: string;
  slug: string;
  name: string;
  /** Previous product name, where a rename would otherwise split the entry. */
  formerName?: string;
  /** Path under /public/logos, or null to fall back to a monogram. */
  logo: string | null;
  /** Official product URL, or null where it is not yet confirmed. */
  website: string | null;
  /** One neutral sentence describing what the product is. */
  summary: string;
  /** Short factual differentiator used on cards. Never promotional. */
  differentiator: string;

  type: GatewayType;
  tier: GatewayTier;
  /** Category slugs this gateway is eligible for. */
  categories: string[];

  // --- Company -------------------------------------------------------------
  legalEntity: Field<string>;
  country: Field<string>;
  countryCode: Field<string>;
  city: Field<string>;
  jurisdictionBucket: JurisdictionBucket;
  euJurisdiction: Field<boolean>;
  founded: Field<number>;
  employees: Field<EmployeeBand>;
  funding: Field<string>;
  ownership: Field<string>;
  ownershipStatus: Field<OwnershipStatus>;
  parentCompany: Field<string>;
  /** Whether the product is actively developed, maintained, or unclear. */
  productStatus: Field<ProductStatus>;
  social: SocialSnapshot;

  // --- Coverage ------------------------------------------------------------
  /**
   * Distinct models addressable through the public API.
   *
   * Never holds a route, endpoint or integration count — those have their own
   * fields, and conflating them is the single easiest way to mislead here.
   */
  models: Metric;
  /** Distinct upstream inference providers reachable through the gateway. */
  providers: Metric;
  /** Model x provider combinations. */
  routes: Metric;
  /** Individually addressable API entries, where a vendor publishes them. */
  endpoints: Metric;
  modalities: Field<Modality[]>;

  // --- Infrastructure ------------------------------------------------------
  gatewayLocations: Field<string[]>;
  inferenceLocations: Field<string[]>;
  euResidency: Field<EuResidency>;
  zeroDataRetention: Field<Capability>;
  deployment: Field<Deployment[]>;
  byok: Field<Capability>;
  byom: Field<Capability>;
  vpc: Field<Capability>;
  onPrem: Field<Capability>;
  openSource: Field<Capability>;
  license: Field<string>;
  repository: Field<string>;

  // --- Governance ----------------------------------------------------------
  certifications: Field<string[]>;
  dpa: Field<Capability>;
  subprocessors: Field<string>;
  pricingModel: Field<string>;
  pricingTransparency: Field<PricingTransparency>;

  // --- Editorial -----------------------------------------------------------
  /** Factual reasons teams evaluate it. No superlatives. */
  strengths: string[];
  /** Documented constraints and open questions. */
  limitations: string[];
  bestFor: string[];

  sources: Source[];
  /** ISO date the record as a whole was last reviewed. */
  lastVerified: string;
}

/** Extra columns for the self-hosted / open-source comparison. */
export interface SelfHostedDetail {
  gatewayId: string;
  runtime: Field<string>;
  observability: Field<string>;
  routing: Field<string>;
  enterpriseOptions: Field<string>;
  githubStars: Field<number>;
  maintainer: Field<string>;
}
