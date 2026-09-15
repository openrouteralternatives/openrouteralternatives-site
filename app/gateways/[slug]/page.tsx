import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EU_RESIDENCY } from "@/lib/taxonomy";
import { allGateways, getGateway } from "@/lib/gateway";
import { latestMeasured } from "@/lib/metric";
import { formatCount, formatDate } from "@/lib/format";
import { JsonLd, breadcrumbJsonLd, canonical, pageMetadata } from "@/lib/seo";
import { GatewayProfile } from "@/components/gateways/profile";

export const dynamicParams = false;

export function generateStaticParams() {
  return allGateways().map((gateway) => ({ slug: gateway.slug }));
}

/** One factual sentence, built from whatever the record actually holds. */
function describe(slug: string): string | null {
  const gateway = getGateway(slug);
  if (!gateway) return null;

  const parts: string[] = [gateway.summary];
  const measurement = latestMeasured(gateway.models);
  if (measurement?.value !== undefined) {
    parts.push(
      `${formatCount(measurement.value)} models measured on ${formatDate(measurement.date!)}.`,
    );
  }
  if (gateway.country.value) {
    parts.push(`Incorporated in ${gateway.country.value}.`);
  }
  parts.push(
    `EU data residency: ${EU_RESIDENCY[gateway.euResidency.value ?? "needs-verification"].label}.`,
  );
  return parts.join(" ").slice(0, 300);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const gateway = getGateway(slug);
  if (!gateway) return {};

  return pageMetadata({
    title: `${gateway.name} — Models, EU Residency and Company Data`,
    description: describe(slug) ?? gateway.summary,
    path: `/gateways/${gateway.slug}`,
    keywords: [
      gateway.name,
      `${gateway.name} alternative`,
      "AI gateway",
      "model router",
      "multi-provider AI API",
    ],
  });
}

export default async function GatewayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gateway = getGateway(slug);
  if (!gateway) notFound();

  const measurement = latestMeasured(gateway.models);

  return (
    <>
      <GatewayProfile gateway={gateway} />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Gateways", path: "/gateways" },
            { name: gateway.name, path: `/gateways/${gateway.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: gateway.name,
            applicationCategory: "DeveloperApplication",
            description: gateway.summary,
            url: canonical(`/gateways/${gateway.slug}`),
            ...(gateway.website ? { sameAs: [gateway.website] } : {}),
            ...(measurement?.value !== undefined
              ? {
                  additionalProperty: {
                    "@type": "PropertyValue",
                    name: "Models measured",
                    value: measurement.value,
                    valueReference: `Measured ${measurement.date}`,
                  },
                }
              : {}),
          },
        ]}
      />
    </>
  );
}
