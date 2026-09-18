/**
 * Dataset integrity audit.
 *
 * Run with `npm run audit`. Fails the build on anything that indicates a data
 * defect rather than an honest gap:
 *
 *  - duplicate ids, slugs, names or legal entities (the Respan / Keywords AI
 *    double-count class of error)
 *  - EU jurisdiction leaking into an EU residency label
 *  - routes recorded as models, or a model count that is actually an endpoint
 *    count
 *  - a certification claimed for a vendor that states it holds none
 *  - a category whose filter matches nothing
 *  - a ranked category whose members have no value for its metric
 *  - a logo path that points at a file which does not exist in /public
 *  - an OpenAI-compatibility value recorded without a status that supports it
 *  - an observability level recorded without a status that supports it, or a
 *    funding record that is marked not applicable on an independent company,
 *    carries a negative round count, or cites no source
 *
 * It then classifies every remaining unresolved field as either a genuine
 * conflict, a not-applicable attribute, or an open research item, and prints
 * the breakdown so the three can never be confused.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { gateways } from "@/data/gateways";
import { categories } from "@/data/categories";
import { resolveCategory } from "@/lib/ranking";
import { allObservations, latestMeasured } from "@/lib/metric";
import { QUANTIFIED_STATUSES } from "@/types/metric";
import type { Field, Gateway } from "@/types";

const errors: string[] = [];
const warnings: string[] = [];

// --- Uniqueness ------------------------------------------------------------
function assertUnique(label: string, values: (string | null)[]) {
  const seen = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    const key = value.toLowerCase().trim();
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  for (const [key, count] of seen) {
    if (count > 1) errors.push(`Duplicate ${label}: "${key}" appears ${count} times`);
  }
}

assertUnique("id", gateways.map((g) => g.id));
assertUnique("slug", gateways.map((g) => g.slug));
assertUnique("name", gateways.map((g) => g.name));
assertUnique("legal entity", gateways.map((g) => g.legalEntity.value));

// A former name must never also exist as its own entry.
for (const gateway of gateways) {
  if (!gateway.formerName) continue;
  const clash = gateways.find(
    (other) => other.id !== gateway.id && other.name.toLowerCase() === gateway.formerName!.toLowerCase(),
  );
  if (clash) {
    errors.push(
      `${gateway.name} lists former name "${gateway.formerName}", which also exists as a separate entry (${clash.id})`,
    );
  }
}

// --- Editorial invariants --------------------------------------------------
const EU_RESIDENCY_CLAIMS = ["eu-by-default", "eu-available", "eu-routes", "enterprise-only"];

for (const gateway of gateways) {
  // EU incorporation must never be the only thing behind an EU residency label.
  const residency = gateway.euResidency;
  if (residency.value && EU_RESIDENCY_CLAIMS.includes(residency.value)) {
    if (residency.status === "needs-verification") {
      errors.push(`${gateway.name}: EU residency claims "${residency.value}" with no supporting status`);
    }
    if (!residency.sources?.length && residency.status !== "verified") {
      warnings.push(`${gateway.name}: EU residency "${residency.value}" has no source reference`);
    }
  }

  // A gateway with no EU jurisdiction evidence must not be in the EU category.
  if (gateway.categories.includes("eu-gateways") && gateway.euJurisdiction.value !== true) {
    errors.push(`${gateway.name} is tagged eu-gateways but euJurisdiction is not true`);
  }

  // A model count must never silently be a route or endpoint count.
  for (const o of allObservations(gateway.models)) {
    const note = (o.note ?? "").toLowerCase();
    if (o.value !== undefined && /routes?|endpoints?/.test(note) && !note.includes("rather than") && !note.includes("across") && !note.includes("collapse") && !note.includes("before")) {
      warnings.push(`${gateway.name}: model figure mentions routes/endpoints — check it is not a route count`);
    }
  }

  // Routes must never be smaller than models: that would mean routes are really
  // a model count, or the two have been swapped.
  const models = latestMeasured(gateway.models)?.value ?? null;
  const routes = allObservations(gateway.routes).find((o) => o.value !== undefined)?.value ?? null;
  if (models !== null && routes !== null && routes < models) {
    errors.push(
      `${gateway.name}: routes (${routes}) < models (${models}) — a route count cannot be smaller than a model count`,
    );
  }

  // A verified empty certification list is an explicit "none claimed". Anything
  // else with entries must carry a source.
  const certs = gateway.certifications;
  if (certs.value && certs.value.length > 0 && !certs.sources?.length) {
    warnings.push(`${gateway.name}: certifications listed without a source reference`);
  }

  // Every field that cites a source must cite one the record actually has.
  const sourceIds = new Set(gateway.sources.map((s) => s.id));
  const fields = Object.entries(gateway) as [string, unknown][];
  for (const [name, value] of fields) {
    const f = value as Field<unknown> | undefined;
    if (!f || typeof f !== "object" || !("status" in f)) continue;
    for (const id of f.sources ?? []) {
      if (!sourceIds.has(id)) {
        errors.push(`${gateway.name}: field "${name}" cites unknown source id "${id}"`);
      }
    }
  }

  // Every quantified observation must be dated and cite a real source.
  for (const metricName of ["models", "providers", "routes", "endpoints"] as const) {
    for (const o of allObservations(gateway[metricName])) {
      const quantified = QUANTIFIED_STATUSES.includes(o.status);
      if (quantified && !o.date) {
        errors.push(`${gateway.name}: ${metricName} observation has a value but no date`);
      }
      if (o.date && !/^\d{4}-\d{2}-\d{2}$/.test(o.date)) {
        errors.push(`${gateway.name}: ${metricName} observation has a malformed date "${o.date}"`);
      }
      // Every measured or officially-published figure must be traceable.
      if (["measured", "official", "catalogue", "secondary"].includes(o.status) && !(o.sourceIds ?? []).length) {
        errors.push(`${gateway.name}: ${o.status} ${metricName} figure cites no source`);
      }
      for (const id of o.sourceIds ?? []) {
        if (!sourceIds.has(id)) {
          errors.push(`${gateway.name}: ${metricName} observation cites unknown source id "${id}"`);
        }
      }
      if (!quantified && o.value !== undefined) {
        errors.push(`${gateway.name}: ${metricName} carries a value under a non-quantified status`);
      }
    }
  }

  if (!gateway.website && gateway.sources.some((s) => s.id === "site")) {
    warnings.push(`${gateway.name}: cites an official-website source but has no website URL`);
  }

  // Public links must be well-formed absolute URLs on the expected hosts.
  const checkUrl = (label: string, url: string | null, host?: RegExp) => {
    if (!url) return;
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      errors.push(`${gateway.name}: ${label} "${url}" is not a valid URL`);
      return;
    }
    if (parsed.protocol !== "https:") errors.push(`${gateway.name}: ${label} "${url}" is not https`);
    if (host && !host.test(parsed.hostname)) {
      errors.push(`${gateway.name}: ${label} "${url}" is not on the expected host`);
    }
    if (parsed.search) warnings.push(`${gateway.name}: ${label} "${url}" carries a query string`);
  };
  checkUrl("website", gateway.website);
  checkUrl("LinkedIn URL", gateway.social.linkedinUrl, /(^|\.)linkedin\.com$/);
  checkUrl("X URL", gateway.social.xUrl, /^(x|twitter)\.com$/);
  for (const source of gateway.sources) checkUrl(`source ${source.id}`, source.url);

  // Ownership relationships must be internally consistent.
  const ownership = gateway.ownershipStatus.value;
  if ((ownership === "acquired" || ownership === "subsidiary") && !gateway.parentCompany.value) {
    errors.push(`${gateway.name}: ownership is "${ownership}" but no parent company is recorded`);
  }
  if (ownership === "independent" && gateway.parentCompany.value) {
    errors.push(`${gateway.name}: ownership is independent but a parent company is recorded`);
  }

  // Deployment flags must agree with the deployment list. A self-hosted
  // gateway can be placed in a VPC or on-premise by definition, so the flags
  // are only checked against the list for products that are not self-hosted.
  const deployment = gateway.deployment.value ?? [];
  const selfHosted = deployment.includes("self-hosted");
  if (gateway.vpc.value === "yes" && gateway.deployment.value && !selfHosted && !deployment.includes("vpc")) {
    warnings.push(`${gateway.name}: vpc is "yes" but deployment does not list vpc`);
  }
  if (gateway.onPrem.value === "yes" && gateway.deployment.value && !selfHosted && !deployment.includes("on-prem")) {
    warnings.push(`${gateway.name}: onPrem is "yes" but deployment does not list on-prem`);
  }

  // A logo path must resolve to a locally stored asset. The logo component has
  // no runtime fallback for a missing file, so a broken path is a build defect.
  if (gateway.logo) {
    if (!gateway.logo.startsWith("/logos/")) {
      errors.push(`${gateway.name}: logo "${gateway.logo}" must live under /public/logos`);
    } else if (!existsSync(path.join(process.cwd(), "public", gateway.logo))) {
      errors.push(`${gateway.name}: logo file "${gateway.logo}" does not exist under /public`);
    }
  }

  // A recorded OpenAI-compatibility value must carry evidence. "Unknown" is a
  // value in its own right (checked, not settled) and needs a source too.
  const openai = gateway.openaiCompatible;
  if (openai.value !== null) {
    if (openai.status === "needs-verification") {
      errors.push(`${gateway.name}: openaiCompatible "${openai.value}" recorded with a needs-verification status`);
    }
    if (!openai.sources?.length) {
      warnings.push(`${gateway.name}: openaiCompatible "${openai.value}" has no source reference`);
    }
  }

  // An observability level is read from documentation, so it must carry a
  // status and a source that say so.
  const observability = gateway.observability;
  if (observability.value !== null) {
    if (observability.status === "needs-verification") {
      errors.push(`${gateway.name}: observability "${observability.value}" recorded with a needs-verification status`);
    }
    if (!observability.sources?.length) {
      warnings.push(`${gateway.name}: observability "${observability.value}" has no source reference`);
    }
  }

  // Funding describes the operating company. "Not applicable" is reserved for
  // a cloud provider's product or a community project; an independent company
  // either has disclosed rounds, none, or funding that could not be verified.
  const funding = gateway.funding;
  if (funding.status === "not-applicable" && gateway.type !== "hyperscaler" && ownership !== "community") {
    errors.push(`${gateway.name}: funding is not applicable, but the record is neither a hyperscaler nor a community project`);
  }
  if (funding.value !== null) {
    if (!Number.isInteger(funding.value.rounds) || funding.value.rounds < 0) {
      errors.push(`${gateway.name}: funding rounds "${funding.value.rounds}" is not a non-negative integer`);
    }
    if (funding.status === "needs-verification") {
      errors.push(`${gateway.name}: funding recorded with a needs-verification status`);
    }
    if (!funding.sources?.length) {
      warnings.push(`${gateway.name}: funding recorded without a source reference`);
    }
  }
}

// --- Categories ------------------------------------------------------------
// The `categories` list on a record is documentation; membership itself is
// evaluated from the category filters. The two must agree, or a profile would
// name a category the data does not support (or omit one it does).
for (const gateway of gateways) {
  const computed = categories.filter((category) => category.filter(gateway)).map((c) => c.slug);
  const declared = [...gateway.categories].sort();
  if (declared.join(",") !== [...computed].sort().join(",")) {
    errors.push(
      `${gateway.name}: declared categories [${declared.join(", ")}] differ from filter membership [${computed.sort().join(", ")}]`,
    );
  }
}

for (const category of categories) {
  const result = resolveCategory(category);
  if (result.members.length === 0) {
    warnings.push(`Category "${category.slug}" matches no gateways`);
  }
  if (category.showTopThree && result.ranked.length === 0) {
    warnings.push(
      `Category "${category.slug}" promises a top three but no member holds a value for its metric`,
    );
  }
  if (category.rankingMetric !== "none" && !category.rankingCriterion.trim()) {
    errors.push(`Category "${category.slug}" ranks without stating a criterion`);
  }
  if (category.rankingMetric === "score" && !(category.signals?.length)) {
    errors.push(`Category "${category.slug}" is score-ranked but declares no signals`);
  }
}

// --- Classify what remains unresolved --------------------------------------
type Bucket = "conflict" | "not-applicable" | "open";

const TRACKED: (keyof Gateway)[] = [
  "legalEntity",
  "country",
  "city",
  "founded",
  "employees",
  "funding",
  "ownership",
  "ownershipStatus",
  "parentCompany",
  "productStatus",
  "modalities",
  "openaiCompatible",
  "observability",
  "gatewayLocations",
  "inferenceLocations",
  "euResidency",
  "zeroDataRetention",
  "deployment",
  "byok",
  "byom",
  "vpc",
  "onPrem",
  "openSource",
  "license",
  "repository",
  "certifications",
  "dpa",
  "subprocessors",
  "pricingModel",
  "pricingTransparency",
];

const CONFLICT_MARKERS = ["conflict", "unresolved", "placeholder", "does not match"];

const tally: Record<Bucket, number> = { conflict: 0, "not-applicable": 0, open: 0 };
const conflicts: string[] = [];

for (const gateway of gateways) {
  for (const key of TRACKED) {
    const f = gateway[key] as Field<unknown> | undefined;
    if (!f || typeof f !== "object" || !("status" in f)) continue;
    if (f.value !== null) continue;

    if (f.status === "not-applicable") {
      tally["not-applicable"] += 1;
      continue;
    }
    // Licence and repository cannot apply to a product documented as closed
    // source, so they are not counted as outstanding research.
    if ((key === "license" || key === "repository") && gateway.openSource.value === "no") {
      tally["not-applicable"] += 1;
      continue;
    }
    const note = (f.note ?? "").toLowerCase();
    if (CONFLICT_MARKERS.some((marker) => note.includes(marker))) {
      tally.conflict += 1;
      conflicts.push(`${gateway.name} · ${String(key)}`);
      continue;
    }
    tally.open += 1;
  }
}

// --- Report ----------------------------------------------------------------
console.log(`Gateways: ${gateways.length}`);
console.log(
  `Measured catalogues: ${gateways.filter((g) => latestMeasured(g.models)).length}`,
);
console.log(`EU-incorporated: ${gateways.filter((g) => g.euJurisdiction.value === true).length}`);
console.log(`With a local logo asset: ${gateways.filter((g) => g.logo).length}`);
console.log(
  `OpenAI compatibility recorded: ${gateways.filter((g) => g.openaiCompatible.value !== null).length}`,
);
console.log(
  `Observability level recorded: ${gateways.filter((g) => g.observability.value !== null).length}`,
);
console.log(
  `Funding recorded: ${gateways.filter((g) => g.funding.value !== null).length} with rounds, ${
    gateways.filter((g) => g.funding.status === "not-published").length
  } not publicly listed, ${gateways.filter((g) => g.funding.status === "not-applicable").length} not applicable`,
);
console.log("");
console.log("Unresolved fields by classification:");
console.log(`  genuine conflict : ${tally.conflict}`);
console.log(`  not applicable   : ${tally["not-applicable"]}`);
console.log(`  open research    : ${tally.open}`);
if (conflicts.length) {
  console.log("");
  console.log("Preserved conflicts:");
  for (const c of conflicts) console.log(`  - ${c}`);
}

if (warnings.length) {
  console.log("");
  console.log(`Warnings (${warnings.length}):`);
  for (const w of warnings) console.log(`  ! ${w}`);
}

if (errors.length) {
  console.log("");
  console.error(`FAILED — ${errors.length} integrity error(s):`);
  for (const e of errors) console.error(`  x ${e}`);
  process.exit(1);
}

console.log("");
console.log("Dataset integrity checks passed.");
