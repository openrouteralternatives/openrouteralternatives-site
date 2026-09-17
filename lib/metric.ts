import type { Metric, MetricStatus, MetricValue } from "@/types/metric";
import { EVIDENCE_PRIORITY, QUANTIFIED_STATUSES } from "@/types/metric";
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
 * Returns null unless an observation matches every constraint the ranking
 * declares — status and, where the ranking sets one, scope. This is what stops
 * a route count, a vendor floor or a differently-scoped catalogue from being
 * ranked against directly measured, same-scope counts.
 *
 * Among the observations that qualify, the strongest evidence wins
 * (`EVIDENCE_PRIORITY`), and recency breaks ties within one kind. A vendor
 * floor published after a measurement therefore never displaces the
 * measurement in a ranking; the table cell still shows the current figure and
 * the measurement beneath it.
 */
export function comparableValue(
  m: Metric,
  allowed: MetricStatus[],
  scope?: MetricValue["scope"],
): { value: number; observation: MetricValue } | null {
  const candidates = allObservations(m).filter((observation) => {
    if (!allowed.includes(observation.status)) return false;
    if (observation.value === undefined) return false;
    if (scope && observation.scope && observation.scope !== scope) return false;
    if (scope && !observation.scope) return false;
    return true;
  });
  if (candidates.length === 0) return null;
  // allObservations is already newest-first, and sort is stable.
  candidates.sort(
    (a, b) => EVIDENCE_PRIORITY.indexOf(a.status) - EVIDENCE_PRIORITY.indexOf(b.status),
  );
  const observation = candidates[0];
  return { value: observation.value as number, observation };
}

/** The newest measured observation, used for "measured on" displays. */
export function latestMeasured(m: Metric): MetricValue | null {
  return observationsWithStatus(m, "measured")[0] ?? null;
}
