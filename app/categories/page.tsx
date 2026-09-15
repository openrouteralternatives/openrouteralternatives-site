import type { Metadata } from "next";
import { categories } from "@/data/categories";
import { resolveCategory } from "@/lib/ranking";
import { JsonLd, breadcrumbJsonLd, itemListJsonLd, pageMetadata } from "@/lib/seo";
import { Container, SectionHeading } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { CategoryGrid } from "@/components/categories/category-grid";
import { CategoryRanking } from "@/components/categories/category-ranking";

export const metadata: Metadata = pageMetadata({
  title: "AI Gateway Categories",
  description:
    "Compare AI gateways by category: largest measured model catalogues, provider networks, EU gateways, EU-hosted gateways, multimodal, enterprise, agent-focused and open-source.",
  path: "/categories",
  keywords: ["AI gateway categories", "EU AI gateways", "open-source AI gateway"],
});

export default function CategoriesPage() {
  const ranked = categories
    .filter((category) => category.rankingMetric !== "none")
    .map((category) => resolveCategory(category));

  return (
    <>
      <PageHeader
        eyebrow="Categories"
        title="Compare by category"
        description="Each category states what puts a gateway on its list and how — or whether — the list is ordered. A category with no measurable ordering is presented as a list, not a ranking."
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Categories", path: "/categories" },
        ]}
        stats={[
          { label: "Categories", value: String(categories.length) },
          {
            label: "Ranked by a metric",
            value: String(categories.filter((c) => c.rankingMetric !== "none").length),
          },
        ]}
      />

      <Container>
        <div className="flex flex-col gap-12 py-10">
          <section aria-labelledby="all-categories-heading">
            <h2 id="all-categories-heading" className="sr-only">
              All categories
            </h2>
            <CategoryGrid categories={categories} />
          </section>

          {ranked.length > 0 ? (
            <section aria-labelledby="rankings-heading">
              <SectionHeading
                id="rankings-heading"
                title="Categories with a measurable ranking"
                description="Only two categories in this directory can be ordered by a single number. Everywhere else, ordering would imply a judgement the data does not support."
              />
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {ranked.map((result) => (
                  <CategoryRanking key={result.category.slug} result={result} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </Container>

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Categories", path: "/categories" },
          ]),
          itemListJsonLd({
            name: "AI gateway categories",
            description: "Comparison categories on openrouteralternatives.eu.",
            items: categories.map((category) => ({
              name: category.name,
              path: `/categories/${category.slug}`,
            })),
          }),
        ]}
      />
    </>
  );
}
