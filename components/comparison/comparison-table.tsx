"use client";

import * as React from "react";
import { flexRender, useTable } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, SearchX } from "lucide-react";
import type { Gateway } from "@/types";
import { EMPTY_FILTERS, filterGateways, type GatewayFilters } from "@/lib/gateway";
import {
  gatewayTableFeatures,
  type GatewayColumnDef,
  type GatewayColumnMeta,
} from "@/lib/table";
import {
  COLUMN_LABELS,
  DEFAULT_HIDDEN_COLUMNS,
  columns as defaultColumns,
} from "@/components/comparison/columns";
import { ExpandedRow } from "@/components/comparison/expanded-row";
import { FilterBar } from "@/components/comparison/filter-bar";
import { MobileGatewayCard } from "@/components/comparison/mobile-card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * The comparison table.
 *
 * Default sort is alphabetical by gateway name — never a ranking that places
 * one company first. Sorting, column visibility and row expansion are driven
 * from the same canonical dataset that the profile pages read.
 */
export function ComparisonTable({
  gateways,
  initialFilters,
  showFilters = true,
  columns = defaultColumns,
  caption,
}: {
  gateways: Gateway[];
  initialFilters?: Partial<GatewayFilters>;
  showFilters?: boolean;
  columns?: GatewayColumnDef[];
  caption?: string;
}) {
  const [filters, setFilters] = React.useState<GatewayFilters>({
    ...EMPTY_FILTERS,
    ...initialFilters,
  });
  const [sorting, setSorting] = React.useState([{ id: "gateway", desc: false }]);
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>(
    Object.fromEntries(DEFAULT_HIDDEN_COLUMNS.map((id) => [id, false])),
  );

  const data = React.useMemo(
    () => (showFilters ? filterGateways(gateways, filters) : gateways),
    [gateways, filters, showFilters],
  );

  const table = useTable({
    features: gatewayTableFeatures,
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getRowCanExpand: () => true,
    getRowId: (row) => row.id,
    enableSortingRemoval: false,
  });

  const updateFilters = React.useCallback((next: Partial<GatewayFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  }, []);

  const resetFilters = React.useCallback(() => {
    setFilters({ ...EMPTY_FILTERS, ...initialFilters });
  }, [initialFilters]);

  const columnToggles = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide() && COLUMN_LABELS[column.id])
    .map((column) => ({
      id: column.id,
      label: COLUMN_LABELS[column.id] ?? column.id,
      visible: column.getIsVisible(),
      toggle: () => column.toggleVisibility(),
    }));

  const rows = table.getRowModel().rows;
  const visibleColumnCount = table.getVisibleLeafColumns().length;

  // The table scrolls horizontally, so an expanded row would otherwise be laid
  // out at the full scroll width and run off the right edge. Pin it to the left
  // of the scroll container and size it to the visible area instead.
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = React.useState<number | null>(null);
  React.useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setPanelWidth(element.clientWidth));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <TooltipProvider delayDuration={120}>
      <div>
        {showFilters ? (
          <FilterBar
            filters={filters}
            onChange={updateFilters}
            onReset={resetFilters}
            resultCount={data.length}
            totalCount={gateways.length}
            columnToggles={columnToggles}
          />
        ) : null}

        {/* Desktop and tablet: full table, sticky header, sticky first column. */}
        <div
          ref={scrollRef}
          className={cn(
            "scroll-shadow-x hidden overflow-x-auto border border-line bg-surface shadow-card md:block",
            showFilters ? "rounded-b-card" : "rounded-card",
          )}
        >
          <table className="w-full border-collapse text-left">
            {caption ? <caption className="sr-only">{caption}</caption> : null}
            <thead className="sticky top-0 z-20">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    const meta = header.column.columnDef.meta as GatewayColumnMeta | undefined;
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={
                          sorted === "asc"
                            ? "ascending"
                            : sorted === "desc"
                              ? "descending"
                              : canSort
                                ? "none"
                                : undefined
                        }
                        style={meta?.width ? { width: meta.width, minWidth: meta.width } : undefined}
                        className={cn(
                          "border-b border-line bg-subtle px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-muted first:pl-4 last:pr-4",
                          index === 0 && "sticky left-0 z-10",
                          meta?.align === "right" && "text-right",
                        )}
                      >
                        {canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className={cn(
                              "group inline-flex items-center gap-1.5 rounded transition-colors hover:text-ink",
                              meta?.align === "right" && "flex-row-reverse",
                              sorted && "text-ink",
                            )}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {sorted === "asc" ? (
                              <ArrowUp aria-hidden="true" className="size-3" />
                            ) : sorted === "desc" ? (
                              <ArrowDown aria-hidden="true" className="size-3" />
                            ) : (
                              <ChevronsUpDown
                                aria-hidden="true"
                                className="size-3 opacity-0 transition-opacity group-hover:opacity-50"
                              />
                            )}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumnCount} className="px-4 py-16">
                    <EmptyState onReset={resetFilters} />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr
                      className={cn(
                        "group border-b border-line transition-colors last:border-b-0",
                        row.getIsExpanded() ? "bg-subtle" : "hover:bg-subtle",
                      )}
                    >
                      {row.getVisibleCells().map((cell, index) => {
                        const meta = cell.column.columnDef.meta as GatewayColumnMeta | undefined;
                        return (
                          <td
                            key={cell.id}
                            className={cn(
                              "px-3 py-3 align-middle first:pl-4 last:pr-4",
                              index === 0 &&
                                "sticky left-0 z-10 bg-surface group-hover:bg-subtle",
                              index === 0 && row.getIsExpanded() && "bg-subtle",
                              meta?.align === "right" && "text-right",
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                    {row.getIsExpanded() ? (
                      <tr className="border-b border-line">
                        <td colSpan={visibleColumnCount} className="p-0">
                          <div
                            className="sticky left-0"
                            style={panelWidth ? { width: panelWidth } : undefined}
                          >
                            <ExpandedRow gateway={row.original} />
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile: one card per gateway rather than a thirteen-column table. */}
        <div className="flex flex-col gap-3 md:hidden">
          {showFilters ? <div className="h-3" aria-hidden="true" /> : null}
          {rows.length === 0 ? (
            <div className="rounded-card border border-line bg-surface px-4 py-12 shadow-card">
              <EmptyState onReset={resetFilters} />
            </div>
          ) : (
            rows.map((row) => <MobileGatewayCard key={row.id} gateway={row.original} />)
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center text-center">
      <span className="flex size-10 items-center justify-center rounded-full border border-line bg-subtle">
        <SearchX aria-hidden="true" className="size-4 text-ink-subtle" />
      </span>
      <p className="mt-4 text-[14.5px] font-medium text-ink">No gateways match these filters</p>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
        Filters match recorded values only. A gateway whose catalogue is configured by the
        customer, or whose provider does not publish a figure, will not match a filter that asks
        for a specific value.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] text-ink transition-colors hover:bg-subtle"
      >
        Clear filters
      </button>
    </div>
  );
}
