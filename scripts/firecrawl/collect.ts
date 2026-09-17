/**
 * Collect: fetch each gateway's public pages through Firecrawl and store the
 * retrieved Markdown with its metadata.
 *
 *   npm run firecrawl:collect                       # every gateway with a URL
 *   npm run firecrawl:collect -- --gateway eden-ai  # one or more slugs
 *   npm run firecrawl:collect -- --limit 5          # first N targets only
 *
 * Output: research/firecrawl/raw/<date>/<gateway>/<page>.md and .meta.json.
 * Nothing here touches data/gateways.ts.
 */
import path from "node:path";
import { requireFirecrawlConfig } from "./env";
import { FirecrawlClient, FirecrawlError } from "./client";
import { RAW_ROOT, today, urlStem, writeJson, writeText } from "./fs";
import { allTargets, gatewaysWithoutTargets, parseNumberFlag, parseSlugFilter } from "./targets";

export interface CaptureRecord {
  gatewaySlug: string;
  gatewayName: string;
  kind: string;
  requestedUrl: string;
  /** URL after redirects, as Firecrawl reports it. */
  sourceUrl: string | null;
  retrieved: string;
  statusCode: number | null;
  title: string | null;
  description: string | null;
  language: string | null;
  markdownFile: string;
  markdownChars: number;
}

async function main() {
  const argv = process.argv.slice(2);
  const client = new FirecrawlClient(requireFirecrawlConfig());
  const slugs = parseSlugFilter(argv);
  const limit = parseNumberFlag(argv, "--limit");
  const pauseMs = parseNumberFlag(argv, "--pause") ?? 800;

  let targets = allTargets(slugs);
  if (limit) targets = targets.slice(0, limit);

  const date = today();
  const runDir = path.join(RAW_ROOT, date);
  console.log(`Collecting ${targets.length} URLs into ${path.relative(process.cwd(), runDir)}`);

  const captures: CaptureRecord[] = [];
  const failures: { url: string; error: string }[] = [];

  for (const [index, target] of targets.entries()) {
    const label = `[${index + 1}/${targets.length}] ${target.gatewaySlug} · ${target.kind}`;
    try {
      const result = await client.scrape(target.url, { formats: ["markdown"], timeout: 45000 });
      const stem = urlStem(target.url);
      const dir = path.join(runDir, target.gatewaySlug);
      const markdownFile = path.join(dir, `${stem}.md`);
      const markdown = result.markdown ?? "";

      const record: CaptureRecord = {
        gatewaySlug: target.gatewaySlug,
        gatewayName: target.gatewayName,
        kind: target.kind,
        requestedUrl: target.url,
        sourceUrl: result.metadata?.sourceURL ?? result.metadata?.url ?? null,
        retrieved: date,
        statusCode: result.metadata?.statusCode ?? null,
        title: result.metadata?.title ?? null,
        description: result.metadata?.description ?? null,
        language: result.metadata?.language ?? null,
        markdownFile: path.relative(process.cwd(), markdownFile),
        markdownChars: markdown.length,
      };

      writeText(
        markdownFile,
        `<!-- source: ${target.url}\n     retrieved: ${date}\n     gateway: ${target.gatewaySlug} (${target.kind}) -->\n\n${markdown}`,
      );
      writeJson(path.join(dir, `${stem}.meta.json`), record);
      captures.push(record);
      console.log(`${label} ✓ ${markdown.length} chars`);
    } catch (error) {
      const message = error instanceof FirecrawlError ? error.message : String(error);
      failures.push({ url: target.url, error: message });
      console.log(`${label} ✗ ${message}`);
    }
    if (index < targets.length - 1) await new Promise((r) => setTimeout(r, pauseMs));
  }

  writeJson(path.join(runDir, "index.json"), {
    retrieved: date,
    captures,
    failures,
    gatewaysWithoutUrl: gatewaysWithoutTargets().map((g) => g.slug),
  });

  console.log("");
  console.log(`${captures.length} pages captured, ${failures.length} failed.`);
  const missing = gatewaysWithoutTargets();
  if (missing.length && !slugs.length) {
    console.log(
      `Skipped (no confirmed URL in the dataset): ${missing.map((g) => g.name).join(", ")}.`,
    );
  }
  console.log("Captured content is research material. Verify against the source before it becomes canonical data.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
