"use client";

import { ChevronDown } from "lucide-react";
import type { Gateway } from "@/types";
import type { GatewayColumnDef, GatewayRow } from "@/lib/table";
import { numeric } from "@/lib/table";
import {
  CAPABILITY_ORDER,
  EU_RESIDENCY,
  EU_RESIDENCY_ORDER,
  JURISDICTION,
  JURISDICTION_ORDER,
  OBSERVABILITY_ORDER,
  OPENAI_COMPATIBILITY_ORDER,
  OWNERSHIP_ORDER,
  PRICING_ORDER,
} from "@/lib/taxonomy";
import { sortableCoverage, sortableModelCount, sortableProviderCount } from "@/lib/gateway";
import {
  CapabilityCell,
  OwnershipCell,
  PricingCell,
  RoutesCell,
  CertificationsCell,
  DeploymentCell,
  EmployeesCell,
  FundingCell,
  OpenAiCompatibilityCell,
  GatewayCell,
  JurisdictionCell,
  LocationsCell,
  ModalityCell,
  ModelsCell,
  ObservabilityCell,
  ProvidersCell,
  ResidencyCell,
  SocialCell,
} from "@/components/comparison/cells";
import { cn } from "@/lib/utils";

/** Ordinal position of a residency label, so the column sorts meaningfully. */
function residencyRank(gateway: Gateway): number {
  return EU_RESIDENCY_ORDER.indexOf(gateway.euResidency.value ?? "needs-verification");
}

/**
 * Sort key for OpenAI compatibility: yes, partial, no, then a documented
 * unknown. Rows with no recorded value return undefined so they stay at the
 * bottom in both directions. This orders the column; it ranks nothing.
 */
function openAiCompatibilityRank(gateway: Gateway): number | undefined {
  const value = gateway.openaiCompatible.value;
  return value === null ? undefined : OPENAI_COMPATIBILITY_ORDER.indexOf(value);
}

/**
 * Sort key for jurisdiction.
 *
 * The visible value is the country, but plain alphabetical order would
 * scatter EU member states between non-EU countries. The key therefore
 * groups by jurisdiction bucket first (EU, UK, US, other) and orders by
 * country name within a bucket, so one click gathers the EU entries together.
 * An unresolved jurisdiction returns undefined and stays at the bottom in
 * both directions. The country itself is never altered to make this work.
 */
function jurisdictionKey(gateway: Gateway): string | undefined {
  if (gateway.jurisdictionBucket === "unresolved") return undefined;
  const bucket = JURISDICTION_ORDER.indexOf(gateway.jurisdictionBucket);
  return `${bucket}:${gateway.country.value ?? "￿"}`;
}

/** Ordinal position of a zero-data-retention answer; no value sorts last. */
function zdrRank(gateway: Gateway): number | undefined {
  const value = gateway.zeroDataRetention.value;
  return value === null ? undefined : CAPABILITY_ORDER.indexOf(value);
}

/**
 * Sort key for observability: position on the five-step scale, so a
 * descending sort shows the deepest built-in observability first. Rows with no
 * recorded level return undefined and stay at the bottom in both directions.
 * This orders the column; it ranks nothing.
 */
function observabilityRank(gateway: Gateway): number | undefined {
  const value = gateway.observability.value;
  return value === null ? undefined : OBSERVABILITY_ORDER.indexOf(value);
}

function ownershipRank(gateway: Gateway): number | undefined {
  const value = gateway.ownershipStatus.value;
  return value === null || value === "unresolved" ? undefined : OWNERSHIP_ORDER.indexOf(value);
}

function pricingRank(gateway: Gateway): number | undefined {
  const value = gateway.pricingTransparency.value;
  return value === null || value === "unresolved" ? undefined : PRICING_ORDER.indexOf(value);
}

export const COLUMN_LABELS: Record<string, string> = {
  gateway: "Gateway",
  jurisdiction: "Jurisdiction",
  residency: "EU residency",
  models: "Models",
  providers: "Providers",
  routes: "Routes / endpoints",
  openaiCompatible: "OpenAI compatible",
  modalities: "Modalities",
  ownership: "Ownership",
  pricing: "Pricing",
  employees: "Employees",
  funding: "Funding",
  gatewayLocation: "Gateway location",
  deployment: "Deployment",
  zdr: "ZDR",
  observability: "Observability",
  certifications: "Certifications",
  linkedin: "LinkedIn",
  x: "X",
};

/**
 * Hidden by default so the first view stays readable.
 *
 * Follower counts are deliberately not a primary column: social reach is not a
 * product property and is never used to order anything on this site. They are
 * available through the Columns menu and in the Traction block of each
 * expanded row.
 */
export const DEFAULT_HIDDEN_COLUMNS = ["gatewayLocation", "pricing", "linkedin", "x"];

export const columns: GatewayColumnDef[] = [
  {
    id: "gateway",
    accessorFn: (gateway) => gateway.name,
    header: COLUMN_LABELS.gateway,
    cell: ({ row }) => <GatewayCell gateway={row.original} />,
    enableHiding: false,
    sortFn: "alphanumeric",
    meta: { width: 208 },
  },
  {
    id: "jurisdiction",
    accessorFn: jurisdictionKey,
    header: COLUMN_LABELS.jurisdiction,
    cell: ({ row }) => <JurisdictionCell gateway={row.original} />,
    sortFn: "alphanumeric",
    sortUndefined: "last",
    meta: { width: 158 },
  },
  {
    id: "residency",
    accessorFn: residencyRank,
    header: COLUMN_LABELS.residency,
    cell: ({ row }) => <ResidencyCell gateway={row.original} />,
    sortFn: numeric,
    meta: { width: 168 },
  },
  {
    id: "models",
    accessorFn: sortableModelCount,
    header: COLUMN_LABELS.models,
    cell: ({ row }) => <ModelsCell gateway={row.original} />,
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right", width: 150 },
  },
  {
    id: "providers",
    accessorFn: sortableProviderCount,
    header: COLUMN_LABELS.providers,
    cell: ({ row }) => <ProvidersCell gateway={row.original} />,
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right", width: 118 },
  },
  {
    id: "routes",
    accessorFn: sortableCoverage,
    header: COLUMN_LABELS.routes,
    cell: ({ row }) => <RoutesCell gateway={row.original} />,
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right", width: 156 },
  },
  {
    id: "openaiCompatible",
    accessorFn: openAiCompatibilityRank,
    header: COLUMN_LABELS.openaiCompatible,
    cell: ({ row }) => <OpenAiCompatibilityCell field={row.original.openaiCompatible} />,
    sortFn: numeric,
    sortUndefined: "last",
    meta: { width: 150 },
  },
  {
    id: "modalities",
    accessorFn: (gateway) => gateway.modalities.value?.length ?? undefined,
    header: COLUMN_LABELS.modalities,
    cell: ({ row }) => <ModalityCell field={row.original.modalities} />,
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { width: 232 },
  },
  {
    id: "employees",
    accessorFn: (gateway) => gateway.employees.value?.min ?? undefined,
    header: COLUMN_LABELS.employees,
    cell: ({ row }) => <EmployeesCell gateway={row.original} />,
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { width: 124 },
  },
  {
    id: "funding",
    // Disclosed round count. Rows with no supported value (not publicly
    // listed, not applicable) return undefined and stay at the bottom in both
    // directions, so an unverified company is never sorted as zero rounds.
    accessorFn: (gateway) => gateway.funding.value?.rounds ?? undefined,
    header: COLUMN_LABELS.funding,
    cell: ({ row }) => <FundingCell field={row.original.funding} />,
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right", width: 112 },
  },
  {
    id: "gatewayLocation",
    accessorFn: (gateway) => gateway.gatewayLocations.value?.join(", ") ?? undefined,
    header: COLUMN_LABELS.gatewayLocation,
    cell: ({ row }) => <LocationsCell field={row.original.gatewayLocations} />,
    sortFn: "alphanumeric",
    sortUndefined: "last",
    meta: { width: 230 },
  },
  {
    id: "deployment",
    // Number of documented deployment options: hosted only sorts below
    // hosted plus VPC, which sorts below hosted plus VPC plus on-prem.
    accessorFn: (gateway) => gateway.deployment.value?.length ?? undefined,
    header: COLUMN_LABELS.deployment,
    cell: ({ row }) => <DeploymentCell field={row.original.deployment} />,
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { width: 176 },
  },
  {
    id: "zdr",
    accessorFn: zdrRank,
    header: COLUMN_LABELS.zdr,
    cell: ({ row }) => <CapabilityCell field={row.original.zeroDataRetention} />,
    sortFn: numeric,
    sortUndefined: "last",
    meta: { width: 116 },
  },
  {
    id: "observability",
    accessorFn: observabilityRank,
    header: COLUMN_LABELS.observability,
    cell: ({ row }) => <ObservabilityCell field={row.original.observability} />,
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { width: 132 },
  },
  {
    id: "certifications",
    accessorFn: (gateway) => gateway.certifications.value?.length ?? undefined,
    header: COLUMN_LABELS.certifications,
    cell: ({ row }) => <CertificationsCell field={row.original.certifications} />,
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { width: 196 },
  },
  {
    id: "ownership",
    accessorFn: ownershipRank,
    header: COLUMN_LABELS.ownership,
    cell: ({ row }) => <OwnershipCell gateway={row.original} />,
    sortFn: numeric,
    sortUndefined: "last",
    meta: { width: 176 },
  },
  {
    id: "pricing",
    accessorFn: pricingRank,
    header: COLUMN_LABELS.pricing,
    cell: ({ row }) => <PricingCell gateway={row.original} />,
    sortFn: numeric,
    sortUndefined: "last",
    meta: { width: 158 },
  },
  {
    id: "linkedin",
    accessorFn: (gateway) => gateway.social.linkedinFollowers.value ?? undefined,
    header: COLUMN_LABELS.linkedin,
    cell: ({ row }) => (
      <SocialCell
        network="LinkedIn"
        url={row.original.social.linkedinUrl}
        followers={row.original.social.linkedinFollowers}
      />
    ),
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right", width: 112 },
  },
  {
    id: "x",
    accessorFn: (gateway) => gateway.social.xFollowers.value ?? undefined,
    header: COLUMN_LABELS.x,
    cell: ({ row }) => (
      <SocialCell
        network="X"
        url={row.original.social.xUrl}
        followers={row.original.social.xFollowers}
      />
    ),
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right", width: 100 },
  },
  {
    id: "expander",
    header: () => <span className="sr-only">Details</span>,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => <ExpandButton row={row} />,
    meta: { width: 56 },
  },
];

function ExpandButton({ row }: { row: GatewayRow }) {
  const expanded = row.getIsExpanded();
  return (
    <button
      type="button"
      onClick={row.getToggleExpandedHandler()}
      aria-expanded={expanded}
      aria-label={`${expanded ? "Hide" : "Show"} details for ${row.original.name}`}
      className="inline-flex size-7 items-center justify-center rounded-md border border-line bg-surface text-ink-subtle transition-colors hover:border-line-strong hover:text-ink"
    >
      <ChevronDown
        aria-hidden="true"
        className={cn("size-3.5 transition-transform duration-200", expanded && "rotate-180")}
      />
    </button>
  );
}

/** Plain-text labels, used by the mobile cards and by tests. */
export function residencyLabel(gateway: Gateway): string {
  return EU_RESIDENCY[gateway.euResidency.value ?? "needs-verification"].label;
}

export function jurisdictionLabel(gateway: Gateway): string {
  return JURISDICTION[gateway.jurisdictionBucket].label;
}
