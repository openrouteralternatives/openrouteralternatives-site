import {
  CircleCheckBig,
  Database,
  FileCheck,
  Info,
  Minus,
  Newspaper,
  SlidersHorizontal,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { Metric, MetricValue } from "@/types/metric";
import { METRIC_STATUS } from "@/lib/taxonomy";
import { metricDisplay } from "@/lib/metric";
import { formatDateShort } from "@/lib/format";
import { InfoTip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  CircleCheckBig,
  FileCheck,
  Database,
  Newspaper,
  Minus,
  SlidersHorizontal,
  Info,
  TriangleAlert,
};

const TONE_TEXT: Record<string, string> = {
  ok: "text-ok",
  info: "text-info",
  warn: "text-warn",
  caution: "text-caution",
  neutral: "text-ink-subtle",
  brand: "text-brand-ink",
};

/** Full tooltip text: what the status means, plus anything specific to this value. */
export function metricTooltip(value: MetricValue): string {
  const term = METRIC_STATUS[value.status];
  const dated =
    value.status === "measured" && value.date
      ? `Counted from the provider's public catalogue on ${formatDateShort(value.date)}.`
      : term.description;
  return value.note ? `${dated} ${value.note}` : dated;
}

/**
 * The compact metric used throughout the comparison table.
 *
 * A figure sits on the first line and its evidence on the second, in small
 * muted text. Where there is no figure the evidence line carries the meaning
 * on its own, so an absent number still reads as a fact about the product
 * rather than as a hole in the research.
 */
export function MetricCell({
  metric,
  className,
  align = "right",
}: {
  metric: Metric;
  className?: string;
  align?: "left" | "right";
}) {
  const current = metric.current;
  const term = METRIC_STATUS[current.status];
  const shown = metricDisplay(current);
  const tooltip = metricTooltip(current);

  // A vendor figure recorded alongside a measurement is worth surfacing, since
  // the gap between the two is itself informative.
  const parallel = (metric.history ?? []).find(
    (o) => o.status === "official" && metricDisplay(o) && current.status === "measured",
  );

  return (
    <InfoTip label={tooltip}>
      <button
        type="button"
        aria-label={`${shown ?? term.label}. ${tooltip}`}
        className={cn(
          "cursor-help leading-tight",
          align === "right" ? "text-right" : "text-left",
          className,
        )}
      >
        <span className="block">
          {shown ? (
            <span className="tnum text-[15px] font-semibold text-ink">{shown}</span>
          ) : (
            <span className="text-[15px] font-semibold text-ink-subtle" aria-hidden="true">
              {current.status === "variable"
                ? "Variable"
                : current.status === "not_comparable"
                  ? "N/A"
                  : current.status === "conflicting"
                    ? "Multiple"
                    : "—"}
            </span>
          )}
        </span>
        <span className={cn("block text-[11px]", TONE_TEXT[term.tone] ?? "text-ink-subtle")}>
          {current.status === "measured" && current.date
            ? `Measured ${formatDateShort(current.date)}`
            : term.short}
        </span>
        {parallel ? (
          <span className="block text-[11px] text-ink-subtle">
            provider: {metricDisplay(parallel)}
          </span>
        ) : null}
      </button>
    </InfoTip>
  );
}

/**
 * The same value at profile size: figure, evidence line, then a sentence
 * explaining what the evidence actually is.
 */
export function MetricBlock({ metric, label }: { metric: Metric; label: string }) {
  const current = metric.current;
  const term = METRIC_STATUS[current.status];
  const shown = metricDisplay(current);
  const Icon = ICONS[term.icon] ?? Info;

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-ink-subtle">
        {label}
      </p>
      <p className="mt-1.5">
        {shown ? (
          <span className="tnum text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink">
            {shown}
          </span>
        ) : (
          <span className="text-[19px] font-semibold leading-tight tracking-[-0.01em] text-ink-muted">
            {term.label}
          </span>
        )}
      </p>
      <p
        className={cn(
          "mt-2 inline-flex items-center gap-1.5 text-[12px]",
          TONE_TEXT[term.tone] ?? "text-ink-subtle",
        )}
      >
        <Icon aria-hidden="true" className="size-3.5" />
        {current.status === "measured" && current.date
          ? `Measured ${formatDateShort(current.date)}`
          : term.label}
      </p>
      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
        {metricTooltip(current)}
      </p>
    </div>
  );
}

/**
 * Non-interactive status marker, for use inside a link or button where a
 * second interactive element would be invalid HTML. The explanation must be
 * carried by the parent's accessible name.
 */
export function MetricStatusText({ value }: { value: MetricValue }) {
  const term = METRIC_STATUS[value.status];
  const Icon = ICONS[term.icon] ?? Info;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11.5px]",
        TONE_TEXT[term.tone] ?? "text-ink-subtle",
      )}
    >
      <Icon aria-hidden="true" className="size-3" />
      {term.short}
    </span>
  );
}

/** Small inline status marker, used in rankings and lists. */
export function MetricStatusChip({ value }: { value: MetricValue }) {
  const term = METRIC_STATUS[value.status];
  const Icon = ICONS[term.icon] ?? Info;
  return (
    <InfoTip label={metricTooltip(value)}>
      <button
        type="button"
        aria-label={`${term.label}. ${metricTooltip(value)}`}
        className={cn(
          "inline-flex cursor-help items-center gap-1 text-[11.5px]",
          TONE_TEXT[term.tone] ?? "text-ink-subtle",
        )}
      >
        <Icon aria-hidden="true" className="size-3" />
        {term.short}
      </button>
    </InfoTip>
  );
}
