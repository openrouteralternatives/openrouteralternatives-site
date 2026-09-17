import Link from "next/link";
import {
  CircleCheckBig,
  Database,
  FileCheck,
  Info,
  Minus,
  Newspaper,
  Plug,
  SlidersHorizontal,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { METRIC_STATUS, METRIC_STATUS_ORDER } from "@/lib/taxonomy";
import { InfoTip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  CircleCheckBig,
  FileCheck,
  Database,
  Newspaper,
  Minus,
  Plug,
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

/**
 * Compact legend for the evidence vocabulary, shown beside the table.
 *
 * The point is that a reader can understand what a status means without
 * leaving the page — the methodology page is the long form, not the only form.
 */
export function DataLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-ink-subtle",
        className,
      )}
    >
      <span className="font-medium uppercase tracking-[0.07em]">Data status</span>
      {METRIC_STATUS_ORDER.map((status) => {
        const term = METRIC_STATUS[status];
        const Icon = ICONS[term.icon] ?? Info;
        return (
          <InfoTip key={status} label={term.description}>
            <button
              type="button"
              aria-label={`${term.label}: ${term.description}`}
              className={cn(
                "inline-flex cursor-help items-center gap-1.5 rounded transition-colors hover:text-ink",
                TONE_TEXT[term.tone] ?? "text-ink-subtle",
              )}
            >
              <Icon aria-hidden="true" className="size-3" />
              {term.short}
            </button>
          </InfoTip>
        );
      })}
      <Link
        href="/#model-counting"
        className="ml-auto underline underline-offset-4 hover:text-ink"
      >
        How counts are established
      </Link>
    </div>
  );
}
