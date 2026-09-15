/**
 * Verification status attached to every value in the dataset.
 *
 * The editorial rule for this project is that uncertainty is displayed, never
 * smoothed over: a field is either backed by a source or it carries a status
 * explaining why it is not.
 */
export type DataStatus =
  | "verified"
  | "vendor-stated"
  | "estimated"
  | "needs-verification"
  /** The company publishes no comparable public value. */
  | "not-published"
  /** Credible sources disagree; the conflict is preserved. */
  | "conflicting"
  | "not-disclosed"
  | "not-applicable";

/**
 * A single dataset value together with its provenance.
 *
 * `value` is `null` whenever the project has no supported figure. Components
 * must render the status instead of substituting a placeholder number.
 */
export interface Field<T> {
  value: T | null;
  status: DataStatus;
  /** Short clarification shown in tooltips and expanded rows. */
  note?: string;
  /** Ids of `Source` entries on the same gateway record. */
  sources?: string[];
  /** ISO date this particular value was established. */
  asOf?: string;
  /**
   * How precise the value is. Vendors routinely publish floors ("50+
   * providers") rather than exact counts; recording that separately keeps the
   * number sortable while stopping the UI from presenting a floor as exact.
   */
  qualifier?: "exact" | "at-least";
}

/** Convenience constructor for a supported value. */
export function field<T>(
  value: T | null,
  status: DataStatus,
  extra: Omit<Field<T>, "value" | "status"> = {},
): Field<T> {
  return { value, status, ...extra };
}

/** A field with no supported value yet. */
export function unverified<T>(note?: string): Field<T> {
  return { value: null, status: "needs-verification", ...(note ? { note } : {}) };
}

/** A field the company publishes no comparable value for. */
export function notPublishedField<T>(note?: string): Field<T> {
  return { value: null, status: "not-published", ...(note ? { note } : {}) };
}

/** A field where credible sources disagree. */
export function conflictingField<T>(note: string): Field<T> {
  return { value: null, status: "conflicting", note };
}

/** A field the company does not publish. */
export function undisclosed<T>(note?: string): Field<T> {
  return { value: null, status: "not-disclosed", ...(note ? { note } : {}) };
}

/** A field that cannot apply to this kind of product. */
export function notApplicable<T>(note?: string): Field<T> {
  return { value: null, status: "not-applicable", ...(note ? { note } : {}) };
}

export function hasValue<T>(f: Field<T> | undefined): f is Field<T> & { value: T } {
  return Boolean(f) && f!.value !== null && f!.value !== undefined;
}
