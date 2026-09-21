/**
 * Why this project exists.
 *
 * The homepage intro and the /why page read from this file so the two never
 * drift apart. The legal material describes what United States law can
 * require of a provider subject to it. It is general information about the
 * law, not legal advice, and it is not an allegation about any vendor in the
 * dataset. Where the page cites a statute it links to the primary text.
 */

export const WHY = {
  eyebrow: "Why this project exists",
  /** Homepage heading. Short enough to sit beside two paragraphs. */
  headline:
    "We had to choose a gateway for a European company. This is the comparison we wished existed.",
  /** Two short paragraphs for the homepage. The page elaborates on both. */
  summary: [
    "An AI gateway is now the practical way to use several model providers behind one API. Models are replaced within months, prices and rate limits move, and a single integration point lets a team switch, fall back and control spend without rewriting client code. It is also the one place every prompt, document and log passes through, so which company operates it, and under which law, matters more than where its servers stand.",
    "We went through this choice for a large company in the European Union that could not route confidential data through a provider subject to the US CLOUD Act. Existing comparisons mixed EU hosting with EU incorporation and rarely named the legal entity behind a product, so we did the research ourselves and are publishing it here.",
  ],
  pageTitle: "Why we built this comparison",
  pageDescription:
    "A gateway concentrates every prompt an organisation sends to an AI model. We had to select one for a large European company under the constraint that the operator must not be subject to US law, and this page sets out the reasoning so the table can be read with the same questions in mind.",
} as const;

/** Why a gateway at all: the three reasons that made the choice unavoidable. */
export const GATEWAY_REASONS = [
  {
    title: "One integration, many providers",
    body: "The leading model for a task changes several times a year. A gateway lets a team swap a model or a provider behind one API without touching the applications that call it.",
  },
  {
    title: "Resilience and cost control",
    body: "Fallback between providers, rate-limit spreading, caching and spend limits are applied once, at the gateway, rather than re-implemented in every service.",
  },
  {
    title: "Governance in one place",
    body: "Keys, access control, logging, retention and observability sit at a single point. That is also why the gateway is the most sensitive component in the chain.",
  },
] as const;

export type ExposureKind = "disclosure" | "intelligence" | "export-control" | "sanctions";

export const EXPOSURE_KIND: Record<ExposureKind, { label: string }> = {
  disclosure: { label: "Compelled disclosure" },
  intelligence: { label: "Intelligence collection" },
  "export-control": { label: "Export control" },
  sanctions: { label: "Sanctions" },
};

export interface LegalExposure {
  id: string;
  name: string;
  /** Statutory or regulatory reference, printed verbatim. */
  citation: string;
  kind: ExposureKind;
  /** What the authority can require of a provider subject to it. */
  requires: string;
  /** Why that matters for a European customer of such a provider. */
  consequence: string;
  /** Primary legal texts, never commentary. */
  links: { label: string; url: string }[];
}

/**
 * United States legal authorities that can reach an American AI provider, or
 * the American infrastructure a provider relies on, regardless of where the
 * customer's data is physically stored.
 */
export const US_LEGAL_EXPOSURES: LegalExposure[] = [
  {
    id: "cloud-act",
    name: "CLOUD Act and Stored Communications Act",
    citation: "18 U.S.C. § 2713; 18 U.S.C. §§ 2701–2713",
    kind: "disclosure",
    requires:
      "An American AI provider may be legally required to disclose to US authorities data in its possession, custody or control, which can include prompts, uploaded documents, account information and logs, even where that data is hosted in Europe, provided the applicable US legal requirements are met.",
    consequence:
      "Storing data in a European region does not take it outside the reach of a US order served on the provider.",
    links: [
      { label: "18 U.S.C. § 2713", url: "https://www.law.cornell.edu/uscode/text/18/2713" },
      {
        label: "Stored Communications Act, chapter 121",
        url: "https://www.law.cornell.edu/uscode/text/18/part-I/chapter-121",
      },
    ],
  },
  {
    id: "fisa-702",
    name: "FISA Section 702",
    citation: "50 U.S.C. § 1881a",
    kind: "intelligence",
    requires:
      "An American AI provider, or the US cloud and communications infrastructure it relies on, may be required to assist US intelligence authorities in collecting communications concerning a non-US person located outside the United States.",
    consequence:
      "Sensitive European information processed through a qualifying US service carries a confidentiality risk that exists outside any criminal-law process.",
    links: [{ label: "50 U.S.C. § 1881a", url: "https://www.law.cornell.edu/uscode/text/50/1881a" }],
  },
  {
    id: "national-security-letters",
    name: "National Security Letters",
    citation: "18 U.S.C. § 2709",
    kind: "disclosure",
    requires:
      "A qualifying American provider may be required by the FBI to disclose certain subscriber and transactional information relating to a customer in a national-security investigation, and may in specified circumstances be prohibited from informing the customer that the request was made.",
    consequence:
      "A European customer may never learn that information about its account was requested.",
    links: [{ label: "18 U.S.C. § 2709", url: "https://www.law.cornell.edu/uscode/text/18/2709" }],
  },
  {
    id: "ear",
    name: "Export Administration Regulations",
    citation: "15 C.F.R. Parts 730–774",
    kind: "export-control",
    requires:
      "An American AI provider may be legally prevented from providing certain advanced AI technologies, model weights, computing capacity or training services to particular countries, entities or end users.",
    consequence:
      "A European company can remain dependent on future US export-control decisions for access to strategically important AI technology.",
    links: [
      {
        label: "15 C.F.R. Subchapter C (EAR)",
        url: "https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C",
      },
    ],
  },
  {
    id: "foreign-direct-product",
    name: "Foreign Direct Product rules under the EAR",
    citation: "15 C.F.R. § 734.9",
    kind: "export-control",
    requires:
      "US export controls can in certain circumstances extend to advanced AI technology produced outside the United States when it derives from controlled US technology, software or tooling.",
    consequence:
      "A European company may remain exposed to US restrictions even where part of its AI infrastructure or supply chain has been localised in Europe.",
    links: [{ label: "15 C.F.R. § 734.9", url: "https://www.ecfr.gov/current/title-15/section-734.9" }],
  },
  {
    id: "ieepa-ofac",
    name: "IEEPA and OFAC sanctions",
    citation: "50 U.S.C. §§ 1701–1710; 31 C.F.R. Chapter V",
    kind: "sanctions",
    requires:
      "An American AI provider may be legally required to restrict, suspend or terminate services involving a sanctioned country, entity or individual.",
    consequence:
      "Access to the service can depend on US foreign-policy and sanctions decisions rather than solely on the European customer's contract with the provider.",
    links: [
      { label: "50 U.S.C. chapter 35 (IEEPA)", url: "https://www.law.cornell.edu/uscode/text/50/chapter-35" },
      {
        label: "OFAC sanctions programs",
        url: "https://ofac.treasury.gov/sanctions-programs-and-country-information",
      },
    ],
  },
  {
    id: "eo-12333",
    name: "Executive Order 12333 and US foreign-intelligence authorities",
    citation: "E.O. 12333 (1981), as amended",
    kind: "intelligence",
    requires:
      "Data processed through global infrastructure controlled by an American provider may be exposed to US foreign-intelligence collection conducted outside the ordinary criminal-law process.",
    consequence:
      "Relevant wherever highly confidential European strategic information is transmitted internationally, including between a gateway and an upstream model provider.",
    links: [
      {
        label: "Executive Order 12333",
        url: "https://www.archives.gov/federal-register/codification/executive-order/12333.html",
      },
    ],
  },
];

export const PRACTICAL_CONSEQUENCE =
  "Hosting data in France or elsewhere in the EU does not, by itself, eliminate exposure to US law where the AI provider or the infrastructure it relies on remains subject to US jurisdiction. The assessment therefore has to consider corporate control and legal jurisdiction, not only the physical location of the servers.";

/**
 * How the reasoning above became columns. Each entry names the question a
 * buyer has to answer and the place on the site where the answer is recorded.
 */
export const TABLE_MAPPING = [
  {
    column: "Jurisdiction and legal entity",
    question: "Which company appears on the contract, and where is it incorporated?",
    href: "/#eu-residency",
  },
  {
    column: "Ownership and parent company",
    question:
      "Is the operator controlled by a company in another jurisdiction? An acquisition changes the answer without changing the website.",
    href: "/#company-data",
  },
  {
    column: "Gateway location",
    question: "Where does a request land first, and where are request and response logs stored?",
    href: "/#eu-explainer",
  },
  {
    column: "EU residency and inference location",
    question:
      "For the models actually in use, where does inference run, and is EU processing the default, a setting or an enterprise-only option?",
    href: "/categories/eu-hosted",
  },
  {
    column: "Zero data retention",
    question: "Is content kept at all once the response has been returned, and for how long?",
    href: "/#eu-residency",
  },
  {
    column: "Deployment",
    question:
      "Can the gateway run in the customer's own cloud or on-premise, so that no third party sits in the request path?",
    href: "/categories/open-source",
  },
] as const;
