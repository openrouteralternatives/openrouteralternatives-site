import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategory } from "@/data/categories";
import { resolveCategory } from "@/lib/ranking";
import { JsonLd, breadcrumbJsonLd, itemListJsonLd, pageMetadata } from "@/lib/seo";
import { CategoryPage } from "@/components/categories/category-page";

const SLUG = "provider-networks";

export function generateMetadata(): Metadata {
  const category = getCategory(SLUG);
  if (!category) return {};
  return pageMetadata({
    title: category.seoTitle,
    description: category.metaDescription,
    path: `/categories/${category.slug}`,
  });
}

export default function Page() {
  const category = getCategory(SLUG);
  if (!category) notFound();

  const result = resolveCategory(category);

  return (
    <>
      <CategoryPage category={category} />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Categories", path: "/categories" },
            { name: category.name, path: `/categories/${category.slug}` },
          ]),
          itemListJsonLd({
            name: category.title,
            description: category.metaDescription,
            items: (result.ranked.length > 0
              ? result.ranked.map((entry) => entry.gateway)
              : result.members
            ).map((gateway) => ({
              name: gateway.name,
              path: `/gateways/${gateway.slug}`,
            })),
          }),
        ]}
      />
    </>
  );
}
