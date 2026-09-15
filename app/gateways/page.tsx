import type { Metadata } from "next";
import { GATEWAY_TYPE, GATEWAY_TYPE_ORDER } from "@/lib/taxonomy";
import { allGateways, datasetStats, sortByName } from "@/lib/gateway";
import { categories } from "@/data/categories";
import { JsonLd, breadcrumbJsonLd, itemListJsonLd, pageMetadata } from "@/lib/seo";
import { Container, SectionHeading } from "@/components/layout/container";
import { GatewayCard } from "@/components/gateways/gateway-card";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = pageMetadata({
  title: "All AI Gateways and OpenRouter Alternatives",
  description:
    "Every AI gateway, model router and multi-provider AI API tracked in the dataset, grouped by product type with model counts, jurisdiction and EU residency.",
  path: "/gateways",
  keywords: ["AI gateway list", "OpenRouter alternatives", "LLM gateway directory"],
});

export default function GatewaysPage() {
  const gateways = sortByName(allGateways());
  const stats = datasetStats(categories.length);

  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="Every gateway in the dataset"
        description="Grouped by product type. Within each group entries are alphabetical — the order carries no judgement."
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Gateways", path: "/gateways" },
        ]}
        stats={[
          { label: "Gateways tracked", value: String(stats.gatewaysTracked) },
          { label: "Measured catalogues", value: String(stats.measuredCatalogues) },
          { label: "EU-incorporated", value: String(stats.euIncorporated) },
          { label: "Open source", value: String(stats.openSource) },
        ]}
      />

      <Container>
        <div className="flex flex-col gap-14 py-12">
          {GATEWAY_TYPE_ORDER.map((type) => {
            const members = gateways.filter((gateway) => gateway.type === type);
            if (members.length === 0) return null;

            return (
              <section key={type} id={type} className="scroll-mt-20">
                <SectionHeading
                  title={GATEWAY_TYPE[type].label}
                  description={GATEWAY_TYPE[type].description}
                />
                <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {members.map((gateway) => (
                    <li key={gateway.id} className="flex">
                      <GatewayCard gateway={gateway} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </Container>

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Gateways", path: "/gateways" },
          ]),
          itemListJsonLd({
            name: "AI gateways tracked",
            description: "All gateways in the openrouteralternatives.eu dataset.",
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
