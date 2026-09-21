/**
 * Counting rule for measured model catalogues, as code.
 *
 * Mirrors COUNT_RULE in data/gateways.ts: "Distinct model identifiers in the
 * public catalogue, after removing exact duplicates, serving-provider
 * prefixes, routing variants and non-model pseudo-entries." Every step
 * records what it removed, so a count is reproducible and a reviewer can see
 * exactly which identifiers were collapsed. Pure functions, tested in
 * count.test.ts.
 */

export interface CountStep {
  rule: string;
  /** Identifiers removed or collapsed by this step, for the reviewer. */
  removed: string[];
  remaining: number;
}

export interface CountResult {
  raw: number;
  final: number;
  steps: CountStep[];
  /** The identifiers that were counted, after every step. */
  ids: string[];
}

export interface CountOptions {
  /**
   * Collapse `provider/model` to `model` so the same model served by several
   * providers counts once. On by default because that is the counting rule;
   * switch off for catalogues whose prefix is the model author, where two
   * different models could share a tail.
   */
  collapsePrefixes?: boolean;
}

/** Aliases that route to another model rather than naming one. */
const PSEUDO_ENTRIES = new Set(["auto", "router", "default", "best", "fallback", "smart"]);

/** Keys under which catalogues commonly list their models. */
const LIST_KEYS = ["data", "models", "items", "results", "llms"];
const ID_KEYS = ["id", "model_id", "modelId", "model", "name", "slug"];

function idOf(item: unknown): string | null {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    for (const key of ID_KEYS) {
      const value = (item as Record<string, unknown>)[key];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return null;
}

/**
 * Pull model identifiers out of whatever shape an endpoint returns.
 *
 * Handles an OpenAI-style `{ data: [{ id }] }`, other common list keys, a bare
 * array, and a map of `provider → [model, …]` (each entry becomes
 * `provider/model`, which the prefix step then collapses). Returns null when
 * no list of identifiers can be found, so the caller can show the payload
 * instead of guessing.
 */
export function extractModelIds(payload: unknown): string[] | null {
  if (Array.isArray(payload)) {
    const ids = payload.map(idOf).filter((id): id is string => id !== null);
    return ids.length ? ids : null;
  }
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;

  for (const key of LIST_KEYS) {
    if (Array.isArray(record[key])) {
      const ids = (record[key] as unknown[]).map(idOf).filter((id): id is string => id !== null);
      if (ids.length) return ids;
    }
  }

  // provider → [models] map
  const entries = Object.entries(record);
  if (entries.length && entries.every(([, value]) => Array.isArray(value))) {
    const ids: string[] = [];
    for (const [provider, list] of entries) {
      for (const item of list as unknown[]) {
        const id = idOf(item);
        if (id) ids.push(id.includes("/") ? id : `${provider}/${id}`);
      }
    }
    return ids.length ? ids : null;
  }

  return null;
}

function tail(id: string): string {
  const parts = id.split("/");
  return parts[parts.length - 1];
}

export function countModels(rawIds: string[], options: CountOptions = {}): CountResult {
  const collapsePrefixes = options.collapsePrefixes ?? true;
  const steps: CountStep[] = [];

  // 1. Exact duplicates.
  let ids: string[] = [];
  {
    const seen = new Set<string>();
    const removed: string[] = [];
    for (const raw of rawIds) {
      const id = raw.trim();
      if (!id) continue;
      if (seen.has(id)) removed.push(id);
      else {
        seen.add(id);
        ids.push(id);
      }
    }
    steps.push({ rule: "exact duplicates", removed, remaining: ids.length });
  }

  // 2. Non-model pseudo-entries.
  {
    const removed = ids.filter((id) => PSEUDO_ENTRIES.has(tail(id).toLowerCase()));
    ids = ids.filter((id) => !PSEUDO_ENTRIES.has(tail(id).toLowerCase()));
    steps.push({ rule: "non-model pseudo-entries (auto-routing aliases)", removed, remaining: ids.length });
  }

  // 3. Routing variants: a colon suffix such as :free, :nitro, :extended.
  {
    const seen = new Set<string>();
    const kept: string[] = [];
    const removed: string[] = [];
    for (const id of ids) {
      const base = id.replace(/:[a-z0-9._-]+$/i, "");
      if (seen.has(base)) removed.push(id);
      else {
        seen.add(base);
        kept.push(base);
      }
    }
    ids = kept;
    steps.push({ rule: "routing variant suffixes (:free, :nitro, …)", removed, remaining: ids.length });
  }

  // 4. Serving-provider prefixes: provider/model → model.
  if (collapsePrefixes) {
    const seen = new Set<string>();
    const kept: string[] = [];
    const removed: string[] = [];
    for (const id of ids) {
      const base = tail(id);
      const key = base.toLowerCase();
      if (seen.has(key)) removed.push(id);
      else {
        seen.add(key);
        kept.push(base);
      }
    }
    ids = kept;
    steps.push({ rule: "serving-provider prefixes (provider/model → model)", removed, remaining: ids.length });
  }

  return { raw: rawIds.length, final: ids.length, steps, ids: [...ids].sort() };
}
