export const SITE = {
  name: "OpenRouter Alternatives",
  domain: "openrouteralternatives.eu",
  url: "https://openrouteralternatives.eu",
  tagline: "Compare AI gateways, model routers and multi-provider AI APIs.",
  description:
    "A source-driven comparison directory of OpenRouter alternatives: AI gateways, model routers and multi-provider AI APIs compared by model coverage, provider diversity, EU jurisdiction, data residency, infrastructure, deployment and company characteristics.",
  locale: "en",
} as const;

/** Public repository. Reused wherever the site points at GitHub. */
export const REPOSITORY_URL = "https://github.com/openrouteralternatives/openrouteralternatives-site";

/**
 * Primary navigation, kept to three entries.
 *
 * The homepage is the comparison, so "Compare" is the homepage. Categories are
 * reached through the cards on the homepage rather than the navbar.
 */
export const NAV_LINKS = [
  { href: "/", label: "Compare" },
  { href: "/gateways", label: "Gateways" },
  { href: "/blog", label: "Blog" },
] as const;

export const FOOTER_SECTIONS = [
  {
    title: "Compare",
    links: [
      { href: "/#compare", label: "Comparison table" },
      { href: "/compare", label: "Full-width table" },
      { href: "/gateways", label: "Gateway profiles" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Categories",
    links: [
      { href: "/categories/largest-model-catalogues", label: "Largest model catalogues" },
      { href: "/categories/eu-gateways", label: "EU AI gateways" },
      { href: "/categories/eu-hosted", label: "EU-hosted gateways" },
      { href: "/categories/open-source", label: "Open-source gateways" },
      { href: "/categories", label: "All categories" },
    ],
  },
  {
    title: "How this works",
    links: [
      { href: "/why", label: "Why this project exists" },
      { href: "/#methodology", label: "Methodology" },
      { href: "/#eu-explainer", label: "EU company vs EU-hosted" },
      { href: "/#contribute", label: "How to contribute" },
      { href: REPOSITORY_URL, label: "Source on GitHub", external: true },
    ],
  },
] as const;

/** The four claims in the trust strip, each linking to where they are explained. */
export const TRUST_POINTS = [
  {
    title: "Direct model measurements",
    body: "Catalogue sizes are counted from public model endpoints where one exists, not copied from marketing pages.",
    href: "/#model-counting",
    icon: "Gauge",
  },
  {
    title: "Source-backed company data",
    body: "Legal entity, jurisdiction and company scale come from registries, legal pages and LinkedIn size bands.",
    href: "/#source-hierarchy",
    icon: "FileSearch",
  },
  {
    title: "Point-in-time snapshots",
    body: "Every number carries the date it was observed, because catalogues and follower counts move.",
    href: "/#snapshots",
    icon: "CalendarClock",
  },
  {
    title: "Transparent methodology",
    body: "What counts as a model, a provider and EU residency is written down and applied to every entry.",
    href: "/#methodology",
    icon: "Scale",
  },
] as const;
