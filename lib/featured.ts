import type { Gateway } from "@/types";
import { allGateways, sortByName } from "@/lib/gateway";
import { QUANTIFIED_STATUSES } from "@/types/metric";

/**
 * Selects the featured cards for the homepage.
 *
 * The selection is deliberately spread across gateway types and jurisdictions
 * rather than ordered by any metric, so the grid never doubles as an implicit
 * ranking or promotes one company repeatedly. The result is deterministic, so
 * it is stable between builds and changes only when the dataset does.
 */
export function featuredGateways(count = 8): Gateway[] {
  const pool = sortByName(allGateways());
  const picked: Gateway[] = [];
  const seen = new Set<string>();

  const take = (gateway: Gateway | undefined) => {
    if (!gateway || seen.has(gateway.id) || picked.length >= count) return;
    seen.add(gateway.id);
    picked.push(gateway);
  };

  // One per gateway type, then one per jurisdiction bucket, then alphabetical
  // fill. Within each pass, entries with more recorded data come first so the
  // cards are informative — but the passes themselves set the diversity.
  const informative = (a: Gateway, b: Gateway) => recordedFields(b) - recordedFields(a);

  const types = ["managed", "enterprise", "self-hosted", "hyperscaler"] as const;
  for (const type of types) {
    take(pool.filter((g) => g.type === type).sort(informative)[0]);
  }

  const buckets = ["eu", "us", "other", "unresolved"] as const;
  for (const bucket of buckets) {
    take(
      pool
        .filter((g) => g.jurisdictionBucket === bucket && !seen.has(g.id))
        .sort(informative)[0],
    );
  }

  for (const gateway of pool) take(gateway);

  return sortByName(picked.slice(0, count));
}

/** How many comparison fields a record actually carries a value for. */
function recordedFields(gateway: Gateway): number {
  const fields = [
    gateway.country,
    gateway.legalEntity,
    gateway.modalities,
    gateway.euResidency,
    gateway.deployment,
    gateway.certifications,
    gateway.employees,
  ];
  const quantified = [gateway.models, gateway.providers].filter((m) =>
    QUANTIFIED_STATUSES.includes(m.current.status),
  ).length;
  return fields.filter((f) => f.value !== null).length + quantified * 2;
}
