export const SITE = {
  name: "OpenRouter Alternatives",
  domain: "openrouteralternatives.eu",
  url: "https://openrouteralternatives.eu",
  tagline: "Compare AI gateways, model routers and multi-provider AI APIs.",
  description:
    "A source-driven comparison directory of OpenRouter alternatives: AI gateways, model routers and multi-provider AI APIs compared by model coverage, provider diversity, EU jurisdiction, data residency, infrastructure, deployment and company characteristics.",
  locale: "en",
} as const;

export const NAV_LINKS = [
  { href: "/compare", label: "Compare" },
  { href: "/gateways", label: "Gateways" },
  { href: "/categories", label: "Categories" },
  { href: "/methodology", label: "Methodology" },
  { href: "/eu-vs-eu-hosted", label: "EU vs EU-hosted" },
  { href: "/changelog", label: "Changelog" },
] as const;

export const FOOTER_SECTIONS = [
  {
    title: "Compare",
    links: [
      { href: "/compare", label: "All gateways" },
      { href: "/gateways", label: "Gateway profiles" },
      { href: "/categories", label: "Categories" },
    ],
  },
  {
    title: "Categories",
    links: [
      { href: "/categories/largest-model-catalogues", label: "Largest model catalogues" },
      { href: "/categories/eu-gateways", label: "EU AI gateways" },
      { href: "/categories/eu-hosted", label: "EU-hosted gateways" },
      { href: "/categories/open-source", label: "Open-source gateways" },
    ],
  },
  {
    title: "How this works",
    links: [
      { href: "/methodology", label: "Methodology" },
      { href: "/eu-vs-eu-hosted", label: "EU vs EU-hosted" },
      { href: "/changelog", label: "Changelog" },
      { href: "/methodology#corrections", label: "Request a correction" },
    ],
  },
] as const;

/** The four claims in the trust strip, each linking to where they are explained. */
export const TRUST_POINTS = [
  {
    title: "Direct model measurements",
    body: "Catalogue sizes are counted from public model endpoints where one exists, not copied from marketing pages.",
    href: "/methodology#model-counting",
    icon: "Gauge",
  },
  {
    title: "Source-backed company data",
    body: "Legal entity, jurisdiction and company scale come from registries, legal pages and LinkedIn size bands.",
    href: "/methodology#source-hierarchy",
    icon: "FileSearch",
  },
  {
    title: "Point-in-time snapshots",
    body: "Every number carries the date it was observed, because catalogues and follower counts move.",
    href: "/methodology#update-schedule",
    icon: "CalendarClock",
  },
  {
    title: "Transparent methodology",
    body: "What counts as a model, a provider and EU residency is written down and applied to every entry.",
    href: "/methodology",
    icon: "Scale",
  },
] as const;
