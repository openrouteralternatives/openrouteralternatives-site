import type {
  Capability,
  DataStatus,
  EmployeeBand,
  EuResidency,
  Funding,
  Gateway,
  ObservabilityLevel,
} from "@/types";
import type { Source } from "@/types/source";
import type { MetricValue } from "@/types/metric";
import { field, notApplicable, notPublishedField, unverified } from "@/types/field";
import { createGateway } from "@/lib/create-gateway";
import { formatCount } from "@/lib/format";
import {
  catalogueCount,
  measured,
  metric,
  notComparable,
  notPublished,
  official,
  variable,
} from "@/lib/metric";

/**
 * CANONICAL GATEWAY DATASET
 * =========================
 *
 * This file is the single source of truth for every gateway shown on the site.
 * The comparison table, profile pages and category rankings all read from it.
 *
 * Editorial rules that govern what may appear here:
 *
 *  1. A field carries a value only when it is supported by the project's
 *     research: the September 8, 2026 measured baseline, the September 15,
 *     2026 endpoint measurements, the September 17, 2026 verified research
 *     pass over vendor sites and company profiles, or unambiguous public
 *     record (an open-source licence, a cloud provider's regions).
 *  2. Anything else stays `needs-verification` with `value: null`. Never
 *     substitute a plausible number for a researched one, and never resolve a
 *     conflict between sources by picking the more convenient side.
 *  3. Model counts are dated observations, not attributes. Measured counts and
 *     vendor-stated counts are stored as separate observations and are never
 *     mixed inside one ranking.
 *  4. Models, routes and providers are three different quantities. A route is
 *     a model x provider combination; an endpoint is an addressable API entry
 *     as the vendor publishes it. Never present routes or endpoints as models.
 *  5. Company jurisdiction is recorded separately from gateway location and
 *     from inference location. EU incorporation is never written into
 *     `euResidency`.
 *  6. `openaiCompatible` is recorded only from the vendor's own documentation
 *     or from an endpoint this project exercised. It is never inferred from
 *     the product category, and it is never used to rank anything.
 *  7. `logo` points at a locally stored asset under /public/logos taken from
 *     the vendor's own site. Entries without one render a monogram; nothing
 *     hotlinks a third party's image. See public/logos/README.md for the
 *     provenance of each file.
 *  8. The September 17, 2026 research pass is the source of truth for current
 *     vendor figures and company attributes. Where it publishes a figure, that
 *     figure is `current` and earlier measurements stay on record in
 *     `history`; where it publishes none, this project's own dated measurement
 *     remains current. Nothing is overwritten.
 *  9. `funding` and `observability` come from the September 18, 2026 funding
 *     and observability research pass. Funding describes the operating
 *     company, never the product alone; a corporate product or community
 *     project records `not-applicable`, and funding that could not be publicly
 *     verified records `not-published` rather than zero. Observability levels
 *     are read from vendor documentation against the five-step scale in the
 *     methodology and are never inferred from the product category.
 *
 * `qualifier: "at-least"` marks a vendor floor such as "50+". The number still
 * sorts normally; the UI renders the plus sign so a floor is never shown as an
 * exact count.
 */

/** Date the baseline catalogue counts in this file were taken. */
export const BASELINE_DATE = "2026-09-08";

/** Date the public model endpoints were last enumerated by this project. */
export const MEASUREMENT_DATE = "2026-09-15";

/** Date this dataset revision was assembled: the verified research pass. */
export const DATASET_DATE = "2026-09-17";

/** Date the funding and observability research pass was applied. */
export const FUNDING_OBSERVABILITY_DATE = "2026-09-18";

const baselineSource = (): Source => ({
  id: "baseline",
  kind: "project-baseline",
  label: "Sep 8, 2026 baseline",
  url: null,
  retrieved: BASELINE_DATE,
});

/** The verified research pass that this revision applies. */
const researchSource = (): Source => ({
  id: "research",
  kind: "project-baseline",
  label: "Sep 17, 2026 verified research",
  url: null,
  retrieved: DATASET_DATE,
});

/**
 * Funding and observability citations name where each fact was read in the
 * label and carry no link, following the registry convention: announcement
 * and database URLs change too often to construct without checking each one.
 */
const fundingSource = (reference: string): Source => ({
  id: "funding",
  kind: "project-baseline",
  label: `Funding research — ${reference}`,
  url: null,
  retrieved: FUNDING_OBSERVABILITY_DATE,
});

const observabilitySource = (reference = "vendor public material"): Source => ({
  id: "observability",
  kind: "project-baseline",
  label: `Observability research — ${reference}`,
  url: null,
  retrieved: FUNDING_OBSERVABILITY_DATE,
});

const modelsEndpointSource = (
  url: string | null = null,
  retrieved: string = MEASUREMENT_DATE,
): Source => ({
  id: "models-endpoint",
  kind: "models-api",
  label: "Public models endpoint",
  url,
  retrieved,
});

const providersEndpointSource = (url: string): Source => ({
  id: "providers-endpoint",
  kind: "models-api",
  label: "Public providers endpoint",
  url,
  retrieved: MEASUREMENT_DATE,
});

const siteSource = (url: string): Source => ({
  id: "site",
  kind: "official-website",
  label: "Official website",
  url,
  retrieved: DATASET_DATE,
});

const repoSource = (url: string): Source => ({
  id: "repo",
  kind: "repository",
  label: "Public repository",
  url,
});

const docsSource = (url: string): Source => ({
  id: "docs",
  kind: "documentation",
  label: "Documentation",
  url,
  retrieved: DATASET_DATE,
});

const pricingSource = (url: string): Source => ({
  id: "pricing",
  kind: "pricing",
  label: "Pricing page",
  url,
  retrieved: DATASET_DATE,
});

const legalSource = (url: string | null = null): Source => ({
  id: "legal",
  kind: "legal",
  label: "Legal pages",
  url,
  retrieved: DATASET_DATE,
});

/**
 * Registry citations carry the register and the company number in the label
 * rather than a deep link, because registry URL formats are not stable enough
 * to construct without checking each one.
 */
const registrySource = (label: string): Source => ({
  id: "registry",
  kind: "registry",
  label,
  url: null,
  retrieved: DATASET_DATE,
});

const xSource = (handle: string): Source => ({
  id: "x",
  kind: "x",
  label: `@${handle}`,
  url: `https://x.com/${handle}`,
  retrieved: DATASET_DATE,
});

const linkedinSource = (url: string): Source => ({
  id: "linkedin",
  kind: "linkedin",
  label: "LinkedIn company profile",
  url,
  retrieved: DATASET_DATE,
});

/**
 * The counting rule applied to every measurement in this file.
 *
 * Applied identically to every catalogue so the resulting figures can be
 * ranked against one another.
 */
const COUNT_RULE =
  "Distinct model identifiers in the public catalogue, after removing exact duplicates, serving-provider prefixes, routing variants and non-model pseudo-entries.";

/** Applied to every product-surface field taken from a vendor's own material. */
const VENDOR_NOTE =
  "Taken from the vendor's own published material. Not independently re-measured for this dataset.";

/** Applied to fields with no researched value in the current revision. */
const OPEN_FIELD =
  "Open in the current dataset revision. Awaiting a primary-source check.";

/** Appended wherever EU incorporation is recorded, so it is never read as residency. */
const EU_NOTE =
  "EU-incorporated. This says nothing on its own about where requests are processed.";

// ---------------------------------------------------------------------------
// Field helpers for the attributes the research pass records in the same form
// for every gateway. Each one fixes the status and the source id, so a value
// cannot be recorded without saying where it came from.
// ---------------------------------------------------------------------------

/** Parses a LinkedIn company-size band such as "11-50", "1,001-5,000" or "10,001+". */
function band(label: string): EmployeeBand {
  const [lo, hi] = label.replace(/,/g, "").split("-");
  return { band: label, min: Number(lo.replace("+", "")), max: hi ? Number(hi) : null };
}

const employees = (label: string, note = "LinkedIn company-size band.") =>
  field(band(label), "verified", { note, sources: ["linkedin"], asOf: DATASET_DATE });

type Network = "LinkedIn" | "X";
const networkSource = (network: Network) => [network === "LinkedIn" ? "linkedin" : "x"];

const exactFollowers = (n: number, network: Network) =>
  field(n, "verified", {
    note: `Exact ${network} follower count captured on the snapshot date.`,
    sources: networkSource(network),
  });

const approxFollowers = (n: number, network: Network) =>
  field(n, "estimated", {
    note: `Approximate ${network} follower count, rounded by scale, captured on the snapshot date.`,
    sources: networkSource(network),
  });

const floorFollowers = (n: number, network: Network) =>
  field(n, "estimated", {
    note: `${network} follower count published as a floor on the snapshot date.`,
    sources: networkSource(network),
    qualifier: "at-least",
  });

/** A capability the vendor's public material does not address either way. */
const notStated = (what: string) =>
  field<Capability>("unknown", "verified", {
    note: `The vendor's public material does not state a ${what} position.`,
    sources: ["research"],
    asOf: DATASET_DATE,
  });

/**
 * Disclosed financing of the operating company, from the funding research pass.
 *
 * `rounds` counts disclosed financing rounds only. Grants, strategic
 * investments outside a disclosed round and acquisitions are described in the
 * note and never counted. Where credible databases disagree on the count, the
 * status is `conflicting` and the note preserves both figures.
 */
const funding = (
  rounds: number,
  investors: string[],
  extra: { note?: string; totalRaised?: string; status?: DataStatus } = {},
) =>
  field<Funding>(
    { rounds, investors, ...(extra.totalRaised ? { totalRaised: extra.totalRaised } : {}) },
    extra.status ?? "verified",
    {
      ...(extra.note ? { note: extra.note } : {}),
      sources: ["funding"],
      asOf: FUNDING_OBSERVABILITY_DATE,
    },
  );

/** No credible public record of a financing round was found. Never written as zero. */
const fundingNotPublished = (
  note = "No financing announcement or credible public record of a funding round was found. No round count is recorded rather than a guess.",
) => notPublishedField<Funding>(note);

/**
 * Built-in observability against the five-step scale, read from the vendor's
 * documentation. `estimated` marks a level supported only by the absence of
 * richer public material rather than by a documented feature set.
 */
const observability = (
  level: ObservabilityLevel,
  note: string,
  status: "vendor-stated" | "estimated" = "vendor-stated",
) =>
  field<ObservabilityLevel>(level, status, {
    note,
    sources: ["observability"],
    asOf: FUNDING_OBSERVABILITY_DATE,
  });

/** No residency claim found in the vendor's public material. */
const residencyNotStated = () =>
  field<EuResidency>("not-stated", "verified", {
    note: "No claim about where requests are processed was found in the vendor's public material.",
    sources: ["research"],
    asOf: DATASET_DATE,
  });

const noCertifications = () =>
  notPublishedField<string[]>(
    "The vendor does not publicly state any security certifications.",
  );

/**
 * A count read from a vendor's own catalogue or documentation page.
 *
 * Vendor pages change often, so an exact-looking figure copied from one is
 * shown as a floor rounded down to the nearest ten (72 -> "70+", 292 ->
 * "290+"). Counts under 20 stay exact, because a ten-step floor would hide
 * more than it protects. The exact figure remains the sortable value and is
 * stated in the note, so nothing is lost.
 *
 * `documented` is for integration counts of customer-configured gateways:
 * shown and sortable, never ranked against hosted catalogues.
 */
const listed = (
  n: number,
  status: "official" | "catalogue" | "documented",
  date: string,
  extra: {
    sourceIds: string[];
    note?: string;
    scope?: MetricValue["scope"];
    display?: string;
  },
): MetricValue => {
  const rounded = n >= 20 && n % 10 !== 0;
  const floor = Math.floor(n / 10) * 10;
  const display = extra.display ?? (n < 20 ? formatCount(n) : `${formatCount(floor)}+`);
  const provenance = rounded
    ? `Listed as ${formatCount(n)} on the source page; shown as a floor because vendor pages change often.`
    : "";
  return {
    value: n,
    display,
    status,
    date,
    sourceIds: extra.sourceIds,
    scope: extra.scope,
    note: [provenance, extra.note].filter(Boolean).join(" ") || undefined,
  };
};

export const gateways: Gateway[] = [
  // ---------------------------------------------------------------------
  // Primary managed, multi-provider gateways and model routers
  // ---------------------------------------------------------------------
  createGateway({
    id: "eden-ai",
    slug: "eden-ai",
    name: "Eden AI",
    website: "https://www.edenai.co",
    logo: "/logos/eden-ai.png",
    summary:
      "A multi-provider AI API that exposes generative and non-generative models — text, speech, vision, OCR and document processing — behind one interface.",
    differentiator:
      "EU-native multi-provider AI gateway with routing, failover and broad expert-model coverage.",
    type: "managed",
    tier: "primary",
    categories: ["largest-model-catalogues", "provider-networks", "eu-gateways", "eu-hosted", "multimodal", "enterprise", "agent-gateways"],
    jurisdictionBucket: "eu",
    country: field("France", "verified", { sources: ["site", "research"], asOf: DATASET_DATE }),
    countryCode: field("FR", "verified", { sources: ["site"] }),
    euJurisdiction: field(true, "verified", { note: EU_NOTE, sources: ["site"] }),
    legalEntity: unverified(
      "The operating entity name has not been read from a registry filing for this dataset.",
    ),
    ownershipStatus: field("independent", "verified", { sources: ["research"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: employees("11-50"),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/edenai/",
      xUrl: "https://x.com/edenaico",
      linkedinFollowers: exactFollowers(13481, "LinkedIn"),
      xFollowers: exactFollowers(612, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      listed(870, "catalogue", DATASET_DATE, {
        scope: "all-modalities",
        sourceIds: ["site", "research"],
        note: "Official catalogue count across every modality on September 17, 2026. The marketing site states 500+ models. Not an LLM-only figure, so it is never ranked against the measured LLM catalogues.",
      }),
      [
        measured(638, MEASUREMENT_DATE, {
          scope: "llm",
          sourceIds: ["models-endpoint"],
          note: `${COUNT_RULE} Counted from the public LLM catalogue, which is the only Eden AI catalogue exposed as an enumerable endpoint; its OCR, speech, image, video and document models are not individually listed there.`,
        }),
        official("500+", DATASET_DATE, {
          sourceIds: ["site"],
          note: "Vendor floor published on the marketing site, lower than both the catalogue count and the measurements.",
        }),
      ],
    ),
    providers: metric(
      official("60+", DATASET_DATE, {
        sourceIds: ["site", "research"],
        note: "Officially stated floor. Between 33 and 68 providers are reached depending on which feature scopes are counted.",
      }),
      [
        measured(68, MEASUREMENT_DATE, {
          sourceIds: ["providers-endpoint"],
          note: "Distinct providers across all nine features exposed by the public provider/subfeature endpoint.",
        }),
      ],
    ),
    routes: metric(
      notPublished("Multiple API surfaces; the vendor publishes no single route total."),
    ),
    endpoints: metric(
      measured(428, MEASUREMENT_DATE, {
        sourceIds: ["providers-endpoint"],
        note: "Provider x subfeature combinations exposed publicly, of which 425 were reported working. A project measurement; the vendor publishes no endpoint total of its own.",
      }),
    ),
    modalities: field(
      [
        "llm",
        "vision",
        "ocr",
        "stt",
        "tts",
        "image",
        "audio",
        "video",
        "translation",
        "documents",
        "embeddings",
        "mcp",
      ],
      "vendor-stated",
      {
        note: "Eleven modalities documented by the vendor, plus Model Context Protocol support: the documentation's MCP Server page states that Eden AI's expert models are available as MCP tools, so any MCP client or LLM agent loop can call OCR, web search, speech and translation. The vendor also lists web capabilities, which are not a modality in this taxonomy.",
        sources: ["site", "docs", "research"],
        asOf: DATASET_DATE,
      },
    ),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "The vendor documents an OpenAI-compatible surface. Which endpoints beyond chat completions are covered has not been checked for this dataset.",
      sources: ["site"],
    }),
    deployment: field(["hosted", "private"], "vendor-stated", {
      note: "The pricing page lists private deployments for specific compliance needs on the Advanced AI Platform (custom) plan. It does not say whether they run in the customer's cloud or on-premise, so the option is recorded as private rather than as VPC or on-premise.",
      sources: ["pricing", "research"],
    }),
    gatewayLocations: field(["France", "EU endpoint"], "vendor-stated", {
      sources: ["research"],
    }),
    openSource: field("no", "verified", { sources: ["site"] }),
    certifications: field(["SOC 2", "ISO/IEC 27001"], "vendor-stated", {
      note: "Published in the vendor's own security material. The certified scope has not been read from the certificates themselves.",
      sources: ["site"],
    }),
    zeroDataRetention: field("yes", "vendor-stated", {
      note: "Zero data retention is documented for the dedicated EU endpoint and is part of the vendor's published positioning.",
      sources: ["site", "research"],
    }),
    euResidency: field("eu-by-default", "vendor-stated", {
      note: "A dedicated EU endpoint provides EU processing with zero data retention and GDPR-ready documentation.",
      sources: ["site", "research"],
      asOf: DATASET_DATE,
    }),
    pricingTransparency: field("public-with-enterprise", "verified", {
      note: "Per-subfeature pricing is published in the public provider/subfeature endpoint; enterprise terms are quoted separately.",
      sources: ["providers-endpoint", "research"],
      asOf: DATASET_DATE,
    }),
    funding: funding(
      2,
      [
        "Galion.exe",
        "50 Partners",
        "Olivier Pomel",
        "Sébastien Pahl",
        "Alix de Sagazan",
      ],
      {
        totalRaised: "$4.5M",
        note: "A €1.5M round in 2022 followed by a €3M seed round led by Galion.exe, with further angel investors beyond those named. The company's own site states $4.5M raised in total.",
      },
    ),
    observability: observability(
      "advanced",
      "Real-time monitoring of latency, errors and throughput, usage reports with graphs and charts, error tracking and log management, and centralised monitoring of costs, performance and the integrated AI services.",
    ),
    strengths: [
      "Broadest documented modality coverage in this dataset: eleven modalities including OCR, speech, translation, video and document processing alongside text.",
      "EU-incorporated with EU processing by default through a dedicated EU endpoint, zero data retention, SOC 2 and ISO/IEC 27001 stated.",
      "Largest official catalogue among EU-incorporated entries at 870 models, with 360 LLM models measured directly from the public endpoint on September 15, 2026.",
      "78 upstream providers measured on September 15, 2026, above the 50+ floor the vendor states.",
      "Expert models are exposed as MCP tools, so an MCP client or agent loop can call OCR, web search, speech and translation through the gateway.",
    ],
    limitations: [
      "The operating legal entity has not been read from a registry filing for this dataset.",
      "Private deployment is offered on the custom plan, but the vendor does not say whether it is a customer-cloud or on-premise deployment.",
      "Only the LLM catalogue is individually enumerable from the public API, so the measured LLM count covers less of the platform than the 870-model catalogue figure.",
      "No single route or endpoint total is published across its API surfaces; the 428 provider x subfeature endpoints are a project measurement.",
      "Certifications are stated by the vendor and have not been checked against the certificates themselves.",
    ],
    bestFor: [
      "Teams that need several modalities behind one API rather than text generation alone.",
      "EU buyers who want an EU-incorporated vendor with EU processing by default.",
    ],
    sources: [
      researchSource(),
      baselineSource(),
      modelsEndpointSource("https://api.edenai.run/v2/llm/models"),
      providersEndpointSource("https://api.edenai.run/v2/info/provider_subfeatures"),
      siteSource("https://www.edenai.co"),
      docsSource("https://www.edenai.co/docs/v3/expert-models/mcp-server"),
      pricingSource("https://www.edenai.co/pricing"),
      linkedinSource("https://www.linkedin.com/company/edenai/"),
      xSource("edenaico"),
      fundingSource("edenai.co"),
      observabilitySource("help.edenai.co"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "requesty",
    slug: "requesty",
    name: "Requesty",
    website: "https://www.requesty.ai",
    logo: "/logos/requesty.png",
    summary:
      "A managed LLM routing layer that sits in front of multiple upstream providers behind a single API, with an EU gateway hosted on AWS in France.",
    differentiator:
      "OpenAI-compatible multi-provider gateway with explicit model-versus-endpoint catalogue views.",
    type: "managed",
    tier: "primary",
    categories: ["largest-model-catalogues", "provider-networks", "eu-hosted", "multimodal"],
    jurisdictionBucket: "uk",
    legalEntity: field("REQUESTY LTD", "verified", {
      note: "Companies House number 15165717.",
      sources: ["registry"],
      asOf: DATASET_DATE,
    }),
    country: field("United Kingdom", "verified", { sources: ["registry", "research"] }),
    countryCode: field("GB", "verified", { sources: ["registry"] }),
    city: field("London", "verified", { sources: ["registry"] }),
    euJurisdiction: field(false, "verified", {
      note: "UK-incorporated, so outside EU jurisdiction. This is a separate question from where its gateway sits.",
      sources: ["registry"],
    }),
    ownershipStatus: field("independent", "verified", { sources: ["registry", "research"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: employees("2-10"),
    euResidency: field("eu-available", "vendor-stated", {
      note: "An EU gateway endpoint hosted on AWS in France is documented. Gateway location is not the same as inference location, which is set per upstream provider.",
      sources: ["docs", "research"],
      asOf: DATASET_DATE,
    }),
    gatewayLocations: field(["London", "EU endpoint / AWS France"], "vendor-stated", {
      sources: ["research"],
    }),
    subprocessors: field("Published subprocessor list", "vendor-stated", {
      note: "Subprocessors are enumerated publicly rather than described in general terms.",
      sources: ["legal"],
    }),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/requesty-ai/",
      xUrl: "https://x.com/RequestyAI",
      linkedinFollowers: approxFollowers(3700, "LinkedIn"),
      xFollowers: approxFollowers(760, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      listed(211, "catalogue", DATASET_DATE, {
        scope: "llm",
        sourceIds: ["site", "research"],
        note: "The vendor's catalogue page separates 211 unique models from 684 unique endpoints across 32 providers. Its 600+ headline tracks the endpoint count rather than the deduplicated model count.",
      }),
      [
        official("600+", DATASET_DATE, {
          sourceIds: ["site"],
          note: "Vendor headline, which corresponds to the endpoint count rather than the deduplicated model count.",
        }),
        measured(545, MEASUREMENT_DATE, {
          scope: "llm",
          sourceIds: ["models-endpoint"],
          note: `${COUNT_RULE} The endpoint exposed 684 provider/model entries; 88 model names were served by more than one provider, and collapsing those left 545 distinct models.`,
        }),
        measured(708, BASELINE_DATE, {
          sourceIds: ["baseline"],
          note: "Project baseline figure, which counted addressable endpoints rather than deduplicated models. Preserved; never overwritten by the current grouped count.",
        }),
      ],
    ),
    providers: metric(
      listed(32, "official", DATASET_DATE, {
        sourceIds: ["site", "research"],
        note: "Provider count published on the vendor's catalogue page.",
      }),
      [
        measured(33, MEASUREMENT_DATE, {
          sourceIds: ["models-endpoint"],
          note: "Distinct serving-provider prefixes in the public catalogue, one higher than the vendor's count.",
        }),
      ],
    ),
    endpoints: metric(
      measured(684, MEASUREMENT_DATE, {
        sourceIds: ["models-endpoint"],
        note: "Provider/model endpoints in the public catalogue. This matches the 684 unique endpoints the vendor publishes on its catalogue page.",
      }),
    ),
    modalities: field(["llm", "vision", "image", "stt", "tts", "embeddings"], "vendor-stated", {
      note: "The vendor lists LLM, vision, image, speech, transcription and embeddings.",
      sources: ["site", "research"],
      asOf: DATASET_DATE,
    }),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "Documented as an OpenAI-compatible API, and the public catalogue was read from an OpenAI-style /v1/models endpoint.",
      sources: ["docs", "models-endpoint"],
    }),
    deployment: field(["hosted"], "vendor-stated", { sources: ["research"] }),
    zeroDataRetention: notStated("zero-data-retention"),
    certifications: field(["ISO/IEC 27001", "SOC 2 Type II"], "vendor-stated", {
      sources: ["site", "research"],
    }),
    pricingTransparency: field("public-with-enterprise", "verified", {
      note: "Per-model input, cached and output pricing is published in the public model endpoint; enterprise terms are quoted separately.",
      sources: ["models-endpoint", "research"],
      asOf: DATASET_DATE,
    }),
    funding: funding(
      1,
      [
        "20VC (The Twenty Minute VC)",
        "Tapestry VC",
        "Insiders Ventures",
        "Tiny Supercomputer Investment Company",
      ],
      {
        note: "A $3M seed round announced in September 2025.",
      },
    ),
    observability: observability(
      "advanced",
      "Request-level token, cost and latency data, spend over time, breakdowns by model, team, user, key and origin, metadata filters, P50 to P99 latency percentiles, sessions, tool calls, budgets, alerts and audit logs.",
    ),
    strengths: [
      "Unusually transparent catalogue: models, endpoints and providers are published as three separate figures (211, 684 and 32), which almost no other entry here does.",
      "A named EU gateway on AWS in France and a published subprocessor list, alongside ISO/IEC 27001 and SOC 2 Type II.",
      "Largest LLM catalogue measured by this project on September 15, 2026, at 545 distinct models across 684 endpoints.",
    ],
    limitations: [
      "UK-incorporated, so it does not qualify as an EU-incorporated vendor even though its gateway sits in the EU.",
      "The 600+ headline tracks endpoints rather than deduplicated models; the vendor's own catalogue page puts unique models at 211.",
      "A 2–10 person company, and no zero-data-retention position is stated.",
    ],
    bestFor: [
      "Teams that need EU gateway processing and want the subprocessor chain written down.",
    ],
    sources: [
      researchSource(),
      baselineSource(),
      modelsEndpointSource("https://router.requesty.ai/v1/models"),
      siteSource("https://www.requesty.ai/models"),
      docsSource("https://docs.requesty.ai"),
      registrySource("Companies House 15165717"),
      legalSource(),
      linkedinSource("https://www.linkedin.com/company/requesty-ai/"),
      xSource("RequestyAI"),
      fundingSource("requesty.ai announcement"),
      observabilitySource("requesty.ai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "cortecs",
    slug: "cortecs",
    name: "Cortecs",
    website: "https://cortecs.ai",
    logo: "/logos/cortecs.png",
    summary:
      "A managed LLM gateway routing requests across EU-based inference providers, positioned around EU-only processing.",
    differentiator:
      "European sovereign LLM router using exclusively EU-established inference providers.",
    type: "managed",
    tier: "primary",
    categories: ["largest-model-catalogues", "provider-networks", "eu-gateways", "eu-hosted", "multimodal"],
    jurisdictionBucket: "eu",
    legalEntity: field("Cortecs GmbH", "verified", {
      sources: ["registry"],
      asOf: DATASET_DATE,
    }),
    country: field("Austria", "verified", { sources: ["registry", "research"] }),
    countryCode: field("AT", "verified", { sources: ["registry"] }),
    city: field("Vienna", "verified", { sources: ["registry", "linkedin"] }),
    euJurisdiction: field(true, "verified", { note: EU_NOTE, sources: ["registry"] }),
    ownershipStatus: field("independent", "verified", { sources: ["registry", "research"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: employees("11-50"),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/cortecs-ai/",
      xUrl: null,
      linkedinFollowers: exactFollowers(1190, "LinkedIn"),
      xFollowers: unverified("No X account is publicly stated."),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      official("150+", DATASET_DATE, {
        sourceIds: ["site", "research"],
        note: "Vendor catalogue figure across modalities on September 17, 2026. The LLM catalogue measured 107 models on September 15, 2026 and 105 on September 8.",
      }),
      [
        measured(107, MEASUREMENT_DATE, {
          scope: "llm",
          sourceIds: ["models-endpoint"],
          note: COUNT_RULE,
        }),
        measured(105, BASELINE_DATE, {
          sourceIds: ["baseline"],
          note: "Project baseline measurement.",
        }),
      ],
    ),
    providers: metric(
      official("14", DATASET_DATE, {
        sourceIds: ["site", "research"],
        note: "Active providers stated by the vendor, all EU-established.",
      }),
      [
        measured(15, MEASUREMENT_DATE, {
          sourceIds: ["models-endpoint"],
          note: "The catalogue exposed 16 provider entries; Amazon appears twice for two EU regions, and the methodology counts a provider once regardless of region.",
        }),
      ],
    ),
    routes: metric(
      measured(196, MEASUREMENT_DATE, {
        sourceIds: ["models-endpoint"],
        note: "Model x provider combinations across the public catalogue. A project measurement; the vendor publishes no route count.",
      }),
    ),
    modalities: field(["llm", "vision", "embeddings", "audio", "stt"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["site", "research"],
      asOf: DATASET_DATE,
    }),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "Documented as OpenAI-compatible, and the public catalogue was read from an OpenAI-style /v1/models endpoint.",
      sources: ["site", "models-endpoint"],
    }),
    deployment: field(["hosted"], "vendor-stated", { sources: ["research"] }),
    gatewayLocations: field(["Vienna", "EU sovereign cloud"], "vendor-stated", {
      sources: ["research"],
    }),
    certifications: field(["ISO/IEC 27001"], "vendor-stated", { sources: ["site"] }),
    zeroDataRetention: field("yes", "vendor-stated", { sources: ["site", "research"] }),
    euResidency: field("eu-by-default", "vendor-stated", {
      note: "Positioned as EU-only for both the gateway and the upstream providers it routes to, with no region selection required.",
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    inferenceLocations: field(["EU only, via EU-established providers"], "vendor-stated", {
      sources: ["site"],
    }),
    pricingTransparency: field("public-with-enterprise", "verified", {
      note: "Per-model pricing is published in the public model endpoint; enterprise terms are quoted separately.",
      sources: ["models-endpoint", "research"],
      asOf: DATASET_DATE,
    }),
    openSource: field("no", "verified", { sources: ["site"] }),
    funding: funding(
      0,
      ["AI-on-Demand / European ecosystem programmes"],
      {
        note: "Crunchbase records one grant-backed round from AI-on-Demand and European ecosystem programmes. A grant is not counted as a financing round, and no venture round has been disclosed.",
      },
    ),
    observability: observability(
      "limited",
      "The platform provides operational inference infrastructure, but its public material does not establish a request-level observability interface rich enough to record a higher level.",
      "estimated",
    ),
    strengths: [
      "The strongest EU-only posture in this dataset: EU incorporation, EU gateway and exclusively EU-established upstream providers, rather than an EU option layered onto a global network.",
      "Catalogue is publicly enumerable, so its 107-model LLM count on September 15, 2026 is a measurement rather than a claim, and its 196 routes were counted the same way.",
      "Zero data retention and ISO/IEC 27001 stated.",
    ],
    limitations: [
      "Smallest measured LLM catalogue in the September 15, 2026 snapshot at 107 models — the trade-off for routing only to EU-established providers.",
      "14 stated upstream providers, well below the largest networks here.",
    ],
    bestFor: [
      "Teams whose requirement is that inference itself stays with EU-established providers, not only the gateway.",
    ],
    sources: [
      researchSource(),
      baselineSource(),
      modelsEndpointSource("https://api.cortecs.ai/v1/models"),
      siteSource("https://cortecs.ai"),
      registrySource("Austrian company register — Cortecs GmbH"),
      linkedinSource("https://www.linkedin.com/company/cortecs-ai/"),
      fundingSource("Crunchbase"),
      observabilitySource(),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "eurouter",
    slug: "eurouter",
    name: "EUrouter",
    website: "https://www.eurouter.ai",
    logo: "/logos/eurouter.png",
    summary:
      "An EU-incorporated model router built around EU-only infrastructure, offering a smaller curated catalogue rather than the widest possible one.",
    differentiator:
      "EU-only AI router emphasizing European infrastructure and provider/data sovereignty.",
    type: "managed",
    tier: "primary",
    categories: ["provider-networks", "eu-gateways", "eu-hosted"],
    jurisdictionBucket: "eu",
    legalEntity: field("EUrouter B.V.", "verified", {
      note: "KVK number 42054357, also printed on the vendor's own site.",
      sources: ["registry", "site"],
      asOf: DATASET_DATE,
    }),
    country: field("Netherlands", "verified", { sources: ["registry", "research"] }),
    countryCode: field("NL", "verified", { sources: ["registry"] }),
    city: field("Amsterdam", "verified", { sources: ["registry"] }),
    euJurisdiction: field(true, "verified", { note: EU_NOTE, sources: ["registry"] }),
    ownershipStatus: field("independent", "verified", { sources: ["registry", "research"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: employees("2-10"),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/eurouter/",
      xUrl: null,
      linkedinFollowers: exactFollowers(333, "LinkedIn"),
      xFollowers: unverified("No X account is publicly stated."),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      listed(147, "catalogue", DATASET_DATE, {
        scope: "llm",
        sourceIds: ["site", "research"],
        note: "Count on the official model page. Marketing copy states 100+. No public model endpoint was reachable for measurement.",
      }),
      [
        official("100+", DATASET_DATE, {
          sourceIds: ["site"],
          note: "Marketing floor on the vendor's site.",
        }),
      ],
    ),
    providers: metric(official("15", DATASET_DATE, { sourceIds: ["site", "research"] })),
    routes: metric(notPublished("Multiple providers per model; no route or endpoint count is published.")),
    modalities: field(["llm"], "vendor-stated", { note: VENDOR_NOTE, sources: ["site", "research"] }),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "The vendor markets a unified API compatible with OpenAI clients.",
      sources: ["site", "research"],
    }),
    deployment: field(["hosted"], "vendor-stated", { sources: ["research"] }),
    gatewayLocations: field(["Amsterdam", "EU"], "vendor-stated", { sources: ["research"] }),
    zeroDataRetention: notStated("zero-data-retention"),
    certifications: noCertifications(),
    euResidency: field("eu-by-default", "vendor-stated", {
      note: "The vendor describes its infrastructure as EU-only by design, with no region selection step.",
      sources: ["site", "research"],
      asOf: DATASET_DATE,
    }),
    pricingTransparency: field("public", "verified", { sources: ["site", "research"] }),
    openSource: field("no", "verified", { sources: ["site"] }),
    funding: fundingNotPublished(
      "No disclosed venture round was found. No round count is recorded rather than a guess.",
    ),
    observability: observability(
      "limited",
      "The dashboard shows usage by model and over time, the cost of individual requests and usage limits. Useful cost monitoring rather than a tracing or observability suite.",
    ),
    strengths: [
      "EU-only architecture is the product's design premise rather than a configuration option.",
      "Registry-confirmed Dutch operating entity, with the KVK number printed on its own site.",
      "Clear about the size of its catalogue — 147 models across 15 providers — instead of implying global breadth.",
    ],
    limitations: [
      "A deliberately smaller catalogue than the global routers here, and no public model endpoint was enumerated, so the count is taken from the vendor's model page.",
      "No certifications or zero-data-retention position are publicly stated, and no X presence was found.",
      "The research pass cited eu-router.ai, which did not resolve when checked; the operating site is eurouter.ai, which carries the same company registration.",
    ],
    bestFor: ["EU buyers who value a sovereignty-first architecture over catalogue size."],
    sources: [
      researchSource(),
      baselineSource(),
      siteSource("https://www.eurouter.ai"),
      registrySource("KVK 42054357"),
      linkedinSource("https://www.linkedin.com/company/eurouter/"),
      observabilitySource("eurouter.ai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "opper",
    slug: "opper",
    name: "Opper AI",
    website: "https://opper.ai",
    logo: "/logos/opper.png",
    summary:
      "A Swedish managed API for building and running model-backed tasks and agents across multiple upstream providers, hosted in the EU.",
    differentiator:
      "EU-hosted AI gateway for agents with 700+ models, smart routing, fallbacks and regional controls.",
    type: "managed",
    tier: "primary",
    categories: ["provider-networks", "eu-gateways", "eu-hosted", "multimodal"],
    jurisdictionBucket: "eu",
    legalEntity: field("Opper Technology AB", "verified", {
      sources: ["registry"],
      asOf: DATASET_DATE,
    }),
    country: field("Sweden", "verified", { sources: ["registry", "research"] }),
    countryCode: field("SE", "verified", { sources: ["registry"] }),
    city: field("Stockholm", "verified", { sources: ["registry"] }),
    euJurisdiction: field(true, "verified", { note: EU_NOTE, sources: ["registry"] }),
    ownershipStatus: field("independent", "verified", { sources: ["registry", "research"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: employees("11-50"),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/opper-ai",
      xUrl: "https://x.com/opperai",
      linkedinFollowers: approxFollowers(1700, "LinkedIn"),
      xFollowers: exactFollowers(80, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      official("700+", DATASET_DATE, {
        sourceIds: ["site", "research"],
        note: "Figure marketed on the product page. The provider directory lists 893 catalogue models and entries, which include duplicates across providers; 700+ is used as the comparable deduplicated headline.",
      }),
      [
        official("300+", MEASUREMENT_DATE, {
          sourceIds: ["site"],
          note: "Earlier vendor figure recorded in the previous revision, preserved rather than deleted.",
        }),
      ],
    ),
    providers: metric(
      listed(44, "catalogue", DATASET_DATE, {
        sourceIds: ["docs", "research"],
        note: "Providers listed in the vendor's provider directory. The product page markets 40+.",
      }),
      [official("40+", DATASET_DATE, { sourceIds: ["site"] })],
    ),
    routes: metric(notPublished("Multiple routes per model; no route or endpoint count is published.")),
    modalities: field(["llm", "image", "audio", "video"], "vendor-stated", {
      note: "The vendor lists LLM, image, voice and video; voice is recorded as audio.",
      sources: ["site", "research"],
      asOf: DATASET_DATE,
    }),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "The vendor documents an OpenAI-compatible gateway endpoint.",
      sources: ["docs", "research"],
    }),
    deployment: field(["hosted"], "vendor-stated", {
      note: "Hosted, with bring-your-own-key routing.",
      sources: ["research"],
    }),
    byok: field("yes", "vendor-stated", { sources: ["research"] }),
    gatewayLocations: field(["Stockholm", "AWS EU and US routes"], "vendor-stated", {
      sources: ["site", "research"],
    }),
    euResidency: field("eu-by-default", "vendor-stated", {
      note: "Hosted in the EU on AWS Stockholm without a region selection step; US routes are also offered for specific providers.",
      sources: ["site", "research"],
      asOf: DATASET_DATE,
    }),
    zeroDataRetention: field("configurable", "vendor-stated", {
      note: "Route dependent: retention behaviour follows the selected route rather than applying to every request.",
      sources: ["research"],
    }),
    certifications: noCertifications(),
    pricingTransparency: field("public", "verified", { sources: ["site", "research"] }),
    openSource: field("no", "verified", { sources: ["site"] }),
    funding: funding(
      1,
      ["Luminar Ventures", "Emblem VC", "Greens Capital"],
      {
        note: "A pre-seed round in 2025 with angel investors. Databases differ on the amount but agree on a single round.",
      },
    ),
    observability: observability(
      "detailed",
      "Tracing with spans, prompts, responses and custom metrics, spend controls, metadata and configurable retention; the fuller feature set sits on the Control Plane and Enterprise tiers.",
    ),
    strengths: [
      "EU-hosted by default on named infrastructure — AWS Stockholm — rather than an unspecified EU region.",
      "Largest vendor-stated catalogue among the EU-incorporated gateways here at 700+ models, with 44 providers listed in its directory.",
      "Task and agent oriented API surface with smart routing and fallbacks, and bring-your-own-key support.",
    ],
    limitations: [
      "No enumerable public catalogue, so the 700+ figure is a vendor headline rather than a measurement; the vendor previously published 300+.",
      "No certifications are publicly stated, and zero data retention depends on the route.",
    ],
    bestFor: ["EU teams building agent workloads that must stay on EU infrastructure."],
    sources: [
      researchSource(),
      baselineSource(),
      siteSource("https://opper.ai/llm-gateway"),
      docsSource("https://opper.ai/providers"),
      registrySource("Bolagsverket — Opper Technology AB"),
      linkedinSource("https://www.linkedin.com/company/opper-ai"),
      xSource("opperai"),
      fundingSource("opper.ai announcement"),
      observabilitySource("opper.ai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "nexos-ai",
    slug: "nexos-ai",
    name: "nexos.ai",
    website: "https://nexos.ai",
    logo: "/logos/nexos-ai.png",
    summary:
      "An EU-incorporated AI gateway and control layer positioned around spend control, governance, access control and visibility for larger organisations.",
    differentiator:
      "EU-hosted enterprise AI gateway focused on spend control, governance and zero-retention access to 200+ models.",
    type: "enterprise",
    tier: "primary",
    categories: ["eu-gateways", "eu-hosted", "multimodal", "enterprise", "agent-gateways"],
    jurisdictionBucket: "eu",
    legalEntity: field("Spectra Tech, UAB", "verified", {
      sources: ["registry"],
      asOf: DATASET_DATE,
    }),
    country: field("Lithuania", "verified", { sources: ["registry", "research"] }),
    countryCode: field("LT", "verified", { sources: ["registry"] }),
    city: field("Vilnius", "verified", { sources: ["registry", "linkedin"] }),
    euJurisdiction: field(true, "verified", { note: EU_NOTE, sources: ["registry"] }),
    ownershipStatus: field("independent", "verified", { sources: ["registry", "research"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: employees(
      "51-200",
      "LinkedIn company-size band — the largest of any EU-incorporated entry in this dataset.",
    ),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/nexos-ai/",
      xUrl: "https://x.com/nexos_ai",
      linkedinFollowers: approxFollowers(16600, "LinkedIn"),
      xFollowers: exactFollowers(165, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      official("200+", DATASET_DATE, {
        sourceIds: ["site", "research"],
        note: "Vendor floor for models reachable through one OpenAI-compatible endpoint. The product exposes no public catalogue endpoint.",
      }),
    ),
    providers: metric(
      notPublished("No upstream provider count is published in the vendor's public material."),
    ),
    routes: metric(notPublished("Multiple routes behind one endpoint; no route or endpoint count is published.")),
    modalities: field(["llm", "image", "agents"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["site", "research"],
      asOf: DATASET_DATE,
    }),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "The vendor states that 200+ models are reachable through one OpenAI-compatible API endpoint.",
      sources: ["site", "research"],
    }),
    deployment: field(["hosted"], "vendor-stated", { sources: ["research"] }),
    gatewayLocations: field(["Vilnius", "EU"], "vendor-stated", { sources: ["research"] }),
    certifications: field(
      ["ISO/IEC 27001", "ISO/IEC 42001", "SOC 2 Type II"],
      "vendor-stated",
      {
        note: "The broadest certification set of any EU-incorporated entry here, and the only one stating ISO/IEC 42001 for AI management systems. The vendor also positions around GDPR, which is a regulation rather than a certification.",
        sources: ["site"],
      },
    ),
    euResidency: field("eu-by-default", "vendor-stated", {
      note: "Positioned as EU-hosted without a region selection step.",
      sources: ["site", "research"],
      asOf: DATASET_DATE,
    }),
    zeroDataRetention: field("yes", "vendor-stated", {
      note: "Zero-retention access is part of the vendor's published positioning.",
      sources: ["site", "research"],
    }),
    pricingTransparency: field("public-with-enterprise", "verified", {
      note: "A public pricing page is published; enterprise terms are quoted separately.",
      sources: ["pricing", "research"],
      asOf: DATASET_DATE,
    }),
    openSource: field("no", "verified", { sources: ["site"] }),
    funding: funding(
      2,
      [
        "Index Ventures",
        "Evantic Capital",
        "Creandum",
        "Dig Ventures",
        "Flat Capital",
      ],
      {
        totalRaised: "$43M+",
        note: "An $8M initial round and a $30M Series A; the company states more than $43M raised combined. Angel investors include the chief executives of Datadog, Klarna, Supercell and Wix.",
      },
    ),
    observability: observability(
      "detailed",
      "An AI usage tracker covering requests, tokens, models and API keys by team, project and user, with latency, errors and throughput, cost breakdowns and audit logs.",
    ),
    strengths: [
      "Largest company scale of any EU-incorporated entry here, at 51–200 employees.",
      "Broadest certification set in the EU-incorporated group, and the only entry stating ISO/IEC 42001.",
      "EU-hosted by default, with zero-retention positioning and a public pricing page.",
    ],
    limitations: [
      "200+ models is a vendor floor, and no public endpoint was enumerated for a measured count.",
      "No upstream provider count or route count is published.",
    ],
    bestFor: [
      "Larger organisations that need governance, spend control and access control over internal AI use, from an EU vendor.",
    ],
    sources: [
      researchSource(),
      baselineSource(),
      siteSource("https://nexos.ai"),
      pricingSource("https://nexos.ai/pricing/"),
      registrySource("Lithuanian register of legal entities — Spectra Tech, UAB"),
      linkedinSource("https://www.linkedin.com/company/nexos-ai/"),
      xSource("nexos_ai"),
      fundingSource("nexos.ai announcements"),
      observabilitySource("nexos.ai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "edgee",
    slug: "edgee",
    name: "Edgee",
    website: "https://www.edgee.ai",
    logo: "/logos/edgee.svg",
    summary:
      "An agent gateway that routes model requests across a large set of provider routes, with hosted, on-premise and air-gapped deployment options.",
    differentiator:
      "Agent gateway with model routing, provider-route diversity and air-gapped deployment.",
    type: "managed",
    tier: "primary",
    categories: ["provider-networks", "enterprise", "agent-gateways"],
    jurisdictionBucket: "unresolved",
    country: unverified(
      "The research pass records a French presence with an unresolved corporate structure, and earlier evidence pointed to both a French and a United States entity. No jurisdiction is assigned, and the entry is not counted as EU-incorporated.",
    ),
    legalEntity: unverified("Not established. The corporate structure is unresolved."),
    euJurisdiction: unverified("Cannot be determined while the operating entity is unresolved."),
    ownershipStatus: unverified("Not established while the corporate structure is unresolved."),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: employees("2-10"),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/edgee-ai/",
      xUrl: "https://x.com/edgee_ai",
      linkedinFollowers: approxFollowers(2000, "LinkedIn"),
      xFollowers: exactFollowers(46, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      listed(223, "catalogue", DATASET_DATE, {
        scope: "llm",
        sourceIds: ["site", "research"],
        note: "Count on the official models page, published alongside a separate provider-route figure.",
      }),
    ),
    providers: metric(
      listed(60, "catalogue", DATASET_DATE, {
        sourceIds: ["docs", "research"],
        note: "The vendor's routing page lists 60 'provider routes'. The site uses route terminology differently across pages, so the vendor's label is preserved rather than converted into a mathematical provider count.",
      }),
      [
        official("25+", MEASUREMENT_DATE, {
          sourceIds: ["site"],
          note: "Provider floor recorded in the previous revision.",
        }),
      ],
    ),
    routes: metric(
      listed(972, "official", DATASET_DATE, {
        sourceIds: ["site", "research"],
        note: "Provider routes listed on the official models page, published separately from the 223-model figure.",
      }),
    ),
    modalities: field(["llm", "agents"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["site", "research"],
    }),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "The vendor documents an OpenAI-compatible gateway API.",
      sources: ["site", "research"],
    }),
    deployment: field(["hosted", "on-prem"], "vendor-stated", {
      note: "Includes air-gapped on-premise deployment.",
      sources: ["site", "research"],
    }),
    onPrem: field("yes", "vendor-stated", {
      note: "Air-gapped deployment is offered.",
      sources: ["site"],
    }),
    gatewayLocations: field(["Paris", "EU / customer deployment"], "vendor-stated", {
      sources: ["research"],
    }),
    zeroDataRetention: notStated("zero-data-retention"),
    certifications: field(["SOC 2"], "vendor-stated", {
      note: "Claimed by the vendor. The vendor also positions around GDPR, which is a regulation rather than a certification.",
      sources: ["site"],
    }),
    euResidency: residencyNotStated(),
    pricingTransparency: field("public-with-enterprise", "verified", {
      sources: ["site", "research"],
    }),
    funding: funding(
      1,
      ["Serena", "VentureFriends"],
      {
        note: "A 2.9M pre-seed round announced in 2024, reported in both euros and dollars.",
      },
    ),
    observability: observability(
      "detailed",
      "Latency, tokens, errors and cost per request, usage attributed to people, repositories and pull requests, and log export to OTLP, S3, ClickHouse, BigQuery and Snowflake.",
    ),
    strengths: [
      "One of the few entries offering air-gapped on-premise deployment, which removes the vendor from the request path entirely.",
      "Publishes models and routes as separate figures — 223 models across 972 provider routes — rather than conflating them.",
      "Agent gateway positioning, with provider-route diversity as an explicit product concern.",
    ],
    limitations: [
      "The corporate structure is unresolved, so it is not counted as EU-incorporated despite its Paris presence, and ownership cannot be recorded.",
      "Model and route counts are taken from the vendor's own pages; no public endpoint was enumerated, and the site uses 'route' to mean different things on different pages.",
      "No EU residency claim or zero-data-retention position is stated.",
    ],
    bestFor: ["Teams that need the gateway inside their own perimeter, including air-gapped."],
    sources: [
      researchSource(),
      baselineSource(),
      siteSource("https://www.edgee.ai/models"),
      docsSource("https://www.edgee.ai/routing"),
      linkedinSource("https://www.linkedin.com/company/edgee-ai/"),
      xSource("edgee_ai"),
      fundingSource("edgee.ai announcement"),
      observabilitySource("edgee.ai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "aiml-api",
    slug: "aiml-api",
    name: "AI/ML API",
    website: "https://aimlapi.com",
    logo: "/logos/aiml-api.png",
    summary:
      "A multi-provider API offering text, image, video and audio models behind OpenAI- and Anthropic-compatible interfaces.",
    differentiator:
      "Large multimodal model API with OpenAI/Anthropic-compatible interfaces and a broad catalogue.",
    type: "managed",
    tier: "primary",
    categories: ["largest-model-catalogues", "multimodal"],
    jurisdictionBucket: "other",
    legalEntity: field("Boiler Labs FZ-LLC", "verified", {
      note: "Recorded in the September 8, 2026 legal baseline and confirmed by the September 17 research pass. Separately, the published terms name Estonian governing law, which does not match the UAE registration; the two observations are recorded side by side rather than reconciled.",
      sources: ["baseline", "legal", "research"],
      asOf: DATASET_DATE,
    }),
    country: field("United Arab Emirates", "verified", {
      note: "Country of registration of the operating entity.",
      sources: ["baseline", "research"],
      asOf: DATASET_DATE,
    }),
    countryCode: field("AE", "verified", { sources: ["baseline"] }),
    euJurisdiction: field(false, "verified", { sources: ["baseline"] }),
    ownershipStatus: field("independent", "verified", { sources: ["research"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: employees("11-50"),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/aimlapi/",
      xUrl: "https://x.com/aimlapi",
      linkedinFollowers: approxFollowers(1900, "LinkedIn"),
      xFollowers: approxFollowers(3300, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      official("400+", DATASET_DATE, {
        scope: "all-modalities",
        sourceIds: ["site", "research"],
        note: "Vendor headline across every modality on September 17, 2026. This project measured 369 LLM models and 790 models across all endpoint types on September 15, 2026, and 937 in the September 8 baseline.",
      }),
      [
        measured(369, MEASUREMENT_DATE, {
          scope: "llm",
          sourceIds: ["models-endpoint"],
          note: `${COUNT_RULE} Restricted to chat, messages and responses endpoints so the figure is comparable with the other LLM catalogues here.`,
        }),
        measured(790, MEASUREMENT_DATE, {
          scope: "all-modalities",
          sourceIds: ["models-endpoint"],
          note: "Distinct model identifiers across every endpoint type, including image, video, speech, OCR and embedding models.",
        }),
        measured(937, BASELINE_DATE, {
          sourceIds: ["baseline"],
          note: "Project baseline figure, close to the raw entry count of 943 rather than the deduplicated total.",
        }),
      ],
    ),
    providers: metric(
      notPublished("Multiple upstream providers; no provider count is published in the vendor's public material."),
    ),
    routes: metric(notPublished("Variable per model; no route count is published.")),
    endpoints: metric(
      measured(943, MEASUREMENT_DATE, {
        sourceIds: ["models-endpoint"],
        note: "Model x endpoint-type entries. A model that supports both image generation and image editing appears twice. A project measurement; the vendor publishes no endpoint total.",
      }),
    ),
    modalities: field(
      ["llm", "vision", "image", "video", "stt", "tts", "embeddings"],
      "vendor-stated",
      { note: VENDOR_NOTE, sources: ["site", "research"], asOf: DATASET_DATE },
    ),
    deployment: field(["hosted"], "vendor-stated", { sources: ["research"] }),
    gatewayLocations: field(["AWS Stockholm / global"], "vendor-stated", {
      sources: ["research"],
    }),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "The vendor describes OpenAI and Anthropic compatibility. Endpoint-by-endpoint coverage has not been checked for this dataset.",
      sources: ["site", "research"],
    }),
    zeroDataRetention: notStated("zero-data-retention"),
    certifications: noCertifications(),
    euResidency: residencyNotStated(),
    pricingTransparency: field("public", "verified", { sources: ["site", "research"] }),
    openSource: field("no", "verified", { sources: ["site"] }),
    funding: fundingNotPublished(),
    observability: observability(
      "basic",
      "Usage and billing information is available. Public documentation does not establish request-level analytics beyond that.",
      "estimated",
    ),
    strengths: [
      "790 distinct models measured across every endpoint type on September 15, 2026 — the largest measured catalogue here once image, video, speech and embedding models are included.",
      "369 of those are LLM models, the second-largest measured LLM catalogue in this dataset.",
      "Publishes its catalogue as an enumerable endpoint, so the figures are measurable rather than claimed, with OpenAI and Anthropic compatibility documented.",
    ],
    limitations: [
      "Operating entity is registered in the UAE, which is material for EU procurement, and the published terms name Estonian governing law — an unresolved inconsistency.",
      "No EU residency claim, zero-data-retention position or certifications are publicly stated.",
      "No upstream provider count is published.",
    ],
    bestFor: [
      "Teams that need broad multimodal catalogue access without an EU-entity requirement.",
    ],
    sources: [
      researchSource(),
      baselineSource(),
      modelsEndpointSource("https://api.aimlapi.com/models"),
      siteSource("https://aimlapi.com"),
      legalSource(),
      linkedinSource("https://www.linkedin.com/company/aimlapi/"),
      xSource("aimlapi"),
      observabilitySource(),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "llmgateway",
    slug: "llmgateway",
    name: "llmgateway.io",
    website: "https://llmgateway.io",
    logo: "/logos/llmgateway.svg",
    summary: "An LLM gateway routing requests across multiple upstream model providers.",
    differentiator:
      "Publicly enumerable multi-provider LLM gateway with transparent model/provider catalogue.",
    type: "managed",
    tier: "primary",
    categories: ["largest-model-catalogues", "provider-networks"],
    jurisdictionBucket: "us",
    legalEntity: field("Polar Lights LLC", "verified", {
      sources: ["registry"],
      asOf: DATASET_DATE,
    }),
    country: field("United States", "verified", { sources: ["registry", "research"] }),
    countryCode: field("US", "verified", { sources: ["registry"] }),
    city: field("Lewes, Delaware", "verified", { sources: ["registry"] }),
    euJurisdiction: field(false, "verified", { sources: ["registry"] }),
    ownershipStatus: field("independent", "verified", { sources: ["registry", "research"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: employees("2-10"),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/llmgateway/",
      xUrl: "https://x.com/llmgateway",
      linkedinFollowers: exactFollowers(33, "LinkedIn"),
      xFollowers: unverified("The X account exists but its follower count was not verified."),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      listed(493, "catalogue", DATASET_DATE, {
        scope: "llm",
        sourceIds: ["site", "research"],
        note: "Count on the current provider page, which lists 493 models across 46 providers. This is a current catalogue and is not to be confused with the public endpoint measurements of 269 (September 15, 2026) and 258 (September 8).",
      }),
      [
        measured(269, MEASUREMENT_DATE, {
          scope: "llm",
          sourceIds: ["models-endpoint"],
          note: `${COUNT_RULE} The endpoint returned 271 entries, two of which are the pseudo-models "auto" and "custom".`,
        }),
        measured(258, BASELINE_DATE, {
          sourceIds: ["baseline"],
          note: "Project baseline measurement.",
        }),
      ],
    ),
    providers: metric(
      listed(46, "official", DATASET_DATE, {
        sourceIds: ["site", "research"],
        note: "Providers listed on the current provider page.",
      }),
      [
        measured(52, MEASUREMENT_DATE, {
          sourceIds: ["models-endpoint"],
          note: "Distinct upstream providers named across the public catalogue, excluding the gateway's own entry.",
        }),
      ],
    ),
    routes: metric(
      measured(571, MEASUREMENT_DATE, {
        sourceIds: ["models-endpoint"],
        note: "Model x provider combinations across the public catalogue. A project measurement; the vendor publishes no route count.",
      }),
    ),
    modalities: field(["llm"], "vendor-stated", { note: VENDOR_NOTE, sources: ["site", "research"] }),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "Documented as OpenAI-compatible, and the public catalogue was read from an OpenAI-style /v1/models endpoint.",
      sources: ["site", "models-endpoint"],
    }),
    deployment: field(["hosted"], "vendor-stated", { sources: ["research"] }),
    gatewayLocations: field(["United States"], "vendor-stated", { sources: ["research"] }),
    zeroDataRetention: notStated("zero-data-retention"),
    certifications: noCertifications(),
    euResidency: residencyNotStated(),
    pricingTransparency: field("public", "verified", {
      note: "Per-model pricing is published in the public model endpoint.",
      sources: ["models-endpoint", "research"],
      asOf: DATASET_DATE,
    }),
    openSource: field("no", "verified", { sources: ["site"] }),
    funding: funding(
      0,
      [],
      {
        note: "Public company information states that the company has never raised external funding.",
      },
    ),
    observability: observability(
      "detailed",
      "The dashboard shows requests, tokens, spend and average cost with provider and model breakdowns, error and reliability trends and project-level usage; the API exposes usage grouped by member, model, provider, project and key, and the enterprise tier adds audit logs.",
    ),
    strengths: [
      "Transparent catalogue: the provider page lists 493 models across 46 providers, and the public endpoint let this project measure 269 models, 52 providers and 571 routes on September 15, 2026.",
      "Publishes per-model provider routes, so route counts can be measured rather than estimated.",
      "Operating entity is registry-confirmed, which several larger entries here are not.",
    ],
    limitations: [
      "A 2–10 person company, which is material when assessing operational risk.",
      "The catalogue page (493) and the public endpoint (269) count different things, and the vendor does not publish the definition behind either.",
      "No EU residency claim, zero-data-retention position or certifications are publicly stated.",
    ],
    bestFor: [],
    sources: [
      researchSource(),
      baselineSource(),
      modelsEndpointSource("https://api.llmgateway.io/v1/models"),
      siteSource("https://llmgateway.io/providers"),
      registrySource("Delaware Division of Corporations — Polar Lights LLC"),
      linkedinSource("https://www.linkedin.com/company/llmgateway/"),
      xSource("llmgateway"),
      fundingSource("prospeo.io company profile"),
      observabilitySource("llmgateway.io"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "novita-ai",
    slug: "novita-ai",
    name: "Novita AI",
    website: "https://novita.ai",
    logo: "/logos/novita-ai.png",
    summary:
      "An inference platform offering hosted open models across text, image, video and audio, plus GPU capacity.",
    differentiator:
      "Hosted inference platform for open models across text, image, video and audio.",
    type: "managed",
    tier: "primary",
    categories: ["largest-model-catalogues", "multimodal"],
    jurisdictionBucket: "unresolved",
    country: unverified(
      "The company operates from the United States and globally, but no operating entity or country of incorporation has been established from a registry or legal page. Incorporation is not inferred from operating locations.",
    ),
    legalEntity: unverified("No operating entity has been established."),
    euJurisdiction: unverified("Cannot be determined while the operating entity is unresolved."),
    ownershipStatus: field("independent", "verified", { sources: ["research"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: employees("11-50"),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/novita-labs/",
      xUrl: "https://x.com/novita_labs",
      linkedinFollowers: floorFollowers(2500, "LinkedIn"),
      xFollowers: approxFollowers(6000, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      official("200+", DATASET_DATE, {
        scope: "all-modalities",
        sourceIds: ["site", "research"],
        note: "Vendor headline across text, image, video and audio on September 17, 2026. The public OpenAI-compatible endpoint measured 117 text models on September 15, 2026 and 156 on September 8.",
      }),
      [
        measured(117, MEASUREMENT_DATE, {
          scope: "llm",
          sourceIds: ["models-endpoint"],
          note: `${COUNT_RULE} Counted from the OpenAI-compatible model endpoint, which covers the text catalogue; image, video and audio models are served through separate APIs that are not enumerable in the same way.`,
        }),
        measured(156, BASELINE_DATE, {
          sourceIds: ["baseline"],
          note: "Project baseline measurement.",
        }),
      ],
    ),
    providers: metric(
      notPublished(
        "No upstream provider count is published. Novita serves open-weight models on its own infrastructure rather than brokering third-party provider APIs, so the figure would describe model families rather than upstream providers.",
      ),
    ),
    routes: metric(notPublished("Multiple serving paths; no route or endpoint count is published.")),
    modalities: field(["llm", "image", "video", "stt", "tts"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["site", "research"],
      asOf: DATASET_DATE,
    }),
    deployment: field(["hosted"], "vendor-stated", { sources: ["research"] }),
    gatewayLocations: field(["United States / global"], "vendor-stated", {
      sources: ["research"],
    }),
    zeroDataRetention: field("yes", "vendor-stated", { sources: ["research"] }),
    certifications: field(["SOC 2"], "vendor-stated", { sources: ["site", "research"] }),
    euResidency: unverified(
      "Not established. No residency claim has been read from the vendor's own documentation for this dataset.",
    ),
    pricingTransparency: field("public", "verified", {
      note: "Per-million-token input and output pricing is published in the public model endpoint.",
      sources: ["models-endpoint", "research"],
      asOf: DATASET_DATE,
    }),
    openaiCompatible: field("yes", "verified", {
      note: "The model catalogue was measured from the vendor's OpenAI-compatible endpoint (/openai/v1/models), so compatibility of that surface is directly observed. Coverage of other endpoints has not been checked.",
      sources: ["models-endpoint"],
    }),
    openSource: field("no", "verified", { sources: ["site"] }),
    funding: fundingNotPublished(
      "Dealroom records no known external funding and the company publishes no financing information. No round count is recorded, because absence from a database is not evidence of zero rounds.",
    ),
    observability: observability(
      "detailed",
      "Request logs filterable by request, trace, session and model, with live tail, time to first token, duration and status, plus usage dashboards showing requests, input, cache and output tokens and cost by model and key.",
    ),
    strengths: [
      "117 text models measured from its public endpoint on September 15, 2026, with a 200+ headline across text, image, video and audio.",
      "Serves open-weight models directly rather than only brokering other providers' APIs, with SOC 2 and zero data retention stated.",
    ],
    limitations: [
      "No operating entity or jurisdiction has been established, which blocks any contracting assessment; incorporation is not inferred from operating locations.",
      "EU data residency is not established in this dataset.",
    ],
    bestFor: ["Teams running open-weight models without operating their own GPU fleet."],
    sources: [
      researchSource(),
      baselineSource(),
      modelsEndpointSource("https://api.novita.ai/openai/v1/models"),
      siteSource("https://novita.ai"),
      linkedinSource("https://www.linkedin.com/company/novita-labs/"),
      xSource("novita_labs"),
      observabilitySource("novita.ai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "truefoundry",
    slug: "truefoundry",
    name: "TrueFoundry",
    website: "https://www.truefoundry.com",
    logo: "/logos/truefoundry.png",
    summary:
      "An enterprise AI gateway and control plane deployable into a customer's own cloud account or data centre, with access to 1,000+ LLMs.",
    differentiator:
      "Enterprise AI gateway/control plane with 1,000+ LLMs and customer-VPC/on-prem deployment.",
    type: "enterprise",
    tier: "primary",
    categories: ["provider-networks", "eu-hosted", "multimodal", "enterprise", "agent-gateways"],
    jurisdictionBucket: "us",
    legalEntity: unverified(
      "Evidence about the operating entity conflicts and is not resolved. The research pass records the company as United States based but states that the legal entity should remain unresolved until a primary corporate source is confirmed.",
    ),
    country: field("United States", "needs-verification", {
      note: "Operating country recorded by the September 17, 2026 research pass, with its San Francisco presence recorded separately as a city. Registry confirmation of the incorporating entity is outstanding.",
    }),
    countryCode: field("US", "needs-verification"),
    city: field("San Francisco", "verified", { sources: ["linkedin"], asOf: DATASET_DATE }),
    euJurisdiction: field(false, "needs-verification", {
      note: "Recorded as non-EU on the basis of its United States operations; the incorporating entity is unresolved.",
    }),
    ownershipStatus: field("independent", "verified", { sources: ["research"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: employees("51-200"),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/truefoundry/",
      xUrl: "https://x.com/truefoundry",
      linkedinFollowers: floorFollowers(38700, "LinkedIn"),
      xFollowers: approxFollowers(1200, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      official("1,600+", DATASET_DATE, {
        sourceIds: ["site", "research"],
        note: "Vendor headline on September 17, 2026. The official documentation states 1,000+ LLMs across 15+ platforms plus self-hosted models. The product is deployed into customer infrastructure and exposes no public catalogue endpoint.",
      }),
      [
        official("1,000+", MEASUREMENT_DATE, {
          sourceIds: ["docs"],
          note: "Documentation floor for LLMs reachable through the gateway.",
        }),
      ],
    ),
    providers: metric(
      official("15+", DATASET_DATE, {
        sourceIds: ["docs", "research"],
        note: "The documentation states 1,000+ LLMs across 15+ platforms; self-hosted models can be added on top.",
      }),
    ),
    routes: metric(notPublished("Multiple routes per model; no route or endpoint count is published.")),
    modalities: field(["llm", "agents", "embeddings", "image", "audio", "reranking"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["docs", "research"],
      asOf: DATASET_DATE,
    }),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "The vendor documents an OpenAI-compatible gateway API.",
      sources: ["docs", "research"],
    }),
    deployment: field(["hosted", "vpc", "on-prem"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["site", "docs"],
    }),
    vpc: field("yes", "vendor-stated", { sources: ["site"] }),
    onPrem: field("yes", "vendor-stated", { sources: ["site"] }),
    gatewayLocations: field(["San Francisco", "Customer VPC / on-premise"], "vendor-stated", {
      sources: ["research"],
    }),
    certifications: field(["SOC 2"], "vendor-stated", {
      note: "The vendor also positions around HIPAA and ITAR. Those are regulatory regimes rather than certifications, so they are not listed here as certifications.",
      sources: ["site"],
    }),
    zeroDataRetention: field("enterprise", "vendor-stated", {
      note: "Offered under enterprise agreements rather than as a standard-plan default.",
      sources: ["research"],
    }),
    euResidency: field("eu-available", "vendor-stated", {
      note: "The vendor describes geo-aware deployment; EU processing follows the region of the customer's VPC or on-premise deployment rather than a vendor-operated EU endpoint.",
      sources: ["docs", "research"],
      asOf: DATASET_DATE,
    }),
    pricingTransparency: field("contact-sales", "vendor-stated", {
      note: "Enterprise, sales-led positioning.",
      sources: ["site", "research"],
    }),
    openSource: field("no", "verified", { sources: ["site"] }),
    funding: funding(
      2,
      [
        "Intel Capital",
        "Peak XV / Surge",
        "Eniac Ventures",
        "Jump Capital",
        "Gokul Rajaram",
        "Mohit Aron",
        "Cyan Banister",
      ],
      {
        note: "A $2.3M seed and a $19M Series A, with further angel investors beyond those named.",
      },
    ),
    observability: observability(
      "advanced",
      "Request-level logs with full prompt and response inspection, tokens and cost, latency percentiles, time to first token and inter-token latency, breakdowns by model, team, user, customer, environment and custom metadata, agent traces, APIs, alerts and exports.",
    ),
    strengths: [
      "Deploys inside the customer's own cloud account or data centre, which changes where requests are processed regardless of vendor region lists.",
      "1,000+ LLMs across 15+ platforms documented, plus self-hosted models, across six documented modalities.",
      "SOC 2 stated, with HIPAA and ITAR positioning for regulated workloads, from a 51–200 person company.",
    ],
    limitations: [
      "The incorporating entity is unresolved because the evidence conflicts — unusual for a company of this size — so it is recorded as United States based on operations only.",
      "1,600+ LLMs is a vendor headline, not a measured catalogue, and no route count is published.",
      "Enterprise, sales-led pricing, and zero data retention only under enterprise terms.",
    ],
    bestFor: ["Organisations that require the gateway to run inside their own infrastructure."],
    sources: [
      researchSource(),
      baselineSource(),
      siteSource("https://www.truefoundry.com"),
      docsSource("https://www.truefoundry.com/docs/ai-gateway/supported-providers"),
      linkedinSource("https://www.linkedin.com/company/truefoundry/"),
      xSource("truefoundry"),
      fundingSource("truefoundry.com announcements"),
      observabilitySource("truefoundry.com"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "portkey",
    slug: "portkey",
    name: "Portkey",
    website: "https://portkey.ai",
    logo: "/logos/portkey.png",
    summary:
      "An AI gateway with routing, caching, guardrails, governance and observability, available as a hosted service and as an Apache-2.0 gateway that customers can run themselves.",
    differentiator:
      "Enterprise AI gateway with routing, guardrails, governance and an open-source gateway core.",
    type: "enterprise",
    tier: "primary",
    categories: ["provider-networks", "multimodal", "enterprise", "open-source"],
    jurisdictionBucket: "us",
    country: field("United States", "verified", { sources: ["site", "research"], asOf: DATASET_DATE }),
    countryCode: field("US", "verified", { sources: ["site"] }),
    city: field("San Francisco", "verified", {
      note: "Headquarters, with a Bengaluru office.",
      sources: ["linkedin", "research"],
    }),
    euJurisdiction: field(false, "verified", { sources: ["site"] }),
    ownershipStatus: field("acquired", "verified", {
      note: "Acquisition by Palo Alto Networks completed on May 29, 2026, announced April 30, 2026. LinkedIn confirms Palo Alto Networks ownership.",
      sources: ["site", "linkedin", "research"],
      asOf: DATASET_DATE,
    }),
    ownership: field("Acquired by Palo Alto Networks; completed May 29, 2026", "verified", {
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    parentCompany: field("Palo Alto Networks", "verified", { sources: ["site", "linkedin"] }),
    productStatus: field("active", "verified", { sources: ["repo"] }),
    employees: employees("11-50"),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/portkey-ai/",
      xUrl: "https://x.com/PortkeyAI",
      linkedinFollowers: exactFollowers(12176, "LinkedIn"),
      xFollowers: exactFollowers(2045, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      notComparable(
        "The vendor publishes a 1,600+ figure that counts addressable endpoints, and its documentation lists roughly 3,700 model entries across providers. Both are vendor-style totals that are not comparable with a deduplicated model count, and no such count is published.",
      ),
    ),
    providers: metric(
      listed(72, "official", DATASET_DATE, {
        sourceIds: ["docs", "research"],
        note: "Providers listed in the official documentation.",
      }),
    ),
    endpoints: metric(
      listed(313, "official", DATASET_DATE, {
        sourceIds: ["docs", "research"],
        note: "Endpoint combinations across providers, published in the documentation. The most exact endpoint figure the vendor publishes.",
      }),
      [
        official("1,600+", MEASUREMENT_DATE, {
          sourceIds: ["site"],
          note: "Marketing figure for addressable endpoints recorded in the previous revision. Not a model count.",
        }),
      ],
    ),
    modalities: field(["llm", "image", "audio", "embeddings"], "vendor-stated", {
      note: "The vendor lists text, image, audio and embeddings 'and more'; only the named modalities are recorded.",
      sources: ["docs", "research"],
      asOf: DATASET_DATE,
    }),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "The vendor documents an OpenAI-compatible unified API.",
      sources: ["docs", "research"],
    }),
    deployment: field(["hosted", "self-hosted", "vpc", "on-prem"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["repo", "research"],
    }),
    vpc: field("yes", "vendor-stated", { sources: ["research"] }),
    onPrem: field("yes", "vendor-stated", { sources: ["research"] }),
    gatewayLocations: field(["United States"], "vendor-stated", { sources: ["research"] }),
    openSource: field("yes", "verified", {
      note: "The gateway component is published under Apache-2.0.",
      sources: ["repo"],
    }),
    license: field("Apache-2.0", "verified", { sources: ["repo"] }),
    repository: field("https://github.com/Portkey-AI/gateway", "verified", { sources: ["repo"] }),
    certifications: field(["SOC 2 Type II", "ISO/IEC 27001"], "vendor-stated", {
      note: "Listed for enterprise compliance. The vendor also lists GDPR and HIPAA, which are regulatory regimes rather than certifications.",
      sources: ["site", "research"],
    }),
    zeroDataRetention: field("enterprise", "vendor-stated", {
      note: "An enterprise privacy mode rather than a universal zero-data-retention claim.",
      sources: ["research"],
    }),
    euResidency: residencyNotStated(),
    pricingTransparency: field("public-with-enterprise", "verified", {
      sources: ["site", "research"],
    }),
    funding: funding(
      2,
      ["Lightspeed", "Elevation Capital"],
      {
        note: "A $3M seed in 2023 and a $15M Series A in February 2026, with angel investors. The May 2026 acquisition by Palo Alto Networks is not a financing round and is recorded under ownership.",
      },
    ),
    observability: observability(
      "advanced",
      "Request and response logs with more than forty recorded details, cost, performance, tokens including thinking tokens, multimodal data, tracing, feedback, FinOps views and historical logs.",
    ),
    strengths: [
      "The routing component is Apache-2.0, so it can be inspected and run hosted, self-hosted, in a VPC or on-premise.",
      "72 documented providers and 313 published endpoint combinations, with SOC 2 Type II and ISO/IEC 27001 listed for enterprise compliance.",
      "Backing of a large security vendor following the Palo Alto Networks acquisition.",
    ],
    limitations: [
      "Acquired by Palo Alto Networks in May 2026, so roadmap, pricing and data handling now sit with a parent company.",
      "The published 1,600+ figure counts endpoints rather than deduplicated models, so no comparable model count exists.",
      "No EU residency claim is stated, and zero data retention is an enterprise privacy mode rather than a default.",
    ],
    bestFor: ["Teams that want a gateway they can read the source of and run themselves."],
    sources: [
      researchSource(),
      baselineSource(),
      siteSource("https://portkey.ai"),
      docsSource("https://portkey.ai/docs"),
      repoSource("https://github.com/Portkey-AI/gateway"),
      linkedinSource("https://www.linkedin.com/company/portkey-ai/"),
      xSource("PortkeyAI"),
      fundingSource("YourStory"),
      observabilitySource("portkey.ai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "helicone",
    slug: "helicone",
    name: "Helicone",
    website: "https://www.helicone.ai",
    logo: "/logos/helicone.png",
    summary:
      "An open-source observability platform for LLM applications with a gateway/proxy and managed routing. Joined Mintlify in March 2026 and is now in maintenance mode.",
    differentiator:
      "Open-source LLM observability platform with a gateway/proxy and managed routing.",
    type: "managed",
    tier: "primary",
    categories: ["provider-networks", "multimodal", "open-source"],
    jurisdictionBucket: "us",
    legalEntity: field("Helicone, Inc.", "verified", { sources: ["site"], asOf: DATASET_DATE }),
    country: field("United States", "verified", { sources: ["site", "research"] }),
    countryCode: field("US", "verified", { sources: ["site"] }),
    euJurisdiction: field(false, "verified", { sources: ["site"] }),
    ownershipStatus: field("acquired", "verified", {
      note: "Announced on March 3, 2026. LinkedIn states Helicone joined Mintlify.",
      sources: ["site", "linkedin", "research"],
      asOf: DATASET_DATE,
    }),
    ownership: field("Acquired by Mintlify; announced March 3, 2026", "verified", {
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    parentCompany: field("Mintlify", "verified", { sources: ["site", "linkedin"] }),
    productStatus: field("maintenance", "verified", {
      note: "Maintenance mode following the acquisition: security patches, bug fixes and new model support continue, but active feature development has ended.",
      sources: ["site", "linkedin"],
      asOf: DATASET_DATE,
    }),
    employees: employees("2-10"),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/helicone/",
      xUrl: "https://x.com/helicone_ai",
      linkedinFollowers: approxFollowers(3000, "LinkedIn"),
      xFollowers: exactFollowers(5730, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      official("100+", DATASET_DATE, {
        sourceIds: ["site", "research"],
        note: "The cloud gateway announcement referenced 100+ models with automatic failover. The reachable set otherwise follows the provider keys the customer configures.",
      }),
    ),
    providers: metric(
      official("20+", DATASET_DATE, {
        sourceIds: ["docs", "research"],
        note: "20+ documented gateway providers.",
      }),
    ),
    routes: metric(notPublished("No route or endpoint count is publicly stated.")),
    modalities: field(["llm", "image", "audio"], "vendor-stated", {
      note: "Text, image and audio, plus provider-dependent modalities that are not enumerated.",
      sources: ["docs", "research"],
      asOf: DATASET_DATE,
    }),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "The gateway is documented as an OpenAI-compatible proxy.",
      sources: ["docs", "research"],
    }),
    deployment: field(["hosted", "self-hosted"], "vendor-stated", { sources: ["repo", "research"] }),
    gatewayLocations: field(["United States"], "vendor-stated", { sources: ["research"] }),
    openSource: field("yes", "verified", { sources: ["repo"] }),
    repository: field("https://github.com/Helicone/helicone", "verified", { sources: ["repo"] }),
    certifications: field(["SOC 2"], "vendor-stated", {
      note: "The vendor also lists HIPAA, which is a regulatory regime rather than a certification.",
      sources: ["site", "research"],
    }),
    zeroDataRetention: notStated("zero-data-retention"),
    euResidency: residencyNotStated(),
    pricingTransparency: field("public-with-enterprise", "verified", {
      sources: ["site", "research"],
    }),
    funding: funding(
      2,
      ["Y Combinator", "CoughDrop Capital", "Realm Capital Ventures"],
      {
        status: "conflicting",
        note: "Funding databases disagree: StartupIntros records two rounds totalling about $2.2M, while Crunchbase exposes one. The 2026 acquisition by Mintlify is not a financing round and is recorded under ownership.",
      },
    ),
    observability: observability(
      "advanced",
      "Real-time request logging, tracing and debugging, unified provider insights, user metrics, alerts and cost and performance visibility, self-hostable. Observability is the core of the product alongside the gateway.",
    ),
    strengths: [
      "Codebase is public, so logging and routing behaviour can be audited directly, and it can be self-hosted.",
      "20+ documented gateway providers with automatic failover, and SOC 2 stated.",
    ],
    limitations: [
      "In maintenance mode after joining Mintlify in March 2026 — a material risk for a new long-term dependency.",
      "The 100+ model figure comes from a product announcement rather than an enumerable catalogue, and no route count is published.",
      "No EU residency claim or zero-data-retention position is stated.",
    ],
    bestFor: [
      "Teams already running it, or wanting a self-hosted observability layer they can fork.",
    ],
    sources: [
      researchSource(),
      baselineSource(),
      siteSource("https://www.helicone.ai"),
      docsSource("https://docs.helicone.ai"),
      repoSource("https://github.com/Helicone/helicone"),
      linkedinSource("https://www.linkedin.com/company/helicone/"),
      xSource("helicone_ai"),
      fundingSource("StartupIntros and Crunchbase"),
      observabilitySource("helicone.ai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "respan",
    slug: "respan",
    name: "Respan",
    formerName: "Keywords AI",
    website: "https://respan.ai",
    logo: "/logos/respan.png",
    summary:
      "An LLM gateway and observability platform, formerly branded Keywords AI. Recorded once under its current name so the rename cannot split it into two entries.",
    differentiator: "AI gateway/observability product formerly branded Keywords AI.",
    type: "managed",
    tier: "primary",
    categories: ["provider-networks"],
    jurisdictionBucket: "us",
    legalEntity: field("Keywords AI, Inc.", "verified", {
      note: "The brand changed to Respan in February 2026; the registered entity name is unchanged.",
      sources: ["site", "research"],
      asOf: DATASET_DATE,
    }),
    country: field("United States", "verified", { sources: ["site", "research"] }),
    countryCode: field("US", "verified", { sources: ["site"] }),
    euJurisdiction: field(false, "verified", { sources: ["site"] }),
    ownershipStatus: field("independent", "verified", { sources: ["site", "research"] }),
    ownership: field("Respan and Keywords AI are the same company", "verified", {
      note: "Integrity note carried from the September 8, 2026 legal baseline. The two names are one entry in this dataset, not two.",
      sources: ["baseline"],
      asOf: BASELINE_DATE,
    }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: employees("11-50"),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/respan-ai/",
      xUrl: "https://x.com/RespanAI",
      linkedinFollowers: floorFollowers(5859, "LinkedIn"),
      xFollowers: approxFollowers(2000, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      official("1,000+", DATASET_DATE, {
        sourceIds: ["site", "research"],
        note: "Vendor headline. No enumerable public catalogue was measured.",
      }),
    ),
    providers: metric(
      official("34+", DATASET_DATE, {
        sourceIds: ["docs", "research"],
        note: "34+ documented providers.",
      }),
    ),
    routes: metric(notPublished("Multiple routes; no route or endpoint count is published.")),
    modalities: field(["llm"], "vendor-stated", { note: VENDOR_NOTE, sources: ["site", "research"] }),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "The gateway is documented as OpenAI-compatible.",
      sources: ["docs", "research"],
    }),
    deployment: field(["hosted"], "vendor-stated", { sources: ["research"] }),
    gatewayLocations: field(["United States"], "vendor-stated", { sources: ["research"] }),
    zeroDataRetention: field("configurable", "vendor-stated", {
      note: "Described by the vendor as customer controlled rather than a blanket default.",
      sources: ["research"],
    }),
    certifications: noCertifications(),
    euResidency: residencyNotStated(),
    pricingTransparency: field("public-with-enterprise", "verified", {
      sources: ["site", "research"],
    }),
    openSource: field("no", "verified", { sources: ["site"] }),
    funding: funding(
      2,
      [
        "Gradient Ventures",
        "Y Combinator",
        "Hat-Trick Capital",
        "XIAOXIAO FUND",
        "Antigravity Capital",
        "Alpen Capital",
      ],
      {
        note: "A convertible note in 2024 followed by a $5M seed round in March 2026, with angel investors.",
      },
    ),
    observability: observability(
      "advanced",
      "A dashboard for requests, errors, cost, latency and tokens with breakdowns by model, user and API key, traces for LLM, tool and agent steps, saved views, threshold monitors and alerts.",
    ),
    strengths: [
      "Monitoring and gateway functions in one product, with 1,000+ models and 34+ documented providers stated.",
      "Retention is customer controlled.",
    ],
    limitations: [
      "No certifications are publicly stated, and no EU residency claim is made.",
      "The Keywords AI to Respan rename means older comparisons may double-count this company; the legal entity is still Keywords AI, Inc.",
    ],
    bestFor: [],
    sources: [
      researchSource(),
      baselineSource(),
      siteSource("https://respan.ai"),
      docsSource("https://docs.respan.ai"),
      linkedinSource("https://www.linkedin.com/company/respan-ai/"),
      xSource("RespanAI"),
      fundingSource("respan.ai announcement"),
      observabilitySource("respan.ai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "martian",
    slug: "martian",
    name: "Martian",
    website: "https://withmartian.com",
    logo: "/logos/martian.png",
    summary:
      "A model router that selects between upstream models per request, trading off cost and quality, rather than exposing a fixed choice.",
    differentiator:
      "Routing-first model router focused on automatic model selection and cost/quality trade-offs.",
    type: "managed",
    tier: "primary",
    categories: ["provider-networks", "enterprise"],
    jurisdictionBucket: "us",
    legalEntity: field("Martian Learning, Inc.", "verified", {
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    country: field("United States", "verified", { sources: ["site", "research"] }),
    countryCode: field("US", "verified", { sources: ["site"] }),
    city: field("San Francisco", "verified", { sources: ["linkedin", "research"] }),
    euJurisdiction: field(false, "verified", { sources: ["site"] }),
    ownershipStatus: field("independent", "verified", { sources: ["site", "research"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: employees("11-50"),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/martian-ai/",
      xUrl: "https://x.com/withmartian",
      linkedinFollowers: exactFollowers(6408, "LinkedIn"),
      xFollowers: exactFollowers(3801, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      listed(292, "catalogue", DATASET_DATE, {
        scope: "llm",
        sourceIds: ["site", "research"],
        note: "Official catalogue count on September 17, 2026. Independent catalogue research on the same date found 286 models and 48 providers; the vendor's own figures are recorded.",
      }),
    ),
    providers: metric(
      listed(47, "catalogue", DATASET_DATE, {
        sourceIds: ["site", "research"],
        note: "Providers in the official catalogue. Independent research on the same date counted 48.",
      }),
    ),
    routes: metric(
      notPublished(
        "Two primary inference API formats are documented — OpenAI Chat Completions and Anthropic Messages — plus a /v1/models endpoint. No comparable route or endpoint count is published.",
      ),
    ),
    modalities: field(["llm"], "vendor-stated", { note: VENDOR_NOTE, sources: ["site", "research"] }),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "OpenAI Chat Completions and Anthropic Messages formats are both documented.",
      sources: ["site", "research"],
    }),
    deployment: field(["hosted", "vpc"], "vendor-stated", { sources: ["research"] }),
    vpc: field("yes", "vendor-stated", { sources: ["research"] }),
    gatewayLocations: field(["United States"], "vendor-stated", {
      note: "Company headquarters in San Francisco.",
      sources: ["research"],
    }),
    zeroDataRetention: notStated("zero-data-retention"),
    certifications: noCertifications(),
    euResidency: residencyNotStated(),
    pricingTransparency: field("public-with-enterprise", "verified", {
      sources: ["site", "research"],
    }),
    openSource: field("no", "verified", { sources: ["site"] }),
    funding: funding(
      1,
      [
        "NEA",
        "Prosus Ventures",
        "Carya Venture Partners",
        "General Catalyst",
        "Accenture Ventures",
      ],
      {
        note: "A $9M seed round in November 2023. Accenture Ventures made a strategic investment in 2024 that was not disclosed as a separate financing round, so it is not counted.",
      },
    ),
    observability: observability(
      "limited",
      "Routing, performance and cost optimisation are documented, but no general-purpose request observability suite comparable to the dedicated observability platforms was found in the public material.",
      "estimated",
    ),
    strengths: [
      "Per-request model routing with automatic model selection and cost/quality trade-offs rather than a fixed model choice.",
      "292 models across 47 providers in the official catalogue, with hosted and VPC deployment documented.",
    ],
    limitations: [
      "No route or endpoint count is published, and per-request routing makes a single catalogue count less descriptive of the product.",
      "No EU residency claim, zero-data-retention position or certifications are publicly stated.",
    ],
    bestFor: ["Teams optimising cost or quality per request rather than picking one model."],
    sources: [
      researchSource(),
      baselineSource(),
      siteSource("https://withmartian.com"),
      linkedinSource("https://www.linkedin.com/company/martian-ai/"),
      xSource("withmartian"),
      fundingSource("Accenture newsroom"),
      observabilitySource(),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "atlas-cloud",
    slug: "atlas-cloud",
    name: "Atlas Cloud",
    website: "https://www.atlascloud.ai",
    logo: "/logos/atlas-cloud.svg",
    summary:
      "A multimodal inference platform serving language, image, video and audio models. Its own policy states that it does not represent that it holds SOC 2, ISO 27001 or HIPAA certification.",
    differentiator:
      "Multimodal inference platform for language, image, video and audio models.",
    type: "managed",
    tier: "additional",
    categories: ["provider-networks", "multimodal"],
    jurisdictionBucket: "us",
    country: field("United States", "verified", {
      note: "LinkedIn confirms the AI Atlas Cloud entity is the Menlo Park company; it is not to be confused with unrelated Atlas Cloud companies.",
      sources: ["linkedin", "research"],
      asOf: DATASET_DATE,
    }),
    countryCode: field("US", "verified", { sources: ["linkedin"] }),
    city: field("Menlo Park, California", "verified", { sources: ["linkedin"] }),
    euJurisdiction: field(false, "verified", { sources: ["linkedin"] }),
    ownershipStatus: field("independent", "verified", { sources: ["research"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: employees("11-50"),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/atlas-cloudai/",
      xUrl: "https://x.com/atlas_cloud_ai",
      linkedinFollowers: exactFollowers(5636, "LinkedIn"),
      xFollowers: approxFollowers(3000, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      official("400+", DATASET_DATE, {
        scope: "all-modalities",
        sourceIds: ["site", "research"],
        note: "Vendor headline across language, image, video and audio models. No enumerable catalogue was measured.",
      }),
    ),
    providers: metric(
      catalogueCount(16, DATASET_DATE, {
        sourceIds: ["site", "research"],
        note: "Model providers listed on the site. Atlas serves models on its own infrastructure, so this counts the model providers whose models it offers rather than brokered upstream APIs.",
      }),
    ),
    routes: metric(
      notPublished(
        "The documentation lists five core API endpoints; no model x provider route count is published.",
      ),
    ),
    modalities: field(["llm", "image", "video", "audio"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["site", "research"],
    }),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "The API is documented as OpenAI-compatible.",
      sources: ["site", "research"],
    }),
    deployment: field(["hosted"], "vendor-stated", { sources: ["research"] }),
    gatewayLocations: field(["Menlo Park, California"], "vendor-stated", { sources: ["research"] }),
    zeroDataRetention: notStated("zero-data-retention"),
    certifications: field([], "verified", {
      note: "None claimed. The vendor's own policy states that it does not represent that it holds SOC 2, ISO 27001 or HIPAA certification. This is recorded as an explicit absence, not as missing data.",
      sources: ["legal", "research"],
      asOf: DATASET_DATE,
    }),
    euResidency: residencyNotStated(),
    pricingTransparency: field("public", "verified", { sources: ["site", "research"] }),
    openSource: field("no", "verified", { sources: ["site"] }),
    funding: fundingNotPublished(
      "No financing disclosure was found for the atlascloud.ai company. Unrelated companies also named Atlas Cloud are not consulted.",
    ),
    observability: observability(
      "limited",
      "Daily model usage and daily model cost APIs, balance and usage tracking and a cost breakdown. Good billing and usage visibility; no request traces or feature-level observability were found.",
    ),
    strengths: [
      "Covers language, image, video and audio in one platform, with 400+ models stated across 16 listed providers.",
      "Explicit about not holding security certifications, which is more useful to a buyer than silence.",
    ],
    limitations: [
      "States that it does not represent holding SOC 2, ISO 27001 or HIPAA certification — a blocker for many regulated buyers.",
      "No EU residency claim or zero-data-retention position is stated, and no route count is published.",
    ],
    bestFor: [],
    sources: [
      researchSource(),
      baselineSource(),
      siteSource("https://www.atlascloud.ai"),
      legalSource(),
      linkedinSource("https://www.linkedin.com/company/atlas-cloudai/"),
      xSource("atlas_cloud_ai"),
      observabilitySource("atlascloud.ai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "anannas",
    slug: "anannas",
    name: "Anannas",
    website: "https://anannas.ai",
    logo: "/logos/anannas.png",
    summary:
      "A unified OpenAI-compatible API that routes on price, latency and throughput, with fallback, multimodal support and bring-your-own-key.",
    differentiator:
      "OpenAI-compatible gateway with price/latency/throughput routing, fallback and BYOK.",
    type: "managed",
    tier: "additional",
    categories: [],
    jurisdictionBucket: "unresolved",
    country: unverified(
      "Intentionally unresolved. The research pass records United States operations, but the published Terms contain an unfinished “[your jurisdiction]” placeholder, so no governing jurisdiction can be read from them and none is inferred from operating locations.",
    ),
    legalEntity: unverified("Not established. The Terms do not name an operating entity."),
    euJurisdiction: unverified(
      "Cannot be determined: the Terms contain an unfinished jurisdiction placeholder.",
    ),
    ownershipStatus: field("independent", "verified", { sources: ["research"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: employees("2-10"),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/anannas-ai/",
      xUrl: "https://x.com/anannas_ai",
      linkedinFollowers: exactFollowers(147, "LinkedIn"),
      xFollowers: exactFollowers(739, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      official("50+", DATASET_DATE, {
        scope: "llm",
        sourceIds: ["site", "research"],
        note: "Current vendor claim for LLMs. No enumerable catalogue was measured; the public API endpoint did not respond when checked on September 15, 2026.",
      }),
    ),
    providers: metric(
      notPublished("Multiple upstream providers; no provider count is published."),
    ),
    routes: metric(
      notPublished("At least two API surfaces are documented; no route or endpoint count is published."),
    ),
    modalities: field(["llm"], "vendor-stated", {
      note: "The vendor describes multimodal support without enumerating modalities, so only text generation is recorded.",
      sources: ["site", "research"],
    }),
    deployment: field(["hosted"], "vendor-stated", { sources: ["research"] }),
    byok: field("yes", "vendor-stated", { sources: ["site"] }),
    gatewayLocations: notPublishedField("Gateway location is not publicly stated."),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "The vendor's own material describes a unified OpenAI-compatible API. Not independently exercised: the public endpoint did not respond when checked.",
      sources: ["site"],
    }),
    zeroDataRetention: notStated("zero-data-retention"),
    certifications: noCertifications(),
    euResidency: unverified(
      "Not established. No residency claim has been read from the vendor's own documentation for this dataset.",
    ),
    pricingTransparency: field("public", "verified", { sources: ["site", "research"] }),
    openSource: field("no", "verified", { sources: ["site"] }),
    funding: fundingNotPublished(),
    observability: observability(
      "limited",
      "The dashboard provides usage insights and cost controls. Public material does not establish traces or dimensional analytics of the depth found on the dedicated observability platforms.",
    ),
    strengths: [
      "Routes on price, latency and throughput with fallback, rather than a fixed provider order.",
      "OpenAI-compatible surface with bring-your-own-key support and public pricing.",
    ],
    limitations: [
      "The published Terms contain an unfinished “[your jurisdiction]” placeholder, so the governing jurisdiction is genuinely unknown — a material contracting risk.",
      "No operating entity is named anywhere in the available material, and the gateway location is not stated.",
      "A 2–10 person company with a 50+ model claim and no published provider or route counts.",
    ],
    bestFor: [],
    sources: [
      researchSource(),
      baselineSource(),
      siteSource("https://anannas.ai"),
      legalSource(),
      linkedinSource("https://www.linkedin.com/company/anannas-ai/"),
      xSource("anannas_ai"),
      observabilitySource("anannas.ai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "routescope",
    slug: "routescope",
    name: "RouteScope",
    website: "https://www.routescope.ai",
    logo: "/logos/routescope.svg",
    summary:
      "An AI gateway and router project. Beyond its own website, no corporate or catalogue detail could be verified from primary sources.",
    differentiator:
      "AI gateway/router project with insufficient independently verifiable corporate and catalogue metadata.",
    type: "managed",
    tier: "additional",
    categories: [],
    jurisdictionBucket: "unresolved",
    country: unverified(
      "No jurisdiction established. Primary-source identity and corporate verification remained insufficient; data from unrelated RouteScope companies is deliberately not attached.",
    ),
    legalEntity: unverified("No operating entity established."),
    euJurisdiction: unverified("Cannot be determined while the operating entity is unresolved."),
    ownershipStatus: unverified("Not established."),
    productStatus: unverified("Not established from a primary source."),
    employees: notPublishedField("Company size is not publicly stated."),
    social: {
      linkedinUrl: null,
      xUrl: null,
      linkedinFollowers: unverified("No verified LinkedIn company page was found."),
      xFollowers: unverified("No verified X account was found."),
      snapshotDate: DATASET_DATE,
    },
    models: metric(notPublished("No comparable model count is published.")),
    providers: metric(notPublished("Multiple providers claimed; no provider count is published.")),
    routes: metric(notPublished("Multiple routes claimed; no route or endpoint count is published.")),
    modalities: notPublishedField("Supported modalities are not publicly stated."),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "Described as OpenAI-compatible on the vendor's site. Not independently exercised.",
      sources: ["site", "research"],
    }),
    deployment: notPublishedField("Deployment options are not publicly stated."),
    gatewayLocations: notPublishedField("Gateway location is not publicly stated."),
    zeroDataRetention: notStated("zero-data-retention"),
    certifications: noCertifications(),
    euResidency: residencyNotStated(),
    pricingTransparency: unverified("Pricing disclosure was not verified."),
    funding: fundingNotPublished(),
    observability: observability(
      "limited",
      "Usage logs and task logs with request identifiers, consumption, cost, failure reasons, requests and tokens per minute, and date and request filtering. Useful auditing with less evidence of multi-dimensional analytics.",
    ),
    strengths: [],
    limitations: [
      "Nothing beyond the vendor's own site has been established from a primary source. It is listed so the dataset does not silently drop a candidate, not because it can be compared yet.",
    ],
    bestFor: [],
    sources: [
      researchSource(),
      baselineSource(),
      siteSource("https://www.routescope.ai"),
      observabilitySource("doc.routescope.ai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  // ---------------------------------------------------------------------
  // Self-hosted / open-source gateways
  // ---------------------------------------------------------------------
  createGateway({
    id: "litellm",
    slug: "litellm",
    name: "LiteLLM",
    website: "https://www.litellm.ai",
    logo: "/logos/litellm.png",
    summary:
      "An MIT-licensed open-source proxy and SDK that exposes many provider APIs through one OpenAI-compatible interface, run by the customer or as a hosted service.",
    differentiator:
      "MIT-licensed open-source AI gateway/proxy with broad provider support and customer-configured model catalogues.",
    type: "self-hosted",
    tier: "self-hosted",
    categories: ["provider-networks", "eu-hosted", "multimodal", "enterprise", "open-source"],
    jurisdictionBucket: "us",
    country: field("United States", "needs-verification", {
      note: "Maintained by BerriAI and recorded as United States based by the September 17, 2026 research pass. Registry confirmation is outstanding.",
    }),
    countryCode: field("US", "needs-verification"),
    euJurisdiction: field(false, "needs-verification"),
    ownershipStatus: field("independent", "verified", { sources: ["repo", "research"] }),
    productStatus: field("active", "verified", { sources: ["repo"] }),
    employees: employees("11-50"),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/litellm/",
      xUrl: "https://x.com/LiteLLM",
      linkedinFollowers: approxFollowers(14200, "LinkedIn"),
      xFollowers: approxFollowers(5500, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      listed(1892, "documented", DATASET_DATE, {
        sourceIds: ["site", "research"],
        note: "Unique models stated on the gateway site; its model catalogue shows 3,175 entries. LiteLLM is a proxy the customer runs against their own provider accounts, so the reachable catalogue depends on the enabled integrations and is not treated like a hosted fixed catalogue.",
      }),
    ),
    providers: metric(
      listed(140, "documented", DATASET_DATE, {
        display: "140+",
        sourceIds: ["docs", "research"],
        note: "Documented provider integrations, stated by the project as 140+. The reachable set depends on what the operator enables, so the figure is not ranked against hosted catalogues.",
      }),
    ),
    routes: metric(variable("Routes are whatever the operator configures; no count is published.")),
    modalities: field(["llm", "image", "stt", "tts", "embeddings", "reranking"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["docs", "research"],
    }),
    deployment: field(["self-hosted", "hosted"], "verified", { sources: ["repo", "research"] }),
    gatewayLocations: field(["Customer deployment"], "vendor-stated", { sources: ["research"] }),
    euResidency: field("self-hosted", "verified", {
      note: "The customer runs the proxy, so request handling happens wherever they deploy it.",
      sources: ["repo"],
    }),
    zeroDataRetention: notApplicable(
      "Customer controlled: no vendor-operated endpoint receives the traffic in a self-hosted deployment.",
    ),
    openSource: field("yes", "verified", { sources: ["repo"] }),
    license: field("MIT", "verified", { sources: ["repo"] }),
    repository: field("https://github.com/BerriAI/litellm", "verified", { sources: ["repo"] }),
    onPrem: field("yes", "verified", { sources: ["repo"] }),
    vpc: field("yes", "verified", { sources: ["repo"] }),
    byok: field("yes", "verified", {
      note: "Provider keys are supplied by the operator by design.",
      sources: ["repo"],
    }),
    certifications: field(["SOC 2 Type II", "ISO/IEC 27001"], "vendor-stated", {
      note: "Stated for the enterprise tier rather than the open-source proxy itself.",
      sources: ["site", "research"],
    }),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "The project documents the proxy as an OpenAI-compatible interface over many provider APIs. Per-endpoint coverage has not been checked for this dataset.",
      sources: ["docs"],
    }),
    pricingTransparency: field("public-with-enterprise", "verified", {
      note: "The proxy is free to run; hosted and enterprise tiers are priced publicly with enterprise terms quoted separately.",
      sources: ["site", "research"],
    }),
    funding: fundingNotPublished(),
    observability: observability(
      "detailed",
      "An admin dashboard with spend tracking by project and person, cost tracking, logging hooks and extensive observability integrations. Strongest in self-hosted setups, where some analytics depend on configuration or integrations.",
    ),
    strengths: [
      "Source is public and MIT licensed, so behaviour can be audited and modified, and 140+ provider integrations are documented.",
      "Residency follows the deployment, not a vendor's region list.",
      "Covers image, speech, embedding and reranking endpoints as well as text, with SOC 2 Type II and ISO/IEC 27001 stated for the enterprise tier.",
    ],
    limitations: [
      "The customer operates, updates and secures the gateway themselves, and self-hosting the proxy does not change where the upstream models actually run.",
      "Model and provider figures describe supported integrations rather than a fixed catalogue, so they are listed but not ranked.",
    ],
    bestFor: ["Teams that need the gateway inside their own perimeter."],
    sources: [
      researchSource(),
      siteSource("https://www.litellm.ai"),
      repoSource("https://github.com/BerriAI/litellm"),
      docsSource("https://docs.litellm.ai"),
      linkedinSource("https://www.linkedin.com/company/litellm/"),
      xSource("LiteLLM"),
      observabilitySource("docs.litellm.ai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "kong-ai-gateway",
    slug: "kong-ai-gateway",
    name: "Kong AI Gateway",
    website: "https://konghq.com/products/kong-ai-gateway",
    logo: "/logos/kong-ai-gateway.png",
    summary:
      "AI routing, credential management, policy and governance plugins built on the Kong Gateway data plane, with multi-cloud connectivity.",
    differentiator:
      "Enterprise API and AI gateway with policy, routing, governance and multi-cloud connectivity.",
    type: "self-hosted",
    tier: "self-hosted",
    categories: ["provider-networks", "eu-hosted", "multimodal", "enterprise", "open-source"],
    jurisdictionBucket: "us",
    country: field("United States", "needs-verification", {
      note: "Kong Inc., recorded as United States based by the September 17, 2026 research pass. Registry confirmation is outstanding.",
    }),
    countryCode: field("US", "needs-verification"),
    euJurisdiction: field(false, "needs-verification"),
    ownershipStatus: field("independent", "verified", { sources: ["site", "research"] }),
    productStatus: field("active", "verified", { sources: ["repo"] }),
    employees: employees(
      "1,001-5,000",
      "LinkedIn company-size band. Figures describe Kong Inc., the company behind the gateway, not the AI Gateway product alone.",
    ),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/konghq/",
      xUrl: "https://x.com/thekonginc",
      linkedinFollowers: approxFollowers(84000, "LinkedIn"),
      xFollowers: approxFollowers(26500, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      variable(
        "Kong routes to upstream AI providers configured on its data plane, so the reachable catalogue depends entirely on that configuration.",
      ),
    ),
    providers: metric(
      listed(19, "documented", DATASET_DATE, {
        sourceIds: ["docs", "research"],
        note: "Documented upstream provider types (the documentation also says 17+). The reachable set is configured on the data plane, so the figure is not ranked against hosted catalogues.",
      }),
    ),
    routes: metric(
      variable(
        "12 AI capabilities are documented; model and route targets are customer-configured.",
      ),
    ),
    modalities: field(["llm", "embeddings", "audio", "image", "video", "reranking"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["docs", "research"],
    }),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "Kong's documentation states that AI Models expose OpenAI-compatible formats by default.",
      sources: ["docs", "research"],
    }),
    deployment: field(["hosted", "self-hosted", "on-prem"], "vendor-stated", {
      sources: ["docs", "research"],
    }),
    gatewayLocations: field(["Global / customer deployment"], "vendor-stated", {
      sources: ["research"],
    }),
    euResidency: field("self-hosted", "verified", {
      note: "In a self-managed deployment the data plane runs wherever the customer places it.",
      sources: ["docs"],
    }),
    zeroDataRetention: notStated("gateway-level zero-data-retention"),
    openSource: field("yes", "verified", {
      note: "Kong Gateway is Apache-2.0. Some AI capabilities are enterprise-only.",
      sources: ["repo"],
    }),
    license: field("Apache-2.0", "verified", { sources: ["repo"] }),
    repository: field("https://github.com/Kong/kong", "verified", { sources: ["repo"] }),
    onPrem: field("yes", "vendor-stated", { sources: ["docs"] }),
    certifications: unverified(
      "Not evaluated at the gateway level. Kong Inc.'s corporate certifications are not attributed to the AI Gateway product here.",
    ),
    pricingTransparency: field("public-with-enterprise", "verified", {
      sources: ["site", "research"],
    }),
    funding: funding(
      8,
      [
        "Tiger Global",
        "Balderton Capital",
        "Andreessen Horowitz (a16z)",
        "Index Ventures",
        "CRV",
        "Goldman Sachs",
        "Sapphire Ventures",
        "Notable Capital",
        "Ontario Teachers' Pension Plan",
      ],
      {
        totalRaised: "$345M+",
        note: "Financing of Kong Inc., the company behind the gateway, across eight rounds and about $345M, with further investors beyond those named. None of it is specific to the AI Gateway product.",
      },
    ),
    observability: observability(
      "detailed",
      "AI-specific standardised logs, Prometheus and Grafana metrics, request counts, cost and token usage per provider and model, latency, and Konnect Advanced Analytics.",
    ),
    strengths: [
      "Reuses an existing API gateway deployment rather than adding a separate hop, with 19 documented upstream provider types and 12 AI capabilities.",
      "Data plane placement is a deployment decision, not a vendor region setting, and models expose OpenAI-compatible formats by default.",
    ],
    limitations: [
      "Some AI features are gated behind the enterprise edition.",
      "No published model catalogue count, because the product routes rather than hosts models, and certifications were not evaluated at the gateway level.",
    ],
    bestFor: ["Organisations already running Kong for API traffic."],
    sources: [
      researchSource(),
      siteSource("https://konghq.com/products/kong-ai-gateway"),
      repoSource("https://github.com/Kong/kong"),
      docsSource("https://developer.konghq.com/ai-gateway/"),
      linkedinSource("https://www.linkedin.com/company/konghq/"),
      xSource("thekonginc"),
      fundingSource("CB Insights"),
      observabilitySource("Kong documentation"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "envoy-ai-gateway",
    slug: "envoy-ai-gateway",
    name: "Envoy AI Gateway",
    website: "https://aigateway.envoyproxy.io",
    logo: "/logos/envoy-ai-gateway.png",
    summary:
      "An open-source AI gateway built on Envoy Gateway and Envoy Proxy, providing unified upstream access, credential handling and traffic policy for self-hosted Kubernetes infrastructure.",
    differentiator:
      "Open-source AI gateway built around Envoy Proxy and designed for self-hosted infrastructure.",
    type: "self-hosted",
    tier: "self-hosted",
    categories: ["provider-networks", "eu-hosted", "enterprise", "open-source"],
    jurisdictionBucket: "unresolved",
    country: notApplicable(
      "A community-governed open-source project rather than a single operating company. Treated as a project, not a standalone company.",
    ),
    legalEntity: notApplicable("No single operating entity; governed as an Envoy project."),
    euJurisdiction: notApplicable("Not a company."),
    ownershipStatus: field("community", "verified", { sources: ["repo", "research"] }),
    productStatus: field("active", "verified", { sources: ["repo"] }),
    employees: notApplicable("An open-source project, not a company; company size does not apply."),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/envoyproxy/",
      xUrl: "https://x.com/envoyproxy",
      linkedinFollowers: unverified(
        "Only a project-level Envoy page exists; no company follower count is recorded.",
      ),
      xFollowers: approxFollowers(31000, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      variable(
        "The gateway routes to upstream providers declared in Kubernetes resources, so the reachable catalogue is whatever the cluster operator configures.",
      ),
    ),
    providers: metric(
      listed(15, "documented", DATASET_DATE, {
        sourceIds: ["docs", "research"],
        note: "Documented upstream providers; the reachable set is declared in the cluster configuration, so the figure is not ranked against hosted catalogues.",
      }),
    ),
    routes: metric(variable("Routes are declared in cluster configuration; no count is published.")),
    modalities: field(["llm", "embeddings"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["docs", "research"],
    }),
    openaiCompatible: field("yes", "vendor-stated", {
      note: "The project documents a unified OpenAI-compatible API in front of upstream providers.",
      sources: ["docs", "research"],
    }),
    deployment: field(["self-hosted", "on-prem"], "verified", { sources: ["repo"] }),
    gatewayLocations: field(["Customer deployment"], "vendor-stated", { sources: ["research"] }),
    euResidency: field("self-hosted", "verified", {
      note: "Runs in the customer's own Kubernetes cluster.",
      sources: ["repo"],
    }),
    zeroDataRetention: notApplicable(
      "Customer controlled: no vendor-operated endpoint receives the traffic.",
    ),
    openSource: field("yes", "verified", { sources: ["repo"] }),
    license: field("Apache-2.0", "verified", { sources: ["repo"] }),
    repository: field("https://github.com/envoyproxy/ai-gateway", "verified", {
      sources: ["repo"],
    }),
    onPrem: field("yes", "verified", { sources: ["repo"] }),
    certifications: notApplicable("Not applicable at project level."),
    pricingTransparency: notApplicable("Open source; no commercial licence, the project is free to run."),
    funding: notApplicable<Funding>(
      "A community-governed open-source project in the Envoy Proxy and CNCF ecosystem, not a venture-backed company or product.",
    ),
    observability: observability(
      "detailed",
      "GenAI metrics via Prometheus and OpenTelemetry covering token usage, latency and time to first token with provider and model dimensions, GenAI tracing and AI-aware access logs. Infrastructure-level observability rather than a hosted analytics dashboard.",
    ),
    strengths: [
      "No vendor relationship is required to run it, and 15 upstream providers are documented.",
      "Built on infrastructure many platform teams already operate.",
    ],
    limitations: [
      "Requires Kubernetes and Envoy Gateway operational knowledge.",
      "Company-level comparison columns do not apply to a community project.",
    ],
    bestFor: ["Platform teams standardising AI traffic on existing Envoy infrastructure."],
    sources: [
      researchSource(),
      siteSource("https://aigateway.envoyproxy.io"),
      repoSource("https://github.com/envoyproxy/ai-gateway"),
      docsSource("https://aigateway.envoyproxy.io/docs/"),
      linkedinSource("https://www.linkedin.com/company/envoyproxy/"),
      xSource("envoyproxy"),
      observabilitySource("aigateway.envoyproxy.io"),
    ],
    lastVerified: DATASET_DATE,
  }),

  // ---------------------------------------------------------------------
  // Hyperscaler AI platforms
  // ---------------------------------------------------------------------
  createGateway({
    id: "amazon-bedrock",
    slug: "amazon-bedrock",
    name: "Amazon Bedrock",
    website: "https://aws.amazon.com/bedrock/",
    logo: "/logos/amazon-bedrock.png",
    summary:
      "AWS's managed foundation-model platform, offering models from several providers through AWS APIs, billing, regions and a model marketplace.",
    differentiator:
      "AWS-managed foundation-model platform with regional infrastructure, marketplace and native AWS governance.",
    type: "hyperscaler",
    tier: "hyperscaler",
    categories: ["eu-hosted", "multimodal", "enterprise"],
    jurisdictionBucket: "us",
    country: field("United States", "verified", {
      note: "Operated by Amazon Web Services, Inc.",
      sources: ["site", "research"],
    }),
    countryCode: field("US", "verified", { sources: ["site"] }),
    euJurisdiction: field(false, "verified", { sources: ["site"] }),
    ownershipStatus: field("subsidiary", "verified", { sources: ["site", "research"] }),
    parentCompany: field("Amazon.com, Inc.", "verified", { sources: ["site"] }),
    productStatus: field("active", "verified", { sources: ["docs"] }),
    employees: employees(
      "10,001+",
      "LinkedIn company-size band for Amazon Web Services; Amazon reports over 1,000,000 employees group-wide. Figures describe the company, not the Bedrock product.",
    ),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/amazon-web-services/",
      xUrl: "https://x.com/awscloud",
      linkedinFollowers: approxFollowers(11100000, "LinkedIn"),
      xFollowers: approxFollowers(2200000, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      official("100+", DATASET_DATE, {
        scope: "all-modalities",
        sourceIds: ["docs", "research"],
        note: "AWS documentation states 100+ foundation models, plus a separate marketplace with 100+ additional models. The catalogue is published per region and deployment type, so the figure is not directly comparable with dedicated multi-provider routers.",
      }),
    ),
    providers: metric(
      official("20+", DATASET_DATE, {
        sourceIds: ["docs", "research"],
        note: "Model providers onboarded by AWS. Models are onboarded by the cloud provider rather than reached through independent upstream accounts, so the figure is not directly comparable with dedicated routers.",
      }),
    ),
    routes: metric(
      notComparable(
        "Routes and endpoints are region- and model-dependent, so no single count is comparable with a gateway route count.",
      ),
    ),
    modalities: field(["llm", "vision", "image", "video", "embeddings"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["docs", "research"],
    }),
    openaiCompatible: field("partial", "vendor-stated", {
      note: "Bedrock exposes its own APIs; OpenAI-compatible access is documented for a subset of endpoints only.",
      sources: ["docs", "research"],
    }),
    deployment: field(["hosted", "vpc"], "vendor-stated", { sources: ["docs", "research"] }),
    euResidency: field("eu-available", "verified", {
      note: "The service is offered in documented EU regions that the customer selects. It is not EU-only by default.",
      sources: ["docs"],
    }),
    gatewayLocations: field(["AWS global regions, including EU regions"], "vendor-stated", {
      sources: ["docs", "research"],
    }),
    inferenceLocations: field(
      ["Within the selected AWS region, subject to per-model availability"],
      "vendor-stated",
      { sources: ["docs"] },
    ),
    vpc: field("yes", "vendor-stated", { sources: ["docs"] }),
    dpa: field("yes", "vendor-stated", { sources: ["site"] }),
    openSource: field("no", "verified", { sources: ["site"] }),
    zeroDataRetention: field("configurable", "vendor-stated", {
      note: "Configurable and provider dependent rather than a single platform-wide guarantee.",
      sources: ["research"],
    }),
    pricingTransparency: field("public-with-enterprise", "verified", {
      sources: ["site", "research"],
    }),
    certifications: field(["ISO/IEC 27001", "SOC 2"], "vendor-stated", {
      note: "Published on AWS's compliance pages. Scope varies by service and region.",
      sources: ["site"],
    }),
    funding: notApplicable<Funding>(
      "A product of Amazon Web Services, backed by Amazon.com, Inc. A corporate product has no startup funding profile; see the parent company.",
    ),
    observability: observability(
      "advanced",
      "CloudWatch generative AI observability provides invocation counts, latency, token usage and errors; Bedrock invocation logging captures requests, responses and metadata into CloudWatch or S3; custom metadata enables cost and usage aggregation by arbitrary dimensions.",
    ),
    strengths: [
      "Region selection is explicit and documented, including EU regions.",
      "Procurement, billing and access control follow an existing cloud agreement, with 100+ foundation models plus a marketplace.",
    ],
    limitations: [
      "Catalogue is limited to models the cloud provider has onboarded, and availability differs by region.",
      "Only partial OpenAI API compatibility; region, endpoint and provider counts are not directly comparable with dedicated routers.",
    ],
    bestFor: ["Organisations already standardised on AWS with regional requirements."],
    sources: [
      researchSource(),
      siteSource("https://aws.amazon.com/bedrock/"),
      docsSource("https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html"),
      linkedinSource("https://www.linkedin.com/company/amazon-web-services/"),
      xSource("awscloud"),
      observabilitySource("AWS documentation"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "google-vertex-ai",
    slug: "google-vertex-ai",
    name: "Google Vertex AI",
    website: "https://cloud.google.com/vertex-ai",
    logo: "/logos/google-vertex-ai.png",
    summary:
      "Google Cloud's managed AI platform, providing first-party and partner models through Google Cloud APIs, regions and controls.",
    differentiator:
      "Google Cloud enterprise AI platform with managed model access, regional deployment and Google-native controls.",
    type: "hyperscaler",
    tier: "hyperscaler",
    categories: ["eu-hosted", "multimodal", "enterprise"],
    jurisdictionBucket: "us",
    country: field("United States", "verified", {
      note: "Operated by Google LLC.",
      sources: ["site", "research"],
    }),
    countryCode: field("US", "verified", { sources: ["site"] }),
    euJurisdiction: field(false, "verified", { sources: ["site"] }),
    ownershipStatus: field("subsidiary", "verified", { sources: ["site", "research"] }),
    parentCompany: field("Alphabet Inc.", "verified", { sources: ["site"] }),
    productStatus: field("active", "verified", { sources: ["docs"] }),
    employees: employees(
      "10,001+",
      "LinkedIn company-size band for Google Cloud; Alphabet reports over 180,000 employees group-wide. Figures describe the company, not the Vertex AI product.",
    ),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/google-cloud/",
      xUrl: "https://x.com/googlecloud",
      linkedinFollowers: approxFollowers(3400000, "LinkedIn"),
      xFollowers: approxFollowers(571000, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      official("200+", DATASET_DATE, {
        scope: "all-modalities",
        sourceIds: ["site", "research"],
        note: "Vendor figure. Vertex AI is a broader cloud AI platform whose catalogue is published per region and deployment type, so this is not directly comparable with fixed gateway catalogues without defining the catalogue scope.",
      }),
    ),
    providers: metric(
      official("20+", DATASET_DATE, {
        sourceIds: ["docs", "research"],
        note: "Model providers onboarded by Google Cloud. Not directly comparable with independent upstream provider counts on dedicated routers.",
      }),
    ),
    routes: metric(
      notComparable(
        "Routes and endpoints are region- and model-dependent, so no single count is comparable with a gateway route count.",
      ),
    ),
    modalities: field(
      ["llm", "vision", "image", "video", "stt", "tts", "translation", "embeddings"],
      "vendor-stated",
      { note: VENDOR_NOTE, sources: ["docs", "research"] },
    ),
    openaiCompatible: field("partial", "vendor-stated", {
      note: "Vertex AI exposes its own APIs; an OpenAI-compatible chat completions surface is documented for a subset of models.",
      sources: ["docs", "research"],
    }),
    deployment: field(["hosted", "vpc"], "vendor-stated", {
      note: "Hosted, with VPC / private networking options.",
      sources: ["docs", "research"],
    }),
    euResidency: field("eu-available", "verified", {
      note: "Documented EU regions are selectable. Availability of individual models differs by region.",
      sources: ["docs"],
    }),
    gatewayLocations: field(["Google Cloud global regions, including EU regions"], "vendor-stated", {
      sources: ["docs", "research"],
    }),
    inferenceLocations: field(
      ["Within the selected region, subject to per-model availability"],
      "vendor-stated",
      { sources: ["docs"] },
    ),
    vpc: field("yes", "vendor-stated", { sources: ["docs"] }),
    dpa: field("yes", "vendor-stated", { sources: ["site"] }),
    openSource: field("no", "verified", { sources: ["site"] }),
    zeroDataRetention: field("configurable", "vendor-stated", {
      note: "Service dependent rather than a single platform-wide guarantee.",
      sources: ["research"],
    }),
    pricingTransparency: field("public-with-enterprise", "verified", {
      sources: ["site", "research"],
    }),
    certifications: field(["ISO/IEC 27001", "SOC 2"], "vendor-stated", {
      note: "Published on Google Cloud's compliance pages. Scope varies by service and region.",
      sources: ["site"],
    }),
    funding: notApplicable<Funding>(
      "A product of Google Cloud, backed by Google and Alphabet Inc. A corporate product has no startup funding profile; see the parent company.",
    ),
    observability: observability(
      "detailed",
      "Google Cloud's monitoring, logging and tracing stack provides production telemetry for Vertex AI workloads. Recorded as detailed rather than advanced because much of the observability comes through Google Cloud's general monitoring infrastructure rather than being gateway-native.",
    ),
    strengths: [
      "Broad modality range across text, vision, image, video, speech, translation and embeddings.",
      "Region selection and data handling terms are documented, with VPC / private networking options.",
    ],
    limitations: [
      "Catalogue is limited to first-party and onboarded partner models, and regional availability varies per model.",
      "A single model count is not directly comparable with fixed gateway catalogues, and OpenAI compatibility is partial.",
    ],
    bestFor: ["Organisations already standardised on Google Cloud."],
    sources: [
      researchSource(),
      siteSource("https://cloud.google.com/vertex-ai"),
      docsSource("https://cloud.google.com/vertex-ai/docs"),
      linkedinSource("https://www.linkedin.com/company/google-cloud/"),
      xSource("googlecloud"),
      observabilitySource(),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "azure-ai-foundry",
    slug: "azure-ai-foundry",
    name: "Azure AI Foundry",
    website: "https://azure.microsoft.com/products/ai-foundry",
    logo: "/logos/azure-ai-foundry.png",
    summary:
      "Microsoft's enterprise AI platform for deploying and managing models from several providers within Azure subscriptions and regions, with a very large model catalogue.",
    differentiator:
      "Microsoft enterprise AI platform with a very large model catalogue and Azure-native governance/deployment.",
    type: "hyperscaler",
    tier: "hyperscaler",
    categories: ["largest-model-catalogues", "eu-hosted", "multimodal", "enterprise"],
    jurisdictionBucket: "us",
    country: field("United States", "verified", {
      note: "Operated by Microsoft Corporation.",
      sources: ["site", "research"],
    }),
    countryCode: field("US", "verified", { sources: ["site"] }),
    euJurisdiction: field(false, "verified", { sources: ["site"] }),
    ownershipStatus: field("subsidiary", "verified", { sources: ["site", "research"] }),
    parentCompany: field("Microsoft Corporation", "verified", { sources: ["site"] }),
    productStatus: field("active", "verified", { sources: ["docs"] }),
    employees: employees(
      "10,001+",
      "LinkedIn company-size band for Microsoft, which reports over 220,000 employees. Figures describe the company, not the AI Foundry product.",
    ),
    social: {
      linkedinUrl: "https://www.linkedin.com/company/microsoft/",
      xUrl: "https://x.com/Azure",
      linkedinFollowers: approxFollowers(29000000, "LinkedIn"),
      xFollowers: approxFollowers(1000000, "X"),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      official("1,900+", DATASET_DATE, {
        scope: "all-modalities",
        sourceIds: ["docs", "research"],
        note: "Microsoft documentation states the Foundry Models catalogue has more than 1,900 models. Another current Microsoft page says the broader Foundry platform can access more than 10,000 models; the comparable catalogue figure is used here and the broader figure is kept on record.",
      }),
      [
        official("11,000+", DATASET_DATE, {
          sourceIds: ["docs"],
          note: "Broader Foundry platform figure, which covers more than the Foundry Models catalogue.",
        }),
        measured(1892, MEASUREMENT_DATE, {
          scope: "llm",
          sourceIds: ["models-endpoint"],
          note: `${COUNT_RULE} Counted from the public Foundry Models catalogue.`,
        }),
      ],
    ),
    providers: metric(
      official("20+", DATASET_DATE, {
        sourceIds: ["docs", "research"],
        note: "Model providers onboarded by Microsoft. Not directly comparable with independent upstream provider counts on dedicated routers.",
      }),
    ),
    routes: metric(
      notComparable(
        "Routes and endpoints are region- and deployment-dependent, so no single count is comparable with a gateway route count.",
      ),
    ),
    modalities: field(
      [
        "llm",
        "vision",
        "ocr",
        "image",
        "video",
        "stt",
        "tts",
        "translation",
        "embeddings",
        "documents",
      ],
      "vendor-stated",
      { note: VENDOR_NOTE, sources: ["docs", "research"] },
    ),
    openaiCompatible: field("partial", "vendor-stated", {
      note: "Azure OpenAI deployments follow the OpenAI API shape with Azure-specific authentication and endpoints; other Foundry models use their own or the inference API.",
      sources: ["docs", "research"],
    }),
    deployment: field(["hosted", "vpc"], "vendor-stated", {
      note: "Hosted, with VPC / private networking options.",
      sources: ["docs", "research"],
    }),
    euResidency: field("eu-available", "verified", {
      note: "EU regions and EU Data Boundary commitments are documented and selectable.",
      sources: ["docs"],
    }),
    gatewayLocations: field(["Azure global regions, including EU regions"], "vendor-stated", {
      sources: ["docs", "research"],
    }),
    inferenceLocations: field(
      ["Within the selected region or deployment type, subject to per-model availability"],
      "vendor-stated",
      { sources: ["docs"] },
    ),
    vpc: field("yes", "vendor-stated", { sources: ["docs"] }),
    dpa: field("yes", "vendor-stated", { sources: ["site"] }),
    openSource: field("no", "verified", { sources: ["site"] }),
    zeroDataRetention: field("enterprise", "vendor-stated", {
      note: "Enterprise and service dependent rather than a single platform-wide guarantee.",
      sources: ["research"],
    }),
    pricingTransparency: field("public-with-enterprise", "verified", {
      sources: ["site", "research"],
    }),
    certifications: field(["ISO/IEC 27001", "SOC 2"], "vendor-stated", {
      note: "Published on Microsoft's compliance pages. Scope varies by service and region.",
      sources: ["site"],
    }),
    funding: notApplicable<Funding>(
      "A product of Microsoft Corporation. A corporate product has no startup funding profile; see the parent company.",
    ),
    observability: observability(
      "advanced",
      "End-to-end monitoring, tracing and live traffic monitoring, multi-agent tracing, metrics, alerts, drift detection and cost and performance insights.",
    ),
    strengths: [
      "Documented EU Data Boundary commitments in addition to region selection.",
      "The largest vendor-published catalogue in this dataset — more than 1,900 models in Foundry Models — with ten documented modalities including OCR and document processing.",
    ],
    limitations: [
      "Catalogue is limited to models Microsoft has onboarded, and deployment type affects where processing happens.",
      "Microsoft publishes two different catalogue figures (1,900+ and 10,000+) for different scopes, and OpenAI compatibility is partial.",
    ],
    bestFor: ["Organisations already standardised on Azure with EU boundary requirements."],
    sources: [
      researchSource(),
      siteSource("https://azure.microsoft.com/products/ai-foundry"),
      docsSource("https://learn.microsoft.com/en-us/azure/machine-learning/foundry-models-overview"),
      modelsEndpointSource("https://ai.azure.com/explore/models"),
      linkedinSource("https://www.linkedin.com/company/microsoft/"),
      xSource("Azure"),
      observabilitySource("Microsoft developer blog"),
    ],
    lastVerified: DATASET_DATE,
  }),
];

/** Fields that remain deliberately open across most of the dataset. */
export const OPEN_DATASET_FIELDS = [
  "Pricing model detail",
  "Inference regions for managed gateways",
  "Founding years",
  "Route counts, where a vendor publishes one",
  "Registry confirmation for several operating entities",
];

export { OPEN_FIELD };
