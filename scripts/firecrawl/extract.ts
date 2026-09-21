/**
 * Extract: ask Firecrawl for structured candidates against the schema in
 * `schema.ts`, one page at a time, and merge them per gateway.
 *
 *   npm run firecrawl:extract                          # every gateway with a URL
 *   npm run firecrawl:extract -- --gateway portkey     # one or more slugs
 *   npm run firecrawl:extract -- --skip-existing       # skip gateways with a candidates file from today
 *   npm run firecrawl:extract -- --include-discovered  # add pages found by firecrawl:discover
 *
 * Each request asks for Markdown *and* JSON, so one call yields both the raw
 * capture (research/firecrawl/raw/<date>/…, same layout as collect.ts) and
 * the structured claims. Firecrawl performs the extraction on the page it
 * fetches; it cannot extract from Markdown we already hold, so the way to
 * avoid paying twice is to fetch once with both formats, which is what this
 * script does. Run collect.ts only when you want Markdown alone.
 *
 * Output: research/firecrawl/candidates/<gateway>.json. Each field lists every
 * page that made a claim about it, with the verbatim evidence. Disagreements
 * between pages are kept side by side; nothing is resolved automatically.
 * Compare a candidates file with the dataset using `npm run firecrawl:diff`.
 *
 * These files are inputs to the verification phase. They are never read by
 * the site and never copied into data/gateways.ts by any script.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { hasFlag, parseNumberFlag, parseSlugFilter } from "./args";
import { requireFirecrawlConfig } from "./env";
import { FirecrawlClient, FirecrawlError } from "./client";
import { CANDIDATES_ROOT, RAW_ROOT, sleep, today, writeJson } from "./fs";
import { writeCapture, type CaptureRecord } from "./capture";
import { allTargets, type Target } from "./targets";
import { collectClaims, emptyCandidates, type GatewayCandidates } from "./claims";
import { EXTRACTION_PROMPT, GATEWAY_EXTRACTION_SCHEMA, type ExtractedGateway } from "./schema";

export function candidatesFile(slug: string): string {
  return path.join(CANDIDATES_ROOT, `${slug}.json`);
}

function generatedToday(slug: string, date: string): boolean {
  const file = candidatesFile(slug);
  if (!existsSync(file)) return false;
  try {
    const existing = JSON.parse(readFileSync(file, "utf8")) as Partial<GatewayCandidates>;
    return existing.generatedAt === date;
  } catch {
    return false;
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const client = new FirecrawlClient(requireFirecrawlConfig());
  const slugs = parseSlugFilter(argv);
  const pauseMs = parseNumberFlag(argv, "--pause") ?? 800;
  const skipExisting = hasFlag(argv, "--skip-existing");
  const includeDiscovered = hasFlag(argv, "--include-discovered");
  const date = today();
  const runDir = path.join(RAW_ROOT, date);

  const targets = allTargets(slugs, includeDiscovered);
  const bySlug = new Map<string, Target[]>();
  for (const target of targets) {
    const list = bySlug.get(target.gatewaySlug) ?? [];
    list.push(target);
    bySlug.set(target.gatewaySlug, list);
  }

  const skipped: string[] = [];
  if (skipExisting) {
    for (const slug of [...bySlug.keys()]) {
      if (generatedToday(slug, date)) {
        bySlug.delete(slug);
        skipped.push(slug);
      }
    }
  }

  const pageCount = [...bySlug.values()].reduce((sum, list) => sum + list.length, 0);
  console.log(`Extracting candidates for ${bySlug.size} gateways (${pageCount} pages)`);
  if (skipped.length) console.log(`Skipping ${skipped.length} with candidates from today (--skip-existing): ${skipped.join(", ")}`);

  const captures: CaptureRecord[] = [];

  for (const [slug, gatewayTargets] of bySlug) {
    const candidates = emptyCandidates(slug, gatewayTargets[0].gatewayName, date);

    for (const target of gatewayTargets) {
      try {
        const result = await client.scrape<ExtractedGateway>(target.url, {
          formats: [
            "markdown",
            {
              type: "json",
              schema: GATEWAY_EXTRACTION_SCHEMA as unknown as Record<string, unknown>,
              prompt: EXTRACTION_PROMPT,
            },
          ],
          timeout: 60000,
        });
        captures.push(writeCapture(runDir, target, result, date));
        candidates.pagesQueried.push(target.url);
        const added = result.json ? collectClaims(result.json, target, date, candidates.fields) : 0;
        console.log(`  ${slug} · ${target.kind} ✓ ${added} claims`);
      } catch (error) {
        const message = error instanceof FirecrawlError ? error.message : String(error);
        candidates.pagesFailed.push({ url: target.url, error: message });
        console.log(`  ${slug} · ${target.kind} ✗ ${message}`);
      }
      await sleep(pauseMs);
    }

    const file = candidatesFile(slug);
    writeJson(file, candidates);
    const fieldCount = Object.keys(candidates.fields).length;
    console.log(`${slug}: ${fieldCount} fields with candidates → ${path.relative(process.cwd(), file)}`);
  }

  // The raw captures share the collect.ts layout, so the same index applies.
  if (captures.length) {
    const indexFile = path.join(runDir, "index.json");
    let previous: { captures?: CaptureRecord[]; failures?: unknown[] } = {};
    if (existsSync(indexFile)) {
      try {
        previous = JSON.parse(readFileSync(indexFile, "utf8"));
      } catch {
        previous = {};
      }
    }
    const merged = new Map<string, CaptureRecord>();
    for (const record of [...(previous.captures ?? []), ...captures]) merged.set(record.requestedUrl, record);
    writeJson(indexFile, { retrieved: date, captures: [...merged.values()], failures: previous.failures ?? [] });
  }

  console.log("");
  console.log("Candidates written. Run `npm run firecrawl:diff` to compare them with the dataset, then verify each value against its sourceUrl before recording it in data/gateways.ts.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
