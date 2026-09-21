import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Gateway, SourceKind } from "@/types";
import { gateways } from "@/data/gateways";
import { parseSlugFilter } from "./args";
import { DISCOVERED_ROOT } from "./fs";

/**
 * Which public pages to collect for each gateway.
 *
 * Targets are derived from the canonical dataset rather than kept in a
 * separate list, so a gateway added to `data/gateways.ts` is collected on the
 * next run without further configuration. Only URLs the dataset already cites
 * (official website, documentation, pricing and legal pages) are used; social
 * profiles and registries are deliberately excluded because they are not
 * useful as scraped Markdown and often forbid automated access.
 *
 * `npm run firecrawl:discover` can add pages the dataset does not cite yet
 * (a pricing page found on the site map, for example). Those are opt-in via
 * `--include-discovered`, so a default run only touches URLs a person chose.
 */

export type TargetKind =
  | "website"
  | Extract<SourceKind, "documentation" | "pricing" | "legal">
  | "security";

export interface Target {
  gatewaySlug: string;
  gatewayName: string;
  kind: TargetKind;
  url: string;
  /** Where the URL came from: the dataset record, or a discover run. */
  origin: "dataset" | "discovered";
}

/** Shape of research/firecrawl/discovered/<slug>.json, written by discover.ts. */
export interface DiscoveredPages {
  gatewaySlug: string;
  gatewayName: string;
  website: string;
  discoveredAt: string;
  /** Total links the site map returned before filtering. */
  mapped: number;
  pages: { url: string; kind: TargetKind }[];
}

const COLLECTED_SOURCE_KINDS: TargetKind[] = ["documentation", "pricing", "legal"];

export function targetsFor(gateway: Gateway, includeDiscovered = false): Target[] {
  const targets: Target[] = [];
  const seen = new Set<string>();
  const add = (kind: TargetKind, url: string | null, origin: Target["origin"]) => {
    if (!url) return;
    const key = normalizeUrl(url);
    if (seen.has(key)) return;
    seen.add(key);
    targets.push({ gatewaySlug: gateway.slug, gatewayName: gateway.name, kind, url, origin });
  };

  add("website", gateway.website, "dataset");
  for (const source of gateway.sources) {
    if (COLLECTED_SOURCE_KINDS.includes(source.kind as TargetKind)) {
      add(source.kind as TargetKind, source.url, "dataset");
    }
  }
  if (includeDiscovered) {
    for (const page of loadDiscovered(gateway.slug)?.pages ?? []) {
      add(page.kind, page.url, "discovered");
    }
  }
  return targets;
}

export function allTargets(filterSlugs?: string[], includeDiscovered = false): Target[] {
  return gateways
    .filter((gateway) => !filterSlugs?.length || filterSlugs.includes(gateway.slug))
    .flatMap((gateway) => targetsFor(gateway, includeDiscovered));
}

/** Gateways with no collectable URL at all, so a run can say so explicitly. */
export function gatewaysWithoutTargets(): Gateway[] {
  return gateways.filter((gateway) => targetsFor(gateway).length === 0);
}

/** Every URL the dataset already cites for a gateway, normalised, for discover.ts to exclude. */
export function citedUrls(gateway: Gateway): Set<string> {
  const urls = new Set<string>();
  if (gateway.website) urls.add(normalizeUrl(gateway.website));
  for (const source of gateway.sources) if (source.url) urls.add(normalizeUrl(source.url));
  return urls;
}

export function discoveredFile(slug: string): string {
  return path.join(DISCOVERED_ROOT, `${slug}.json`);
}

export function loadDiscovered(slug: string): DiscoveredPages | null {
  const file = discoveredFile(slug);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as DiscoveredPages;
}

/** Lower-cased host, no trailing slash, no fragment: enough to spot the same page twice. */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase();
    let out = parsed.toString();
    if (out.endsWith("/")) out = out.slice(0, -1);
    return out;
  } catch {
    return url.trim();
  }
}

// Run directly: print the target list without calling Firecrawl.
if (process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/firecrawl/targets.ts")) {
  const argv = process.argv.slice(2);
  const slugs = parseSlugFilter(argv);
  const includeDiscovered = argv.includes("--include-discovered");
  const targets = allTargets(slugs, includeDiscovered);
  for (const target of targets) {
    const origin = target.origin === "discovered" ? " (discovered)" : "";
    console.log(`${target.gatewaySlug.padEnd(18)} ${target.kind.padEnd(14)} ${target.url}${origin}`);
  }
  const missing = gatewaysWithoutTargets();
  console.log("");
  console.log(`${targets.length} URLs across ${new Set(targets.map((t) => t.gatewaySlug)).size} gateways.`);
  if (!includeDiscovered) {
    console.log("Pass --include-discovered to add pages found by npm run firecrawl:discover.");
  }
  if (missing.length) {
    console.log(
      `No collectable URL for: ${missing.map((g) => g.name).join(", ")} (website not confirmed in the dataset).`,
    );
  }
}
