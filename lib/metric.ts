import type { Metric, MetricStatus, MetricValue } from "@/types/metric";
import { QUANTIFIED_STATUSES } from "@/types/metric";
import { formatCount } from "@/lib/format";

/** Convenience constructors, so records read as prose rather than punctuation. */

export function measured(
  value: number,
  date: string,
  extra: Omit<MetricValue, "value" | "status" | "date"> = {},
): MetricValue {
  return { value, status: "measured", date, ...extra };
}

/**
 * A figure the vendor publishes.
 *
 * `display` is what the vendor prints ("30+"); `value` is the number that
 * figure sorts on, which for a floor is the floor itself. Without `value` the
 * figure is shown but cannot enter a ranking, which is the right behaviour for
 * a statement that carries no comparable number at all.
 */
export function official(
  display: string,
  date: string,
  extra: Omit<MetricValue, "display" | "status" | "date"> = {},
): MetricValue {
  const parsed = Number(display.replace(/[^0-9.]/g, ""));
  const value = extra.value ?? (Number.isFinite(parsed) && parsed > 0 ? parsed : undefined);
  return { display, status: "official", date, ...extra, value };
}

export function catalogueCount(
  value: number,
  date: string,
  extra: Omit<MetricValue, "value" | "status" | "date"> = {},
): MetricValue {
  return { value, status: "catalogue", date, ...extra };
}

export function notPublished(note: string): MetricValue {
  return { status: "not_published", note };
}

export function variable(note: string): MetricValue {
  return { status: "variable", note };
}

export function notComparable(note: string): MetricValue {
  return { status: "not_comparable", note };
}

export function conflicting(note: string): MetricValue {
  return { status: "conflicting", note };
}

/** A metric with a single observation and no history. */
export function metric(current: MetricValue, history: MetricValue[] = []): Metric {
  return history.length ? { current, history } : { current };
}

/** The empty metric used as a default: nothing recorded, and it says so. */
export function noMetric(note: string): Metric {
  return { current: { status: "not_published", note } };
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

/** How the figure is rendered: an explicit display string, else the number. */
export function metricDisplay(value: MetricValue): string | null {
  if (value.display) return value.display;
  if (value.value !== undefined) return formatCount(value.value);
  return null;
}

/** Whether this observation carries an actual comparable quantity. */
export function isQuantified(value: MetricValue): boolean {
  return QUANTIFIED_STATUSES.includes(value.status) && value.value !== undefined;
}

/** Every observation, newest first, for the history view on a profile. */
export function allObservations(m: Metric): MetricValue[] {
  return [m.current, ...(m.history ?? [])].sort((a, b) =>
    (b.date ?? "").localeCompare(a.date ?? ""),
  );
}

/** Observations of a given status, newest first. */
export function observationsWithStatus(m: Metric, status: MetricStatus): MetricValue[] {
  return allObservations(m).filter((o) => o.status === status);
}

/**
 * The value a ranking may use.
 *
 * Returns null unless the observation matches every constraint the ranking
 * declares — status and, where the ranking sets one, scope. This is what stops
 * a route count, a vendor floor or a differently-scoped catalogue from being
 * ranked against directly measured, same-scope counts.
 */
export function comparableValue(
  m: Metric,
  allowed: MetricStatus[],
  scope?: MetricValue["scope"],
): { value: number; observation: MetricValue } | null {
  for (const observation of allObservations(m)) {
    if (!allowed.includes(observation.status)) continue;
    if (observation.value === undefined) continue;
    if (scope && observation.scope && observation.scope !== scope) continue;
    if (scope && !observation.scope) continue;
    return { value: observation.value, observation };
  }
  return null;
}

/** The newest measured observation, used for "measured on" displays. */
export function latestMeasured(m: Metric): MetricValue | null {
  return observationsWithStatus(m, "measured")[0] ?? null;
}
