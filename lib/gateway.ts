import type {
  Deployment,
  EuResidency,
  Gateway,
  GatewayType,
  JurisdictionBucket,
  Modality,
  Source,
} from "@/types";
import type { MetricValue } from "@/types/metric";
import { allObservations, comparableValue, latestMeasured } from "@/lib/metric";
import { gateways } from "@/data/gateways";

/**
 * Reading helpers over the canonical dataset.
 *
 * Everything the UI needs to know about a gateway is derived here rather than
 * in components, so that adding a measurement or filling in a field changes
 * every surface at once.
 */

export function allGateways(): Gateway[] {
  return gateways;
}

export function getGateway(slug: string): Gateway | undefined {
  return gateways.find((gateway) => gateway.slug === slug);
}

export function sortByName(list: Gateway[]): Gateway[] {
  return [...list].sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  );
}

/** The newest directly measured model count, or null if never measured. */
export function latestModelMeasurement(gateway: Gateway): MetricValue | null {
  return latestMeasured(gateway.models);
}

export function measuredModelCount(gateway: Gateway): number | null {
  return latestMeasured(gateway.models)?.value ?? null;
}

/**
 * The model figure to show when only one line is available.
 *
 * Prefers a measurement, because that is the only figure this project produced
 * itself; otherwise falls back to whatever the current observation records,
 * including the statuses that explain why there is no number.
 */
export function displayModelObservation(gateway: Gateway): MetricValue {
  return latestMeasured(gateway.models) ?? gateway.models.current;
}

/** The newest date on which any model count was measured across the dataset. */
export function currentSnapshotDate(list: Gateway[] = gateways): string | null {
  const dates = list
    .map((gateway) => latestMeasured(gateway.models)?.date)
    .filter((d): d is string => Boolean(d))
    .sort();
  return dates.length ? dates[dates.length - 1] : null;
}

/** Gateways carrying a measured model count for a given snapshot date. */
export function measuredOn(date: string, list: Gateway[] = gateways): Gateway[] {
  return list.filter((gateway) =>
    allObservations(gateway.models).some((o) => o.status === "measured" && o.date === date),
  );
}

export function resolveSources(gateway: Gateway, ids?: string[]): Source[] {
  if (!ids || ids.length === 0) return [];
  return ids
    .map((id) => gateway.sources.find((source) => source.id === id))
    .filter((source): source is Source => Boolean(source));
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

export interface GatewayFilters {
  search: string;
  /** "all" plus the gateway types, with "open-source" as a cross-cutting flag. */
  type: GatewayType | "open-source" | "all";
  jurisdiction: JurisdictionBucket | "all";
  residency: EuResidency | "all";
  deployment: Deployment | "all";
  modalities: Modality[];
}

export const EMPTY_FILTERS: GatewayFilters = {
  search: "",
  type: "all",
  jurisdiction: "all",
  residency: "all",
  deployment: "all",
  modalities: [],
};

/** Free-text haystack: name, summary, country, modalities and capabilities. */
function searchHaystack(gateway: Gateway): string {
  return [
    gateway.name,
    gateway.slug,
    gateway.summary,
    gateway.differentiator,
    gateway.country.value ?? "",
    gateway.legalEntity.value ?? "",
    gateway.parentCompany.value ?? "",
    ...(gateway.modalities.value ?? []),
    ...(gateway.deployment.value ?? []),
    gateway.models.current.status,
    ...(gateway.certifications.value ?? []),
    ...gateway.bestFor,
  ]
    .join(" ")
    .toLowerCase();
}

export function filterGateways(list: Gateway[], filters: GatewayFilters): Gateway[] {
  const query = filters.search.trim().toLowerCase();

  return list.filter((gateway) => {
    if (query && !searchHaystack(gateway).includes(query)) return false;

    if (filters.type !== "all") {
      if (filters.type === "open-source") {
        if (gateway.openSource.value !== "yes") return false;
      } else if (gateway.type !== filters.type) {
        return false;
      }
    }

    if (filters.jurisdiction !== "all" && gateway.jurisdictionBucket !== filters.jurisdiction) {
      return false;
    }

    if (filters.residency !== "all") {
      const residency = gateway.euResidency.value ?? "needs-verification";
      if (residency !== filters.residency) return false;
    }

    if (filters.deployment !== "all") {
      const deployment = gateway.deployment.value ?? [];
      if (!deployment.includes(filters.deployment)) return false;
    }

    if (filters.modalities.length > 0) {
      const modalities = gateway.modalities.value ?? [];
      if (!filters.modalities.every((m) => modalities.includes(m))) return false;
    }

    return true;
  });
}

export function activeFilterCount(filters: GatewayFilters): number {
  let count = 0;
  if (filters.search.trim()) count += 1;
  if (filters.type !== "all") count += 1;
  if (filters.jurisdiction !== "all") count += 1;
  if (filters.residency !== "all") count += 1;
  if (filters.deployment !== "all") count += 1;
  count += filters.modalities.length;
  return count;
}

// ---------------------------------------------------------------------------
// Dataset statistics — every homepage number is computed, never written down.
// ---------------------------------------------------------------------------

export interface DatasetStats {
  gatewaysTracked: number;
  measuredCatalogues: number;
  categoriesCovered: number;
  euIncorporated: number;
  openSource: number;
  snapshotDate: string | null;
  largestMeasuredCount: number | null;
  /** Gateway counts per product type, in taxonomy order. */
  byType: { type: GatewayType; count: number }[];
}

export function datasetStats(categoryCount: number): DatasetStats {
  const measured = gateways.filter((gateway) => latestMeasured(gateway.models));
  const counts = measured
    .map((gateway) => measuredModelCount(gateway))
    .filter((n): n is number => n !== null);

  return {
    gatewaysTracked: gateways.length,
    measuredCatalogues: measured.length,
    categoriesCovered: categoryCount,
    euIncorporated: gateways.filter((g) => g.euJurisdiction.value === true).length,
    openSource: gateways.filter((g) => g.openSource.value === "yes").length,
    snapshotDate: currentSnapshotDate(),
    largestMeasuredCount: counts.length ? Math.max(...counts) : null,
    byType: (["managed", "enterprise", "self-hosted", "hyperscaler"] as GatewayType[]).map(
      (type) => ({ type, count: gateways.filter((g) => g.type === type).length }),
    ),
  };
}

/**
 * Count of fields still open across the dataset. Surfaced on the methodology
 * page so the site is explicit about its own coverage.
 */
export function openFieldCount(): number {
  const tracked = (gateway: Gateway) => [
    gateway.legalEntity,
    gateway.country,
    gateway.founded,
    gateway.employees,
    gateway.modalities,
    gateway.euResidency,
    gateway.certifications,
    gateway.deployment,
    gateway.social.linkedinFollowers,
    gateway.social.xFollowers,
  ];
  return gateways.reduce(
    (total, gateway) =>
      total + tracked(gateway).filter((f) => f.status === "needs-verification").length,
    0,
  );
}

/** Re-exported so ranking code has a single import site for dataset reads. */
export { comparableValue };
