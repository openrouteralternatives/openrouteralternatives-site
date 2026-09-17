import type { Gateway, SourceKind } from "@/types";
import { gateways } from "@/data/gateways";

/**
 * Which public pages to collect for each gateway.
 *
 * Targets are derived from the canonical dataset rather than kept in a
 * separate list, so a gateway added to `data/gateways.ts` is collected on the
 * next run without further configuration. Only URLs the dataset already cites
 * (official website, documentation, pricing and legal pages) are used; social
 * profiles and registries are deliberately excluded because they are not
 * useful as scraped Markdown and often forbid automated access.
 */

export type TargetKind = "website" | Extract<SourceKind, "documentation" | "pricing" | "legal">;

export interface Target {
  gatewaySlug: string;
  gatewayName: string;
  kind: TargetKind;
  url: string;
}

const COLLECTED_SOURCE_KINDS: TargetKind[] = ["documentation", "pricing", "legal"];

export function targetsFor(gateway: Gateway): Target[] {
  const targets: Target[] = [];
  const seen = new Set<string>();
  const add = (kind: TargetKind, url: string | null) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    targets.push({ gatewaySlug: gateway.slug, gatewayName: gateway.name, kind, url });
  };

  add("website", gateway.website);
  for (const source of gateway.sources) {
    if (COLLECTED_SOURCE_KINDS.includes(source.kind as TargetKind)) {
      add(source.kind as TargetKind, source.url);
    }
  }
  return targets;
}

export function allTargets(filterSlugs?: string[]): Target[] {
  return gateways
    .filter((gateway) => !filterSlugs?.length || filterSlugs.includes(gateway.slug))
    .flatMap(targetsFor);
}

/** Gateways with no collectable URL at all, so a run can say so explicitly. */
export function gatewaysWithoutTargets(): Gateway[] {
  return gateways.filter((gateway) => targetsFor(gateway).length === 0);
}

/** `--gateway a,b` and `--gateway a --gateway b` are both accepted. */
export function parseSlugFilter(argv: string[]): string[] {
  const slugs: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--gateway" && argv[i + 1]) {
      slugs.push(...argv[i + 1].split(",").map((s) => s.trim()).filter(Boolean));
      i += 1;
    } else if (argv[i].startsWith("--gateway=")) {
      slugs.push(...argv[i].slice("--gateway=".length).split(",").map((s) => s.trim()).filter(Boolean));
    }
  }
  return slugs;
}

export function parseNumberFlag(argv: string[], flag: string): number | undefined {
  const index = argv.indexOf(flag);
  const inline = argv.find((arg) => arg.startsWith(`${flag}=`));
  const raw = index !== -1 ? argv[index + 1] : inline?.slice(flag.length + 1);
  const value = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

// Run directly: print the target list without calling Firecrawl.
if (process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/firecrawl/targets.ts")) {
  const slugs = parseSlugFilter(process.argv.slice(2));
  const targets = allTargets(slugs);
  for (const target of targets) {
    console.log(`${target.gatewaySlug.padEnd(18)} ${target.kind.padEnd(14)} ${target.url}`);
  }
  const missing = gatewaysWithoutTargets();
  console.log("");
  console.log(`${targets.length} URLs across ${new Set(targets.map((t) => t.gatewaySlug)).size} gateways.`);
  if (missing.length) {
    console.log(
      `No collectable URL for: ${missing.map((g) => g.name).join(", ")} (website not confirmed in the dataset).`,
    );
  }
}
