import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/categories";
import { allGateways, datasetStats, sortByName } from "@/lib/gateway";
import { buildSearchIndex } from "@/lib/search";
import { featuredGateways } from "@/lib/featured";
import { resolveCategory } from "@/lib/ranking";
import { JsonLd, itemListJsonLd } from "@/lib/seo";
import { Container, SectionHeading } from "@/components/layout/container";
import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { EuExplainer } from "@/components/home/eu-explainer";
import { UseCases } from "@/components/home/use-cases";
import { MethodologyPreview } from "@/components/home/methodology-preview";
import { LatestUpdates } from "@/components/home/latest-updates";
import { ComparisonTable } from "@/components/comparison/comparison-table";
import { DataLegend } from "@/components/comparison/data-legend";
import { CategoryGrid } from "@/components/categories/category-grid";
import { CategoryRanking } from "@/components/categories/category-ranking";
import { GatewayCard } from "@/components/gateways/gateway-card";

export default function HomePage() {
  const gateways = sortByName(allGateways());
  const stats = datasetStats(categories.length);
  const searchIndex = buildSearchIndex(gateways);
  const featured = featuredGateways(8);

  const catalogueRanking = resolveCategory(
    categories.find((category) => category.slug === "largest-model-catalogues")!,
  );
  const providerRanking = resolveCategory(
    categories.find((category) => category.slug === "provider-networks")!,
  );

  return (
    <>
      <Hero stats={stats} searchIndex={searchIndex} />
      <TrustStrip />

      <section aria-labelledby="compare-heading" className="scroll-mt-20 py-14" id="compare">
        <Container>
          <SectionHeading
            id="compare-heading"
            title="Compare AI gateways"
            description="Model counts are dated snapshots. Where available, catalogues are measured directly from public model endpoints."
            action={
              <Link
                href="/compare"
                className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-ink hover:underline"
              >
                Open full comparison
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            }
          />
          <DataLegend className="mt-6" />
          <div className="mt-4">
            <ComparisonTable
              gateways={gateways}
              caption="Comparison of AI gateways by jurisdiction, EU residency, model count, providers, modalities, deployment and company data."
            />
          </div>
          <p className="mt-3 text-[12.5px] text-ink-subtle">
            Default order is alphabetical. Every figure carries how it was established, so an
            absent number reads as a fact about the product rather than a gap in the research.
          </p>
        </Container>
      </section>

      <section aria-labelledby="categories-heading" className="py-14">
        <Container>
          <SectionHeading
            id="categories-heading"
            eyebrow="Category discovery"
            title="Explore by use case"
            description="Each category states what puts a gateway on the list, and whether the list is ranked at all."
          />
          <div className="mt-8">
            <CategoryGrid categories={categories} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <CategoryRanking
              result={catalogueRanking}
              heading="Largest publicly measured model catalogues"
            />
            <CategoryRanking result={providerRanking} heading="Largest provider networks" />
          </div>
        </Container>
      </section>

      <EuExplainer />

      <div className="py-14">
        <UseCases />
      </div>

      <section aria-labelledby="featured-heading" className="pb-14">
        <Container>
          <SectionHeading
            id="featured-heading"
            eyebrow="Featured entries"
            title="A cross-section of the dataset"
            description="Selected to span managed, enterprise, self-hosted and hyperscaler products across different jurisdictions — not ordered by any metric."
            action={
              <Link
                href="/gateways"
                className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-ink hover:underline"
              >
                All {stats.gatewaysTracked} gateways
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            }
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((gateway) => (
              <li key={gateway.id} className="flex">
                <GatewayCard gateway={gateway} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <MethodologyPreview />

      <div className="py-14">
        <LatestUpdates />
      </div>

      <JsonLd
        data={itemListJsonLd({
          name: "AI gateways and OpenRouter alternatives",
          description:
            "Gateways tracked in the openrouteralternatives.eu comparison dataset.",
          items: gateways.map((gateway) => ({
            name: gateway.name,
            path: `/gateways/${gateway.slug}`,
          })),
        })}
      />
    </>
  );
}
