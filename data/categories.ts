import type { CategoryDefinition, UseCase } from "@/types";
import { latestMeasured } from "@/lib/metric";
import { QUANTIFIED_STATUSES } from "@/types/metric";

/**
 * Category definitions.
 *
 * Each category states, in its own record, exactly what puts a gateway on the
 * list and exactly how the list is ordered. Nothing is ranked without a
 * measurable criterion, and `showTopThree` is false wherever a top three would
 * imply an ordering the data does not support.
 */
export const categories: CategoryDefinition[] = [
  {
    slug: "largest-model-catalogues",
    name: "Largest model catalogues",
    title: "Largest AI gateway model catalogues",
    seoTitle: "Largest AI Gateway Model Catalogues — Measured Model Counts",
    metaDescription:
      "AI gateways ranked by the number of distinct models measured directly from their public model endpoints, with the measurement date for every figure.",
    intro:
      "This list ranks gateways by the number of distinct models addressable through their public API, counted by this project on the same day using the same rule. Figures a provider publishes about itself are ranked alongside, never merged in, because a marketing total and a measurement are not the same kind of evidence.",
    inclusionCriterion:
      "The gateway exposes a public model endpoint that could be enumerated, and this project counted it.",
    rankingCriterion:
      "Descending by directly measured model count, restricted to LLM catalogues so every figure covers the same thing. Counting rule: distinct model identifiers after removing exact duplicates, serving-provider prefixes, routing variants and non-model pseudo-entries. Provider-stated figures, route counts and endpoint counts are all excluded.",
    rankingMetric: "measured-models",
    showTopThree: true,
    showSecondaryModelRanking: true,
    icon: "Layers",
    filter: (gateway) => latestMeasured(gateway.models) !== null,
  },
  {
    slug: "provider-networks",
    name: "Largest provider networks",
    title: "AI gateways by upstream provider network",
    seoTitle: "AI Gateways by Provider Network — Upstream Provider Counts",
    metaDescription:
      "Multi-provider AI gateways compared by the number of distinct upstream inference providers reachable through them.",
    intro:
      "A provider is a distinct upstream inference provider or model company reachable through the gateway. The same provider is not counted twice because it is offered in more than one region. Self-hosted gateways appear here because they route to multiple providers, even though the reachable set depends on what the operator configures.",
    inclusionCriterion:
      "The gateway routes to more than one upstream provider, so a provider count is a meaningful attribute of it.",
    rankingCriterion:
      "Descending by upstream provider count. Measured counts and provider-stated figures are both ranked here, and each row shows which it is — a floor such as 30+ is ranked on its floor value. Gateways whose provider set is configured by the customer, or who publish no count, are listed but not ranked.",
    rankingMetric: "providers",
    showTopThree: true,
    icon: "Network",
    filter: (gateway) =>
      gateway.type !== "hyperscaler" &&
      QUANTIFIED_STATUSES.concat("variable").includes(gateway.providers.current.status),
  },
  {
    slug: "eu-gateways",
    name: "EU AI gateways",
    title: "EU AI gateways",
    seoTitle: "EU AI Gateways — EU-Incorporated Gateway Companies",
    metaDescription:
      "AI gateways operated by companies incorporated in the EU. Company jurisdiction is listed separately from where requests are actually processed.",
    intro:
      "Inclusion here is about the company, not the infrastructure. A gateway appears on this list because its operating company is recorded as incorporated in an EU member state — which says nothing on its own about where requests are processed or where models run. Within that group, the list is ordered by upstream provider breadth.",
    inclusionCriterion:
      "The operating company is recorded in the dataset as incorporated in an EU member state, confirmed from a registry filing.",
    rankingCriterion:
      "Descending by upstream provider count, among EU-incorporated companies only. Each row shows whether its figure was measured by this project or stated by the provider; a floor such as 30+ is ranked on its floor value. Entries with no published count are listed but not ranked.",
    rankingMetric: "providers",
    showTopThree: true,
    icon: "Landmark",
    filter: (gateway) => gateway.euJurisdiction.value === true,
  },
  {
    slug: "eu-hosted",
    name: "EU-hosted gateways",
    title: "EU-hosted AI gateways",
    seoTitle: "EU-Hosted AI Gateways — EU Data Residency Options",
    metaDescription:
      "AI gateways with a documented way to have requests processed in the EU, including customer-controlled self-hosted deployments.",
    intro:
      "Inclusion here is about infrastructure, not incorporation. A gateway appears because there is a documented route to EU processing — by default, as a configurable option, for selected routes, under an enterprise agreement, or because the customer runs it themselves.",
    inclusionCriterion:
      "The dataset records a documented EU processing option, or the gateway is customer-deployed so residency follows the deployment.",
    rankingCriterion:
      "Not ranked. Residency labels describe different arrangements, not different amounts of the same thing.",
    rankingMetric: "none",
    showTopThree: false,
    icon: "ShieldCheck",
    filter: (gateway) =>
      ["eu-by-default", "eu-available", "eu-routes", "enterprise-only", "self-hosted"].includes(
        gateway.euResidency.value ?? "",
      ),
  },
  {
    slug: "multimodal",
    name: "Multimodal gateways",
    title: "Multimodal AI gateways",
    seoTitle: "Multimodal AI Gateways — Beyond Text Generation",
    metaDescription:
      "AI gateways with documented support for three or more modalities, including vision, OCR, speech, image, video and document processing.",
    intro:
      "Most gateways route text generation. This list covers those that document support across several modalities, so that a single integration covers more than chat completions.",
    inclusionCriterion:
      "The dataset records three or more documented modalities, at least two of which are not text generation.",
    rankingCriterion:
      "Descending by the number of distinct documented modalities. This counts breadth only: a longer list is not automatically better than a shorter one that covers the modalities you actually need.",
    showSecondaryModelRanking: false,
    rankingMetric: "modalities",
    showTopThree: true,
    icon: "Shapes",
    filter: (gateway) => {
      const modalities = gateway.modalities.value ?? [];
      const nonText = modalities.filter((m) => m !== "llm");
      return modalities.length >= 3 && nonText.length >= 2;
    },
  },
  {
    slug: "enterprise",
    name: "Enterprise AI gateways",
    title: "Enterprise AI gateways",
    seoTitle: "Enterprise AI Gateways — VPC, On-Prem and Governance",
    metaDescription:
      "AI gateways with documented enterprise deployment options such as VPC or on-premise installation, or explicit governance positioning.",
    intro:
      "Enterprise here means a documented deployment or governance capability, not a pricing tier. The attribute that matters most is whether the gateway can run inside infrastructure the organisation controls.",
    inclusionCriterion:
      "The gateway is positioned as an enterprise product, or the dataset records documented VPC or on-premise deployment.",
    rankingCriterion:
      "Not ranked. Enterprise requirements differ too much between organisations for a single ordering to be meaningful.",
    rankingMetric: "none",
    showTopThree: false,
    icon: "Building2",
    filter: (gateway) =>
      gateway.type === "enterprise" ||
      gateway.vpc.value === "yes" ||
      gateway.onPrem.value === "yes",
  },
  {
    slug: "agent-gateways",
    name: "Agent-focused gateways",
    title: "Agent-focused AI gateways",
    seoTitle: "Agent-Focused AI Gateways — Agent and MCP Support",
    metaDescription:
      "AI gateways with documented agent orchestration or Model Context Protocol support.",
    intro:
      "Agent support is recorded only where a gateway documents agent orchestration or Model Context Protocol capability. Tool calling that simply passes through from an upstream model is not counted.",
    inclusionCriterion:
      "The dataset records agent orchestration or Model Context Protocol support as a documented modality.",
    rankingCriterion: "Not ranked. Listed alphabetically.",
    rankingMetric: "none",
    showTopThree: false,
    icon: "Bot",
    filter: (gateway) => {
      const modalities = gateway.modalities.value ?? [];
      return modalities.includes("agents") || modalities.includes("mcp");
    },
  },
  {
    slug: "open-source",
    name: "Open-source gateways",
    title: "Open-source and self-hosted AI gateways",
    seoTitle: "Open-Source AI Gateways — Self-Hosted Model Routers",
    metaDescription:
      "AI gateways published under an open-source licence and run by the customer, compared by licence, deployment and residency implications.",
    intro:
      "These gateways are published under an open-source licence, so the routing layer can be inspected and run inside the customer's own infrastructure. Self-hosting the gateway changes where requests are received — it does not change where the upstream models run.",
    inclusionCriterion:
      "The gateway, or its routing component, is published under an open-source licence with a public repository.",
    rankingCriterion:
      "Not ranked. Licence and operational fit matter more than any single ordering.",
    rankingMetric: "none",
    showTopThree: false,
    icon: "GitBranch",
    filter: (gateway) => gateway.openSource.value === "yes",
  },
];

/**
 * The provider-stated counterpart to the measured catalogue ranking.
 *
 * Not a route of its own: it is rendered beneath the measured ranking so the
 * two sit side by side without ever being merged into one list.
 */
export const officiallyStatedCatalogues: CategoryDefinition = {
  slug: "officially-stated-catalogues",
  name: "Provider-stated catalogues",
  title: "Provider-stated model catalogues",
  seoTitle: "Provider-Stated Model Catalogues",
  metaDescription:
    "Model catalogue figures as published by the providers themselves, ranked separately from directly measured counts.",
  intro:
    "These are the figures providers publish about themselves. They are ranked separately from measured counts because they are a different kind of evidence, and providers do not all count the same way.",
  inclusionCriterion:
    "The provider publishes a model figure in its own documentation or product pages, and no measurement of that catalogue exists in this dataset.",
  rankingCriterion:
    "Descending by the published figure. A floor such as 700+ is ranked on its floor value. These numbers are not comparable with the measured counts above and are never merged with them.",
  rankingMetric: "official-models",
  showTopThree: true,
  icon: "FileCheck",
  filter: (gateway) =>
    ["official", "catalogue"].includes(gateway.models.current.status),
};

export function getCategory(slug: string): CategoryDefinition | undefined {
  return categories.find((category) => category.slug === slug);
}

/** Homepage "Which AI gateway is right for you?" cards. */
export const useCases: UseCase[] = [
  {
    slug: "eu-data-residency",
    title: "EU data residency",
    description:
      "You need requests processed in the EU, and you need the claim to be documented rather than implied by a company address.",
    categorySlug: "eu-hosted",
    icon: "ShieldCheck",
  },
  {
    slug: "broad-model-coverage",
    title: "Broad model coverage",
    description:
      "You want the widest catalogue reachable through one integration, measured rather than advertised.",
    categorySlug: "largest-model-catalogues",
    icon: "Layers",
  },
  {
    slug: "large-provider-network",
    title: "Large provider network",
    description:
      "Your concern is how many distinct upstream providers you can reach, not how many model names are listed.",
    categorySlug: "provider-networks",
    icon: "Network",
  },
  {
    slug: "multimodal-ai",
    title: "Multimodal AI",
    description:
      "Your workload includes speech, OCR, images or documents, so a text-only router does not cover it.",
    categorySlug: "multimodal",
    icon: "Shapes",
  },
  {
    slug: "enterprise-governance",
    title: "Enterprise governance",
    description:
      "You need access control, deployment into your own account, and contractual terms your legal team can review.",
    categorySlug: "enterprise",
    icon: "Building2",
  },
  {
    slug: "ai-agents",
    title: "AI agents",
    description:
      "You are building agents and need orchestration or Model Context Protocol support from the gateway itself.",
    categorySlug: "agent-gateways",
    icon: "Bot",
  },
  {
    slug: "self-hosting",
    title: "Self-hosting",
    description:
      "The gateway has to run inside your perimeter, so residency follows your deployment rather than a vendor region list.",
    categorySlug: "open-source",
    icon: "Server",
  },
  {
    slug: "open-source",
    title: "Open source",
    description:
      "You need to read the routing code, not just the documentation that describes it.",
    categorySlug: "open-source",
    icon: "GitBranch",
  },
];
