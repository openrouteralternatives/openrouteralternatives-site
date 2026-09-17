import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/data/categories";
import { DATASET_DATE, OPEN_DATASET_FIELDS } from "@/data/gateways";
import { allGateways, datasetStats, sortByName } from "@/lib/gateway";
import { formatDate } from "@/lib/format";
import { JsonLd, breadcrumbJsonLd, itemListJsonLd, pageMetadata } from "@/lib/seo";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { ComparisonTable } from "@/components/comparison/comparison-table";
import { DataLegend } from "@/components/comparison/data-legend";

export const metadata: Metadata = pageMetadata({
  title: "Compare AI Gateways, Model Routers and Multi-Provider AI APIs",
  description:
    "Filter and sort every AI gateway in the dataset by jurisdiction, EU data residency, measured model count, providers, modalities, deployment and certifications.",
  path: "/compare",
  keywords: [
    "compare AI gateways",
    "AI gateway comparison",
    "model router comparison",
    "EU AI gateway",
  ],
});

export default function ComparePage() {
  const gateways = sortByName(allGateways());
  const stats = datasetStats(categories.length);

  return (
    <>
      <PageHeader
        eyebrow="Comparison"
        title="Compare AI gateways"
        description="Model counts are dated snapshots. Where available, catalogues are measured directly from public model endpoints. Fields with no supported value are shown as such rather than estimated."
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
        ]}
        stats={[
          { label: "Gateways tracked", value: String(stats.gatewaysTracked) },
          { label: "Measured catalogues", value: String(stats.measuredCatalogues) },
          {
            label: "Catalogue snapshot",
            value: stats.snapshotDate ? formatDate(stats.snapshotDate) : "—",
          },
        ]}
      />

      <Container width="wide">
        <div className="py-10">
          <DataLegend className="mb-4" />
          <ComparisonTable
            gateways={gateways}
            caption="Comparison of AI gateways by jurisdiction, EU residency, model count, providers, modalities, employees, deployment, zero data retention, certifications and social presence."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div className="rounded-card border border-line bg-surface p-5 shadow-card">
              <h2 className="text-[14px] font-semibold text-ink">How to read this table</h2>
              <ul className="mt-3 flex flex-col gap-2 text-[13.5px] leading-relaxed text-ink-muted">
                <li>
                  Every figure carries how it was established, in the small line beneath it:
                  counted from a public endpoint by us, published by the provider, or taken from an
                  official catalogue.
                </li>
                <li>
                  Where there is no number, the line beneath says why. &ldquo;Configured by
                  you&rdquo; means the reachable catalogue depends on the providers you connect;
                  &ldquo;Different metric&rdquo; means the only published figure counts something
                  else. Neither is a gap in the research.
                </li>
                <li>
                  Jurisdiction is where the company is incorporated. EU residency is where requests
                  are processed. The two columns are never derived from each other.
                </li>
                <li>
                  Sorting always keeps rows with no recorded value at the bottom, in both
                  directions, so missing data is never promoted by reversing the sort.
                </li>
                <li>
                  The default order is alphabetical. Sort by any column to rank by that measure.
                </li>
              </ul>
            </div>

            <div className="rounded-card border border-line bg-subtle p-5">
              <h2 className="text-[14px] font-semibold text-ink">Not yet recorded</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                These fields are open across most of the dataset. They are left blank rather than
                estimated:
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {OPEN_DATASET_FIELDS.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-line bg-surface px-2 py-1 text-[12px] text-ink-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[12.5px] leading-relaxed text-ink-subtle">
                Catalogues re-counted {formatDate(DATASET_DATE)}; earlier measurements are kept on
                each profile rather than overwritten. See the{" "}
                <Link href="/#methodology" className="text-brand-ink hover:underline">
                  methodology
                </Link>{" "}
                for how each field is established.
              </p>
            </div>
          </div>
        </div>
      </Container>

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
          ]),
          itemListJsonLd({
            name: "AI gateway comparison",
            description:
              "AI gateways, model routers and multi-provider AI APIs compared by measured model counts, jurisdiction and EU data residency.",
            items: gateways.map((gateway) => ({
              name: gateway.name,
              path: `/gateways/${gateway.slug}`,
            })),
          }),
        ]}
      />
    </>
  );
}
