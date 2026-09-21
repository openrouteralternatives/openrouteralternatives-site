/**
 * Diff: print what the candidates say next to what the dataset records.
 *
 *   npm run firecrawl:diff                          # every candidates file
 *   npm run firecrawl:diff -- --gateway portkey     # one or more slugs
 *   npm run firecrawl:diff -- --only-differences    # hide fields whose candidates all match
 *   npm run firecrawl:diff -- --json                # machine-readable output
 *
 * Reads research/firecrawl/candidates/<slug>.json and data/gateways.ts. Writes
 * nothing. A "differs" or "dataset-empty" line is an invitation to open the
 * cited page, not a change to make: the page, not the extraction, is the
 * evidence.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { gateways } from "@/data/gateways";
import { hasFlag, parseSlugFilter } from "./args";
import { CANDIDATES_ROOT } from "./fs";
import type { GatewayCandidates } from "./claims";
import { compareCandidates, type FieldComparison, type Verdict } from "./compare";

const MARK: Record<Verdict, string> = {
  matches: "=",
  differs: "≠",
  "dataset-empty": "+",
  review: "?",
  "no-dataset-field": "·",
};

const LEGEND =
  "=  matches the dataset   ≠  differs, open the page   +  dataset has no value   ?  free text, compare by hand   ·  no dataset column";

function truncate(text: string | null, max = 110): string {
  if (!text) return "";
  const single = text.replace(/\s+/g, " ").trim();
  return single.length > max ? `${single.slice(0, max - 1)}…` : single;
}

function loadCandidates(slugs: string[]): GatewayCandidates[] {
  if (!existsSync(CANDIDATES_ROOT)) return [];
  return readdirSync(CANDIDATES_ROOT)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(readFileSync(path.join(CANDIDATES_ROOT, file), "utf8")) as GatewayCandidates)
    .filter((candidates) => !slugs.length || slugs.includes(candidates.gatewaySlug))
    .sort((a, b) => a.gatewaySlug.localeCompare(b.gatewaySlug));
}

function main() {
  const argv = process.argv.slice(2);
  const slugs = parseSlugFilter(argv);
  const onlyDifferences = hasFlag(argv, "--only-differences");
  const asJson = hasFlag(argv, "--json");

  const files = loadCandidates(slugs);
  if (!files.length) {
    console.log(
      `No candidates found under ${path.relative(process.cwd(), CANDIDATES_ROOT)}. Run npm run firecrawl:extract first.`,
    );
    return;
  }

  const report: { gateway: string; generatedAt: string; orphan: boolean; fields: FieldComparison[] }[] = [];
  const totals: Record<Verdict, number> = { matches: 0, differs: 0, "dataset-empty": 0, review: 0, "no-dataset-field": 0 };

  for (const candidates of files) {
    const gateway = gateways.find((g) => g.slug === candidates.gatewaySlug);
    if (!gateway) {
      report.push({ gateway: candidates.gatewaySlug, generatedAt: candidates.generatedAt, orphan: true, fields: [] });
      continue;
    }
    let fields = compareCandidates(gateway, candidates);
    if (onlyDifferences) {
      fields = fields.filter((f) => f.candidates.some((c) => c.verdict !== "matches"));
    }
    for (const field of fields) for (const c of field.candidates) totals[c.verdict] += 1;
    report.push({ gateway: gateway.slug, generatedAt: candidates.generatedAt, orphan: false, fields });
  }

  if (asJson) {
    console.log(JSON.stringify({ totals, gateways: report }, null, 2));
    return;
  }

  console.log(LEGEND);
  for (const entry of report) {
    console.log("");
    if (entry.orphan) {
      console.log(`${entry.gateway}  (candidates from ${entry.generatedAt}; this slug is no longer in the dataset)`);
      continue;
    }
    console.log(`${entry.gateway}  (candidates from ${entry.generatedAt})`);
    if (!entry.fields.length) {
      console.log(onlyDifferences ? "  every candidate matches the dataset" : "  no claims extracted");
      continue;
    }
    for (const field of entry.fields) {
      const recorded =
        field.datasetField === null
          ? "no dataset column"
          : field.datasetValue === null
            ? `${field.datasetField}: (no value, ${field.datasetStatus})`
            : `${field.datasetField}: ${field.datasetValue} [${field.datasetStatus}]`;
      console.log(`  ${field.field}`);
      console.log(`      dataset    ${recorded}`);
      for (const c of field.candidates) {
        console.log(`    ${MARK[c.verdict]} candidate  ${truncate(c.shown, 90)}`);
        console.log(`                 ${c.candidate.sourceKind} · ${c.candidate.sourceUrl}`);
        if (c.candidate.evidence) console.log(`                 “${truncate(c.candidate.evidence)}”`);
      }
    }
  }

  console.log("");
  console.log(
    `${totals.matches} match · ${totals.differs} differ · ${totals["dataset-empty"]} could fill an empty field · ${totals.review} to compare by hand · ${totals["no-dataset-field"]} without a dataset column`,
  );
  console.log("Nothing was written. Verify a candidate on its cited page before recording it in data/gateways.ts.");
}

main();
