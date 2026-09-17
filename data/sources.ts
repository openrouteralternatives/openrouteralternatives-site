import type { SourceKind } from "@/types/source";

/**
 * The source hierarchy this project applies when two sources disagree.
 * Rendered in the homepage methodology section and used to order source chips.
 */
export const SOURCE_HIERARCHY: {
  rank: number;
  kind: SourceKind | "competitor-content";
  label: string;
  description: string;
  accepted: boolean;
}[] = [
  {
    rank: 1,
    kind: "models-api",
    label: "The product's own API response",
    description:
      "A public model endpoint enumerated directly. This is the only evidence that produces a measured catalogue count.",
    accepted: true,
  },
  {
    rank: 2,
    kind: "registry",
    label: "Company registry filings",
    description:
      "National business registers establish the operating legal entity and country of incorporation.",
    accepted: true,
  },
  {
    rank: 3,
    kind: "legal",
    label: "The vendor's own legal pages",
    description:
      "Terms, data processing agreements and subprocessor lists, which are contractual rather than promotional.",
    accepted: true,
  },
  {
    rank: 4,
    kind: "documentation",
    label: "Product documentation",
    description:
      "Technical documentation for regions, deployment options and capabilities.",
    accepted: true,
  },
  {
    rank: 5,
    kind: "official-website",
    label: "The vendor's marketing pages",
    description:
      "Accepted for product-surface facts and recorded as vendor-stated, never as measured.",
    accepted: true,
  },
  {
    rank: 6,
    kind: "linkedin",
    label: "LinkedIn company profile",
    description:
      "Used for company-size bands and follower snapshots only. Never used to derive a precise headcount.",
    accepted: true,
  },
  {
    rank: 7,
    kind: "competitor-content",
    label: "Competitor blog posts and comparison pages",
    description:
      "Not used as evidence for any value in this dataset, in either direction.",
    accepted: false,
  },
];

/** Order used when rendering a gateway's source chips. */
export const SOURCE_KIND_ORDER: SourceKind[] = [
  "models-api",
  "official-website",
  "documentation",
  "repository",
  "legal",
  "registry",
  "pricing",
  "linkedin",
  "x",
  "project-baseline",
];

export function sourceRank(kind: SourceKind): number {
  const index = SOURCE_KIND_ORDER.indexOf(kind);
  return index === -1 ? SOURCE_KIND_ORDER.length : index;
}
