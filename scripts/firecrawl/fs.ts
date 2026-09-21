import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

/** Root for everything the Firecrawl scripts write. Raw captures are git-ignored. */
export const RESEARCH_ROOT = path.join(process.cwd(), "research", "firecrawl");
export const RAW_ROOT = path.join(RESEARCH_ROOT, "raw");
export const CANDIDATES_ROOT = path.join(RESEARCH_ROOT, "candidates");
export const DISCOVERED_ROOT = path.join(RESEARCH_ROOT, "discovered");

/** Root for model-endpoint measurements written by scripts/measure/models.ts. */
export const MEASUREMENTS_ROOT = path.join(process.cwd(), "research", "measurements");

export function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Short stable hash so two captures of one URL land in the same file. */
export function urlHash(url: string): string {
  return createHash("sha1").update(url).digest("hex").slice(0, 10);
}

/** A readable, filesystem-safe stem for a URL: host and path, truncated. */
export function urlStem(url: string): string {
  const { host, pathname } = new URL(url);
  const stem = `${host}${pathname}`
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `${stem.slice(0, 60)}-${urlHash(url)}`;
}

export function writeJson(file: string, value: unknown): void {
  ensureDir(path.dirname(file));
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function writeText(file: string, value: string): void {
  ensureDir(path.dirname(file));
  writeFileSync(file, value, "utf8");
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
