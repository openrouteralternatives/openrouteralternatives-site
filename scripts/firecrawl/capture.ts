import { existsSync } from "node:fs";
import path from "node:path";
import type { ScrapeResult } from "./client";
import { urlStem, writeJson, writeText } from "./fs";
import type { Target } from "./targets";

/**
 * Writing a retrieved page to research/firecrawl/raw/<date>/<gateway>/.
 * Shared by collect.ts (Markdown only) and extract.ts (Markdown and JSON in
 * one request), so a page is never fetched twice to get both.
 */

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

export function captureFiles(runDir: string, target: Target) {
  const stem = urlStem(target.url);
  const dir = path.join(runDir, target.gatewaySlug);
  return {
    markdownFile: path.join(dir, `${stem}.md`),
    metaFile: path.join(dir, `${stem}.meta.json`),
  };
}

/** True when this run directory already holds a capture of the target. */
export function hasCapture(runDir: string, target: Target): boolean {
  const { markdownFile, metaFile } = captureFiles(runDir, target);
  return existsSync(markdownFile) && existsSync(metaFile);
}

export function writeCapture(
  runDir: string,
  target: Target,
  result: ScrapeResult,
  date: string,
): CaptureRecord {
  const { markdownFile, metaFile } = captureFiles(runDir, target);
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
  writeJson(metaFile, record);
  return record;
}
