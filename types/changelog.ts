export type ChangeKind =
  | "model-catalogue"
  | "social"
  | "company"
  | "dataset"
  | "site"
  | "correction";

export interface ChangelogChange {
  /** Gateway slug, or null for dataset-wide changes. */
  gateway: string | null;
  field: string;
  previous: string | null;
  next: string | null;
  source?: string;
}

export interface ChangelogEntry {
  /** ISO date. */
  date: string;
  kind: ChangeKind;
  title: string;
  summary: string;
  changes: ChangelogChange[];
}
