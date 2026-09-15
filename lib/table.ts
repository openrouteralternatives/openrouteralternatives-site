import {
  columnVisibilityFeature,
  createExpandedRowModel,
  createSortedRowModel,
  rowExpandingFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  type ColumnDef,
  type Row,
  type SortFn,
} from "@tanstack/react-table";
import type { Gateway } from "@/types";

/**
 * Feature set for the comparison table.
 *
 * TanStack Table v9 requires features to be registered explicitly, which keeps
 * the client bundle to the three behaviours this table actually uses: sorting,
 * row expansion and column visibility. No pagination or filtering models are
 * pulled in, because filtering happens on the dataset before it reaches the
 * table.
 */
export const gatewayTableFeatures = tableFeatures({
  rowSortingFeature,
  rowExpandingFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  sortFns,
});

export type GatewayTableFeatures = typeof gatewayTableFeatures;
export type GatewayColumnDef = ColumnDef<GatewayTableFeatures, Gateway>;
export type GatewayRow = Row<GatewayTableFeatures, Gateway>;

/** Per-column presentation hints read by the table shell. */
export interface GatewayColumnMeta {
  align?: "left" | "right";
  /** Rendered width in pixels; the table scrolls horizontally rather than squashing. */
  width?: number;
}

/**
 * Numeric comparator for measured columns.
 *
 * Rows with no value are handled by `sortUndefined: "last"` on the column
 * rather than here: that pushes them to the bottom in BOTH directions, so an
 * unmeasured catalogue is never promoted to the top by reversing the sort. A
 * comparator cannot achieve that on its own, because its result is negated for
 * a descending sort.
 */
export const numeric: SortFn<GatewayTableFeatures, Gateway> = (rowA, rowB, columnId) => {
  const left = rowA.getValue(columnId) as number;
  const right = rowB.getValue(columnId) as number;
  return left - right;
};
