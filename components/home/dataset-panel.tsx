import Link from "next/link";
import type { DatasetStats } from "@/lib/gateway";
import { GATEWAY_TYPE } from "@/lib/taxonomy";
import { formatDate } from "@/lib/format";

const SEGMENT_TONE: Record<string, string> = {
  managed: "bg-brand",
  enterprise: "bg-info",
  "self-hosted": "bg-ok",
  hyperscaler: "bg-line-strong",
};

function Line({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-line py-2.5">
      <dt className="text-[13px] text-ink-muted">
        {label}
        {caption ? <span className="ml-1.5 text-[11.5px] text-ink-subtle">{caption}</span> : null}
      </dt>
      <dd className="tnum shrink-0 text-[13.5px] font-medium text-ink">{value}</dd>
    </div>
  );
}

/**
 * Composition of the dataset, computed rather than written down.
 *
 * Sits beside the hero as a neutral summary of what is tracked — deliberately
 * not a ranking, so the first thing on the page is not a league table.
 */
export function DatasetPanel({ stats }: { stats: DatasetStats }) {
  const total = stats.gatewaysTracked;

  return (
    <aside
      aria-label="Dataset composition"
      className="rounded-card border border-line bg-surface p-5 shadow-card"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
          Dataset composition
        </h2>
        <span className="tnum text-[12px] text-ink-subtle">{total} tracked</span>
      </div>

      <div
        className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={stats.byType
          .map((entry) => `${entry.count} ${GATEWAY_TYPE[entry.type].label}`)
          .join(", ")}
      >
        {stats.byType.map((entry) =>
          entry.count > 0 ? (
            <span
              key={entry.type}
              className={SEGMENT_TONE[entry.type]}
              style={{ width: `${(entry.count / total) * 100}%` }}
            />
          ) : null,
        )}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {stats.byType.map((entry) => (
          <li key={entry.type} className="flex items-center gap-1.5 text-[12px] text-ink-muted">
            <span
              aria-hidden="true"
              className={`size-2 rounded-[3px] ${SEGMENT_TONE[entry.type]}`}
            />
            {GATEWAY_TYPE[entry.type].label}
            <span className="tnum text-ink-subtle">{entry.count}</span>
          </li>
        ))}
      </ul>

      <dl className="mt-5">
        <Line
          label="Directly measured catalogues"
          value={`${stats.measuredCatalogues} of ${total}`}
        />
        <Line label="EU-incorporated companies" value={String(stats.euIncorporated)} />
        <Line label="Published under an open licence" value={String(stats.openSource)} />
        <Line
          label="Catalogue snapshot"
          value={stats.snapshotDate ? formatDate(stats.snapshotDate) : "—"}
        />
      </dl>

      <p className="mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-ink-subtle">
        Counts are computed from the dataset on every build.{" "}
        <Link href="/methodology" className="text-ink-muted underline underline-offset-2 hover:text-ink">
          How each field is established
        </Link>
      </p>
    </aside>
  );
}
