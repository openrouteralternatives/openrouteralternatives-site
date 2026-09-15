import type {
  Capability,
  DataStatus,
  Deployment,
  EuResidency,
  GatewayType,
  JurisdictionBucket,
  Modality,
  OwnershipStatus,
  PricingTransparency,
  ProductStatus,
} from "@/types";
import type { SourceKind } from "@/types/source";
import type { MetricStatus } from "@/types/metric";

export type Tone = "neutral" | "ok" | "info" | "warn" | "caution" | "brand";

interface Term {
  label: string;
  /** Shorter form used on badges where the full label would repeat nearby text. */
  badge?: string;
  /** Tooltip / help text. Explains what the label means, not how good it is. */
  description: string;
  tone: Tone;
}

/**
 * Evidence vocabulary for quantitative values.
 *
 * `short` is what the table shows under the number; `label` is the full name
 * used in legends and on profiles; `description` is the tooltip. Nothing here
 * describes missing data as a defect in the research.
 */
interface MetricTerm extends Term {
  short: string;
  /** Lucide icon name, resolved by the metric component. */
  icon: string;
}

export const METRIC_STATUS: Record<MetricStatus, MetricTerm> = {
  measured: {
    label: "Measured",
    short: "Measured",
    description:
      "Counted by this project directly from the provider's public model catalogue or API on the date shown.",
    tone: "ok",
    icon: "CircleCheckBig",
  },
  official: {
    label: "Officially published",
    short: "Official",
    description:
      "A current figure the provider publishes in its own documentation or product pages. Not a direct measurement, and it may use a different counting rule.",
    tone: "info",
    icon: "FileCheck",
  },
  catalogue: {
    label: "Official catalogue",
    short: "Catalogue",
    description:
      "Derived from an official public catalogue that the provider does not market as a headline number.",
    tone: "info",
    icon: "Database",
  },
  secondary: {
    label: "Reported",
    short: "Reported",
    description:
      "From a reputable third party, used only because no primary source publishes the figure. Weaker evidence than a measurement or an official statement.",
    tone: "neutral",
    icon: "Newspaper",
  },
  not_published: {
    label: "Not publicly listed",
    short: "Not published",
    description:
      "The provider publishes no comparable public figure. This is a gap in what the vendor discloses, not a gap in this dataset.",
    tone: "neutral",
    icon: "Minus",
  },
  variable: {
    label: "Variable",
    short: "Configured by you",
    description:
      "Availability depends on the providers and endpoints the customer configures. This is a property of the product's architecture, not missing data.",
    tone: "info",
    icon: "SlidersHorizontal",
  },
  not_comparable: {
    label: "Not directly comparable",
    short: "Different metric",
    description:
      "The provider publishes a figure, but it measures something else — routes, endpoints or provider/model combinations — so it is not comparable with a model catalogue count.",
    tone: "warn",
    icon: "Info",
  },
  conflicting: {
    label: "Multiple figures",
    short: "Multiple figures",
    description:
      "Credible sources currently report different figures. The disagreement is preserved rather than resolved by picking one without sufficient evidence.",
    tone: "warn",
    icon: "TriangleAlert",
  },
};

/** Order used by the legend beside the comparison table. */
export const METRIC_STATUS_ORDER: MetricStatus[] = [
  "measured",
  "official",
  "catalogue",
  "secondary",
  "not_published",
  "variable",
  "not_comparable",
  "conflicting",
];

export const DATA_STATUS: Record<DataStatus, Term> = {
  verified: {
    label: "Verified",
    description:
      "Checked against a primary source: the vendor's own site, documentation, a public API response or a company registry.",
    tone: "ok",
  },
  "vendor-stated": {
    label: "Vendor-stated",
    description:
      "Published by the vendor but not independently confirmed against a public model catalogue or registry.",
    tone: "info",
  },
  estimated: {
    label: "Estimated",
    description:
      "Derived from a documented range or band rather than an exact published figure.",
    tone: "warn",
  },
  "needs-verification": {
    label: "Not recorded",
    description:
      "No value is recorded for this field in the current dataset revision. It is not a judgement about the product.",
    tone: "neutral",
  },
  "not-published": {
    label: "Not publicly listed",
    description:
      "The company publishes no comparable public value for this field.",
    tone: "neutral",
  },
  conflicting: {
    label: "Unresolved",
    description:
      "Credible sources disagree. The disagreement is preserved rather than resolved by picking the more convenient side.",
    tone: "warn",
  },
  "not-disclosed": {
    label: "Not disclosed",
    description: "The company does not publish this information.",
    tone: "neutral",
  },
  "not-applicable": {
    label: "Not applicable",
    description: "This attribute does not apply to this kind of product.",
    tone: "neutral",
  },
};

export const GATEWAY_TYPE: Record<GatewayType, Term> = {
  managed: {
    label: "Managed",
    description:
      "A hosted, multi-provider gateway. Requests are sent to the vendor's endpoint and routed onward to upstream providers.",
    tone: "brand",
  },
  enterprise: {
    label: "Enterprise",
    description:
      "Positioned around governance, access control and deployment options for large organisations.",
    tone: "info",
  },
  "self-hosted": {
    label: "Self-hosted",
    description:
      "Runs inside infrastructure the customer controls. The vendor never receives the traffic.",
    tone: "neutral",
  },
  hyperscaler: {
    label: "Hyperscaler",
    description:
      "A cloud provider's own multi-model platform, billed and operated as part of that cloud.",
    tone: "neutral",
  },
};

export const JURISDICTION: Record<JurisdictionBucket, Term> = {
  eu: {
    label: "EU",
    badge: "EU",
    description: "The operating company is incorporated in an EU member state.",
    tone: "ok",
  },
  uk: {
    label: "UK",
    badge: "Non-EU",
    description: "The operating company is incorporated in the United Kingdom.",
    tone: "neutral",
  },
  us: {
    label: "US",
    badge: "Non-EU",
    description: "The operating company is incorporated in the United States.",
    tone: "neutral",
  },
  other: {
    label: "Other",
    badge: "Non-EU",
    description: "The operating company is incorporated outside the EU, UK and US.",
    tone: "neutral",
  },
  unresolved: {
    label: "Unresolved",
    badge: "Unresolved",
    description:
      "The operating legal entity has not been established from a registry or the vendor's own legal pages.",
    tone: "warn",
  },
};

export const EU_RESIDENCY: Record<EuResidency, Term> = {
  "eu-by-default": {
    label: "EU by default",
    description:
      "The gateway processes requests in the EU without the customer having to select a region.",
    tone: "ok",
  },
  "eu-available": {
    label: "EU available",
    description:
      "EU processing is offered as a configurable option on standard plans.",
    tone: "info",
  },
  "eu-routes": {
    label: "EU routes",
    description:
      "EU processing exists for a subset of routes or models rather than the whole catalogue.",
    tone: "warn",
  },
  "enterprise-only": {
    label: "Enterprise only",
    description:
      "EU processing is available, but only under an enterprise agreement.",
    tone: "caution",
  },
  "not-stated": {
    label: "Not stated",
    description:
      "The vendor publishes no claim about where requests are processed.",
    tone: "neutral",
  },
  "self-hosted": {
    label: "Customer controlled",
    description:
      "The customer runs the gateway, so residency follows wherever they deploy it.",
    tone: "info",
  },
  "needs-verification": {
    label: "Not established",
    description:
      "No residency claim has been read from the vendor's own documentation for this dataset. It is not a statement that the vendor lacks EU processing.",
    tone: "neutral",
  },
};

export const MODALITY: Record<Modality, Term> = {
  llm: { label: "LLM", description: "Text generation and chat completions.", tone: "neutral" },
  vision: { label: "Vision", description: "Image understanding as model input.", tone: "neutral" },
  ocr: { label: "OCR", description: "Text extraction from images and scans.", tone: "neutral" },
  stt: { label: "Speech", description: "Speech-to-text transcription.", tone: "neutral" },
  tts: { label: "TTS", description: "Text-to-speech synthesis.", tone: "neutral" },
  audio: { label: "Audio", description: "Other audio processing beyond speech-to-text and text-to-speech.", tone: "neutral" },
  image: { label: "Image", description: "Image generation and editing.", tone: "neutral" },
  video: { label: "Video", description: "Video generation or analysis.", tone: "neutral" },
  translation: { label: "Translation", description: "Machine translation.", tone: "neutral" },
  embeddings: { label: "Embeddings", description: "Vector embedding models.", tone: "neutral" },
  documents: { label: "Docs", description: "Document parsing and extraction.", tone: "neutral" },
  agents: { label: "Agents", description: "Agent orchestration or tool-calling features.", tone: "neutral" },
  mcp: { label: "MCP", description: "Model Context Protocol support.", tone: "neutral" },
  reranking: { label: "Reranking", description: "Relevance reranking models.", tone: "neutral" },
};

export const DEPLOYMENT: Record<Deployment, Term> = {
  hosted: {
    label: "Hosted",
    description: "Multi-tenant service operated by the vendor.",
    tone: "neutral",
  },
  vpc: {
    label: "VPC",
    description: "Deployed into the customer's own cloud account.",
    tone: "neutral",
  },
  "on-prem": {
    label: "On-prem",
    description: "Deployed in the customer's own data centre.",
    tone: "neutral",
  },
  "self-hosted": {
    label: "Self-hosted",
    description: "Run from source or a container by the customer.",
    tone: "neutral",
  },
};

export const CAPABILITY: Record<Capability, Term> = {
  yes: { label: "Yes", description: "Documented as available.", tone: "ok" },
  no: { label: "No", description: "Documented as unavailable.", tone: "neutral" },
  enterprise: {
    label: "Enterprise",
    description: "Available under an enterprise agreement.",
    tone: "caution",
  },
  unknown: {
    label: "Not stated",
    description:
      "The vendor's documentation does not state this either way.",
    tone: "neutral",
  },
};

export const OWNERSHIP_STATUS: Record<OwnershipStatus, Term> = {
  independent: {
    label: "Independent",
    description: "Not owned by another company on the record date.",
    tone: "neutral",
  },
  acquired: {
    label: "Acquired",
    description:
      "Bought by another company. Ownership changes can change a product's roadmap, pricing and data handling, so it is recorded as its own attribute.",
    tone: "caution",
  },
  subsidiary: {
    label: "Subsidiary",
    description: "Operated as part of a larger parent company.",
    tone: "info",
  },
  community: {
    label: "Community",
    description: "Governed as an open-source project rather than owned by one vendor.",
    tone: "info",
  },
  unresolved: {
    label: "Unresolved",
    description: "Ownership has not been established from a filing or vendor announcement.",
    tone: "neutral",
  },
};

export const PRODUCT_STATUS: Record<ProductStatus, Term> = {
  active: {
    label: "Active",
    description: "Actively developed on the record date.",
    tone: "ok",
  },
  maintenance: {
    label: "Maintenance",
    description:
      "Still available but no longer actively developed. Material when choosing a long-term dependency.",
    tone: "caution",
  },
  unresolved: {
    label: "Unresolved",
    description: "Development status has not been established.",
    tone: "neutral",
  },
};

export const PRICING_TRANSPARENCY: Record<PricingTransparency, Term> = {
  public: {
    label: "Public",
    description: "Pricing is published and can be evaluated without contacting sales.",
    tone: "ok",
  },
  "public-with-enterprise": {
    label: "Public + enterprise",
    description:
      "Standard pricing is published; enterprise terms are quoted separately.",
    tone: "info",
  },
  "contact-sales": {
    label: "Contact sales",
    description: "No public pricing; terms are quoted after a sales conversation.",
    tone: "caution",
  },
  unresolved: {
    label: "Unresolved",
    description: "Pricing disclosure has not been established.",
    tone: "neutral",
  },
};

export const SOURCE_KIND: Record<SourceKind, { label: string; icon: string }> = {
  "official-website": { label: "Official website", icon: "Globe" },
  "models-api": { label: "Models API", icon: "Terminal" },
  documentation: { label: "Documentation", icon: "BookOpen" },
  pricing: { label: "Pricing", icon: "Tag" },
  legal: { label: "Legal", icon: "Scale" },
  registry: { label: "Registry", icon: "Landmark" },
  linkedin: { label: "LinkedIn", icon: "Users" },
  x: { label: "X", icon: "AtSign" },
  repository: { label: "Repository", icon: "GitBranch" },
  "project-baseline": { label: "Project baseline", icon: "Database" },
};

/** Ordered option lists for the comparison filters. */
export const MODALITY_ORDER: Modality[] = [
  "llm",
  "vision",
  "ocr",
  "stt",
  "tts",
  "image",
  "video",
  "translation",
  "embeddings",
  "documents",
  "agents",
  "mcp",
  "reranking",
  "audio",
];

export const EU_RESIDENCY_ORDER: EuResidency[] = [
  "eu-by-default",
  "eu-available",
  "eu-routes",
  "enterprise-only",
  "self-hosted",
  "not-stated",
  "needs-verification",
];

export const DEPLOYMENT_ORDER: Deployment[] = ["hosted", "vpc", "on-prem", "self-hosted"];

export const JURISDICTION_ORDER: JurisdictionBucket[] = [
  "eu",
  "uk",
  "us",
  "other",
  "unresolved",
];

export const GATEWAY_TYPE_ORDER: GatewayType[] = [
  "managed",
  "enterprise",
  "self-hosted",
  "hyperscaler",
];
