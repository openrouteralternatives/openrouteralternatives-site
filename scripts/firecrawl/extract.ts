/**
 * Extract: ask Firecrawl for structured candidates against the schema in
 * `schema.ts`, one page at a time, and merge them per gateway.
 *
 *   npm run firecrawl:extract                        # every gateway with a URL
 *   npm run firecrawl:extract -- --gateway portkey   # one or more slugs
 *
 * Output: research/firecrawl/candidates/<gateway>.json. Each field lists every
 * page that made a claim about it, with the verbatim evidence. Disagreements
 * between pages are kept side by side; nothing is resolved automatically.
 *
 * These files are inputs to the verification phase. They are never read by
 * the site and never copied into data/gateways.ts by any script.
 */
import path from "node:path";
import { requireFirecrawlConfig } from "./env";
import { FirecrawlClient, FirecrawlError } from "./client";
import { CANDIDATES_ROOT, today, writeJson } from "./fs";
import { allTargets, parseNumberFlag, parseSlugFilter, type Target } from "./targets";
import {
  EXTRACTED_FIELDS,
  EXTRACTION_PROMPT,
  GATEWAY_EXTRACTION_SCHEMA,
  type Claim,
  type ExtractedField,
  type ExtractedGateway,
} from "./schema";

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

function collectClaims(
  extracted: ExtractedGateway,
  target: Target,
  retrieved: string,
  into: GatewayCandidates["fields"],
) {
  for (const field of EXTRACTED_FIELDS) {
    const claim = extracted[field] as Claim<unknown> | undefined;
    if (!claim?.found || claim.value === undefined || claim.value === null) continue;
    (into[field] ??= []).push({
      value: claim.value,
      evidence: claim.evidence?.trim() || null,
      sourceUrl: target.url,
      sourceKind: target.kind,
      retrieved,
    });
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const client = new FirecrawlClient(requireFirecrawlConfig());
  const slugs = parseSlugFilter(argv);
  const pauseMs = parseNumberFlag(argv, "--pause") ?? 800;
  const date = today();

  const targets = allTargets(slugs);
  const bySlug = new Map<string, Target[]>();
  for (const target of targets) {
    (bySlug.get(target.gatewaySlug) ?? bySlug.set(target.gatewaySlug, []).get(target.gatewaySlug)!).push(target);
  }

  console.log(`Extracting candidates for ${bySlug.size} gateways (${targets.length} pages)`);

  for (const [slug, gatewayTargets] of bySlug) {
    const candidates: GatewayCandidates = {
      gatewaySlug: slug,
      gatewayName: gatewayTargets[0].gatewayName,
      generatedAt: date,
      status: "candidate",
      pagesQueried: [],
      pagesFailed: [],
      fields: {},
    };

    for (const target of gatewayTargets) {
      try {
        const result = await client.scrape<ExtractedGateway>(target.url, {
          formats: [
            { type: "json", schema: GATEWAY_EXTRACTION_SCHEMA as unknown as Record<string, unknown>, prompt: EXTRACTION_PROMPT },
          ],
          timeout: 60000,
        });
        candidates.pagesQueried.push(target.url);
        if (result.json) collectClaims(result.json, target, date, candidates.fields);
        console.log(`  ${slug} · ${target.kind} ✓`);
      } catch (error) {
        const message = error instanceof FirecrawlError ? error.message : String(error);
        candidates.pagesFailed.push({ url: target.url, error: message });
        console.log(`  ${slug} · ${target.kind} ✗ ${message}`);
      }
      await new Promise((r) => setTimeout(r, pauseMs));
    }

    const file = path.join(CANDIDATES_ROOT, `${slug}.json`);
    writeJson(file, candidates);
    const fieldCount = Object.keys(candidates.fields).length;
    console.log(`${slug}: ${fieldCount} fields with candidates → ${path.relative(process.cwd(), file)}`);
  }

  console.log("");
  console.log("Candidates written. Each value must be checked against its sourceUrl before it is recorded in data/gateways.ts.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
