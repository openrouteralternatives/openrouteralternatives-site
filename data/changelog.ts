import type { ChangelogEntry } from "@/types";

/**
 * Dated record of what changed in the dataset.
 *
 * Corrections are appended, never applied silently: a superseded figure stays
 * visible here with the value that replaced it and the source for the change.
 */
export const changelog: ChangelogEntry[] = [
  {
    date: "2026-09-21",
    kind: "dataset",
    title: "Four entries removed; Azure AI Foundry catalogue measured; Eden AI providers re-counted",
    summary:
      "Orq.ai, Braintrust, Not Diamond and Maxim AI (Bifrost) are no longer tracked in this revision, taking the dataset from 28 to 24 gateways; their records remain in the repository history and their logo files were removed with them. Azure AI Foundry gains this project's own count of the public Foundry Models catalogue (1,892 at LLM scope, from the September 15, 2026 enumeration), recorded in the metric's history alongside the 1,900+ vendor figure that stays current, so it now appears in the measured catalogue ranking. Eden AI's measured provider count from the public provider endpoint is corrected from 78 to 68.",
    changes: [
      { gateway: "orq-ai", field: "Entry", previous: "Listed", next: "Removed from the dataset", source: "Sep 21, 2026 dataset revision" },
      { gateway: "braintrust", field: "Entry", previous: "Listed", next: "Removed from the dataset", source: "Sep 21, 2026 dataset revision" },
      { gateway: "not-diamond", field: "Entry", previous: "Listed", next: "Removed from the dataset", source: "Sep 21, 2026 dataset revision" },
      { gateway: "maxim-ai", field: "Entry", previous: "Listed", next: "Removed from the dataset", source: "Sep 21, 2026 dataset revision" },
      { gateway: "azure-ai-foundry", field: "Models", previous: "1,900+ official only", next: "1,892 measured (LLM scope, Sep 15, 2026) added to history; 1,900+ official stays current; enters largest-model-catalogues", source: "ai.azure.com/explore/models" },
      { gateway: "eden-ai", field: "Providers (measured)", previous: "78", next: "68 distinct providers across all nine features", source: "api.edenai.run/v2/info/provider_subfeatures" },
    ],
  },
  {
    date: "2026-09-18",
    kind: "company",
    title: "Funding and observability recorded for every gateway",
    summary:
      "The funding field, open since the baseline, now holds the number of disclosed financing rounds and the investors named in them for 17 gateways, from the companies' own announcements or a named company database. Seven gateways with no credible public financing record are marked not publicly listed rather than zero, and the three hyperscaler products and Envoy AI Gateway record the field as not applicable. A new observability field rates every gateway's built-in observability on a five-level scale defined in the methodology, read from vendor documentation. Neither field feeds any ranking.",
    changes: [
      { gateway: null, field: "Funding", previous: "Not recorded", next: "Disclosed rounds and investors for 17 gateways; not publicly listed for LiteLLM, Atlas Cloud, Anannas, RouteScope, EUrouter, AI/ML API and Novita AI; not applicable for Amazon Bedrock, Azure AI Foundry, Google Vertex AI and Envoy AI Gateway", source: "Sep 18, 2026 funding research" },
      { gateway: "helicone", field: "Funding", previous: "Not recorded", next: "Two rounds (Y Combinator, CoughDrop Capital, Realm Capital Ventures) with an unresolved status: StartupIntros records two, Crunchbase one", source: "StartupIntros; Crunchbase" },
      { gateway: "maxim-ai", field: "Funding", previous: "Not recorded", next: "One round: $3M seed, June 2024, Elevation Capital. Funding of unrelated companies named Bifrost is not attributed", source: "CB Insights" },
      { gateway: "kong-ai-gateway", field: "Funding", previous: "Not recorded", next: "Eight rounds and about $345M for Kong Inc., the company, not the AI Gateway product", source: "CB Insights" },
      { gateway: "cortecs", field: "Funding", previous: "Not recorded", next: "No disclosed financing round; one grant from AI-on-Demand / European ecosystem programmes recorded as a backer, not a round", source: "Crunchbase" },
      { gateway: "llmgateway", field: "Funding", previous: "Not recorded", next: "No disclosed rounds: public company information states it has never raised external funding", source: "prospeo.io" },
      { gateway: null, field: "Observability", previous: "Not recorded", next: "Advanced for 11 gateways, Detailed for 9, Limited for 6, Basic for 2, None for 0", source: "Sep 18, 2026 observability research over vendor documentation" },
    ],
  },
  {
    date: "2026-09-17",
    kind: "dataset",
    title: "Verified research pass applied as the source of truth",
    summary:
      "Every record was updated from the September 17, 2026 verified research over vendor sites, documentation and company profiles. Current vendor figures replace earlier vendor figures; this project's September 15 endpoint measurements stay on record in each metric's history and still drive the measured rankings. OpenRouter is no longer a row: it is the product the directory compares against, and the verified dataset does not list it as an alternative.",
    changes: [
      { gateway: "openrouter", field: "Entry", previous: "Listed as a reference row", next: "Removed from the dataset", source: "Sep 17, 2026 verified research (28 gateways, OpenRouter excluded)" },
      { gateway: "eden-ai", field: "EU residency", previous: "EU routes", next: "EU by default — dedicated EU endpoint with zero data retention", source: "edenai.co/eu" },
      { gateway: "eden-ai", field: "Models", previous: "360 measured (LLM, Sep 15) shown", next: "870 official catalogue (all modalities) shown; 360 measured kept and still ranked", source: "edenai.co" },
      { gateway: "requesty", field: "Models / EU gateway", previous: "545 measured; EU gateway in Frankfurt", next: "211 unique models on the catalogue page (684 endpoints, 32 providers); EU endpoint on AWS France", source: "requesty.ai/models" },
      { gateway: "opper", field: "Name / models", previous: "Opper; 700+ and 300+ conflicting", next: "Opper AI; 700+ with 44 providers in the directory", source: "opper.ai" },
      { gateway: "maxim-ai", field: "Name / country / employees", previous: "Maxim AI; country unresolved; 11-50", next: "Maxim AI (Bifrost); United States (registry outstanding); 51-200", source: "LinkedIn, getmaxim.ai" },
      { gateway: "truefoundry", field: "Country", previous: "Unresolved", next: "United States on the basis of operations; legal entity still unresolved", source: "Sep 17, 2026 research" },
      { gateway: "eurouter", field: "Website / logo", previous: "Not confirmed; monogram", next: "eurouter.ai (the cited eu-router.ai did not resolve); official mark", source: "eurouter.ai" },
      { gateway: "atlas-cloud", field: "Website / logo", previous: "Not confirmed; monogram", next: "atlascloud.ai; official mark", source: "atlascloud.ai" },
      { gateway: "anannas", field: "Website / logo", previous: "Not confirmed; monogram", next: "anannas.ai; official mark", source: "anannas.ai" },
      { gateway: "routescope", field: "Website / logo", previous: "Not confirmed; monogram", next: "routescope.ai; official mark", source: "routescope.ai" },
      { gateway: "nexos-ai", field: "Logo / pricing", previous: "Monogram; contact sales", next: "Official mark; public pricing page with enterprise terms", source: "nexos.ai/pricing" },
      { gateway: "respan", field: "Website", previous: "keywordsai.co", next: "respan.ai (brand changed February 2026; entity unchanged)", source: "respan.ai" },
      { gateway: "edgee", field: "Website / providers / routes", previous: "edgee.cloud; 25+ providers; 972 routes", next: "edgee.ai; 60 'provider routes' on the routing page; 972 provider routes on the models page", source: "edgee.ai" },
      { gateway: "portkey", field: "Endpoints / providers", previous: "1,600+ endpoints; providers not published", next: "313 endpoint combinations; 72 providers", source: "portkey.ai docs" },
      { gateway: "azure-ai-foundry", field: "Models", previous: "Not directly comparable", next: "1,900+ (Foundry Models catalogue); 10,000+ platform figure kept on record", source: "learn.microsoft.com" },
      { gateway: null, field: "Social snapshots", previous: "Recorded for 19 gateways on Sep 15", next: "LinkedIn and X URLs and follower counts recorded for 27 gateways on Sep 17", source: "LinkedIn and X company profiles" },
      { gateway: null, field: "Zero data retention", previous: "Yes / enterprise / not stated", next: "Adds a 'configurable' answer for retention that depends on plan, route or region", source: "Sep 17, 2026 research" },
    ],
  },
  {
    date: "2026-09-17",
    kind: "dataset",
    title: "Vendor counts shown as floors; integration counts recorded; Eden AI MCP support",
    summary:
      "Exact-looking counts copied from vendor catalogue pages are now shown rounded down to the nearest ten (72 becomes 70+), with the exact figure kept for sorting and stated in the tooltip, because vendor pages change often. Integration counts of customer-configured gateways (LiteLLM, Kong, Envoy, Bifrost, Braintrust) are recorded under a new 'documented integrations' status: shown and sortable, never ranked against hosted catalogues. Rankings now prefer a measured count over a vendor figure of any date.",
    changes: [
      { gateway: "eden-ai", field: "Modalities / deployment", previous: "No MCP; hosted only", next: "MCP Server documented (expert models as MCP tools); private deployment on the custom plan recorded as 'private'", source: "edenai.co/docs/v3/expert-models/mcp-server; edenai.co/pricing" },
      { gateway: "orq-ai", field: "Modalities", previous: "No MCP", next: "MCP access documented alongside the unified API", source: "Sep 17, 2026 research" },
      { gateway: "litellm", field: "Models / providers", previous: "Configured by you (figures in notes)", next: "1,890+ models and 140+ providers as documented integrations", source: "litellm.ai" },
      { gateway: "maxim-ai", field: "Models / providers", previous: "Configured by you (figures in notes)", next: "4,450+ catalogue entries and 90+ providers as documented integrations", source: "github.com/maximhq/bifrost" },
      { gateway: "kong-ai-gateway", field: "Providers", previous: "Configured by you", next: "19 documented provider types", source: "developer.konghq.com" },
      { gateway: "envoy-ai-gateway", field: "Providers", previous: "Configured by you", next: "15 documented providers", source: "aigateway.envoyproxy.io" },
      { gateway: "google-vertex-ai", field: "Models", previous: "Not directly comparable", next: "200+ vendor figure, comparability caveat kept in the note", source: "cloud.google.com/vertex-ai" },
    ],
  },
  {
    date: "2026-09-17",
    kind: "site",
    title: "Routes and endpoints share one column; categories ranked by declared signals",
    summary:
      "Routes and endpoints remain separate fields but now share one labelled table column. EU, EU-hosted and enterprise categories are ranked by a weighted score over recorded attributes that each page declares, with no gateway placed by name. Jurisdiction sorting groups EU entries together; ZDR, ownership and pricing sort in a stated order. The site favicon is now the directory's own routing glyph rather than the OpenRouter mark.",
    changes: [],
  },
  {
    date: "2026-09-15",
    kind: "social",
    title: "Company scale and social snapshots filled in",
    summary:
      "Employee bands and follower snapshots were recorded for nineteen gateways, captured on one date so the figures stay comparable. Exact counts are marked as such; rounded ones are marked approximate. Social reach stays out of the default table columns and out of every ranking.",
    changes: [
      { gateway: "openrouter", field: "Social", previous: "Not recorded", next: "31,479 LinkedIn followers; ~142K on X (@OpenRouter); 11-50 employees", source: "LinkedIn and X company profiles" },
      { gateway: "truefoundry", field: "Social", previous: "38,500 approximate", next: "38,251 exact; ~1.2K on X (@truefoundry)", source: "LinkedIn and X company profiles" },
      { gateway: "eden-ai", field: "Social", previous: "Not recorded", next: "13,465 LinkedIn followers; ~2.4K on X (@edenaico); 11-50 employees", source: "LinkedIn and X company profiles" },
      { gateway: "kong-ai-gateway", field: "Social", previous: "Not recorded", next: "83,801 LinkedIn followers; ~26.5K on X; 1,001-5,000 employees at Kong Inc.", source: "LinkedIn and X company profiles" },
      { gateway: "not-diamond", field: "X followers", previous: "Not recorded", next: "154 (@notdiamond_ai); LinkedIn follower count not found", source: "X profile" },
      { gateway: null, field: "Employee bands", previous: "Recorded for 9 gateways", next: "Recorded for 22 gateways", source: "LinkedIn company-size bands" },
    ],
  },
  {
    date: "2026-09-15",
    kind: "dataset",
    title: "Pricing disclosure recorded from public endpoints",
    summary:
      "Six gateways publish per-model pricing inside the same public endpoints that were enumerated for the catalogue counts, which is direct evidence that their pricing can be evaluated without contacting sales.",
    changes: [
      { gateway: null, field: "Pricing disclosure", previous: "Not recorded", next: "Public for Eden AI, OpenRouter, Requesty, Cortecs, llmgateway.io and Novita AI", source: "Public model and provider endpoints" },
    ],
  },
  {
    date: "2026-09-15",
    kind: "model-catalogue",
    title: "Catalogues re-counted from public endpoints",
    summary:
      "Six public model endpoints were enumerated on the same day using one counting rule: distinct model identifiers after removing exact duplicates, serving-provider prefixes, routing variants and non-model pseudo-entries. Eden AI's public LLM catalogue and provider list were counted the same way. Earlier figures are preserved on each profile rather than overwritten.",
    changes: [
      { gateway: "requesty", field: "Models (LLM catalogue)", previous: "708 measured Sep 8", next: "545 measured Sep 15, across 684 endpoints", source: "router.requesty.ai/v1/models" },
      { gateway: "aiml-api", field: "Models (LLM catalogue)", previous: "937 measured Sep 8", next: "369 measured Sep 15; 790 across all modalities", source: "api.aimlapi.com/models" },
      { gateway: "eden-ai", field: "Models (LLM catalogue)", previous: "1,038 measured Sep 8 (platform-wide)", next: "360 measured Sep 15 (LLM catalogue)", source: "api.edenai.run/v2/llm/models" },
      { gateway: "openrouter", field: "Models (LLM catalogue)", previous: "428 measured Sep 8", next: "356 measured Sep 15, from 446 identifiers before variants", source: "openrouter.ai/api/v1/models" },
      { gateway: "llmgateway", field: "Models (LLM catalogue)", previous: "258 measured Sep 8", next: "269 measured Sep 15, excluding the auto and custom pseudo-models", source: "api.llmgateway.io/v1/models" },
      { gateway: "novita-ai", field: "Models (LLM catalogue)", previous: "156 measured Sep 8", next: "117 measured Sep 15", source: "api.novita.ai/openai/v1/models" },
      { gateway: "cortecs", field: "Models (LLM catalogue)", previous: "105 measured Sep 8", next: "107 measured Sep 15", source: "api.cortecs.ai/v1/models" },
    ],
  },
  {
    date: "2026-09-15",
    kind: "dataset",
    title: "Provider counts measured, not taken on trust",
    summary:
      "Where a catalogue exposes its upstream providers, the provider count is now measured rather than copied from a marketing floor. In every case the measured figure was higher than the floor the vendor publishes.",
    changes: [
      { gateway: "openrouter", field: "Providers", previous: "80+ vendor-stated", next: "106 measured", source: "openrouter.ai/api/v1/providers" },
      { gateway: "eden-ai", field: "Providers", previous: "50+ vendor-stated", next: "78 measured across nine features", source: "api.edenai.run/v2/info/provider_subfeatures" },
      { gateway: "llmgateway", field: "Providers", previous: "Needs verification", next: "52 measured", source: "api.llmgateway.io/v1/models" },
      { gateway: "requesty", field: "Providers", previous: "32 vendor-stated", next: "33 measured serving-provider prefixes", source: "router.requesty.ai/v1/models" },
      { gateway: "cortecs", field: "Providers", previous: "14 vendor-stated", next: "15 measured, counting Amazon once across two EU regions", source: "api.cortecs.ai/v1/models" },
      { gateway: "eden-ai", field: "Modalities", previous: "9 vendor-stated", next: "10 measured, including video", source: "api.edenai.run/v2/info/provider_subfeatures" },
    ],
  },
  {
    date: "2026-09-15",
    kind: "site",
    title: "Evidence statuses replace blank fields",
    summary:
      "Quantitative values now carry the kind of evidence behind them, and an absent number carries its reason. A gateway whose catalogue is configured by the customer reads as “Configured by you”, a vendor figure that counts endpoints reads as “Different metric”, and nothing in the interface says “Needs verification” any more.",
    changes: [
      { gateway: "portkey", field: "Models", previous: "Needs verification", next: "Not directly comparable — the published 1,600+ counts endpoints, now recorded as an endpoint count", source: "Vendor site" },
      { gateway: "litellm", field: "Models", previous: "Needs verification", next: "Variable — configured by the operator", source: "Product architecture" },
      { gateway: "kong-ai-gateway", field: "Models", previous: "Needs verification", next: "Variable — configured by the operator", source: "Product architecture" },
      { gateway: "helicone", field: "Models", previous: "Needs verification", next: "Variable — configured by the customer's provider keys", source: "Product architecture" },
      { gateway: "amazon-bedrock", field: "Models", previous: "Needs verification", next: "Not directly comparable — catalogue is published per region and deployment type", source: "Provider documentation" },
      { gateway: "opper", field: "Models", previous: "700+ vendor-stated", next: "Multiple figures — 700+ and 300+ both published", source: "Vendor site" },
    ],
  },
  {
    date: "2026-09-15",
    kind: "company",
    title: "Acquisition dates confirmed from primary sources",
    summary:
      "Two ownership changes recorded in the previous revision were confirmed against the acquirers' own announcements and given exact dates.",
    changes: [
      { gateway: "portkey", field: "Ownership", previous: "Acquired by Palo Alto Networks in 2026", next: "Acquisition completed May 29, 2026", source: "Palo Alto Networks press release" },
      { gateway: "helicone", field: "Ownership", previous: "Acquired by Mintlify in March 2026", next: "Announced March 3, 2026; maintenance mode confirmed", source: "Mintlify and Helicone announcements" },
    ],
  },
  {
    date: "2026-09-15",
    kind: "company",
    title: "Validated company research applied",
    summary:
      "Registry-confirmed operating entities, jurisdictions, company-size bands and ownership changes were applied across the dataset. Several fields that had been open since the baseline are now resolved; the ones that remain open are genuine conflicts rather than gaps in research.",
    changes: [
      {
        gateway: "requesty",
        field: "Legal entity / jurisdiction",
        previous: "Needs verification",
        next: "REQUESTY LTD, London, United Kingdom — not EU-incorporated",
        source: "Companies House 15165717",
      },
      {
        gateway: "cortecs",
        field: "Legal entity / jurisdiction",
        previous: "Needs verification",
        next: "Cortecs GmbH, Vienna, Austria — EU-incorporated",
        source: "Austrian company register",
      },
      {
        gateway: "eurouter",
        field: "Legal entity / jurisdiction",
        previous: "Needs verification",
        next: "EUrouter B.V., Amsterdam, Netherlands — EU-incorporated",
        source: "KVK 42054357",
      },
      {
        gateway: "opper",
        field: "Legal entity / jurisdiction",
        previous: "Needs verification",
        next: "Opper Technology AB, Stockholm, Sweden — EU-incorporated",
        source: "Swedish company register",
      },
      {
        gateway: "orq-ai",
        field: "Legal entity",
        previous: "Needs verification",
        next: "Orq.AI Holding B.V., Amsterdam",
        source: "KVK 88882179",
      },
      {
        gateway: "nexos-ai",
        field: "Legal entity",
        previous: "Needs verification",
        next: "Spectra Tech, UAB, Vilnius, Lithuania",
        source: "Lithuanian register of legal entities",
      },
      {
        gateway: "portkey",
        field: "Ownership",
        previous: "Independent",
        next: "Acquired by Palo Alto Networks (2026)",
        source: "Acquisition announcement",
      },
      {
        gateway: "helicone",
        field: "Ownership / product status",
        previous: "Independent, active",
        next: "Acquired by Mintlify (March 2026); maintenance mode",
        source: "Acquisition announcement",
      },
      {
        gateway: "respan",
        field: "Name",
        previous: "Keywords AI",
        next: "Respan (entity: Keywords AI, Inc.)",
        source: "Vendor rename",
      },
      {
        gateway: "atlas-cloud",
        field: "Certifications",
        previous: "Needs verification",
        next: "None claimed — vendor policy states it does not represent holding SOC 2, ISO 27001 or HIPAA",
        source: "Vendor policy",
      },
    ],
  },
  {
    date: "2026-09-15",
    kind: "dataset",
    title: "Models, routes and providers separated throughout",
    summary:
      "Endpoint counts that had been presented as model counts were reclassified as routes. Vendor floors such as 50+ are now stored with their precision so a floor is never rendered as an exact figure, and measured counts are never mixed with vendor-stated ones inside a ranking.",
    changes: [
      {
        gateway: "requesty",
        field: "Models / routes",
        previous: "708 (single figure)",
        next: "708 measured Sep 8 (addressable entries); 211 unique models and 684 unique endpoints currently vendor-stated",
        source: "Vendor documentation",
      },
      {
        gateway: "portkey",
        field: "Routes",
        previous: "Presented as 1,600+ models elsewhere",
        next: "1,600+ recorded as routes; no deduplicated model count published",
        source: "Vendor site",
      },
      {
        gateway: "edgee",
        field: "Models / routes",
        previous: "Needs verification",
        next: "223 models across 972 routes; 25+ providers",
        source: "Vendor site",
      },
      {
        gateway: null,
        field: "Provider counts",
        previous: "Needs verification across the dataset",
        next: "Recorded for 8 gateways, with vendor floors marked as floors",
        source: "Vendor material",
      },
    ],
  },
  {
    date: "2026-09-15",
    kind: "dataset",
    title: "Conflicts preserved rather than resolved",
    summary:
      "Four entries carry unresolved conflicts that research did not settle. Each is published as unresolved rather than being decided in whichever direction would have been tidier, and the September 15 endpoint refresh is still outstanding.",
    changes: [
      {
        gateway: "truefoundry",
        field: "Legal entity / country",
        previous: "Needs verification",
        next: "Still unresolved — evidence conflicts",
        source: "Conflicting entity evidence",
      },
      {
        gateway: "edgee",
        field: "Jurisdiction",
        previous: "Needs verification",
        next: "Still unresolved — French and US entity evidence conflicts",
        source: "Conflicting entity evidence",
      },
      {
        gateway: "anannas",
        field: "Jurisdiction",
        previous: "Needs verification",
        next: "Still unresolved — Terms contain an unfinished “[your jurisdiction]” placeholder",
        source: "Vendor Terms",
      },
      {
        gateway: "opper",
        field: "Models",
        previous: null,
        next: "700+ published, with a conflicting 300+ also published by the vendor",
        source: "Vendor site",
      },
      {
        gateway: null,
        field: "Model catalogue refresh",
        previous: "Measured September 8, 2026",
        next: "September 15, 2026 refresh outstanding",
        source: "Public model endpoints",
      },
    ],
  },
  {
    date: "2026-09-15",
    kind: "site",
    title: "Directory published",
    summary:
      "First public revision of the comparison directory, seeded from the September 8, 2026 research baseline. Twenty-nine gateways are tracked across managed, enterprise, self-hosted and hyperscaler categories.",
    changes: [
      {
        gateway: null,
        field: "Dataset",
        previous: null,
        next: "29 gateways published",
        source: "September 8, 2026 baseline",
      },
      {
        gateway: null,
        field: "Measured catalogues",
        previous: null,
        next: "7 gateways with directly measured model counts",
        source: "Public model endpoints, measured September 8, 2026",
      },
    ],
  },
  {
    date: "2026-09-08",
    kind: "model-catalogue",
    title: "Model catalogue baseline measured",
    summary:
      "Seven gateways exposed a public model endpoint that could be enumerated. These counts are the measured baseline the rankings are built on; every other gateway in the dataset has no measured count rather than an assumed one.",
    changes: [
      { gateway: "eden-ai", field: "Models", previous: null, next: "1,038", source: "Public model endpoint" },
      { gateway: "aiml-api", field: "Models", previous: null, next: "937", source: "Public model endpoint" },
      { gateway: "requesty", field: "Models", previous: null, next: "708", source: "Public model endpoint" },
      { gateway: "openrouter", field: "Models", previous: null, next: "428", source: "Public model endpoint" },
      { gateway: "llmgateway", field: "Models", previous: null, next: "258", source: "Public model endpoint" },
      { gateway: "novita-ai", field: "Models", previous: null, next: "156", source: "Public model endpoint" },
      { gateway: "cortecs", field: "Models", previous: null, next: "105", source: "Public model endpoint" },
    ],
  },
  {
    date: "2026-09-08",
    kind: "company",
    title: "Legal baseline and entity integrity notes",
    summary:
      "Company records were reviewed for entity-level mistakes before publication. Two gateways were consolidated or held back rather than published as separate or resolved entries.",
    changes: [
      {
        gateway: "respan",
        field: "Ownership",
        previous: "Respan and Keywords AI listed separately",
        next: "Recorded as the same company, one entry",
        source: "September 8, 2026 legal baseline",
      },
      {
        gateway: "aiml-api",
        field: "Legal entity",
        previous: null,
        next: "Boiler Labs FZ-LLC (United Arab Emirates)",
        source: "September 8, 2026 legal baseline",
      },
      {
        gateway: "anannas",
        field: "Jurisdiction",
        previous: null,
        next: "Unresolved — published as unresolved rather than assigned",
        source: "September 8, 2026 legal baseline",
      },
      {
        gateway: "truefoundry",
        field: "Legal entity",
        previous: null,
        next: "Needs verification — incorporation not established",
        source: "September 8, 2026 legal baseline",
      },
    ],
  },
];

export const CHANGE_KIND_LABEL: Record<ChangelogEntry["kind"], string> = {
  "model-catalogue": "Model catalogue",
  social: "Social refresh",
  company: "Company data",
  dataset: "Dataset",
  site: "Site",
  correction: "Correction",
};
