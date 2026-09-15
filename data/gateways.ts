import type { Gateway } from "@/types";
import type { Source } from "@/types/source";
import { field, notApplicable, unverified } from "@/types/field";
import { createGateway } from "@/lib/create-gateway";
import {
  conflicting,
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
 *     research: the September 8, 2026 measured baseline, the validated company
 *     research applied in the September 15, 2026 revision, or unambiguous
 *     public record (an open-source licence, a cloud provider's regions).
 *  2. Anything else stays `needs-verification` with `value: null`. Never
 *     substitute a plausible number for a researched one, and never resolve a
 *     conflict between sources by picking the more convenient side.
 *  3. Model counts are dated observations, not attributes. Measured counts and
 *     vendor-stated counts are stored as separate observations and are never
 *     mixed inside one ranking.
 *  4. Models, routes and providers are three different quantities. A route is
 *     a model x provider combination. Never present routes as models.
 *  5. Company jurisdiction is recorded separately from gateway location and
 *     from inference location. EU incorporation is never written into
 *     `euResidency`.
 *
 * `qualifier: "at-least"` marks a vendor floor such as "50+". The number still
 * sorts normally; the UI renders the plus sign so a floor is never shown as an
 * exact count.
 */

/** Date the measured catalogue counts in this file were taken. */
export const BASELINE_DATE = "2026-09-08";

/** Date this dataset revision was assembled. */
export const DATASET_DATE = "2026-09-15";

const baselineSource = (): Source => ({
  id: "baseline",
  kind: "project-baseline",
  label: "Sep 8, 2026 baseline",
  url: null,
  retrieved: BASELINE_DATE,
});

const modelsEndpointSource = (
  url: string | null = null,
  retrieved: string = DATASET_DATE,
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
  retrieved: DATASET_DATE,
});

const siteSource = (url: string): Source => ({
  id: "site",
  kind: "official-website",
  label: "Official website",
  url,
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

/**
 * Vendor material for an entry whose canonical URL has not been confirmed, so
 * a figure can still cite where it came from without publishing a guessed link.
 */
const vendorMaterialSource = (): Source => ({
  id: "site",
  kind: "official-website",
  label: "Vendor material",
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

const linkedinSource = (): Source => ({
  id: "linkedin",
  kind: "linkedin",
  label: "LinkedIn company profile",
  url: null,
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

export const gateways: Gateway[] = [
  // ---------------------------------------------------------------------
  // Primary managed, multi-provider gateways and model routers
  // ---------------------------------------------------------------------
  createGateway({
    id: "eden-ai",
    slug: "eden-ai",
    name: "Eden AI",
    website: "https://www.edenai.co",
    summary:
      "A multi-provider AI API that exposes generative and non-generative models — text, speech, vision, OCR and document processing — behind one interface.",
    differentiator:
      "Widest measured provider network and modality coverage of any EU-incorporated entry.",
    type: "managed",
    tier: "primary",
    categories: ["largest-model-catalogues", "eu-gateways", "multimodal", "provider-networks"],
    jurisdictionBucket: "eu",
    country: field("France", "verified", { sources: ["site"], asOf: DATASET_DATE }),
    countryCode: field("FR", "verified", { sources: ["site"] }),
    euJurisdiction: field(true, "verified", {
      note: "EU-incorporated. This says nothing on its own about where requests are processed.",
      sources: ["site"],
    }),
    legalEntity: unverified(
      "The operating entity name has not been read from a registry filing for this dataset.",
    ),
    ownershipStatus: field("independent", "verified", { sources: ["site"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: field({ band: "11-50", min: 11, max: 50 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/edenaico",
      linkedinFollowers: field(13465, "verified", {
        note: "Exact LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: field(2400, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      measured(360, DATASET_DATE, {
        scope: "llm",
        sourceIds: ["models-endpoint"],
        note: `${COUNT_RULE} Counted from the public LLM catalogue, which is the only Eden AI catalogue exposed as an enumerable endpoint; its OCR, speech, image, video and document models are not individually listed there.`,
      }),
      [
        measured(1038, BASELINE_DATE, {
          sourceIds: ["baseline"],
          note: "Project baseline figure covering the platform as a whole rather than the LLM catalogue alone. Preserved as a historical observation; not comparable with the LLM-scoped measurements.",
        }),
        official("500+", DATASET_DATE, {
          sourceIds: ["site"],
          note: "Vendor floor published on the marketing site, lower than both measurements.",
        }),
      ],
    ),
    providers: metric(
      measured(78, DATASET_DATE, {
        sourceIds: ["providers-endpoint"],
        note: "Distinct providers across all nine features exposed by the public provider/subfeature endpoint.",
      }),
      [
        official("50+", DATASET_DATE, {
          sourceIds: ["site"],
          note: "Vendor floor, lower than the measured count.",
        }),
      ],
    ),
    endpoints: metric(
      measured(428, DATASET_DATE, {
        sourceIds: ["providers-endpoint"],
        note: "Provider x subfeature combinations exposed publicly, of which 425 were reported working.",
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
        "video",
        "translation",
        "documents",
        "embeddings",
      ],
      "verified",
      {
        note: "Counted from the public provider/subfeature endpoint, which exposes nine features across 74 subfeatures including OCR parsers, speech, video and translation.",
        sources: ["providers-endpoint"],
        asOf: DATASET_DATE,
      },
    ),
    deployment: field(["hosted"], "vendor-stated", { sources: ["site"] }),
    openSource: field("no", "verified", { sources: ["site"] }),
    certifications: field(["SOC 2", "ISO/IEC 27001"], "vendor-stated", {
      note: "Published in the vendor's own security material. The certified scope has not been read from the certificates themselves.",
      sources: ["site"],
    }),
    zeroDataRetention: field("yes", "vendor-stated", {
      note: "Zero-data-retention is part of the vendor's published positioning.",
      sources: ["site"],
    }),
    euResidency: field("eu-routes", "vendor-stated", {
      note: "EU processing is documented for part of the catalogue. It is not automatic for every route, so the whole-catalogue label is deliberately not applied.",
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    pricingTransparency: field("public", "verified", {
      note: "Per-subfeature pricing is published in the public provider/subfeature endpoint.",
      sources: ["providers-endpoint"],
      asOf: DATASET_DATE,
    }),
    strengths: [
      "Second-largest measured provider network in this dataset at 78 upstream providers, and the largest of any EU-incorporated entry \u2014 48 more than the next EU vendor.",
      "Joint-widest measured modality coverage here at ten features, counted from the public catalogue rather than taken from marketing: OCR parsers, speech, video, translation, embeddings and document extraction alongside text.",
      "Third-largest measured LLM catalogue on the September 15, 2026 snapshot at 360 models.",
      "EU-incorporated operating company, with SOC 2 and ISO/IEC 27001 stated.",
    ],
    limitations: [
      "EU processing is documented for part of the catalogue rather than every route, so it is labelled EU routes rather than EU by default.",
      "The operating legal entity has not been read from a registry filing for this dataset.",
      "Only the LLM catalogue is individually enumerable from the public API. The OCR, speech, image, video and document models are not listed there, so the measured model count covers less of the platform than the same figure does for a text-only router.",
      "Certifications are stated by the vendor and have not been checked against the certificates themselves.",
    ],
    bestFor: [
      "Teams that need several modalities behind one API rather than text generation alone.",
      "EU buyers who want an EU-incorporated vendor with broad provider coverage.",
    ],
    sources: [
baselineSource(),
      modelsEndpointSource("https://api.edenai.run/v2/llm/models"),
      providersEndpointSource("https://api.edenai.run/v2/info/provider_subfeatures"),
      siteSource("https://www.edenai.co"),
      linkedinSource(),
      xSource("edenaico"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "openrouter",
    slug: "openrouter",
    name: "OpenRouter",
    website: "https://openrouter.ai",
    summary:
      "A unified, OpenAI-compatible API that routes chat and completion requests across many upstream model providers.",
    differentiator: "The reference point most of this dataset is compared against.",
    type: "managed",
    tier: "primary",
    categories: ["largest-model-catalogues", "provider-networks"],
    jurisdictionBucket: "us",
    legalEntity: field("OpenRouter, Inc.", "verified", {
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    country: field("United States", "verified", { sources: ["site"] }),
    countryCode: field("US", "verified", { sources: ["site"] }),
    euJurisdiction: field(false, "verified", { sources: ["site"] }),
    ownershipStatus: field("independent", "verified", { sources: ["site"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: field({ band: "11-50", min: 11, max: 50 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/OpenRouter",
      linkedinFollowers: field(31479, "verified", {
        note: "Exact LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: field(142000, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      measured(356, DATASET_DATE, {
        scope: "llm",
        sourceIds: ["models-endpoint"],
        note: `${COUNT_RULE} The endpoint returned 446 addressable identifiers, which collapse to 356 once routing variants such as :free and :nitro are removed.`,
      }),
      [
        measured(428, BASELINE_DATE, {
          sourceIds: ["baseline"],
          note: "Project baseline figure, counted before routing variants were excluded.",
        }),
        official("500+", DATASET_DATE, {
          sourceIds: ["site"],
          note: "Current vendor-stated figure.",
        }),
      ],
    ),
    providers: metric(
      measured(106, DATASET_DATE, {
        sourceIds: ["providers-endpoint"],
        note: "Distinct providers listed by the public providers endpoint.",
      }),
      [
        official("60+", DATASET_DATE, {
          sourceIds: ["site"],
          note: "Vendor floor, well below the measured count.",
        }),
      ],
    ),
    modalities: field(["llm", "vision"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["site"],
    }),
    deployment: field(["hosted"], "vendor-stated", { sources: ["site"] }),
    openSource: field("no", "verified"),
    byok: field("yes", "vendor-stated", {
      note: "Bring-your-own-key routing is documented on the vendor's site.",
      sources: ["site"],
    }),
    euResidency: field("enterprise-only", "vendor-stated", {
      note: "An EU endpoint is offered, but as an enterprise distinction rather than an option on standard plans.",
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    pricingTransparency: field("public", "verified", {
      note: "Per-model input and output pricing is published in the public model endpoint.",
      sources: ["models-endpoint"],
      asOf: DATASET_DATE,
    }),
    strengths: [
      "Largest measured upstream provider network in this dataset at 106 providers, counted from its public providers endpoint.",
      "Model catalogue is publicly enumerable, so counts can be measured rather than taken on trust.",
      "OpenAI-compatible surface keeps migration cost low for existing clients.",
      "The broadest ecosystem and brand reach of any entry here.",
    ],
    limitations: [
      "EU processing is an enterprise-only distinction rather than a standard-plan option.",
      "US-incorporated, which is material where EU-entity contracting is a requirement.",
      "Its own marketing understates the network: the site states 60+ while the public endpoint lists 106.",
    ],
    bestFor: ["Teams comparing many text and vision models behind one compatible API."],
    sources: [
baselineSource(),
      modelsEndpointSource("https://openrouter.ai/api/v1/models"),
      providersEndpointSource("https://openrouter.ai/api/v1/providers"),
      siteSource("https://openrouter.ai"),
      linkedinSource(),
      xSource("OpenRouter"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "requesty",
    slug: "requesty",
    name: "Requesty",
    website: "https://www.requesty.ai",
    summary:
      "A managed LLM routing layer that sits in front of multiple upstream providers behind a single API, with an EU gateway in Frankfurt.",
    differentiator: "Largest measured LLM catalogue; UK-incorporated with an EU gateway.",
    type: "managed",
    tier: "primary",
    categories: ["largest-model-catalogues", "eu-hosted", "provider-networks"],
    jurisdictionBucket: "uk",
    legalEntity: field("REQUESTY LTD", "verified", {
      note: "Companies House number 15165717.",
      sources: ["registry"],
      asOf: DATASET_DATE,
    }),
    country: field("United Kingdom", "verified", { sources: ["registry"] }),
    countryCode: field("GB", "verified", { sources: ["registry"] }),
    city: field("London", "verified", { sources: ["registry"] }),
    euJurisdiction: field(false, "verified", {
      note: "UK-incorporated, so outside EU jurisdiction. This is a separate question from where its gateway sits.",
      sources: ["registry"],
    }),
    ownershipStatus: field("independent", "verified", { sources: ["registry"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    euResidency: field("eu-available", "vendor-stated", {
      note: "An EU gateway in Frankfurt is documented. Gateway location is not the same as inference location, which is set per upstream provider.",
      sources: ["docs"],
      asOf: DATASET_DATE,
    }),
    subprocessors: field("Published subprocessor list", "vendor-stated", {
      note: "Subprocessors are enumerated publicly rather than described in general terms.",
      sources: ["legal"],
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/RequestyAI",
      linkedinFollowers: field(3661, "estimated", {
        note: "Exact LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: field(760, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      measured(545, DATASET_DATE, {
        scope: "llm",
        sourceIds: ["models-endpoint"],
        note: `${COUNT_RULE} The catalogue exposes 684 provider/model endpoints; 88 model names are served by more than one provider, and collapsing those leaves 545 distinct models.`,
      }),
      [
        measured(708, BASELINE_DATE, {
          sourceIds: ["baseline"],
          note: "Project baseline figure, which counted addressable endpoints rather than deduplicated models.",
        }),
        official("600+", DATASET_DATE, {
          sourceIds: ["site"],
          note: "Vendor headline, which corresponds closely to the endpoint count rather than the deduplicated model count.",
        }),
      ],
    ),
    providers: metric(
      measured(33, DATASET_DATE, {
        sourceIds: ["models-endpoint"],
        note: "Distinct serving-provider prefixes in the public catalogue.",
      }),
      [
        official("32", DATASET_DATE, {
          sourceIds: ["docs"],
          note: "Vendor-stated provider count, one lower than the measured prefix count.",
        }),
      ],
    ),
    endpoints: metric(
      measured(684, DATASET_DATE, {
        sourceIds: ["models-endpoint"],
        note: "Provider/model endpoints in the public catalogue. This matches the vendor's own published endpoint figure.",
      }),
    ),
    pricingTransparency: field("public", "verified", {
      note: "Per-model input, cached and output pricing is published in the public model endpoint.",
      sources: ["models-endpoint"],
      asOf: DATASET_DATE,
    }),
    strengths: [
      "Unusually transparent about infrastructure: a named EU gateway location and a published subprocessor list, neither of which most entries here publish at all.",
      "Largest measured LLM catalogue in the September 15, 2026 snapshot at 545 distinct models, served across 684 endpoints.",
      "Real routing redundancy rather than one path per model: 88 of its models are served by more than one provider.",
    ],
    limitations: [
      "UK-incorporated, so it does not qualify as an EU-incorporated vendor even though its gateway sits in the EU.",
      "Its catalogue is published as provider/model endpoints, so the headline \u201c600+\u201d tracks the endpoint count rather than the deduplicated model count.",
    ],
    bestFor: [
      "Teams that need EU gateway processing and want the subprocessor chain written down.",
    ],
    sources: [
      baselineSource(),
      modelsEndpointSource("https://router.requesty.ai/v1/models"),
      siteSource("https://www.requesty.ai"),
      docsSource("https://docs.requesty.ai"),
      registrySource("Companies House 15165717"),
      legalSource(),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "orq-ai",
    slug: "orq-ai",
    name: "Orq.ai",
    website: "https://orq.ai",
    summary:
      "A generative AI platform combining model access with experimentation, evaluation and deployment workflows.",
    differentiator: "EU-incorporated gen-AI platform with evaluation tooling.",
    type: "enterprise",
    tier: "primary",
    categories: ["eu-gateways", "enterprise", "provider-networks"],
    jurisdictionBucket: "eu",
    legalEntity: field("Orq.AI Holding B.V.", "verified", {
      note: "KVK number 88882179.",
      sources: ["registry"],
      asOf: DATASET_DATE,
    }),
    country: field("Netherlands", "verified", { sources: ["registry"] }),
    countryCode: field("NL", "verified", { sources: ["registry"] }),
    city: field("Amsterdam", "verified", { sources: ["registry"] }),
    euJurisdiction: field(true, "verified", { sources: ["registry"] }),
    ownershipStatus: field("independent", "verified", { sources: ["registry"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: field({ band: "11-50", min: 11, max: 50 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    models: metric(
      official("500+", DATASET_DATE, {
        sourceIds: ["site"],
        note: "Vendor floor. No public model endpoint is exposed, so no measurement was possible.",
      }),
    ),
    providers: metric(official("30+", DATASET_DATE, { sourceIds: ["site"] })),
    modalities: field(["llm", "vision"], "vendor-stated", { note: VENDOR_NOTE }),
    deployment: field(["hosted"], "vendor-stated"),
    certifications: field(["SOC 2", "ISO/IEC 27001"], "vendor-stated", {
      note: "The vendor also positions around GDPR and HIPAA. Those are regulatory regimes rather than certifications, so they are not listed here as certifications.",
      sources: ["site"],
    }),
    euResidency: unverified(
      "No primary evidence about where requests are processed has been read for this dataset. EU incorporation is never used as evidence of EU residency.",
    ),
    strengths: [
      "EU-incorporated with a registry-confirmed operating entity.",
      "SOC 2 and ISO/IEC 27001 stated, alongside GDPR and HIPAA positioning.",
      "Model access is coupled to experimentation and evaluation workflows rather than routing alone.",
    ],
    limitations: [
      "No enumerable public catalogue, so the 500+ figure is a vendor floor rather than a measurement.",
      "EU data residency is not established: being EU-incorporated is not evidence of where requests are processed.",
    ],
    bestFor: [
      "Teams that want model access and evaluation workflows in one EU-incorporated platform.",
    ],
    sources: [
      baselineSource(),
      siteSource("https://orq.ai"),
      registrySource("KVK 88882179"),
      linkedinSource(),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "cortecs",
    slug: "cortecs",
    name: "Cortecs",
    website: "https://cortecs.ai",
    summary:
      "A managed LLM gateway routing requests across EU-based inference providers, positioned around EU-only processing.",
    differentiator: "EU-only provider and inference posture, fully measurable.",
    type: "managed",
    tier: "primary",
    categories: ["largest-model-catalogues", "eu-gateways", "eu-hosted", "provider-networks"],
    jurisdictionBucket: "eu",
    legalEntity: field("Cortecs GmbH", "verified", {
      sources: ["registry"],
      asOf: DATASET_DATE,
    }),
    country: field("Austria", "verified", { sources: ["registry"] }),
    countryCode: field("AT", "verified", { sources: ["registry"] }),
    city: field("Vienna", "verified", { sources: ["registry"] }),
    euJurisdiction: field(true, "verified", { sources: ["registry"] }),
    ownershipStatus: field("independent", "verified", { sources: ["registry"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: field({ band: "11-50", min: 11, max: 50 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    models: metric(
      measured(107, DATASET_DATE, {
        scope: "llm",
        sourceIds: ["models-endpoint"],
        note: COUNT_RULE,
      }),
      [
        measured(105, BASELINE_DATE, {
          sourceIds: ["baseline"],
          note: "Project baseline measurement.",
        }),
      ],
    ),
    providers: metric(
      measured(15, DATASET_DATE, {
        sourceIds: ["models-endpoint"],
        note: "The catalogue exposes 16 provider entries; Amazon appears twice for two EU regions, and the methodology counts a provider once regardless of region.",
      }),
      [
        official("14", DATASET_DATE, {
          sourceIds: ["site"],
          note: "Vendor-stated count of active providers.",
        }),
      ],
    ),
    routes: metric(
      measured(196, DATASET_DATE, {
        sourceIds: ["models-endpoint"],
        note: "Model x provider combinations across the public catalogue.",
      }),
    ),
    modalities: field(["llm"], "vendor-stated", { note: VENDOR_NOTE }),
    deployment: field(["hosted"], "vendor-stated"),
    certifications: field(["ISO/IEC 27001"], "vendor-stated", { sources: ["site"] }),
    euResidency: field("eu-by-default", "vendor-stated", {
      note: "Positioned as EU-only for both the gateway and the upstream providers it routes to, with no region selection required.",
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    inferenceLocations: field(["EU only, via EU-based providers"], "vendor-stated", {
      sources: ["site"],
    }),
    pricingTransparency: field("public", "verified", {
      note: "Per-model pricing is published in the public model endpoint.",
      sources: ["models-endpoint"],
      asOf: DATASET_DATE,
    }),
    strengths: [
      "The strongest EU-only posture in this dataset: EU incorporation, EU gateway and EU-based upstream providers, rather than an EU option layered onto a global network.",
      "Catalogue is publicly enumerable, so its 107-model count on September 15, 2026 is a measurement rather than a claim.",
      "ISO/IEC 27001 stated.",
    ],
    limitations: [
      "Smallest measured catalogue in the September 15, 2026 snapshot at 107 models — the trade-off for routing only to EU-based providers.",
      "15 measured upstream providers, well below the largest networks here.",
    ],
    bestFor: [
      "Teams whose requirement is that inference itself stays with EU-based providers, not only the gateway.",
    ],
    sources: [
      baselineSource(),
      modelsEndpointSource("https://api.cortecs.ai/v1/models"),
      siteSource("https://cortecs.ai"),
      registrySource("Austrian company register — Cortecs GmbH"),
      linkedinSource(),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "eurouter",
    slug: "eurouter",
    name: "EUrouter",
    website: null,
    summary:
      "An EU-incorporated model router built around EU-only processing, offering a smaller curated catalogue rather than the widest possible one.",
    differentiator: "EU-only by design, with a registry-confirmed Dutch entity.",
    type: "managed",
    tier: "primary",
    categories: ["eu-gateways", "eu-hosted", "provider-networks"],
    jurisdictionBucket: "eu",
    legalEntity: field("EUrouter B.V.", "verified", {
      note: "KVK number 42054357.",
      sources: ["registry"],
      asOf: DATASET_DATE,
    }),
    country: field("Netherlands", "verified", { sources: ["registry"] }),
    countryCode: field("NL", "verified", { sources: ["registry"] }),
    city: field("Amsterdam", "verified", { sources: ["registry"] }),
    euJurisdiction: field(true, "verified", { sources: ["registry"] }),
    ownershipStatus: field("independent", "verified", { sources: ["registry"] }),
    productStatus: field("active", "verified"),
    employees: field({ band: "2-10", min: 2, max: 10 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    models: metric(
      official("147", DATASET_DATE, {
        sourceIds: ["site"],
        note: "Vendor-published figure. No public model endpoint was reachable for measurement.",
      }),
    ),
    providers: metric(official("15", DATASET_DATE, { sourceIds: ["site"] })),
    strengths: [
      "EU-only architecture is the product's design premise rather than a configuration option.",
      "Registry-confirmed Dutch operating entity.",
      "Clear about the size of its catalogue instead of implying global breadth.",
    ],
    limitations: [
      "147 models and 15 providers — a deliberately smaller catalogue than the global routers here.",
      "No public model endpoint was enumerated, so the model count is vendor-stated rather than measured.",
      "The official product URL has not been confirmed for this dataset, so no link is published.",
    ],
    bestFor: ["EU buyers who value a sovereignty-first architecture over catalogue size."],
    sources: [baselineSource(), registrySource("KVK 42054357"), vendorMaterialSource()],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "opper",
    slug: "opper",
    name: "Opper",
    website: "https://opper.ai",
    summary:
      "A Swedish managed API for building and running model-backed tasks and agents across multiple upstream providers, hosted in the EU.",
    differentiator: "EU-hosted agent gateway running on AWS Stockholm.",
    type: "managed",
    tier: "primary",
    categories: ["eu-gateways", "eu-hosted", "agent-gateways", "provider-networks"],
    jurisdictionBucket: "eu",
    legalEntity: field("Opper Technology AB", "verified", {
      sources: ["registry"],
      asOf: DATASET_DATE,
    }),
    country: field("Sweden", "verified", { sources: ["registry"] }),
    countryCode: field("SE", "verified", { sources: ["registry"] }),
    city: field("Stockholm", "verified", { sources: ["registry"] }),
    euJurisdiction: field(true, "verified", { sources: ["registry"] }),
    ownershipStatus: field("independent", "verified", { sources: ["registry"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: field({ band: "11-50", min: 11, max: 50 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    models: metric(
      conflicting(
        "The vendor publishes both 700+ and 300+ in its own material. Neither figure is measurable from a public endpoint, and neither is presented here as settled.",
      ),
      [
        official("700+", DATASET_DATE, { sourceIds: ["site"] }),
        official("300+", DATASET_DATE, { sourceIds: ["site"] }),
      ],
    ),
    providers: metric(official("30+", DATASET_DATE, { sourceIds: ["site"] })),
    modalities: field(["llm", "agents"], "vendor-stated", { note: VENDOR_NOTE }),
    deployment: field(["hosted"], "vendor-stated"),
    gatewayLocations: field(["AWS Stockholm (eu-north-1)"], "vendor-stated", {
      sources: ["site"],
    }),
    euResidency: field("eu-by-default", "vendor-stated", {
      note: "Hosted in the EU on AWS Stockholm, without a region selection step.",
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    zeroDataRetention: field("yes", "vendor-stated", {
      note: "Zero-data-retention is part of the vendor's published positioning.",
      sources: ["site"],
    }),
    strengths: [
      "EU-hosted by default on named infrastructure — AWS Stockholm — rather than an unspecified EU region.",
      "Largest vendor-stated catalogue among the EU-incorporated gateways here, at 700+.",
      "Task and agent oriented API surface rather than raw routing, with zero-data-retention positioning.",
    ],
    limitations: [
      "The vendor's own material states both 700+ and 300+ models; the conflict is unresolved and neither figure is measured.",
      "No enumerable public catalogue, so no measured count exists.",
    ],
    bestFor: ["EU teams building agent workloads that must stay on EU infrastructure."],
    sources: [
      baselineSource(),
      siteSource("https://opper.ai"),
      registrySource("Bolagsverket — Opper Technology AB"),
      linkedinSource(),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "nexos-ai",
    slug: "nexos-ai",
    name: "nexos.ai",
    website: "https://nexos.ai",
    summary:
      "An EU-incorporated AI gateway and control layer positioned around governance, access control and visibility for larger organisations.",
    differentiator:
      "Largest company scale and broadest certification set among EU-incorporated entries.",
    type: "enterprise",
    tier: "primary",
    categories: ["eu-gateways", "eu-hosted", "enterprise"],
    jurisdictionBucket: "eu",
    legalEntity: field("Spectra Tech, UAB", "verified", {
      sources: ["registry"],
      asOf: DATASET_DATE,
    }),
    country: field("Lithuania", "verified", { sources: ["registry"] }),
    countryCode: field("LT", "verified", { sources: ["registry"] }),
    city: field("Vilnius", "verified", { sources: ["registry"] }),
    euJurisdiction: field(true, "verified", { sources: ["registry"] }),
    ownershipStatus: field("independent", "verified", { sources: ["registry"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: field({ band: "51-200", min: 51, max: 200 }, "verified", {
      note: "LinkedIn company-size band — the largest of any EU-incorporated entry in this dataset.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    models: metric(
      official("200+", DATASET_DATE, {
        sourceIds: ["site"],
        note: "Vendor floor. The product is sold through an enterprise motion and exposes no public catalogue endpoint.",
      }),
    ),
    providers: metric(
      notPublished("No upstream provider count is published in the vendor's public material."),
    ),
    modalities: field(["llm"], "vendor-stated", { note: VENDOR_NOTE }),
    deployment: field(["hosted"], "vendor-stated"),
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
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    zeroDataRetention: field("yes", "vendor-stated", { sources: ["site"] }),
    pricingTransparency: field("contact-sales", "vendor-stated", {
      note: "Enterprise, sales-led positioning rather than published self-serve pricing.",
      sources: ["site"],
    }),
    strengths: [
      "Largest company scale of any EU-incorporated entry here, at 51–200 employees.",
      "Broadest certification set in the EU-incorporated group, and the only entry stating ISO/IEC 42001.",
      "EU-hosted by default, with zero-data-retention positioning.",
    ],
    limitations: [
      "Enterprise, sales-led positioning: no published self-serve pricing to evaluate.",
      "200+ models is a vendor floor, and no public endpoint was enumerated for a measured count.",
    ],
    bestFor: [
      "Larger organisations that need governance and access control over internal AI use, from an EU vendor.",
    ],
    sources: [
      baselineSource(),
      siteSource("https://nexos.ai"),
      registrySource("Lithuanian register of legal entities — Spectra Tech, UAB"),
      linkedinSource(),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "edgee",
    slug: "edgee",
    name: "Edgee",
    website: "https://www.edgee.cloud",
    summary:
      "An edge computing platform whose AI gateway component routes model requests from edge locations, with on-premise and air-gapped deployment options.",
    differentiator: "Agent gateway with air-gapped deployment; corporate structure unresolved.",
    type: "managed",
    tier: "primary",
    categories: ["agent-gateways", "enterprise", "provider-networks"],
    jurisdictionBucket: "unresolved",
    country: unverified(
      "Evidence points to both a French and a United States entity. The conflict is unresolved, so no jurisdiction is assigned and the entry is not counted as EU-incorporated.",
    ),
    legalEntity: unverified("Not established. French and US entity evidence conflicts."),
    euJurisdiction: unverified(
      "Cannot be determined while the operating entity is unresolved.",
    ),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: field({ band: "2-10", min: 2, max: 10 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: null,
      linkedinFollowers: field(2019, "verified", {
        note: "Exact LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: unverified(
        "No X follower count was found for this company.",
      ),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      official("223", DATASET_DATE, {
        sourceIds: ["site"],
        note: "Vendor-published model figure, quoted alongside a separate route count.",
      }),
    ),
    providers: metric(official("25+", DATASET_DATE, { sourceIds: ["site"] })),
    routes: metric(
      official("972", DATASET_DATE, {
        sourceIds: ["site"],
        note: "Model x provider combinations. Published by the vendor as a separate figure from its model count.",
      }),
    ),
    modalities: field(["llm", "agents"], "vendor-stated", { note: VENDOR_NOTE }),
    deployment: field(["hosted", "on-prem"], "vendor-stated", {
      note: "Includes air-gapped on-premise deployment.",
      sources: ["site"],
    }),
    onPrem: field("yes", "vendor-stated", {
      note: "Air-gapped deployment is offered.",
      sources: ["site"],
    }),
    certifications: field(["SOC 2"], "vendor-stated", {
      note: "The vendor also positions around GDPR, which is a regulation rather than a certification.",
      sources: ["site"],
    }),
    strengths: [
      "One of the few entries offering air-gapped on-premise deployment, which removes the vendor from the request path entirely.",
      "Publishes models and routes as separate figures — 223 models across 972 routes — rather than conflating them.",
      "Agent gateway positioning, with edge placement as an explicit product concern.",
    ],
    limitations: [
      "The operating entity is unresolved between French and US evidence, so it is not counted as EU-incorporated despite its European presence.",
      "Model and route counts are vendor-stated; no public endpoint was enumerated.",
    ],
    bestFor: ["Teams that need the gateway inside their own perimeter, including air-gapped."],
    sources: [
      baselineSource(), siteSource("https://www.edgee.cloud"),
      linkedinSource(),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "aiml-api",
    slug: "aiml-api",
    name: "AI/ML API",
    website: "https://aimlapi.com",
    summary:
      "A multi-provider API offering text, image, video and audio models behind one OpenAI-compatible interface.",
    differentiator:
      "Largest measured catalogue once every modality is counted.",
    type: "managed",
    tier: "primary",
    categories: ["largest-model-catalogues", "multimodal"],
    jurisdictionBucket: "other",
    legalEntity: field("Boiler Labs FZ-LLC", "verified", {
      note: "Recorded in the September 8, 2026 legal baseline. Separately, the published terms name Estonian governing law, which does not match the UAE registration; the two observations are recorded side by side rather than reconciled.",
      sources: ["baseline", "legal"],
      asOf: BASELINE_DATE,
    }),
    country: field("United Arab Emirates", "verified", {
      note: "Country of registration of the operating entity.",
      sources: ["baseline"],
      asOf: BASELINE_DATE,
    }),
    countryCode: field("AE", "verified", { sources: ["baseline"] }),
    euJurisdiction: field(false, "verified", { sources: ["baseline"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: field({ band: "11-50", min: 11, max: 50 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/aimlapi",
      linkedinFollowers: field(1841, "estimated", {
        note: "Exact LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: field(3300, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      measured(369, DATASET_DATE, {
        scope: "llm",
        sourceIds: ["models-endpoint"],
        note: `${COUNT_RULE} Restricted to chat, messages and responses endpoints so the figure is comparable with the other LLM catalogues here.`,
      }),
      [
        measured(790, DATASET_DATE, {
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
      notPublished("No upstream provider count is published in the vendor's public material."),
    ),
    endpoints: metric(
      measured(943, DATASET_DATE, {
        sourceIds: ["models-endpoint"],
        note: "Model x endpoint-type entries. A model that supports both image generation and image editing appears twice.",
      }),
    ),
    modalities: field(
      ["llm", "vision", "image", "video", "stt", "tts", "embeddings"],
      "vendor-stated",
      { note: VENDOR_NOTE, sources: ["site"] },
    ),
    deployment: field(["hosted"], "vendor-stated"),
    strengths: [
      "790 distinct models measured across every endpoint type on September 15, 2026 — the largest measured catalogue here once image, video, speech and embedding models are included.",
      "369 of those are LLM models, the second-largest measured LLM catalogue in this dataset.",
      "Publishes its catalogue as an enumerable endpoint, so the figures are measurable rather than claimed.",
    ],
    limitations: [
      "Operating entity is registered in the UAE, which is material for EU procurement.",
      "The published terms name Estonian governing law while the entity is UAE-registered; that inconsistency is unresolved.",
      "EU data residency is not established in this dataset.",
    ],
    bestFor: [
      "Teams that need broad multimodal catalogue access without an EU-entity requirement.",
    ],
    sources: [
      baselineSource(),
      modelsEndpointSource("https://api.aimlapi.com/models"),
      siteSource("https://aimlapi.com"),
      legalSource(),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "llmgateway",
    slug: "llmgateway",
    name: "llmgateway.io",
    website: "https://llmgateway.io",
    summary: "An LLM gateway routing requests across multiple upstream model providers.",
    differentiator: "Small US-registered team with an openly enumerable catalogue.",
    type: "managed",
    tier: "primary",
    categories: ["largest-model-catalogues"],
    jurisdictionBucket: "us",
    legalEntity: field("Polar Lights LLC", "verified", {
      sources: ["registry"],
      asOf: DATASET_DATE,
    }),
    country: field("United States", "verified", { sources: ["registry"] }),
    countryCode: field("US", "verified", { sources: ["registry"] }),
    city: field("Lewes, Delaware", "verified", { sources: ["registry"] }),
    euJurisdiction: field(false, "verified", { sources: ["registry"] }),
    ownershipStatus: field("independent", "verified", { sources: ["registry"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: field({ band: "2-10", min: 2, max: 10 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: null,
      linkedinFollowers: field(33, "estimated", {
        note: "Approximate LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: unverified(OPEN_FIELD),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      measured(269, DATASET_DATE, {
        scope: "llm",
        sourceIds: ["models-endpoint"],
        note: `${COUNT_RULE} The endpoint returned 271 entries, two of which are the pseudo-models "auto" and "custom".`,
      }),
      [
        measured(258, BASELINE_DATE, {
          sourceIds: ["baseline"],
          note: "Project baseline measurement.",
        }),
      ],
    ),
    providers: metric(
      measured(52, DATASET_DATE, {
        sourceIds: ["models-endpoint"],
        note: "Distinct upstream providers named across the catalogue, excluding the gateway's own entry.",
      }),
    ),
    routes: metric(
      measured(571, DATASET_DATE, {
        sourceIds: ["models-endpoint"],
        note: "Model x provider combinations across the public catalogue.",
      }),
    ),
    modalities: field(["llm"], "vendor-stated", { note: VENDOR_NOTE }),
    deployment: field(["hosted"], "vendor-stated"),
    pricingTransparency: field("public", "verified", {
      note: "Per-model pricing is published in the public model endpoint.",
      sources: ["models-endpoint"],
      asOf: DATASET_DATE,
    }),
    strengths: [
      "Catalogue is publicly enumerable and was measured at 269 models on September 15, 2026, across 52 upstream providers.",
      "Publishes per-model provider routes, so its 571 routes can be counted rather than estimated.",
      "Operating entity is registry-confirmed, which several larger entries here are not.",
    ],
    limitations: [
      "A 2–10 person company, which is material when assessing operational risk.",
      "Current provider and model figures are not published under a stated definition, so they are left open rather than guessed.",
    ],
    bestFor: [],
    sources: [
      baselineSource(),
      modelsEndpointSource("https://api.llmgateway.io/v1/models"),
      siteSource("https://llmgateway.io"),
      registrySource("Delaware Division of Corporations — Polar Lights LLC"),
      linkedinSource(),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "novita-ai",
    slug: "novita-ai",
    name: "Novita AI",
    website: "https://novita.ai",
    summary:
      "An inference platform offering hosted open models across text, image, video and audio, plus GPU capacity.",
    differentiator: "Open-model inference platform with its own serving stack.",
    type: "managed",
    tier: "primary",
    categories: ["largest-model-catalogues", "multimodal"],
    jurisdictionBucket: "unresolved",
    country: unverified(
      "No operating entity or country of registration has been established. None is assumed.",
    ),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: field({ band: "11-50", min: 11, max: 50 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/novita_labs",
      linkedinFollowers: field(2546, "verified", {
        note: "Exact LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: field(6000, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      measured(117, DATASET_DATE, {
        scope: "llm",
        sourceIds: ["models-endpoint"],
        note: `${COUNT_RULE} Counted from the OpenAI-compatible model endpoint, which covers the text catalogue; image, video and audio models are served through separate APIs that are not enumerable in the same way.`,
      }),
      [
        measured(156, BASELINE_DATE, {
          sourceIds: ["baseline"],
          note: "Project baseline measurement. The catalogue has since contracted.",
        }),
      ],
    ),
    providers: metric(
      notComparable(
        "Novita serves open-weight models on its own infrastructure rather than brokering third-party provider APIs, so an upstream provider count does not describe this product.",
      ),
    ),
    modalities: field(["llm", "image", "video", "stt", "tts"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["site"],
    }),
    deployment: field(["hosted"], "vendor-stated"),
    pricingTransparency: field("public", "verified", {
      note: "Per-million-token input and output pricing is published in the public model endpoint.",
      sources: ["models-endpoint"],
      asOf: DATASET_DATE,
    }),
    strengths: [
      "117 text models measured from its public endpoint on September 15, 2026, down from 156 a week earlier.",
      "Serves open-weight models directly rather than only brokering other providers' APIs.",
    ],
    limitations: [
      "No operating entity or jurisdiction has been established, which blocks any residency or contracting assessment.",
      "Certifications are not established in this dataset.",
    ],
    bestFor: ["Teams running open-weight models without operating their own GPU fleet."],
    sources: [
baselineSource(),
      modelsEndpointSource("https://api.novita.ai/openai/v1/models"),
      siteSource("https://novita.ai"),
      linkedinSource(),
      xSource("novita_labs"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "truefoundry",
    slug: "truefoundry",
    name: "TrueFoundry",
    website: "https://www.truefoundry.com",
    summary:
      "An enterprise AI platform with an LLM gateway component, deployable into a customer's own cloud account or data centre.",
    differentiator: "Enterprise gateway built for VPC and on-premise deployment.",
    type: "enterprise",
    tier: "primary",
    categories: ["enterprise"],
    jurisdictionBucket: "unresolved",
    legalEntity: unverified(
      "Evidence about the operating entity conflicts and is not resolved. Flagged in the September 8, 2026 legal baseline.",
    ),
    country: unverified(
      "Country of incorporation is unresolved because the evidence conflicts. The company's San Francisco presence is recorded separately as a city.",
    ),
    city: field("San Francisco", "verified", { sources: ["linkedin"], asOf: DATASET_DATE }),
    euJurisdiction: unverified(
      "Cannot be determined while the country of incorporation is unresolved.",
    ),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: field({ band: "51-200", min: 51, max: 200 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/truefoundry",
      linkedinFollowers: field(38251, "verified", {
        note: "Exact LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: field(1200, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      official("1,000+", DATASET_DATE, {
        sourceIds: ["site"],
        note: "Vendor floor for LLMs reachable through the gateway. The product is deployed into customer infrastructure and exposes no public catalogue endpoint.",
      }),
    ),
    providers: metric(
      notPublished("No upstream provider count is published in the vendor's public material."),
    ),
    modalities: field(["llm"], "vendor-stated", { note: VENDOR_NOTE }),
    deployment: field(["hosted", "vpc", "on-prem"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["site"],
    }),
    vpc: field("yes", "vendor-stated", { sources: ["site"] }),
    onPrem: field("yes", "vendor-stated", { sources: ["site"] }),
    certifications: field(["SOC 2"], "vendor-stated", {
      note: "The vendor also positions around HIPAA and ITAR. Those are regulatory regimes rather than certifications, so they are not listed here as certifications.",
      sources: ["site"],
    }),
    pricingTransparency: field("contact-sales", "vendor-stated", {
      note: "Enterprise, sales-led positioning.",
      sources: ["site"],
    }),
    strengths: [
      "Deploys inside the customer's own cloud account or data centre, which changes where requests are processed regardless of vendor region lists.",
      "Largest social reach of any entry in this dataset, and a 51–200 person company.",
      "SOC 2 stated, with HIPAA and ITAR positioning for regulated workloads.",
    ],
    limitations: [
      "The operating entity and country of incorporation are unresolved because the evidence conflicts — unusual for a company of this size.",
      "1,000+ LLMs is a vendor floor, not a measured catalogue.",
      "Enterprise, sales-led pricing.",
    ],
    bestFor: ["Organisations that require the gateway to run inside their own infrastructure."],
    sources: [
      baselineSource(), siteSource("https://www.truefoundry.com"), linkedinSource(),
      xSource("truefoundry"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "portkey",
    slug: "portkey",
    name: "Portkey",
    website: "https://portkey.ai",
    summary:
      "An AI gateway with routing, caching, guardrails and observability, available as a hosted service and as an Apache-2.0 gateway that customers can run themselves.",
    differentiator: "Apache-2.0 gateway core; acquired by Palo Alto Networks in May 2026.",
    type: "enterprise",
    tier: "primary",
    categories: ["enterprise", "open-source"],
    jurisdictionBucket: "us",
    country: field("United States", "verified", { sources: ["site"], asOf: DATASET_DATE }),
    countryCode: field("US", "verified", { sources: ["site"] }),
    euJurisdiction: field(false, "verified", { sources: ["site"] }),
    ownershipStatus: field("acquired", "verified", {
      note: "Acquisition completed on May 29, 2026, announced April 30, 2026.",
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    ownership: field("Acquired by Palo Alto Networks; completed May 29, 2026", "verified", {
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    parentCompany: field("Palo Alto Networks", "verified", { sources: ["site"] }),
    productStatus: field("active", "verified", { sources: ["repo"] }),
    employees: field({ band: "11-50", min: 11, max: 50 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/PortkeyAI",
      linkedinFollowers: field(12157, "verified", {
        note: "Exact LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: field(2000, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      notComparable(
        "The vendor's published 1,600+ figure counts addressable endpoints rather than deduplicated models, so it is recorded as an endpoint count and not as a model catalogue. No deduplicated model count is published.",
      ),
    ),
    providers: metric(
      notPublished("No upstream provider count is published in the vendor's public material."),
    ),
    endpoints: metric(
      official("1,600+", DATASET_DATE, {
        sourceIds: ["site"],
        note: "Addressable endpoints, published by the vendor. Not a model count.",
      }),
    ),
    modalities: field(["llm", "vision"], "vendor-stated", { note: VENDOR_NOTE }),
    deployment: field(["hosted", "self-hosted"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["repo"],
    }),
    openSource: field("yes", "verified", {
      note: "The gateway component is published under Apache-2.0.",
      sources: ["repo"],
    }),
    license: field("Apache-2.0", "verified", { sources: ["repo"] }),
    repository: field("https://github.com/Portkey-AI/gateway", "verified", { sources: ["repo"] }),
    strengths: [
      "The routing component is Apache-2.0, so it can be inspected and run inside the customer's own infrastructure.",
      "Backing of a large security vendor following the Palo Alto Networks acquisition.",
    ],
    limitations: [
      "Acquired by Palo Alto Networks in May 2026, so roadmap, pricing and data handling now sit with a parent company.",
      "The published 1,600+ figure counts endpoints rather than deduplicated models, so it is not comparable with a model count.",
      "EU data residency and certifications are not established in this dataset.",
    ],
    bestFor: ["Teams that want a gateway they can read the source of and run themselves."],
    sources: [
baselineSource(),
      siteSource("https://portkey.ai"),
      repoSource("https://github.com/Portkey-AI/gateway"),
      linkedinSource(),
      xSource("PortkeyAI"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "helicone",
    slug: "helicone",
    name: "Helicone",
    website: "https://www.helicone.ai",
    summary:
      "An open-source observability and gateway layer for LLM applications. Acquired by Mintlify in March 2026 and now in maintenance mode.",
    differentiator: "Open source and self-hostable, but no longer actively developed.",
    type: "managed",
    tier: "primary",
    categories: ["open-source"],
    jurisdictionBucket: "us",
    legalEntity: field("Helicone, Inc.", "verified", { sources: ["site"], asOf: DATASET_DATE }),
    country: field("United States", "verified", { sources: ["site"] }),
    countryCode: field("US", "verified", { sources: ["site"] }),
    euJurisdiction: field(false, "verified", { sources: ["site"] }),
    ownershipStatus: field("acquired", "verified", {
      note: "Announced on March 3, 2026.",
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    ownership: field("Acquired by Mintlify; announced March 3, 2026", "verified", {
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    parentCompany: field("Mintlify", "verified", { sources: ["site"] }),
    productStatus: field("maintenance", "verified", {
      note: "Maintenance mode following the acquisition: security patches, bug fixes and new model support continue, but active feature development has ended.",
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    employees: field({ band: "2-10", min: 2, max: 10 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/helicone_ai",
      linkedinFollowers: field(2543, "verified", {
        note: "Exact LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: field(6000, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      variable(
        "Helicone proxies traffic to providers the customer configures with their own keys, so the reachable catalogue is whatever those providers expose rather than a fixed list.",
      ),
    ),
    providers: metric(
      variable("Determined by the provider credentials the customer configures."),
    ),
    modalities: field(["llm"], "vendor-stated", { note: VENDOR_NOTE }),
    deployment: field(["hosted", "self-hosted"], "vendor-stated", { sources: ["repo"] }),
    openSource: field("yes", "verified", { sources: ["repo"] }),
    repository: field("https://github.com/Helicone/helicone", "verified", { sources: ["repo"] }),
    strengths: [
      "Codebase is public, so logging and routing behaviour can be audited directly.",
      "Can be self-hosted, which keeps request handling inside infrastructure the customer controls.",
    ],
    limitations: [
      "In maintenance mode after the March 2026 Mintlify acquisition — a material risk for a new long-term dependency.",
      "Catalogue breadth is not the product's purpose, so no model count is recorded.",
    ],
    bestFor: [
      "Teams already running it, or wanting a self-hosted observability layer they can fork.",
    ],
    sources: [
baselineSource(),
      siteSource("https://www.helicone.ai"),
      repoSource("https://github.com/Helicone/helicone"),
      linkedinSource(),
      xSource("helicone_ai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "braintrust",
    slug: "braintrust",
    name: "Braintrust",
    website: "https://www.braintrust.dev",
    summary:
      "An evaluation and observability platform for AI products, including a proxy that routes requests to multiple model providers.",
    differentiator: "Evaluation-first, with a model proxy attached.",
    type: "enterprise",
    tier: "primary",
    categories: ["enterprise"],
    jurisdictionBucket: "us",
    legalEntity: field("Braintrust Data, Inc.", "verified", {
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    country: field("United States", "verified", { sources: ["site"] }),
    countryCode: field("US", "verified", { sources: ["site"] }),
    city: field("San Francisco", "verified", { sources: ["linkedin"] }),
    euJurisdiction: field(false, "verified", { sources: ["site"] }),
    ownershipStatus: field("independent", "verified", { sources: ["site"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: field({ band: "51-200", min: 51, max: 200 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/braintrust",
      linkedinFollowers: field(15697, "verified", {
        note: "Exact LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: field(7600, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      variable(
        "The AI proxy reaches whichever providers the customer configures with their own keys, so there is no fixed catalogue to count.",
      ),
    ),
    providers: metric(
      variable("Determined by the provider credentials the customer configures."),
    ),
    modalities: field(["llm"], "vendor-stated", { note: VENDOR_NOTE }),
    deployment: field(["hosted"], "vendor-stated"),
    strengths: [
      "Routing is coupled to evaluation, so model changes can be measured against test sets rather than chosen by catalogue size.",
      "51–200 person company with a confirmed operating entity.",
    ],
    limitations: [
      "Model and provider counts are not published as an enumerable catalogue.",
      "EU residency and certifications are not established in this dataset.",
    ],
    bestFor: ["Teams that select models by evaluation results rather than catalogue size."],
    sources: [
      baselineSource(), siteSource("https://www.braintrust.dev"), linkedinSource(),
      xSource("braintrust"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "respan",
    slug: "respan",
    name: "Respan",
    formerName: "Keywords AI",
    website: "https://www.keywordsai.co",
    summary:
      "An LLM monitoring and gateway platform, formerly named Keywords AI. Recorded once under its current name so the rename cannot split it into two entries.",
    differentiator: "Formerly Keywords AI — one company, one entry.",
    type: "managed",
    tier: "primary",
    categories: [],
    jurisdictionBucket: "us",
    legalEntity: field("Keywords AI, Inc.", "verified", {
      note: "The company now trades as Respan; the registered entity name is unchanged.",
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    country: field("United States", "verified", { sources: ["site"] }),
    countryCode: field("US", "verified", { sources: ["site"] }),
    euJurisdiction: field(false, "verified", { sources: ["site"] }),
    ownershipStatus: field("independent", "verified", { sources: ["site"] }),
    ownership: field("Respan and Keywords AI are the same company", "verified", {
      note: "Integrity note carried from the September 8, 2026 legal baseline. The two names are one entry in this dataset, not two.",
      sources: ["baseline"],
      asOf: BASELINE_DATE,
    }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: field({ band: "11-50", min: 11, max: 50 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/RespanAI",
      linkedinFollowers: field(5859, "verified", {
        note: "Exact LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: field(2000, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      notPublished("No comparable public model count was found in the vendor's material."),
    ),
    providers: metric(
      notPublished("No upstream provider count is published in the vendor's public material."),
    ),
    modalities: field(["llm"], "vendor-stated", { note: VENDOR_NOTE }),
    deployment: field(["hosted"], "vendor-stated"),
    strengths: ["Monitoring and gateway functions in one product."],
    limitations: [
      "Model and provider counts, residency and certifications are open in this dataset.",
      "The Keywords AI to Respan rename means older comparisons may double-count this company.",
    ],
    bestFor: [],
    sources: [
      baselineSource(), siteSource("https://www.keywordsai.co"),
      linkedinSource(),
      xSource("RespanAI"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "martian",
    slug: "martian",
    name: "Martian",
    website: "https://www.withmartian.com",
    summary:
      "A model router that selects between upstream models per request rather than exposing a fixed choice.",
    differentiator: "The routing decision itself is the product.",
    type: "managed",
    tier: "primary",
    categories: [],
    jurisdictionBucket: "us",
    legalEntity: field("Martian Learning, Inc.", "verified", {
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    country: field("United States", "verified", { sources: ["site"] }),
    countryCode: field("US", "verified", { sources: ["site"] }),
    euJurisdiction: field(false, "verified", { sources: ["site"] }),
    ownershipStatus: field("independent", "verified", { sources: ["site"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: field({ band: "11-50", min: 11, max: 50 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/withmartian",
      linkedinFollowers: field(6409, "verified", {
        note: "Exact LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: field(4000, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      notPublished(
        "Martian routes between models per request and publishes no catalogue count. A single figure would not describe the product well in any case.",
      ),
    ),
    providers: metric(
      notPublished("No upstream provider count is published in the vendor's public material."),
    ),
    modalities: field(["llm"], "vendor-stated", { note: VENDOR_NOTE }),
    deployment: field(["hosted"], "vendor-stated"),
    strengths: [
      "Intelligent per-request model routing rather than a fixed model choice.",
      "Operating entity confirmed.",
    ],
    limitations: [
      "No model or provider counts are published, and none are assumed here.",
      "Per-request routing makes a single catalogue count less meaningful.",
    ],
    bestFor: ["Teams optimising cost or quality per request rather than picking one model."],
    sources: [
      baselineSource(), siteSource("https://www.withmartian.com"), linkedinSource(),
      xSource("withmartian"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "not-diamond",
    slug: "not-diamond",
    name: "Not Diamond",
    website: "https://www.notdiamond.ai",
    summary:
      "A routing layer that selects a model per prompt based on learned routing decisions, with a focus on coding agents.",
    differentiator: "Prompt-level model routing for coding agents.",
    type: "managed",
    tier: "primary",
    categories: ["agent-gateways"],
    jurisdictionBucket: "us",
    legalEntity: field("Not Diamond, Inc.", "verified", {
      sources: ["site"],
      asOf: DATASET_DATE,
    }),
    country: field("United States", "verified", { sources: ["site"] }),
    countryCode: field("US", "verified", { sources: ["site"] }),
    city: field("San Francisco", "verified", { sources: ["linkedin"] }),
    euJurisdiction: field(false, "verified", { sources: ["site"] }),
    ownershipStatus: field("independent", "verified", { sources: ["site"] }),
    productStatus: field("active", "verified", { sources: ["site"] }),
    employees: field({ band: "11-50", min: 11, max: 50 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/notdiamond_ai",
      linkedinFollowers: unverified(
        "No LinkedIn follower count was found for this company.",
      ),
      xFollowers: field(154, "verified", {
        note: "Exact X follower count captured on the snapshot date.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      notPublished(
        "Not Diamond selects a model per prompt from a routed set and publishes no headline catalogue count.",
      ),
    ),
    providers: metric(
      notPublished("No upstream provider count is published in the vendor's public material."),
    ),
    modalities: field(["llm", "agents"], "vendor-stated", { note: VENDOR_NOTE }),
    deployment: field(["hosted"], "vendor-stated"),
    certifications: field(["SOC 2", "ISO/IEC 27001"], "vendor-stated", { sources: ["site"] }),
    zeroDataRetention: field("yes", "vendor-stated", {
      note: "Zero-data-retention is part of the vendor's published positioning.",
      sources: ["site"],
    }),
    strengths: [
      "SOC 2 and ISO/IEC 27001 stated, with zero-data-retention positioning, at an 11–50 person scale.",
      "Routing tuned for coding agents rather than general chat.",
    ],
    limitations: [
      "No enumerable catalogue, so no measured model count is recorded.",
      "EU residency is not established in this dataset.",
    ],
    bestFor: ["Teams routing coding-agent traffic across models."],
    sources: [
      baselineSource(), siteSource("https://www.notdiamond.ai"), linkedinSource(),
      xSource("notdiamond_ai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "maxim-ai",
    slug: "maxim-ai",
    name: "Maxim AI",
    website: "https://www.getmaxim.ai",
    summary:
      "An evaluation and observability platform for AI agents. Its gateway component, Bifrost, is published under Apache-2.0 and can be self-hosted, including air-gapped.",
    differentiator: "Apache-2.0 gateway (Bifrost) with air-gapped deployment.",
    type: "enterprise",
    tier: "primary",
    categories: ["agent-gateways", "enterprise", "open-source"],
    jurisdictionBucket: "unresolved",
    legalEntity: field("H3 Labs Inc.", "verified", { sources: ["site"], asOf: DATASET_DATE }),
    country: unverified(
      "The operating entity is H3 Labs Inc., but its country of registration has not been read from a registry filing. None is assumed.",
    ),
    euJurisdiction: unverified(
      "Cannot be determined while the country of registration is unresolved.",
    ),
    productStatus: field("active", "verified", { sources: ["repo"] }),
    employees: field({ band: "11-50", min: 11, max: 50 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/getmaximai",
      linkedinFollowers: field(6910, "verified", {
        note: "Exact LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: field(395, "verified", {
        note: "Exact X follower count captured on the snapshot date.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      variable(
        "Bifrost is deployed by the customer and routes to the providers they configure, so the reachable catalogue depends on that configuration.",
      ),
    ),
    providers: metric(
      variable("Determined by the provider credentials configured in the customer's deployment."),
    ),
    modalities: field(["llm", "agents"], "vendor-stated", { note: VENDOR_NOTE }),
    deployment: field(["hosted", "self-hosted", "vpc", "on-prem"], "vendor-stated", {
      note: "Bifrost can be self-hosted, deployed into a customer VPC, or run air-gapped.",
      sources: ["repo"],
    }),
    vpc: field("yes", "vendor-stated", { sources: ["site"] }),
    onPrem: field("yes", "vendor-stated", {
      note: "Air-gapped deployment is offered.",
      sources: ["site"],
    }),
    openSource: field("yes", "verified", {
      note: "The Bifrost gateway is published under Apache-2.0.",
      sources: ["repo"],
    }),
    license: field("Apache-2.0", "verified", { sources: ["repo"] }),
    certifications: field(["SOC 2 Type II", "ISO/IEC 27001"], "vendor-stated", {
      note: "The vendor also positions around HIPAA and GDPR, which are regulatory regimes rather than certifications.",
      sources: ["site"],
    }),
    strengths: [
      "Gateway component is Apache-2.0 and can run air-gapped, which removes the vendor from the request path.",
      "SOC 2 Type II and ISO/IEC 27001 stated, alongside agent evaluation tooling.",
    ],
    limitations: [
      "The country of registration for H3 Labs Inc. is unresolved, so jurisdiction cannot be assessed.",
      "No model or provider counts are published.",
    ],
    bestFor: ["Teams building agents that need evaluation plus a self-hostable gateway."],
    sources: [
baselineSource(),
      siteSource("https://www.getmaxim.ai"),
      repoSource("https://github.com/maximhq/bifrost"),
      linkedinSource(),
      xSource("getmaximai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "atlas-cloud",
    slug: "atlas-cloud",
    name: "Atlas Cloud",
    website: null,
    summary:
      "An inference platform serving text, image, video and audio models. Its own policy states that it does not represent that it holds SOC 2, ISO 27001 or HIPAA certification.",
    differentiator: "Multimodal inference; explicitly claims no security certifications.",
    type: "managed",
    tier: "additional",
    categories: ["multimodal"],
    jurisdictionBucket: "us",
    country: field("United States", "verified", { sources: ["linkedin"], asOf: DATASET_DATE }),
    countryCode: field("US", "verified", { sources: ["linkedin"] }),
    city: field("Menlo Park, California", "verified", { sources: ["linkedin"] }),
    euJurisdiction: field(false, "verified", { sources: ["linkedin"] }),
    productStatus: field("active", "verified"),
    employees: field({ band: "11-50", min: 11, max: 50 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/atlas_cloud_ai",
      linkedinFollowers: field(4848, "verified", {
        note: "Exact LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: field(3000, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      notPublished("No comparable public model count was found in the vendor's material."),
    ),
    providers: metric(
      notComparable(
        "Atlas Cloud serves models on its own infrastructure rather than brokering third-party provider APIs, so an upstream provider count does not describe this product.",
      ),
    ),
    modalities: field(["llm", "image", "video", "audio"], "vendor-stated", {
      note: VENDOR_NOTE,
    }),
    deployment: field(["hosted"], "vendor-stated"),
    certifications: field([], "verified", {
      note: "None claimed. The vendor's own policy states that it does not represent that it holds SOC 2, ISO 27001 or HIPAA certification. This is recorded as an explicit absence, not as missing data.",
      sources: ["legal"],
      asOf: DATASET_DATE,
    }),
    strengths: [
      "Covers text, image, video and audio in one platform.",
      "Explicit about not holding security certifications, which is more useful to a buyer than silence.",
    ],
    limitations: [
      "States that it does not represent holding SOC 2, ISO 27001 or HIPAA certification — a blocker for many regulated buyers.",
      "The official product URL has not been confirmed for this dataset, so no link is published.",
      "No model or provider counts are published.",
    ],
    bestFor: [],
    sources: [
      baselineSource(), legalSource(), linkedinSource(),
      xSource("atlas_cloud_ai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "anannas",
    slug: "anannas",
    name: "Anannas",
    website: null,
    summary:
      "A unified OpenAI-compatible API that routes on price, latency and throughput, with fallback, multimodal support and bring-your-own-key.",
    differentiator: "Price, latency and throughput routing; jurisdiction unresolved.",
    type: "managed",
    tier: "additional",
    categories: [],
    jurisdictionBucket: "unresolved",
    country: unverified(
      "Unresolved. The published Terms contain an unfinished “[your jurisdiction]” placeholder, so no governing jurisdiction can be read from them.",
    ),
    legalEntity: unverified("Not established. The Terms do not name an operating entity."),
    euJurisdiction: unverified(
      "Cannot be determined: the Terms contain an unfinished jurisdiction placeholder.",
    ),
    productStatus: field("active", "verified"),
    employees: field({ band: "2-10", min: 2, max: 10 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/anannas_ai",
      linkedinFollowers: field(147, "verified", {
        note: "Exact LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: field(739, "verified", {
        note: "Exact X follower count captured on the snapshot date.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      notPublished(
        "No comparable public model count was found. The public API endpoint did not respond when checked on September 15, 2026.",
      ),
    ),
    providers: metric(
      notPublished("No upstream provider count is published in the vendor's public material."),
    ),
    deployment: field(["hosted"], "vendor-stated"),
    byok: field("yes", "vendor-stated", { sources: ["site"] }),
    strengths: [
      "Routes on price, latency and throughput with fallback, rather than a fixed provider order.",
      "OpenAI-compatible surface with bring-your-own-key support.",
    ],
    limitations: [
      "The published Terms contain an unfinished “[your jurisdiction]” placeholder, so the governing jurisdiction is genuinely unknown — a material contracting risk.",
      "No operating entity is named anywhere in the available material.",
      "A 2–10 person company, with no model or provider counts published.",
    ],
    bestFor: [],
    sources: [
      baselineSource(), legalSource(), linkedinSource(), vendorMaterialSource(),
      xSource("anannas_ai"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "routescope",
    slug: "routescope",
    name: "RouteScope",
    website: null,
    summary:
      "Listed in the September 8, 2026 baseline as a routing candidate. No product or company detail has been established from primary sources.",
    differentiator: "Candidate entry; nothing established.",
    type: "managed",
    tier: "additional",
    categories: [],
    jurisdictionBucket: "unresolved",
    country: unverified("No jurisdiction established. None is assumed."),
    legalEntity: unverified("No operating entity established."),
    models: metric(
      notPublished("No public product material was found for this entry."),
    ),
    providers: metric(
      notPublished("No public product material was found for this entry."),
    ),
    strengths: [],
    limitations: [
      "Nothing about this entry has been established from a primary source. It is listed so the dataset does not silently drop a candidate, not because it can be compared yet.",
    ],
    bestFor: [],
    sources: [baselineSource()],
    lastVerified: BASELINE_DATE,
  }),

  // ---------------------------------------------------------------------
  // Self-hosted / open-source gateways
  // ---------------------------------------------------------------------
  createGateway({
    id: "litellm",
    slug: "litellm",
    name: "LiteLLM",
    website: "https://www.litellm.ai",
    summary:
      "An open-source proxy and SDK that exposes many provider APIs through one OpenAI-compatible interface, run by the customer.",
    differentiator: "Widely deployed open-source proxy; MIT licensed.",
    type: "self-hosted",
    tier: "self-hosted",
    categories: ["open-source", "multimodal"],
    jurisdictionBucket: "us",
    country: field("United States", "needs-verification", {
      note: "Maintained by BerriAI. Registry confirmation is outstanding.",
    }),
    countryCode: field("US", "needs-verification"),
    euJurisdiction: field(false, "needs-verification"),
    ownershipStatus: field("independent", "vendor-stated", { sources: ["repo"] }),
    productStatus: field("active", "verified", { sources: ["repo"] }),
    employees: field({ band: "11-50", min: 11, max: 50 }, "verified", {
      note: "LinkedIn company-size band.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/LiteLLM",
      linkedinFollowers: field(14187, "verified", {
        note: "Exact LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: field(5000, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      variable(
        "LiteLLM is a proxy the customer runs and points at their own provider accounts, so the reachable catalogue is whatever those accounts expose. The project documents support for a large number of provider APIs, which is a different thing from a catalogue count.",
      ),
    ),
    providers: metric(
      variable("Determined by the provider credentials configured in the customer's deployment."),
    ),
    modalities: field(["llm", "image", "stt", "tts", "embeddings", "reranking"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["docs"],
    }),
    deployment: field(["self-hosted", "hosted"], "verified", { sources: ["repo"] }),
    euResidency: field("self-hosted", "verified", {
      note: "The customer runs the proxy, so request handling happens wherever they deploy it.",
      sources: ["repo"],
    }),
    zeroDataRetention: notApplicable(
      "No vendor-operated endpoint receives the traffic in a self-hosted deployment.",
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
    strengths: [
      "Source is public and permissively licensed, so behaviour can be audited and modified.",
      "Residency follows the deployment, not a vendor's region list.",
      "Covers image, speech, embedding and reranking endpoints as well as text.",
    ],
    limitations: [
      "The customer operates, updates and secures the gateway themselves.",
      "Self-hosting the proxy does not change where the upstream models actually run.",
    ],
    bestFor: ["Teams that need the gateway inside their own perimeter."],
    sources: [
siteSource("https://www.litellm.ai"),
      repoSource("https://github.com/BerriAI/litellm"),
      docsSource("https://docs.litellm.ai"),
      linkedinSource(),
      xSource("LiteLLM"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "kong-ai-gateway",
    slug: "kong-ai-gateway",
    name: "Kong AI Gateway",
    website: "https://konghq.com/products/kong-ai-gateway",
    summary:
      "AI routing, credential management and governance plugins built on the Kong Gateway data plane.",
    differentiator: "AI routing delivered as plugins on an established API gateway.",
    type: "self-hosted",
    tier: "self-hosted",
    categories: ["open-source", "enterprise"],
    jurisdictionBucket: "us",
    country: field("United States", "needs-verification", {
      note: "Kong Inc. Registry confirmation is outstanding.",
    }),
    countryCode: field("US", "needs-verification"),
    euJurisdiction: field(false, "needs-verification"),
    ownershipStatus: field("independent", "vendor-stated", { sources: ["site"] }),
    productStatus: field("active", "verified", { sources: ["repo"] }),
    employees: field({ band: "1,001-5,000", min: 1001, max: 5000 }, "verified", {
      note: "LinkedIn company-size band. Figures describe Kong Inc., the company behind the gateway, not the AI Gateway product alone.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/thekonginc",
      linkedinFollowers: field(83801, "verified", {
        note: "Exact LinkedIn follower count captured on the snapshot date. Figures describe Kong Inc., the company behind the gateway, not the AI Gateway product alone.",
        sources: ["linkedin"],
      }),
      xFollowers: field(26500, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date. Figures describe Kong Inc., the company behind the gateway, not the AI Gateway product alone.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      variable(
        "Kong routes to upstream AI providers configured on its data plane, so the reachable catalogue depends entirely on that configuration.",
      ),
    ),
    providers: metric(
      variable("Determined by the AI provider plugins configured on the data plane."),
    ),
    modalities: field(["llm", "embeddings"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["docs"],
    }),
    deployment: field(["self-hosted", "hosted", "on-prem"], "vendor-stated", { sources: ["docs"] }),
    euResidency: field("self-hosted", "verified", {
      note: "In a self-managed deployment the data plane runs wherever the customer places it.",
      sources: ["docs"],
    }),
    openSource: field("yes", "verified", {
      note: "Kong Gateway is Apache-2.0. Some AI capabilities are enterprise-only.",
      sources: ["repo"],
    }),
    license: field("Apache-2.0", "verified", { sources: ["repo"] }),
    repository: field("https://github.com/Kong/kong", "verified", { sources: ["repo"] }),
    onPrem: field("yes", "vendor-stated", { sources: ["docs"] }),
    strengths: [
      "Reuses an existing API gateway deployment rather than adding a separate hop.",
      "Data plane placement is a deployment decision, not a vendor region setting.",
    ],
    limitations: [
      "Some AI features are gated behind the enterprise edition.",
      "No published model catalogue count, because the product routes rather than hosts models.",
    ],
    bestFor: ["Organisations already running Kong for API traffic."],
    sources: [
siteSource("https://konghq.com/products/kong-ai-gateway"),
      repoSource("https://github.com/Kong/kong"),
      docsSource("https://docs.konghq.com/gateway/latest/ai-gateway/"),
      linkedinSource(),
      xSource("thekonginc"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "envoy-ai-gateway",
    slug: "envoy-ai-gateway",
    name: "Envoy AI Gateway",
    website: "https://aigateway.envoyproxy.io",
    summary:
      "An open-source AI gateway built on Envoy Gateway, providing unified upstream access, credential handling and traffic policy for Kubernetes.",
    differentiator: "Community-governed project rather than a single vendor's product.",
    type: "self-hosted",
    tier: "self-hosted",
    categories: ["open-source"],
    jurisdictionBucket: "unresolved",
    country: notApplicable(
      "A community-governed open-source project rather than a single operating company.",
    ),
    legalEntity: notApplicable("No single operating entity; governed as an Envoy project."),
    euJurisdiction: notApplicable("Not a company."),
    ownershipStatus: field("community", "verified", { sources: ["repo"] }),
    productStatus: field("active", "verified", { sources: ["repo"] }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/envoyproxy",
      linkedinFollowers: field(1118, "estimated", {
        note: "Exact LinkedIn follower count captured on the snapshot date.",
        sources: ["linkedin"],
      }),
      xFollowers: field(31000, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      variable(
        "The gateway routes to upstream providers declared in Kubernetes resources, so the reachable catalogue is whatever the cluster operator configures.",
      ),
    ),
    providers: metric(
      variable("Determined by the upstream providers declared in the cluster configuration."),
    ),
    modalities: field(["llm", "embeddings"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["docs"],
    }),
    deployment: field(["self-hosted", "on-prem"], "verified", { sources: ["repo"] }),
    euResidency: field("self-hosted", "verified", {
      note: "Runs in the customer's own Kubernetes cluster.",
      sources: ["repo"],
    }),
    zeroDataRetention: notApplicable("No vendor-operated endpoint receives the traffic."),
    openSource: field("yes", "verified", { sources: ["repo"] }),
    license: field("Apache-2.0", "verified", { sources: ["repo"] }),
    repository: field("https://github.com/envoyproxy/ai-gateway", "verified", {
      sources: ["repo"],
    }),
    onPrem: field("yes", "verified", { sources: ["repo"] }),
    pricingTransparency: notApplicable("No commercial licence; the project is free to run."),
    strengths: [
      "No vendor relationship is required to run it.",
      "Built on infrastructure many platform teams already operate.",
    ],
    limitations: [
      "Requires Kubernetes and Envoy Gateway operational knowledge.",
      "Company-level comparison columns do not apply to a community project.",
    ],
    bestFor: ["Platform teams standardising AI traffic on existing Envoy infrastructure."],
    sources: [
      siteSource("https://aigateway.envoyproxy.io"),
      repoSource("https://github.com/envoyproxy/ai-gateway"),
      docsSource("https://aigateway.envoyproxy.io/docs/"),
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
    summary:
      "AWS's managed multi-model service, offering models from several providers through AWS APIs, billing and regions.",
    differentiator: "Model access inside an existing AWS account and region model.",
    type: "hyperscaler",
    tier: "hyperscaler",
    categories: ["enterprise", "eu-hosted", "multimodal"],
    jurisdictionBucket: "us",
    country: field("United States", "verified", {
      note: "Operated by Amazon Web Services, Inc.",
      sources: ["site"],
    }),
    countryCode: field("US", "verified", { sources: ["site"] }),
    euJurisdiction: field(false, "verified", { sources: ["site"] }),
    ownershipStatus: field("subsidiary", "verified", { sources: ["site"] }),
    parentCompany: field("Amazon.com, Inc.", "verified", { sources: ["site"] }),
    productStatus: field("active", "verified", { sources: ["docs"] }),
    employees: field({ band: "10,001+", min: 10001, max: null }, "verified", {
      note: "LinkedIn company-size band. Figures describe the Amazon Web Services company accounts, not the Bedrock product.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/awscloud",
      linkedinFollowers: field(11060000, "estimated", {
        note: "Approximate LinkedIn follower count, rounded by scale, captured on the snapshot date. Figures describe the Amazon Web Services company accounts, not the Bedrock product.",
        sources: ["linkedin"],
      }),
      xFollowers: field(2200000, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date. Figures describe the Amazon Web Services company accounts, not the Bedrock product.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      notComparable(
        "The catalogue is published per region and per deployment type rather than as one platform-wide list, so a single model count is not comparable with a gateway catalogue count.",
      ),
    ),
    providers: metric(
      notComparable(
        "Models are onboarded by the cloud provider rather than reached through independent upstream provider accounts, so an upstream provider count does not describe this product.",
      ),
    ),
    modalities: field(["llm", "vision", "image", "video", "embeddings"], "vendor-stated", {
      note: VENDOR_NOTE,
      sources: ["docs"],
    }),
    deployment: field(["hosted", "vpc"], "vendor-stated", { sources: ["docs"] }),
    euResidency: field("eu-available", "verified", {
      note: "The service is offered in documented EU regions that the customer selects. It is not EU-only by default.",
      sources: ["docs"],
    }),
    gatewayLocations: field(["Documented AWS regions, including EU regions"], "vendor-stated", {
      sources: ["docs"],
    }),
    inferenceLocations: field(
      ["Within the selected AWS region, subject to per-model availability"],
      "vendor-stated",
      { sources: ["docs"] },
    ),
    vpc: field("yes", "vendor-stated", { sources: ["docs"] }),
    dpa: field("yes", "vendor-stated", { sources: ["site"] }),
    openSource: field("no", "verified"),
    pricingTransparency: field("public", "verified", { sources: ["site"] }),
    certifications: field(["ISO/IEC 27001", "SOC 2"], "vendor-stated", {
      note: "Published on the provider's compliance pages. Scope varies by service and region.",
      sources: ["site"],
    }),
    strengths: [
      "Region selection is explicit and documented, including EU regions.",
      "Procurement, billing and access control follow an existing cloud agreement.",
    ],
    limitations: [
      "Catalogue is limited to models the cloud provider has onboarded.",
      "Model availability differs by region, so an EU region does not imply the full catalogue.",
    ],
    bestFor: ["Organisations already standardised on AWS with regional requirements."],
    sources: [
siteSource("https://aws.amazon.com/bedrock/"),
      docsSource("https://docs.aws.amazon.com/bedrock/"),
      linkedinSource(),
      xSource("awscloud"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "google-vertex-ai",
    slug: "google-vertex-ai",
    name: "Google Vertex AI",
    website: "https://cloud.google.com/vertex-ai",
    summary:
      "Google Cloud's managed AI platform, providing first-party and partner models through Google Cloud APIs and regions.",
    differentiator: "Model access inside an existing Google Cloud project.",
    type: "hyperscaler",
    tier: "hyperscaler",
    categories: ["enterprise", "eu-hosted", "multimodal"],
    jurisdictionBucket: "us",
    country: field("United States", "verified", {
      note: "Operated by Google LLC.",
      sources: ["site"],
    }),
    countryCode: field("US", "verified", { sources: ["site"] }),
    euJurisdiction: field(false, "verified", { sources: ["site"] }),
    ownershipStatus: field("subsidiary", "verified", { sources: ["site"] }),
    parentCompany: field("Alphabet Inc.", "verified", { sources: ["site"] }),
    productStatus: field("active", "verified", { sources: ["docs"] }),
    employees: field({ band: "10,001+", min: 10001, max: null }, "verified", {
      note: "LinkedIn company-size band. Figures describe the Google Cloud company accounts, not the Vertex AI product.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/googlecloud",
      linkedinFollowers: field(3420000, "estimated", {
        note: "Approximate LinkedIn follower count, rounded by scale, captured on the snapshot date. Figures describe the Google Cloud company accounts, not the Vertex AI product.",
        sources: ["linkedin"],
      }),
      xFollowers: field(571000, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date. Figures describe the Google Cloud company accounts, not the Vertex AI product.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      notComparable(
        "The catalogue is published per region and per deployment type rather than as one platform-wide list, so a single model count is not comparable with a gateway catalogue count.",
      ),
    ),
    providers: metric(
      notComparable(
        "Models are onboarded by the cloud provider rather than reached through independent upstream provider accounts, so an upstream provider count does not describe this product.",
      ),
    ),
    modalities: field(
      ["llm", "vision", "image", "video", "stt", "tts", "translation", "embeddings"],
      "vendor-stated",
      { note: VENDOR_NOTE, sources: ["docs"] },
    ),
    deployment: field(["hosted", "vpc"], "vendor-stated", { sources: ["docs"] }),
    euResidency: field("eu-available", "verified", {
      note: "Documented EU regions are selectable. Availability of individual models differs by region.",
      sources: ["docs"],
    }),
    gatewayLocations: field(
      ["Documented Google Cloud regions, including EU regions"],
      "vendor-stated",
      { sources: ["docs"] },
    ),
    inferenceLocations: field(
      ["Within the selected region, subject to per-model availability"],
      "vendor-stated",
      { sources: ["docs"] },
    ),
    vpc: field("yes", "vendor-stated", { sources: ["docs"] }),
    dpa: field("yes", "vendor-stated", { sources: ["site"] }),
    openSource: field("no", "verified"),
    pricingTransparency: field("public", "verified", { sources: ["site"] }),
    certifications: field(["ISO/IEC 27001", "SOC 2"], "vendor-stated", {
      note: "Published on the provider's compliance pages. Scope varies by service and region.",
      sources: ["site"],
    }),
    strengths: [
      "Broad modality range across text, vision, image, video, speech, translation and embeddings.",
      "Region selection and data handling terms are documented.",
    ],
    limitations: [
      "Catalogue is limited to first-party and onboarded partner models.",
      "Regional availability varies per model.",
    ],
    bestFor: ["Organisations already standardised on Google Cloud."],
    sources: [
siteSource("https://cloud.google.com/vertex-ai"),
      docsSource("https://cloud.google.com/vertex-ai/docs"),
      linkedinSource(),
      xSource("googlecloud"),
    ],
    lastVerified: DATASET_DATE,
  }),

  createGateway({
    id: "azure-ai-foundry",
    slug: "azure-ai-foundry",
    name: "Azure AI Foundry",
    website: "https://azure.microsoft.com/products/ai-foundry",
    summary:
      "Microsoft's platform for deploying and managing models from several providers within Azure subscriptions and regions.",
    differentiator: "Model access inside an existing Azure subscription.",
    type: "hyperscaler",
    tier: "hyperscaler",
    categories: ["enterprise", "eu-hosted", "multimodal"],
    jurisdictionBucket: "us",
    country: field("United States", "verified", {
      note: "Operated by Microsoft Corporation.",
      sources: ["site"],
    }),
    countryCode: field("US", "verified", { sources: ["site"] }),
    euJurisdiction: field(false, "verified", { sources: ["site"] }),
    ownershipStatus: field("subsidiary", "verified", { sources: ["site"] }),
    parentCompany: field("Microsoft Corporation", "verified", { sources: ["site"] }),
    productStatus: field("active", "verified", { sources: ["docs"] }),
    employees: field({ band: "10,001+", min: 10001, max: null }, "verified", {
      note: "LinkedIn company-size band. Figures describe the Microsoft company accounts, not the AI Foundry product.",
      sources: ["linkedin"],
      asOf: DATASET_DATE,
    }),
    social: {
      linkedinUrl: null,
      xUrl: "https://x.com/Azure",
      linkedinFollowers: field(28970000, "estimated", {
        note: "Approximate LinkedIn follower count, rounded by scale, captured on the snapshot date. Figures describe the Microsoft company accounts, not the AI Foundry product.",
        sources: ["linkedin"],
      }),
      xFollowers: field(1000000, "estimated", {
        note: "Approximate X follower count, rounded by scale, captured on the snapshot date. Figures describe the Microsoft company accounts, not the AI Foundry product.",
        sources: ["x"],
      }),
      snapshotDate: DATASET_DATE,
    },
    models: metric(
      notComparable(
        "The catalogue is published per region and per deployment type rather than as one platform-wide list, so a single model count is not comparable with a gateway catalogue count.",
      ),
    ),
    providers: metric(
      notComparable(
        "Models are onboarded by the cloud provider rather than reached through independent upstream provider accounts, so an upstream provider count does not describe this product.",
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
      { note: VENDOR_NOTE, sources: ["docs"] },
    ),
    deployment: field(["hosted", "vpc"], "vendor-stated", { sources: ["docs"] }),
    euResidency: field("eu-available", "verified", {
      note: "EU regions and EU Data Boundary commitments are documented and selectable.",
      sources: ["docs"],
    }),
    gatewayLocations: field(["Documented Azure regions, including EU regions"], "vendor-stated", {
      sources: ["docs"],
    }),
    inferenceLocations: field(
      ["Within the selected region or deployment type, subject to per-model availability"],
      "vendor-stated",
      { sources: ["docs"] },
    ),
    vpc: field("yes", "vendor-stated", { sources: ["docs"] }),
    dpa: field("yes", "vendor-stated", { sources: ["site"] }),
    openSource: field("no", "verified"),
    pricingTransparency: field("public", "verified", { sources: ["site"] }),
    certifications: field(["ISO/IEC 27001", "SOC 2"], "vendor-stated", {
      note: "Published on the provider's compliance pages. Scope varies by service and region.",
      sources: ["site"],
    }),
    strengths: [
      "Documented EU Data Boundary commitments in addition to region selection.",
      "Widest documented modality coverage in this dataset, including OCR and document processing.",
    ],
    limitations: [
      "Catalogue is limited to models Microsoft has onboarded.",
      "Deployment type affects where processing happens, so the region setting alone is not the whole answer.",
    ],
    bestFor: ["Organisations already standardised on Azure with EU boundary requirements."],
    sources: [
siteSource("https://azure.microsoft.com/products/ai-foundry"),
      docsSource("https://learn.microsoft.com/azure/ai-foundry/"),
      linkedinSource(),
      xSource("Azure"),
    ],
    lastVerified: DATASET_DATE,
  }),
];

/** Fields that remain deliberately open across most of the dataset. */
export const OPEN_DATASET_FIELDS = [
  "X / Twitter follower snapshots",
  "Funding history",
  "Pricing model detail",
  "Inference regions for managed gateways",
  "Founding years",
];

export { OPEN_FIELD };
