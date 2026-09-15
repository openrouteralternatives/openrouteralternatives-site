"use client";

import { ChevronDown } from "lucide-react";
import type { Gateway } from "@/types";
import type { GatewayColumnDef, GatewayRow } from "@/lib/table";
import { numeric } from "@/lib/table";
import { EU_RESIDENCY, EU_RESIDENCY_ORDER, JURISDICTION } from "@/lib/taxonomy";
import { comparableValue, latestMeasured } from "@/lib/metric";
import {
  CapabilityCell,
  OwnershipCell,
  PricingCell,
  RoutesCell,
  CertificationsCell,
  DeploymentCell,
  EmployeesCell,
  GatewayCell,
  JurisdictionCell,
  LocationsCell,
  ModalityCell,
  ModelsCell,
  ProvidersCell,
  ResidencyCell,
  SocialCell,
} from "@/components/comparison/cells";
import { cn } from "@/lib/utils";

/** Ordinal position of a residency label, so the column sorts meaningfully. */
function residencyRank(gateway: Gateway): number {
  return EU_RESIDENCY_ORDER.indexOf(gateway.euResidency.value ?? "needs-verification");
}

export const COLUMN_LABELS: Record<string, string> = {
  gateway: "Gateway",
  jurisdiction: "Jurisdiction",
  residency: "EU residency",
  models: "Models",
  providers: "Providers",
  routes: "Routes",
  modalities: "Modalities",
  ownership: "Ownership",
  pricing: "Pricing",
  employees: "Employees",
  gatewayLocation: "Gateway location",
  deployment: "Deployment",
  zdr: "ZDR",
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
    meta: { width: 260 },
  },
  {
    id: "jurisdiction",
    accessorFn: (gateway) => gateway.country.value ?? undefined,
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
    meta: { width: 168 },
  },
  {
    id: "models",
    accessorFn: (gateway) =>
      latestMeasured(gateway.models)?.value ??
      comparableValue(gateway.models, ["official", "catalogue", "secondary"])?.value ??
      undefined,
    header: COLUMN_LABELS.models,
    cell: ({ row }) => <ModelsCell gateway={row.original} />,
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right", width: 150 },
  },
  {
    id: "routes",
    accessorFn: (gateway) =>
      comparableValue(gateway.routes, ["measured", "official", "catalogue"])?.value ?? undefined,
    header: COLUMN_LABELS.routes,
    cell: ({ row }) => <RoutesCell gateway={row.original} />,
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right", width: 118 },
  },
  {
    id: "providers",
    accessorFn: (gateway) =>
      comparableValue(gateway.providers, ["measured", "official", "catalogue"])?.value ??
      undefined,
    header: COLUMN_LABELS.providers,
    cell: ({ row }) => <ProvidersCell gateway={row.original} />,
    sortFn: numeric,
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right", width: 112 },
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
    id: "gatewayLocation",
    accessorFn: (gateway) => gateway.gatewayLocations.value?.join(", ") ?? undefined,
    header: COLUMN_LABELS.gatewayLocation,
    cell: ({ row }) => <LocationsCell field={row.original.gatewayLocations} />,
    sortUndefined: "last",
    meta: { width: 230 },
  },
  {
    id: "deployment",
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
    accessorFn: (gateway) => gateway.zeroDataRetention.value ?? undefined,
    header: COLUMN_LABELS.zdr,
    cell: ({ row }) => <CapabilityCell field={row.original.zeroDataRetention} />,
    sortUndefined: "last",
    meta: { width: 116 },
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
    accessorFn: (gateway) => gateway.ownershipStatus.value ?? undefined,
    header: COLUMN_LABELS.ownership,
    cell: ({ row }) => <OwnershipCell gateway={row.original} />,
    sortUndefined: "last",
    meta: { width: 176 },
  },
  {
    id: "pricing",
    accessorFn: (gateway) => gateway.pricingTransparency.value ?? undefined,
    header: COLUMN_LABELS.pricing,
    cell: ({ row }) => <PricingCell gateway={row.original} />,
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
