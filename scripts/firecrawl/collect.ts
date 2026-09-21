/**
 * Collect: fetch each gateway's public pages through Firecrawl and store the
 * retrieved Markdown with its metadata.
 *
 *   npm run firecrawl:collect                          # every gateway with a URL
 *   npm run firecrawl:collect -- --gateway eden-ai     # one or more slugs
 *   npm run firecrawl:collect -- --limit 5             # first N targets only
 *   npm run firecrawl:collect -- --skip-existing       # do not re-fetch pages captured today
 *   npm run firecrawl:collect -- --include-discovered  # add pages found by firecrawl:discover
 *
 * Output: research/firecrawl/raw/<date>/<gateway>/<page>.md and .meta.json.
 * Nothing here touches data/gateways.ts.
 *
 * If you also want structured candidates, run firecrawl:extract instead: it
 * requests Markdown and JSON in the same call and writes both, so collecting
 * first and extracting second would pay for every page twice.
 */
import path from "node:path";
import { hasFlag, parseNumberFlag, parseSlugFilter } from "./args";
import { requireFirecrawlConfig } from "./env";
import { FirecrawlClient, FirecrawlError } from "./client";
import { RAW_ROOT, sleep, today, writeJson } from "./fs";
import { hasCapture, writeCapture, type CaptureRecord } from "./capture";
import { allTargets, gatewaysWithoutTargets } from "./targets";

async function main() {
  const argv = process.argv.slice(2);
  const client = new FirecrawlClient(requireFirecrawlConfig());
  const slugs = parseSlugFilter(argv);
  const limit = parseNumberFlag(argv, "--limit");
  const pauseMs = parseNumberFlag(argv, "--pause") ?? 800;
  const skipExisting = hasFlag(argv, "--skip-existing");
  const includeDiscovered = hasFlag(argv, "--include-discovered");

  const date = today();
  const runDir = path.join(RAW_ROOT, date);

  let targets = allTargets(slugs, includeDiscovered);
  const skipped = skipExisting ? targets.filter((target) => hasCapture(runDir, target)) : [];
  if (skipExisting) targets = targets.filter((target) => !hasCapture(runDir, target));
  if (limit) targets = targets.slice(0, limit);

  console.log(`Collecting ${targets.length} URLs into ${path.relative(process.cwd(), runDir)}`);
  if (skipped.length) console.log(`Skipping ${skipped.length} already captured today (--skip-existing).`);

  const captures: CaptureRecord[] = [];
  const failures: { url: string; error: string }[] = [];

  for (const [index, target] of targets.entries()) {
    const label = `[${index + 1}/${targets.length}] ${target.gatewaySlug} · ${target.kind}`;
    try {
      const result = await client.scrape(target.url, { formats: ["markdown"], timeout: 45000 });
      const record = writeCapture(runDir, target, result, date);
      captures.push(record);
      console.log(`${label} ✓ ${record.markdownChars} chars`);
    } catch (error) {
      const message = error instanceof FirecrawlError ? error.message : String(error);
      failures.push({ url: target.url, error: message });
      console.log(`${label} ✗ ${message}`);
    }
    if (index < targets.length - 1) await sleep(pauseMs);
  }

  writeJson(path.join(runDir, "index.json"), {
    retrieved: date,
    captures,
    failures,
    skipped: skipped.map((target) => target.url),
    gatewaysWithoutUrl: gatewaysWithoutTargets().map((g) => g.slug),
  });

  console.log("");
  console.log(`${captures.length} pages captured, ${failures.length} failed.`);
  const missing = gatewaysWithoutTargets();
  if (missing.length && !slugs.length) {
    console.log(`Skipped (no confirmed URL in the dataset): ${missing.map((g) => g.name).join(", ")}.`);
  }
  console.log("Captured content is research material. Verify against the source before it becomes canonical data.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
