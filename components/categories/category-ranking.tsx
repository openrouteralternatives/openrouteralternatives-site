import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { describeBreakdown, type CategoryResult, type RankedGateway } from "@/lib/ranking";
import { formatDate } from "@/lib/format";
import { GatewayLogo } from "@/components/gateways/gateway-logo";
import { MetricStatusText, metricTooltip } from "@/components/ui/metric-value";
import { Card } from "@/components/ui/card";

/**
 * Reusable top-N block for a category.
 *
 * Renders only when the category declares a ranking metric and members
 * actually hold a value for it. Where no member has a value, the block says so
 * rather than ordering the list by something else.
 */
export function CategoryRanking({
  result,
  limit = 3,
  heading,
  showLink = true,
  showCriterion = true,
}: {
  result: CategoryResult;
  limit?: number;
  heading?: string;
  showLink?: boolean;
  /** Off where the surrounding page already states the ranking criterion. */
  showCriterion?: boolean;
}) {
  const { category, ranked, snapshotDate } = result;
  if (category.rankingMetric === "none") return null;

  const top = ranked.slice(0, limit);

  // Score-ranked entries explain themselves through their signal breakdown;
  // metric-ranked entries through the observation they came from.
  const explain = (entry: RankedGateway): string =>
    entry.observation
      ? metricTooltip(entry.observation)
      : entry.breakdown
        ? describeBreakdown(entry.breakdown)
        : "";

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-1 border-b border-line bg-subtle px-5 py-4">
        <h3 className="text-[14.5px] font-semibold tracking-[-0.01em] text-ink">
          {heading ?? category.title}
        </h3>
        {showCriterion ? (
          <p className="text-[12.5px] leading-relaxed text-ink-muted">
            {category.rankingCriterion}
          </p>
        ) : null}
        {snapshotDate ? (
          <p className="mt-1 text-[11.5px] text-ink-subtle">
            Snapshot: {formatDate(snapshotDate)}
          </p>
        ) : null}
      </div>

      {top.length === 0 ? (
        <div className="flex items-start gap-3 px-5 py-6">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-subtle" />
          <p className="text-[13.5px] leading-relaxed text-ink-muted">
            No gateway in the dataset currently has a value for this metric, so no ranking is
            published. The list below is not ordered by anything else.
          </p>
        </div>
      ) : (
        <ol className="divide-y divide-line">
          {top.map((entry) => (
            <li key={entry.gateway.id}>
              <Link
                href={`/gateways/${entry.gateway.slug}`}
                title={explain(entry)}
                aria-label={`${entry.gateway.name}: ${entry.display}. ${explain(entry)}`}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-subtle"
              >
                <span className="tnum w-5 shrink-0 font-mono text-[12px] text-ink-subtle">
                  {entry.rank}
                </span>
                <GatewayLogo gateway={entry.gateway} size="sm" />
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-ink">
                  {entry.gateway.name}
                </span>
                <span className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className="tnum text-[13px] text-ink-muted">{entry.display}</span>
                  {entry.observation ? (
                    <MetricStatusText value={entry.observation} />
                  ) : (
                    <span className="text-[11.5px] text-ink-subtle">Weighted criteria</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      {showLink ? (
        <div className="border-t border-line px-5 py-3">
          <Link
            href={`/categories/${category.slug}`}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-ink hover:underline"
          >
            See all {result.members.length} in this category
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
