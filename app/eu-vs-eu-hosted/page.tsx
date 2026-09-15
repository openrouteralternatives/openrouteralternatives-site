import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Cpu, Server } from "lucide-react";
import { EU_RESIDENCY, EU_RESIDENCY_ORDER } from "@/lib/taxonomy";
import { allGateways, sortByName } from "@/lib/gateway";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Container, SectionHeading } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = pageMetadata({
  title: "EU vs EU-Hosted AI Gateways",
  description:
    "Company jurisdiction, gateway location and inference location are three separate attributes. An EU-incorporated AI gateway is not automatically an EU-hosted one.",
  path: "/eu-vs-eu-hosted",
  keywords: [
    "EU data residency AI",
    "EU AI gateway hosting",
    "EU vs EU-hosted",
    "AI gateway GDPR",
  ],
});

const LAYERS = [
  {
    step: "01",
    icon: Building2,
    title: "Company jurisdiction",
    question: "Who are you contracting with?",
    body: "Where the operating legal entity is incorporated. It determines which corporate law and courts apply, and which regulator a complaint goes to. It says nothing about the path your request takes.",
    check: "Look for: a registry entry naming the operating entity, not a marketing page.",
  },
  {
    step: "02",
    icon: Server,
    title: "Gateway location",
    question: "Where does your prompt first land?",
    body: "Where the gateway terminates the request: authenticates the key, applies policy, writes logs, then forwards upstream. This is the first place your prompt exists outside your own systems.",
    check: "Look for: documented regions, and a statement about where request logs are stored.",
  },
  {
    step: "03",
    icon: Cpu,
    title: "Inference location",
    question: "Where does the model actually run?",
    body: "Where the upstream provider serves the model. It is usually outside the gateway's control and often differs per model within a single catalogue, so one gateway can be EU-hosted for some models and not others.",
    check: "Look for: per-model or per-route region information, not a single site-wide claim.",
  },
];

const MISREADINGS = [
  {
    claim: "“We are a European company.”",
    means: "A statement about incorporation.",
    doesNot: "It does not establish where requests are processed or where models run.",
  },
  {
    claim: "“EU-hosted infrastructure.”",
    means: "A statement about the gateway's own servers.",
    doesNot:
      "It does not establish that the upstream models run in the EU, which is the larger share of processing.",
  },
  {
    claim: "“GDPR compliant.”",
    means: "A claim about the legal basis and contractual terms for processing.",
    doesNot:
      "It does not imply data stays in the EU. Transfers outside the EU can be lawful under the right mechanism.",
  },
  {
    claim: "“Zero data retention.”",
    means: "A statement about how long content is kept.",
    doesNot: "It does not say where it was processed while it was being handled.",
  },
];

export default function EuVsEuHostedPage() {
  const gateways = sortByName(allGateways());
  const euIncorporated = gateways.filter((g) => g.euJurisdiction.value === true);
  const euProcessing = gateways.filter((g) =>
    ["eu-by-default", "eu-available", "eu-routes"].includes(g.euResidency.value ?? ""),
  );
  const both = euIncorporated.filter((g) => euProcessing.includes(g));

  return (
    <>
      <PageHeader
        eyebrow="Explainer"
        title="EU company ≠ EU data residency"
        description="Three separate attributes get collapsed into a single claim in almost every vendor comparison. This page separates them, and shows what the dataset currently supports for each."
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "EU vs EU-hosted", path: "/eu-vs-eu-hosted" },
        ]}
        stats={[
          { label: "EU-incorporated in dataset", value: String(euIncorporated.length) },
          { label: "With documented EU processing", value: String(euProcessing.length) },
          { label: "Both", value: String(both.length) },
        ]}
      />

      <Container>
        <div className="flex flex-col gap-14 py-12">
          <section aria-labelledby="layers-heading">
            <SectionHeading
              id="layers-heading"
              title="Three attributes, three sources"
              description="Each answers a different question, and each has to be established from its own kind of evidence."
            />
            <ol className="mt-8 grid gap-4 lg:grid-cols-3 lg:gap-0">
              {LAYERS.map((layer, index) => {
                const Icon = layer.icon;
                return (
                  <li key={layer.step} className="relative flex">
                    <div
                      className={`flex w-full flex-col rounded-card border border-line bg-surface p-6 shadow-card lg:rounded-none ${
                        index === 0 ? "lg:rounded-l-card" : ""
                      } ${index === 2 ? "lg:rounded-r-card" : "lg:border-r-0"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-lg border border-line bg-subtle">
                          <Icon aria-hidden="true" className="size-4 text-ink-muted" />
                        </span>
                        <span className="font-mono text-[11px] text-ink-subtle">{layer.step}</span>
                      </div>
                      <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-ink">
                        {layer.title}
                      </h3>
                      <p className="mt-1 text-[13px] font-medium text-brand-ink">
                        {layer.question}
                      </p>
                      <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-ink-muted">
                        {layer.body}
                      </p>
                      <p className="mt-4 border-t border-line pt-3 text-[12.5px] leading-relaxed text-ink-subtle">
                        {layer.check}
                      </p>
                    </div>

                    {index < 2 ? (
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-3 left-1/2 z-10 hidden size-6 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-surface lg:right-0 lg:top-1/2 lg:bottom-auto lg:left-auto lg:flex lg:translate-x-1/2 lg:-translate-y-1/2"
                      >
                        <ArrowRight className="size-3 text-ink-subtle" />
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </section>

          <section aria-labelledby="claims-heading">
            <SectionHeading
              id="claims-heading"
              title="What common claims actually establish"
              description="None of these is dishonest. Each simply answers a narrower question than it appears to."
            />
            <div className="mt-6 overflow-hidden rounded-card border border-line bg-surface shadow-card">
              <table className="w-full text-left">
                <caption className="sr-only">
                  Common vendor claims, what each establishes and what it does not.
                </caption>
                <thead>
                  <tr className="border-b border-line bg-subtle">
                    <th
                      scope="col"
                      className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-muted"
                    >
                      Claim
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-muted"
                    >
                      What it establishes
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-muted"
                    >
                      What it does not
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MISREADINGS.map((row) => (
                    <tr key={row.claim} className="border-b border-line last:border-b-0">
                      <th
                        scope="row"
                        className="px-5 py-4 align-top text-[13.5px] font-medium text-ink"
                      >
                        {row.claim}
                      </th>
                      <td className="px-5 py-4 align-top text-[13.5px] leading-relaxed text-ink-muted">
                        {row.means}
                      </td>
                      <td className="px-5 py-4 align-top text-[13.5px] leading-relaxed text-ink-muted">
                        {row.doesNot}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="labels-heading">
            <SectionHeading
              id="labels-heading"
              title="The residency labels used on this site"
              description="These describe different arrangements rather than different amounts of the same thing, so they are not ordered best to worst."
            />
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {EU_RESIDENCY_ORDER.map((key) => (
                <li
                  key={key}
                  className="rounded-card border border-line bg-surface p-4 shadow-card"
                >
                  <Badge tone={EU_RESIDENCY[key].tone} size="sm" dot>
                    {EU_RESIDENCY[key].label}
                  </Badge>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-muted">
                    {EU_RESIDENCY[key].description}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="dataset-heading">
            <SectionHeading
              id="dataset-heading"
              title="What the dataset currently supports"
              description="Applying the distinction to the current revision rather than describing it in the abstract."
            />
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-card border border-line bg-surface p-5 shadow-card">
                <p className="tnum text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink">
                  {euIncorporated.length}
                </p>
                <h3 className="mt-2.5 text-[13.5px] font-semibold text-ink">
                  EU-incorporated companies
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                  Recorded as incorporated in an EU member state.{" "}
                  {euIncorporated.length > 0
                    ? euIncorporated.map((g) => g.name).join(", ") + "."
                    : ""}
                </p>
                <Link
                  href="/categories/eu-gateways"
                  className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand-ink hover:underline"
                >
                  See EU gateways
                  <ArrowRight aria-hidden="true" className="size-3" />
                </Link>
              </div>

              <div className="rounded-card border border-line bg-surface p-5 shadow-card">
                <p className="tnum text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink">
                  {euProcessing.length}
                </p>
                <h3 className="mt-2.5 text-[13.5px] font-semibold text-ink">
                  With documented EU processing
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                  Gateways with an EU processing option established from documentation, excluding
                  customer-deployed self-hosted products.
                </p>
                <Link
                  href="/categories/eu-hosted"
                  className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand-ink hover:underline"
                >
                  See EU-hosted gateways
                  <ArrowRight aria-hidden="true" className="size-3" />
                </Link>
              </div>

              <div className="rounded-card border border-line bg-subtle p-5">
                <p className="tnum text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink">
                  {both.length}
                </p>
                <h3 className="mt-2.5 text-[13.5px] font-semibold text-ink">
                  Both EU-incorporated and EU-processing
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                  {both.length === 0
                    ? "None yet. Residency claims for the EU-incorporated vendors in this dataset are recorded as research leads and have not been verified against their own documentation, so the intersection is empty rather than assumed."
                    : "Both attributes are established from separate sources for these entries."}
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="questions-heading">
            <SectionHeading
              id="questions-heading"
              title="Questions worth asking a vendor"
              description="Each maps to a field in this dataset, so an answer can be recorded rather than remembered."
            />
            <ol className="mt-6 flex flex-col gap-3">
              {[
                "Which legal entity will appear on the contract, and in which country is it registered?",
                "In which region does the gateway terminate requests, and where are request and response logs stored?",
                "For the specific models we intend to use, in which region does inference run?",
                "Is EU processing the default, a setting, limited to certain routes, or only available under an enterprise agreement?",
                "Which subprocessors receive prompt content, and where are they located?",
                "Is content retained at all, and if so for how long and for what purpose?",
              ].map((question, index) => (
                <li
                  key={question}
                  className="flex gap-4 rounded-card border border-line bg-surface p-4 shadow-card"
                >
                  <span className="tnum font-mono text-[12px] text-ink-subtle">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[14px] leading-relaxed text-ink">{question}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </Container>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "EU vs EU-hosted", path: "/eu-vs-eu-hosted" },
        ])}
      />
    </>
  );
}
