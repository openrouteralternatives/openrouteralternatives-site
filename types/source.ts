/**
 * Source references. Every factual data point in the dataset should be
 * traceable to a source of a known kind, so the UI can render provenance
 * as compact chips rather than a bibliography.
 */

export type SourceKind =
  | "official-website"
  | "models-api"
  | "documentation"
  | "pricing"
  | "legal"
  | "registry"
  | "linkedin"
  | "x"
  | "repository"
  | "project-baseline";

export interface Source {
  /** Stable id, unique within a gateway record. Referenced by fields. */
  id: string;
  kind: SourceKind;
  /** Short human label, e.g. "Models API" or "Companies House". */
  label: string;
  /** Absolute URL, or null for an internal/offline source such as the baseline. */
  url: string | null;
  /** ISO date the source was consulted. */
  retrieved?: string;
}
