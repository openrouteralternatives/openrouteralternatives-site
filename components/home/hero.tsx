import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DatasetStats } from "@/lib/gateway";
import type { SearchIndexEntry } from "@/lib/search";
import { formatDate, formatCount } from "@/lib/format";
import { Container } from "@/components/layout/container";
import { SiteSearch } from "@/components/layout/site-search";
import { DatasetPanel } from "@/components/home/dataset-panel";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="tnum text-[22px] font-semibold leading-none tracking-[-0.02em] text-ink">
        {value}
      </span>
      <span className="text-[12.5px] text-ink-muted">{label}</span>
    </div>
  );
}

export function Hero({
  stats,
  searchIndex,
}: {
  stats: DatasetStats;
  searchIndex: SearchIndexEntry[];
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line">
      <div aria-hidden="true" className="grid-veil absolute inset-0 -z-10 opacity-60" />
      <Container>
        <div className="grid gap-10 py-14 sm:py-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-14 lg:py-20">
          <div>
            <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[12px] text-ink-muted shadow-card">
              <span className="size-1.5 rounded-full bg-ok" aria-hidden="true" />
              {stats.snapshotDate
                ? `Model catalogue snapshot ${formatDate(stats.snapshotDate)}`
                : "Dataset in progress"}
            </p>

            <h1 className="mt-5 text-balance text-[38px] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[52px] lg:text-[60px]">
              OpenRouter Alternatives
            </h1>

            <p className="mt-4 text-pretty text-[18px] leading-snug text-ink sm:text-[21px]">
              Compare AI gateways, model routers and multi-provider AI APIs.
            </p>

            <p className="mt-3 max-w-2xl text-pretty text-[15px] leading-relaxed text-ink-muted">
              OpenRouter is one way to access multiple AI models through a unified API. This
              index compares the broader AI gateway landscape — from EU-native routers and
              enterprise control planes to self-hosted open-source gateways.
            </p>
            </div>

            <div className="mt-8 max-w-2xl">
              <SiteSearch index={searchIndex} variant="input" />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-6">
            <Stat value={formatCount(stats.gatewaysTracked)} label="Gateways tracked" />
            <Stat
              value={formatCount(stats.measuredCatalogues)}
              label="Directly measured catalogues"
            />
            <Stat value={formatCount(stats.categoriesCovered)} label="Comparison categories" />
              <Link
                href="/compare"
                className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-ink hover:underline"
              >
                Open the full comparison
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
          </div>

          <DatasetPanel stats={stats} />
        </div>
      </Container>
    </section>
  );
}
