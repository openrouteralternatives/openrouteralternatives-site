import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Minimal `.env` loader so the scripts need no extra dependency.
 *
 * Values already present in the environment win over the file, and the file
 * is optional: CI can set `FIRECRAWL_API_KEY` directly. Nothing here is ever
 * logged.
 */
export function loadEnv(file = ".env"): void {
  const full = path.join(process.cwd(), file);
  if (!existsSync(full)) return;
  for (const raw of readFileSync(full, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

export interface FirecrawlConfig {
  apiKey: string;
  apiUrl: string;
}

/** Reads the configuration or exits with a setup hint. Never prints the key. */
export function requireFirecrawlConfig(): FirecrawlConfig {
  loadEnv();
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "FIRECRAWL_API_KEY is not set. Copy .env.example to .env and add your key, or export it in the shell. See scripts/firecrawl/README.md.",
    );
    process.exit(1);
  }
  const apiUrl = (process.env.FIRECRAWL_API_URL?.trim() || "https://api.firecrawl.dev/v2").replace(
    /\/+$/,
    "",
  );
  return { apiKey, apiUrl };
}
