"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Columns3, Search, SlidersHorizontal, X } from "lucide-react";
import type { Deployment, EuResidency, JurisdictionBucket, Modality } from "@/types";
import type { GatewayFilters } from "@/lib/gateway";
import {
  DEPLOYMENT,
  DEPLOYMENT_ORDER,
  EU_RESIDENCY,
  EU_RESIDENCY_ORDER,
  GATEWAY_TYPE,
  GATEWAY_TYPE_ORDER,
  JURISDICTION,
  JURISDICTION_ORDER,
  MODALITY,
  MODALITY_ORDER,
} from "@/lib/taxonomy";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Filter modalities offered in the table UI, in the brief's order. */
const FILTERABLE_MODALITIES: Modality[] = MODALITY_ORDER.filter(
  (modality) => modality !== "audio" && modality !== "reranking",
);

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const id = React.useId();
  const isActive = value !== "all";

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-medium uppercase tracking-[0.07em] text-ink-subtle"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className={cn(
            "h-9 w-full appearance-none rounded-lg border bg-surface py-0 pl-3 pr-8 text-[13px] text-ink transition-colors hover:border-line-strong",
            isActive ? "border-brand-line bg-brand-subtle text-brand-ink" : "border-line",
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle"
        />
      </div>
    </div>
  );
}

export function FilterBar({
  filters,
  onChange,
  onReset,
  resultCount,
  totalCount,
  columnToggles,
}: {
  filters: GatewayFilters;
  onChange: (next: Partial<GatewayFilters>) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
  columnToggles?: { id: string; label: string; visible: boolean; toggle: () => void }[];
}) {
  const searchId = React.useId();
  const hasFilters =
    filters.search.trim() !== "" ||
    filters.type !== "all" ||
    filters.jurisdiction !== "all" ||
    filters.residency !== "all" ||
    filters.deployment !== "all" ||
    filters.modalities.length > 0;

  const toggleModality = (modality: Modality) => {
    onChange({
      modalities: filters.modalities.includes(modality)
        ? filters.modalities.filter((m) => m !== modality)
        : [...filters.modalities, modality],
    });
  };

  return (
    <div className="rounded-card border border-line bg-surface md:rounded-b-none md:border-b-0">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label
              htmlFor={searchId}
              className="text-[11px] font-medium uppercase tracking-[0.07em] text-ink-subtle"
            >
              Search
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
              />
              <input
                id={searchId}
                type="search"
                value={filters.search}
                onChange={(event) => onChange({ search: event.target.value })}
                placeholder="Search gateways, providers or capabilities..."
                className="h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-[13px] text-ink transition-colors placeholder:text-ink-subtle hover:border-line-strong"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto lg:grid-cols-4">
            <Select
              label="Gateway type"
              value={filters.type}
              onChange={(value) => onChange({ type: value })}
              options={[
                { value: "all" as const, label: "All" },
                ...GATEWAY_TYPE_ORDER.map((type) => ({
                  value: type,
                  label: GATEWAY_TYPE[type].label,
                })),
                { value: "open-source" as const, label: "Open source" },
              ]}
            />
            <Select
              label="Jurisdiction"
              value={filters.jurisdiction}
              onChange={(value) => onChange({ jurisdiction: value })}
              options={[
                { value: "all" as const, label: "All" },
                ...JURISDICTION_ORDER.map((bucket: JurisdictionBucket) => ({
                  value: bucket,
                  label: JURISDICTION[bucket].label,
                })),
              ]}
            />
            <Select
              label="EU residency"
              value={filters.residency}
              onChange={(value) => onChange({ residency: value })}
              options={[
                { value: "all" as const, label: "All" },
                ...EU_RESIDENCY_ORDER.map((residency: EuResidency) => ({
                  value: residency,
                  label: EU_RESIDENCY[residency].label,
                })),
              ]}
            />
            <Select
              label="Deployment"
              value={filters.deployment}
              onChange={(value) => onChange({ deployment: value })}
              options={[
                { value: "all" as const, label: "All" },
                ...DEPLOYMENT_ORDER.map((deployment: Deployment) => ({
                  value: deployment,
                  label: DEPLOYMENT[deployment].label,
                })),
              ]}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-[13px] transition-colors",
                  filters.modalities.length > 0
                    ? "border-brand-line bg-brand-subtle text-brand-ink"
                    : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
                )}
              >
                <SlidersHorizontal aria-hidden="true" className="size-3.5" />
                Modalities
                {filters.modalities.length > 0 ? (
                  <Badge tone="brand" size="xs">
                    {filters.modalities.length}
                  </Badge>
                ) : null}
                <ChevronDown aria-hidden="true" className="size-3.5" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                sideOffset={6}
                className="z-50 max-h-[22rem] w-60 overflow-y-auto rounded-xl border border-line bg-surface p-1.5 shadow-pop animate-fade-up"
              >
                <DropdownMenu.Label className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-[0.07em] text-ink-subtle">
                  Documented modalities
                </DropdownMenu.Label>
                {FILTERABLE_MODALITIES.map((modality) => {
                  const checked = filters.modalities.includes(modality);
                  return (
                    <DropdownMenu.CheckboxItem
                      key={modality}
                      checked={checked}
                      onCheckedChange={() => toggleModality(modality)}
                      onSelect={(event) => event.preventDefault()}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] text-ink outline-none data-[highlighted]:bg-subtle"
                    >
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded border",
                          checked ? "border-brand bg-brand text-white" : "border-line-strong",
                        )}
                      >
                        {checked ? <Check aria-hidden="true" className="size-3" /> : null}
                      </span>
                      {MODALITY[modality].label}
                    </DropdownMenu.CheckboxItem>
                  );
                })}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {columnToggles && columnToggles.length > 0 ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="hidden h-8 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-[13px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink md:inline-flex"
                >
                  <Columns3 aria-hidden="true" className="size-3.5" />
                  Columns
                  <ChevronDown aria-hidden="true" className="size-3.5" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="start"
                  sideOffset={6}
                  className="z-50 max-h-[22rem] w-56 overflow-y-auto rounded-xl border border-line bg-surface p-1.5 shadow-pop animate-fade-up"
                >
                  <DropdownMenu.Label className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-[0.07em] text-ink-subtle">
                    Visible columns
                  </DropdownMenu.Label>
                  {columnToggles.map((column) => (
                    <DropdownMenu.CheckboxItem
                      key={column.id}
                      checked={column.visible}
                      onCheckedChange={column.toggle}
                      onSelect={(event) => event.preventDefault()}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] text-ink outline-none data-[highlighted]:bg-subtle"
                    >
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded border",
                          column.visible ? "border-brand bg-brand text-white" : "border-line-strong",
                        )}
                      >
                        {column.visible ? <Check aria-hidden="true" className="size-3" /> : null}
                      </span>
                      {column.label}
                    </DropdownMenu.CheckboxItem>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : null}

          {filters.modalities.map((modality) => (
            <button
              key={modality}
              type="button"
              onClick={() => toggleModality(modality)}
              aria-label={`Remove ${MODALITY[modality].label} filter`}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-brand-line bg-brand-subtle px-2.5 text-[12.5px] text-brand-ink"
            >
              {MODALITY[modality].label}
              <X aria-hidden="true" className="size-3" />
            </button>
          ))}

          <div className="ml-auto flex items-center gap-3">
            <p aria-live="polite" className="text-[12.5px] text-ink-muted">
              <span className="tnum font-medium text-ink">{resultCount}</span> of{" "}
              <span className="tnum">{totalCount}</span> gateways
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
              >
                <X aria-hidden="true" className="size-3.5" />
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
