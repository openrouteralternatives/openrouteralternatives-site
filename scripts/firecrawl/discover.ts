/**
 * Discover: use Firecrawl's site map to find pricing, legal, documentation
 * and security pages the dataset does not cite yet.
 *
 *   npm run firecrawl:discover                        # every gateway with a website
 *   npm run firecrawl:discover -- --gateway cortecs   # one or more slugs
 *   npm run firecrawl:discover -- --max 8             # keep at most N pages per gateway (default 6)
 *
 * One `map` call per gateway (one credit each); classification happens
 * locally from the URL path, so no page is fetched here. Results go to
 * research/firecrawl/discovered/<slug>.json and are picked up by collect.ts
 * and extract.ts only when those are run with `--include-discovered`.
 *
 * A discovered URL is a suggestion, not a source: it becomes a `Source` on a
 * gateway record only once a person has opened it and cited it by hand.
 */
import path from "node:path";
import { gateways } from "@/data/gateways";
import { parseNumberFlag, parseSlugFilter } from "./args";
import { requireFirecrawlConfig } from "./env";
import { FirecrawlClient, FirecrawlError } from "./client";
import { sleep, today, writeJson } from "./fs";
import { citedUrls, discoveredFile, normalizeUrl, type DiscoveredPages, type TargetKind } from "./targets";

/** Path patterns that identify a page kind. Order matters: the first match wins. */
export const KIND_PATTERNS: { kind: TargetKind; pattern: RegExp }[] = [
  { kind: "pricing", pattern: /\/(pricing|plans|price)(\/|$|\.)/i },
  { kind: "legal", pattern: /\/(terms|tos|terms-of-service|privacy|privacy-policy|legal|dpa|data-processing|imprint|impressum|subprocessors|sub-processors)(\/|$|\.)/i },
  { kind: "security", pattern: /\/(security|trust|compliance|soc2|soc-2|iso-27001|gdpr)(\/|$|\.)/i },
  { kind: "documentation", pattern: /(^https?:\/\/docs\.)|\/(docs|documentation|api-reference|reference|developers)(\/|$|\.)/i },
];

export function classify(url: string): TargetKind | null {
  for (const { kind, pattern } of KIND_PATTERNS) {
    if (pattern.test(url)) return kind;
  }
  return null;
}

/** Registrable-ish host: the last two labels, so docs.example.com matches example.com. */
export function baseHost(url: string): string {
  const host = new URL(url).hostname.toLowerCase();
  const labels = host.split(".");
  return labels.slice(-2).join(".");
}

/** Prefer shallow paths so /pricing beats /pricing/enterprise/faq. */
function depth(url: string): number {
  return new URL(url).pathname.split("/").filter(Boolean).length;
}

export function selectPages(
  links: string[],
  website: string,
  alreadyCited: Set<string>,
  max: number,
): { url: string; kind: TargetKind }[] {
  const site = baseHost(website);
  const seen = new Set<string>();
  const candidates: { url: string; kind: TargetKind }[] = [];
  for (const link of links) {
    let normalized: string;
    try {
      normalized = normalizeUrl(link);
      if (baseHost(normalized) !== site) continue;
    } catch {
      continue;
    }
    if (seen.has(normalized) || alreadyCited.has(normalized)) continue;
    const kind = classify(normalized);
    if (!kind) continue;
    seen.add(normalized);
    candidates.push({ url: normalized, kind });
  }
  // One of each kind first, shallowest path first, then fill up to max.
  candidates.sort((a, b) => depth(a.url) - depth(b.url) || a.url.localeCompare(b.url));
  const picked: { url: string; kind: TargetKind }[] = [];
  const kinds = new Set<TargetKind>();
  for (const candidate of candidates) {
    if (!kinds.has(candidate.kind)) {
      kinds.add(candidate.kind);
      picked.push(candidate);
    }
  }
  for (const candidate of candidates) {
    if (picked.length >= max) break;
    if (!picked.includes(candidate)) picked.push(candidate);
  }
  return picked.slice(0, max);
}

async function main() {
  const argv = process.argv.slice(2);
  const client = new FirecrawlClient(requireFirecrawlConfig());
  const slugs = parseSlugFilter(argv);
  const max = parseNumberFlag(argv, "--max") ?? 6;
  const pauseMs = parseNumberFlag(argv, "--pause") ?? 800;
  const date = today();

  const selected = gateways.filter(
    (gateway) => gateway.website && (!slugs.length || slugs.includes(gateway.slug)),
  );
  console.log(`Mapping ${selected.length} sites`);

  for (const [index, gateway] of selected.entries()) {
    const website = gateway.website as string;
    try {
      const links = await client.map(website, undefined, 500);
      const pages = selectPages(links, website, citedUrls(gateway), max);
      const record: DiscoveredPages = {
        gatewaySlug: gateway.slug,
        gatewayName: gateway.name,
        website,
        discoveredAt: date,
        mapped: links.length,
        pages,
      };
      writeJson(discoveredFile(gateway.slug), record);
      console.log(`${gateway.slug.padEnd(18)} ${String(links.length).padStart(4)} links → ${pages.length} new pages`);
      for (const page of pages) console.log(`  ${page.kind.padEnd(14)} ${page.url}`);
    } catch (error) {
      const message = error instanceof FirecrawlError ? error.message : String(error);
      console.log(`${gateway.slug.padEnd(18)} ✗ ${message}`);
    }
    if (index < selected.length - 1) await sleep(pauseMs);
  }

  console.log("");
  console.log(
    `Suggestions written to ${path.relative(process.cwd(), path.dirname(discoveredFile("x")))}. ` +
      "Use --include-discovered with firecrawl:collect or firecrawl:extract to fetch them.",
  );
}

if (process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/firecrawl/discover.ts")) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
