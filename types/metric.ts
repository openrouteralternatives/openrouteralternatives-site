/**
 * Evidence-aware quantitative values.
 *
 * A number on this site is only meaningful alongside how it was obtained. A
 * count measured from a public endpoint, a figure a vendor prints on its
 * pricing page, and a product that has no fixed catalogue at all are three
 * different situations — and none of them is "missing data".
 *
 * This is deliberately separate from `Field<T>`, which carries qualitative
 * values (legal entity, certifications, residency labels). Quantitative fields
 * need history and a richer evidence vocabulary.
 */

export type MetricStatus =
  /** Counted by this project from a public catalogue or endpoint. */
  | "measured"
  /** A current figure the company publishes in its own documentation. */
  | "official"
  /** Derived from an official public catalogue that is not a headline number. */
  | "catalogue"
  /** A reputable third party, used only where no primary source exists. */
  | "secondary"
  /** The company publishes no comparable figure. */
  | "not_published"
  /** Availability depends on what the customer configures. */
  | "variable"
  /**
   * The number of provider or model integrations the software documents.
   * A real, dated count, but of what can be connected rather than of a
   * hosted catalogue: the reachable set depends on the operator's
   * configuration, so it is shown and sortable but never ranked against
   * hosted catalogues.
   */
  | "documented"
  /** A figure exists but measures a different thing (routes, endpoints...). */
  | "not_comparable"
  /** Credible sources disagree and the disagreement is preserved. */
  | "conflicting";

/** Statuses that represent an actual, comparable quantity. */
export const QUANTIFIED_STATUSES: MetricStatus[] = [
  "measured",
  "official",
  "catalogue",
  "secondary",
  "documented",
];

/**
 * Which evidence wins when a metric holds observations of several kinds.
 *
 * A count this project measured from a public endpoint outranks a figure
 * read from a vendor's catalogue page, which outranks a marketing headline.
 * Rankings pick by this order first and by recency second, so a newer vendor
 * floor never displaces an older measurement of the same quantity.
 */
export const EVIDENCE_PRIORITY: MetricStatus[] = [
  "measured",
  "catalogue",
  "official",
  "secondary",
  "documented",
];

/**
 * One dated observation of a quantity.
 *
 * `value` is present whenever there is a number; `display` overrides how it is
 * rendered (a vendor floor such as "700+"). An observation with no `value` is
 * still meaningful — it records *why* there is no number.
 */
export interface MetricValue {
  value?: number;
  display?: string;
  status: MetricStatus;
  /** ISO date the observation was made or published. */
  date?: string;
  /** Ids of `Source` entries on the same gateway record. */
  sourceIds?: string[];
  /** What exactly was counted, or why no number exists. */
  note?: string;
  /**
   * The slice of the catalogue this figure covers, where gateways expose
   * different scopes. Two figures with different scopes are never ranked
   * against each other.
   */
  scope?: "llm" | "all-modalities";
}

/**
 * A quantity together with everything previously observed about it.
 *
 * `current` drives the table and the top of the profile. `history` keeps
 * superseded measurements and parallel figures (a vendor's own number
 * alongside a measurement) so nothing is overwritten.
 */
export interface Metric {
  current: MetricValue;
  history?: MetricValue[];
}
