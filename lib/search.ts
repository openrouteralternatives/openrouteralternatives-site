import type { Gateway } from "@/types";
import { EU_RESIDENCY, MODALITY } from "@/lib/taxonomy";
import { latestMeasured } from "@/lib/metric";

/**
 * Flattened, serialisable view of the dataset for the search dialog.
 *
 * Built on the server and passed to the client component, so the full gateway
 * records never have to cross the boundary.
 */
export interface SearchIndexEntry {
  slug: string;
  name: string;
  differentiator: string;
  haystack: string;
  models: number | null;
  residency: string;
}

export function buildSearchIndex(gateways: Gateway[]): SearchIndexEntry[] {
  return gateways.map((gateway) => ({
    slug: gateway.slug,
    name: gateway.name,
    differentiator: gateway.differentiator,
    haystack: [
      gateway.name,
      gateway.summary,
      gateway.differentiator,
      gateway.country.value ?? "",
      gateway.legalEntity.value ?? "",
      gateway.parentCompany.value ?? "",
      ...(gateway.modalities.value ?? []).map((m) => MODALITY[m].label),
      ...(gateway.certifications.value ?? []),
      ...gateway.bestFor,
    ]
      .join(" ")
      .toLowerCase(),
    models: latestMeasured(gateway.models)?.value ?? null,
    residency: EU_RESIDENCY[gateway.euResidency.value ?? "needs-verification"].label,
  }));
}
