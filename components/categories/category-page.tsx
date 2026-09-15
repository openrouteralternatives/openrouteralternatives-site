import Link from "next/link";
import { Info } from "lucide-react";
import type { CategoryDefinition } from "@/types";
import { isSingleSnapshot, resolveCategory } from "@/lib/ranking";
import { officiallyStatedCatalogues } from "@/data/categories";
import { formatDate } from "@/lib/format";
import { Container, SectionHeading } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { ComparisonTable } from "@/components/comparison/comparison-table";
import { CategoryRanking } from "@/components/categories/category-ranking";
import { GatewayCard } from "@/components/gateways/gateway-card";
import { SourceChips } from "@/components/ui/source-chips";

/** Names the quantity the top-three block is ordered by. */
const METRIC_HEADING: Record<string, string> = {
  "measured-models": "Ranked by directly measured model count",
  providers: "Ranked by documented upstream provider count",
  modalities: "Ranked by documented modality breadth",
};

/**
 * One template for all eight category pages.
 *
 * Everything on the page — members, ordering, the top three and the sources
 * list — is derived from the category definition and the canonical dataset, so
 * a new category is a data change rather than a new page implementation.
 */
export function CategoryPage({ category }: { category: CategoryDefinition }) {
  const result = resolveCategory(category);
  const secondary = category.showSecondaryModelRanking
    ? resolveCategory(officiallyStatedCatalogues)
    : null;
  const { members, ranked, unranked } = result;

  // Sources are collected from the members themselves rather than maintained
  // as a separate bibliography.
  const sources = Array.from(
    new Map(
      members
        .flatMap((gateway) => gateway.sources)
        .filter((source) => source.url)
        .map((source) => [source.url, source]),
    ).values(),
  ).slice(0, 12);

  return (
    <>
      <PageHeader
        eyebrow="Category"
        title={category.title}
        description={category.intro}
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Categories", path: "/categories" },
          { name: category.name, path: `/categories/${category.slug}` },
        ]}
        stats={[
          { label: "Gateways in category", value: String(members.length) },
          ...(category.rankingMetric !== "none"
            ? [{ label: "With a value to rank on", value: String(ranked.length) }]
            : []),
          ...(result.snapshotDate
            ? [{ label: "Snapshot", value: formatDate(result.snapshotDate) }]
            : []),
        ]}
      />

      <Container>
        <div className="flex flex-col gap-12 py-10">
          <section aria-labelledby="criteria-heading">
            <h2 id="criteria-heading" className="sr-only">
              Methodology for this category
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-card border border-line bg-surface p-5 shadow-card">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
                  What puts a gateway on this list
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-ink">
                  {category.inclusionCriterion}
                </p>
              </div>
              <div className="rounded-card border border-line bg-surface p-5 shadow-card">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
                  How this list is ordered
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-ink">
                  {category.rankingCriterion}
                </p>
              </div>
            </div>
          </section>

          {category.showTopThree && category.rankingMetric !== "none" ? (
            <section aria-labelledby="top-heading">
              <SectionHeading
                id="top-heading"
                title="Ranked results"
                description="Generated from the current dataset. Measured counts and provider-stated figures are ranked separately and never merged, because they are different kinds of evidence."
              />
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <CategoryRanking
                  result={result}
                  limit={result.ranked.length}
                  showLink={false}
                  showCriterion={false}
                  heading={METRIC_HEADING[category.rankingMetric]}
                />
                {secondary ? (
                  <CategoryRanking
                    result={secondary}
                    limit={secondary.ranked.length}
                    showLink={false}
                    heading="Ranked by the figure the provider publishes"
                  />
                ) : null}
              </div>
              {isSingleSnapshot(result) && result.snapshotDate ? (
                <p className="mt-3 text-[12.5px] text-ink-subtle">
                  Every figure in the measured ranking was counted on the same day, using the same
                  rule, so the entries are directly comparable with one another.
                </p>
              ) : null}
            </section>
          ) : null}

          <section aria-labelledby="results-heading">
            <SectionHeading
              id="results-heading"
              title={`All ${members.length} in this category`}
              description="The same comparison table used site-wide, filtered to this category's members."
            />

            {members.length === 0 ? (
              <div className="mt-6 flex items-start gap-3 rounded-card border border-line bg-subtle p-5">
                <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-subtle" />
                <p className="text-[13.5px] leading-relaxed text-ink-muted">
                  No gateway in the dataset currently meets this criterion. Rather than relaxing the
                  criterion to fill the page, the list stays empty until a value is verified.{" "}
                  <Link href="/methodology" className="text-brand-ink hover:underline">
                    See how fields are verified
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <div className="mt-6">
                <ComparisonTable
                  gateways={members}
                  showFilters={false}
                  caption={`${category.title}: ${category.inclusionCriterion}`}
                />
              </div>
            )}

            {category.rankingMetric !== "none" && unranked.length > 0 ? (
              <p className="mt-4 text-[12.5px] leading-relaxed text-ink-subtle">
                {unranked.length} of these have no value for the ranking metric and are therefore
                listed but not ranked: {unranked.map((gateway) => gateway.name).join(", ")}.
              </p>
            ) : null}
          </section>

          {members.length > 0 ? (
            <section aria-labelledby="cards-heading">
              <SectionHeading
                id="cards-heading"
                title="At a glance"
                description="Alphabetical. Card order carries no ranking."
              />
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {members.map((gateway) => (
                  <li key={gateway.id} className="flex">
                    <GatewayCard gateway={gateway} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {sources.length > 0 ? (
            <section aria-labelledby="sources-heading">
              <SectionHeading
                id="sources-heading"
                title="Sources"
                description="Primary sources behind the entries on this page. Each gateway profile lists the sources for its own values."
              />
              <div className="mt-5">
                <SourceChips sources={sources} />
              </div>
            </section>
          ) : null}
        </div>
      </Container>
    </>
  );
}
