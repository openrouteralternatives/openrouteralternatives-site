import type { FirecrawlConfig } from "./env";

/**
 * A small, dependency-free client for the parts of the Firecrawl REST API
 * these scripts use: `scrape` (one page to Markdown, optionally with a JSON
 * extraction) and `map` (discover a site's URLs).
 *
 * Kept deliberately thin so that a new field can be collected by changing the
 * extraction schema in `schema.ts`, not the transport.
 */

export interface ScrapeMetadata {
  title?: string;
  description?: string;
  language?: string;
  sourceURL?: string;
  url?: string;
  statusCode?: number;
  [key: string]: unknown;
}

export interface ScrapeResult<TJson = unknown> {
  markdown?: string;
  html?: string;
  json?: TJson;
  metadata?: ScrapeMetadata;
}

export interface JsonFormat {
  type: "json";
  schema: Record<string, unknown>;
  prompt?: string;
}

export type ScrapeFormat = "markdown" | "html" | "links" | JsonFormat;

export interface ScrapeOptions {
  formats?: ScrapeFormat[];
  /** Strip navigation, footers and other boilerplate. Defaults to true. */
  onlyMainContent?: boolean;
  /** Milliseconds to wait for client-side rendering before capture. */
  waitFor?: number;
  /** Request timeout in milliseconds, passed to Firecrawl. */
  timeout?: number;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  links?: string[];
}

export class FirecrawlError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
  ) {
    super(message);
    this.name = "FirecrawlError";
  }
}

const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class FirecrawlClient {
  constructor(
    private readonly config: FirecrawlConfig,
    private readonly retries = 3,
  ) {}

  private async post<T>(endpoint: string, body: Record<string, unknown>): Promise<ApiEnvelope<T>> {
    const url = `${this.config.apiUrl}${endpoint}`;
    let attempt = 0;
    for (;;) {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.config.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        return (await response.json()) as ApiEnvelope<T>;
      }

      const text = await response.text();
      if (RETRYABLE.has(response.status) && attempt < this.retries) {
        attempt += 1;
        const retryAfter = Number(response.headers.get("retry-after"));
        const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1500 * 2 ** attempt;
        console.warn(`  firecrawl ${response.status} on ${endpoint}, retrying in ${delay}ms (${attempt}/${this.retries})`);
        await sleep(delay);
        continue;
      }
      throw new FirecrawlError(
        `Firecrawl ${endpoint} failed with ${response.status}: ${text.slice(0, 300)}`,
        response.status,
        url,
      );
    }
  }

  /** Scrape one URL. Returns Markdown plus metadata, and JSON when requested. */
  async scrape<TJson = unknown>(url: string, options: ScrapeOptions = {}): Promise<ScrapeResult<TJson>> {
    const envelope = await this.post<ScrapeResult<TJson>>("/scrape", {
      url,
      formats: options.formats ?? ["markdown"],
      onlyMainContent: options.onlyMainContent ?? true,
      ...(options.waitFor ? { waitFor: options.waitFor } : {}),
      ...(options.timeout ? { timeout: options.timeout } : {}),
    });
    if (!envelope.success || !envelope.data) {
      throw new FirecrawlError(envelope.error ?? "Firecrawl returned no data", 200, url);
    }
    return envelope.data;
  }

  /** Discover URLs on a site, optionally filtered by a search term such as "pricing". */
  async map(url: string, search?: string, limit = 100): Promise<string[]> {
    type MapLink = string | { url?: string };
    const envelope = await this.post<{ links?: MapLink[] }>("/map", {
      url,
      ...(search ? { search } : {}),
      limit,
    });
    if (!envelope.success) {
      throw new FirecrawlError(envelope.error ?? "Firecrawl map failed", 200, url);
    }
    // v1 returned `links: string[]` at the top level; v2 returns
    // `data.links` as objects with `url`, `title` and `description`.
    const links = (envelope.links ?? envelope.data?.links ?? []) as MapLink[];
    return links
      .map((link) => (typeof link === "string" ? link : link.url))
      .filter((link): link is string => typeof link === "string" && link.length > 0);
  }
}
