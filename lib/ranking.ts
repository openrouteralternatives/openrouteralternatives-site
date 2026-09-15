import type { CategoryDefinition, Gateway, RankingMetric } from "@/types";
import type { Metric, MetricStatus, MetricValue } from "@/types/metric";
import { allGateways, sortByName } from "@/lib/gateway";
import { comparableValue, metricDisplay } from "@/lib/metric";
import { formatCount } from "@/lib/format";

export interface RankedGateway {
  rank: number;
  gateway: Gateway;
  /** The value the ranking is built on. */
  value: number;
  /** Rendered form of that value, e.g. "1,038 models". */
  display: string;
  /** The observation the value came from, so the UI can show its evidence. */
  observation: MetricValue;
  /** ISO date the value was observed. */
  asOf?: string;
}

export interface CategoryResult {
  category: CategoryDefinition;
  /** Everything matching the inclusion criterion, alphabetical. */
  members: Gateway[];
  /** Members holding a value the ranking rule accepts, ordered by it. */
  ranked: RankedGateway[];
  /** Members with no acceptable value. Listed, never ranked. */
  unranked: Gateway[];
  /** Snapshot date for metrics derived from dated observations. */
  snapshotDate: string | null;
}

/**
 * What each ranking metric is allowed to consume.
 *
 * This is the guard that keeps a route count, an endpoint count or a
 * differently-scoped catalogue out of a model-catalogue ranking. A value may
 * only be ranked against values of the same kind, from the same evidence
 * statuses, at the same scope.
 */
const RANKING_RULES: Record<
  Exclude<RankingMetric, "none" | "modalities">,
  {
    field: (gateway: Gateway) => Metric;
    statuses: MetricStatus[];
    scope?: MetricValue["scope"];
    unit: string;
  }
> = {
  "measured-models": {
    field: (gateway) => gateway.models,
    statuses: ["measured"],
    scope: "llm",
    unit: "models",
  },
  "official-models": {
    field: (gateway) => gateway.models,
    statuses: ["official", "catalogue"],
    unit: "models",
  },
  providers: {
    field: (gateway) => gateway.providers,
    statuses: ["measured", "official", "catalogue"],
    unit: "providers",
  },
};

/**
 * Resolves a category against the canonical dataset.
 *
 * Ranking is applied only where the category declares a metric, and only to
 * members holding a value the metric's rule accepts — a gateway is never given
 * a position it has not earned with a comparable figure.
 */
export function resolveCategory(category: CategoryDefinition): CategoryResult {
  const members = sortByName(allGateways().filter(category.filter));

  if (category.rankingMetric === "none") {
    return { category, members, ranked: [], unranked: members, snapshotDate: null };
  }

  const entries = members
    .map((gateway) => {
      // Modality breadth is counted from the documented list rather than from a
      // metric, because it is a set rather than a published quantity.
      if (category.rankingMetric === "modalities") {
        const count = gateway.modalities.value?.length ?? null;
        if (count === null) return null;
        const observation: MetricValue = {
          value: count,
          status: gateway.modalities.status === "verified" ? "measured" : "official",
          note: gateway.modalities.note,
          date: gateway.modalities.asOf,
        };
        return { gateway, value: count, observation, unit: "modalities" };
      }

      const rule = RANKING_RULES[category.rankingMetric as keyof typeof RANKING_RULES];
      const hit = comparableValue(rule.field(gateway), rule.statuses, rule.scope);
      if (!hit) return null;
      return {
        gateway,
        value: hit.value,
        observation: hit.observation,
        unit: rule.unit,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => b.value - a.value || a.gateway.name.localeCompare(b.gateway.name));

  const ranked: RankedGateway[] = entries.map((entry, index) => ({
    rank: index + 1,
    gateway: entry.gateway,
    value: entry.value,
    observation: entry.observation,
    display: `${metricDisplay(entry.observation) ?? formatCount(entry.value)} ${entry.unit}`,
    asOf: entry.observation.date,
  }));

  const rankedIds = new Set(ranked.map((entry) => entry.gateway.id));
  const snapshotDates = ranked
    .map((entry) => entry.asOf)
    .filter((d): d is string => Boolean(d))
    .sort();

  return {
    category,
    members,
    ranked,
    unranked: members.filter((gateway) => !rankedIds.has(gateway.id)),
    snapshotDate: snapshotDates.length ? snapshotDates[snapshotDates.length - 1] : null,
  };
}

/**
 * True when every ranked entry was observed on the same date.
 *
 * Category pages say so explicitly, because a ranking assembled from figures
 * taken on different days is weaker evidence than a single snapshot.
 */
export function isSingleSnapshot(result: CategoryResult): boolean {
  const dates = new Set(result.ranked.map((entry) => entry.asOf).filter(Boolean));
  return dates.size === 1;
}
