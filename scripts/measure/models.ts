/**
 * Measure: enumerate a gateway's public model endpoint and count it with the
 * dataset's counting rule.
 *
 *   npm run measure:models                             # every gateway with a models-endpoint source
 *   npm run measure:models -- --gateway cortecs        # one or more slugs
 *   npm run measure:models -- --gateway x --url https://api.example.com/v1/models
 *   npm run measure:models -- --header "Authorization: Bearer …"
 *   npm run measure:models -- --keep-prefixes          # do not collapse provider/model to model
 *   npm run measure:models -- --dry                    # print only, write nothing
 *
 * Endpoints are read from each record's `models-endpoint` source in
 * data/gateways.ts, so a gateway gains a measurement target by citing its
 * endpoint. Endpoints that need a key read it from `MODELS_API_KEY_<SLUG>`
 * (slug upper-cased, hyphens to underscores, e.g. MODELS_API_KEY_EDEN_AI) in
 * the environment or .env, sent as a Bearer token, or from --header.
 *
 * Output: research/measurements/<date>/<slug>.json with the raw identifiers,
 * every step of the rule and what it removed, plus a `measured(...)` snippet
 * to paste into the metric's history by hand. Nothing here edits the dataset.
 */
import path from "node:path";
import { gateways } from "@/data/gateways";
import { hasFlag, parseSlugFilter, parseStringFlag, parseStringFlags } from "../firecrawl/args";
import { loadEnv } from "../firecrawl/env";
import { MEASUREMENTS_ROOT, today, writeJson } from "../firecrawl/fs";
import { countModels, extractModelIds, type CountResult } from "./count";

interface MeasureTarget {
  slug: string;
  name: string;
  url: string;
}

interface Measurement {
  gatewaySlug: string;
  gatewayName: string;
  url: string;
  retrieved: string;
  httpStatus: number;
  collapsePrefixes: boolean;
  result: CountResult;
  rawIds: string[];
}

function envKeyFor(slug: string): string {
  return `MODELS_API_KEY_${slug.toUpperCase().replace(/-/g, "_")}`;
}

function parseHeaders(raw: string[]): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const line of raw) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    headers[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return headers;
}

function targetsFrom(argv: string[]): MeasureTarget[] {
  const slugs = parseSlugFilter(argv);
  const urlOverride = parseStringFlag(argv, "--url");
  if (urlOverride) {
    if (slugs.length !== 1) {
      console.error("--url needs exactly one --gateway slug to file the measurement under.");
      process.exit(1);
    }
    const gateway = gateways.find((g) => g.slug === slugs[0]);
    return [{ slug: slugs[0], name: gateway?.name ?? slugs[0], url: urlOverride }];
  }
  return gateways
    .filter((gateway) => !slugs.length || slugs.includes(gateway.slug))
    .flatMap((gateway) =>
      gateway.sources
        .filter((source) => source.id === "models-endpoint" && source.url)
        .map((source) => ({ slug: gateway.slug, name: gateway.name, url: source.url as string })),
    );
}

async function fetchJson(url: string, headers: Record<string, string>): Promise<{ status: number; body: unknown }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json", ...headers },
      signal: controller.signal,
    });
    const text = await response.text();
    let body: unknown = text;
    try {
      body = JSON.parse(text);
    } catch {
      /* leave as text so the caller can show it */
    }
    return { status: response.status, body };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  loadEnv();
  const argv = process.argv.slice(2);
  const dry = hasFlag(argv, "--dry");
  const collapsePrefixes = !hasFlag(argv, "--keep-prefixes");
  const extraHeaders = parseHeaders(parseStringFlags(argv, "--header"));
  const date = today();

  const targets = targetsFrom(argv);
  if (!targets.length) {
    console.log("No gateway cites a models-endpoint source with a URL. Add modelsEndpointSource(url) to a record, or pass --gateway <slug> --url <endpoint>.");
    return;
  }
  console.log(`Measuring ${targets.length} endpoint(s) on ${date}${dry ? " (dry run)" : ""}`);

  let failures = 0;
  for (const target of targets) {
    const headers = { ...extraHeaders };
    const key = process.env[envKeyFor(target.slug)];
    if (key && !headers.Authorization && !headers.authorization) headers.Authorization = `Bearer ${key}`;

    console.log("");
    console.log(`${target.name} · ${target.url}`);
    let status = 0;
    let body: unknown;
    try {
      ({ status, body } = await fetchJson(target.url, headers));
    } catch (error) {
      failures += 1;
      console.log(`  ✗ request failed: ${String(error)}`);
      continue;
    }
    if (status < 200 || status >= 300) {
      failures += 1;
      const hint = status === 401 || status === 403 ? ` (set ${envKeyFor(target.slug)} or pass --header)` : "";
      console.log(`  ✗ HTTP ${status}${hint}`);
      console.log(`    ${String(typeof body === "string" ? body : JSON.stringify(body)).slice(0, 200)}`);
      continue;
    }

    const rawIds = extractModelIds(body);
    if (!rawIds) {
      failures += 1;
      console.log("  ✗ could not find a list of model identifiers in the response. First 300 characters:");
      console.log(`    ${JSON.stringify(body).slice(0, 300)}`);
      continue;
    }

    const result = countModels(rawIds, { collapsePrefixes });
    console.log(`  raw entries                 ${result.raw}`);
    for (const step of result.steps) {
      const detail = step.removed.length
        ? `−${step.removed.length}  e.g. ${step.removed.slice(0, 3).join(", ")}`
        : "no change";
      console.log(`  after ${step.rule.padEnd(52)} ${String(step.remaining).padStart(5)}   ${detail}`);
    }
    console.log(`  measured                    ${result.final}`);

    const measurement: Measurement = {
      gatewaySlug: target.slug,
      gatewayName: target.name,
      url: target.url,
      retrieved: date,
      httpStatus: status,
      collapsePrefixes,
      result,
      rawIds,
    };
    if (!dry) {
      const file = path.join(MEASUREMENTS_ROOT, date, `${target.slug}.json`);
      writeJson(file, measurement);
      console.log(`  → ${path.relative(process.cwd(), file)}`);
    }
    console.log("  paste into the metric's history, then log it in data/changelog.ts:");
    console.log(
      `    measured(${result.final}, "${date}", { scope: "llm", sourceIds: ["models-endpoint"], note: \`\${COUNT_RULE}\` }),`,
    );
  }

  console.log("");
  console.log(`${targets.length - failures} measured, ${failures} failed. Counts are observations: append them to history, never overwrite an earlier figure.`);
  if (failures) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
