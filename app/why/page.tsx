import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Scale } from "lucide-react";
import {
  EXPOSURE_KIND,
  GATEWAY_REASONS,
  PRACTICAL_CONSEQUENCE,
  TABLE_MAPPING,
  US_LEGAL_EXPOSURES,
  WHY,
} from "@/data/why";
import { JsonLd, breadcrumbJsonLd, canonical, pageMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Container, SectionHeading } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = pageMetadata({
  title: WHY.pageTitle,
  description: WHY.pageDescription,
  path: "/why",
  keywords: [
    "why AI gateway",
    "CLOUD Act AI provider",
    "EU AI gateway jurisdiction",
    "FISA 702 AI",
    "sovereign AI gateway Europe",
  ],
});

const BREADCRUMB = [
  { name: "Home", path: "/" },
  { name: "Why this project exists", path: "/why" },
];

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 flex flex-col gap-4 text-[15.5px] leading-[1.75] text-ink-muted">
      {children}
    </div>
  );
}

/**
 * The reasoning behind the project: why a gateway is needed, why choosing one
 * is a jurisdiction decision rather than a hosting decision, the US legal
 * authorities that make it so, and how that reasoning became table columns.
 * Content lives in data/why.ts.
 */
export default function WhyPage() {
  return (
    <>
      <PageHeader
        eyebrow={WHY.eyebrow}
        title={WHY.pageTitle}
        description={WHY.pageDescription}
        breadcrumb={BREADCRUMB}
      />

      <Container width="reading">
        <div className="flex flex-col gap-14 py-12">
          <section aria-labelledby="gateway-heading">
            <SectionHeading
              id="gateway-heading"
              eyebrow="01"
              title="Why a gateway at all"
              description="Using one model provider directly worked while there was one obvious model. That stopped being true."
            />
            <ul className="mt-6 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3">
              {GATEWAY_REASONS.map((reason) => (
                <li key={reason.title} className="bg-surface p-5">
                  <h3 className="text-[14px] font-semibold text-ink">{reason.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">{reason.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="safety-heading">
            <SectionHeading
              id="safety-heading"
              eyebrow="02"
              title="Why the choice is a security decision"
              description="The gateway is the single point where all of an organisation's AI traffic converges."
            />
            <Prose>
              <p>
                Prompts, uploaded documents, retrieved context, model outputs, API keys and request
                logs all pass through the gateway. Whoever operates it has technical access to that
                flow, and the law that applies to the operator applies to that access. Where the
                servers stand is one factor. Who controls the company, and which courts and agencies
                can compel it, are the others.
              </p>
              <p>
                For most organisations this makes the gateway more sensitive than any single model
                provider behind it, because a model provider sees one slice of traffic while the
                gateway sees all of it.
              </p>
            </Prose>
          </section>

          <section aria-labelledby="case-heading">
            <SectionHeading
              id="case-heading"
              eyebrow="03"
              title="Our own case"
              description="We did not set out to build a directory. We set out to make a purchasing decision."
            />
            <Prose>
              <p>
                In 2026 we had to select an AI gateway for a large company headquartered in the
                European Union. Its requirement was specific: the operator must not be an American
                provider subject to the CLOUD Act, and hosting in an EU region on its own would not
                satisfy that requirement, because the law follows the company rather than the
                server.
              </p>
              <p>
                The comparisons we found did not answer the question. They treated &ldquo;EU
                hosted&rdquo; and &ldquo;EU company&rdquo; as the same thing, rarely named the legal
                entity behind a product, and ordered vendors by a score whose ingredients were not
                stated. So we did the research ourselves: registry filings, legal pages, public model
                endpoints and product documentation, one rule applied to every vendor. This site is
                that research, published so that others facing the same choice can reuse it and
                correct it.
              </p>
            </Prose>
          </section>

          <section aria-labelledby="law-heading">
            <SectionHeading
              id="law-heading"
              eyebrow="04"
              title="What US law can reach, wherever the servers are"
              description="Each authority below can apply to an American AI provider, or to the American infrastructure a provider relies on, independently of where a European customer's data is stored. Each entry links to the primary legal text."
            />
            <ol className="mt-6 flex flex-col gap-4">
              {US_LEGAL_EXPOSURES.map((exposure, index) => (
                <li
                  key={exposure.id}
                  id={exposure.id}
                  className="scroll-mt-20 rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="tnum mt-0.5 font-mono text-[11.5px] text-ink-subtle">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-ink">
                          {exposure.name}
                        </h3>
                        <p className="mt-1 font-mono text-[12px] text-ink-subtle">{exposure.citation}</p>
                      </div>
                    </div>
                    <Badge tone="outline" size="sm">
                      {EXPOSURE_KIND[exposure.kind].label}
                    </Badge>
                  </div>

                  <dl className="mt-4 grid gap-4 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-x-6 sm:gap-y-3">
                    <dt className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-ink-subtle sm:pt-0.5">
                      What it can require
                    </dt>
                    <dd className="text-[14px] leading-relaxed text-ink-muted">{exposure.requires}</dd>
                    <dt className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-ink-subtle sm:pt-0.5">
                      Why it matters
                    </dt>
                    <dd className="text-[14px] leading-relaxed text-ink">{exposure.consequence}</dd>
                  </dl>

                  <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-line pt-3">
                    {exposure.links.map((link) => (
                      <li key={link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-brand-ink hover:underline"
                        >
                          {link.label}
                          <ArrowUpRight aria-hidden="true" className="size-3" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-card border-l-2 border-brand bg-brand-subtle px-5 py-4">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-brand-ink">
                Practical consequence for a strategic European company
              </p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-brand-ink">{PRACTICAL_CONSEQUENCE}</p>
            </div>

            <div className="mt-4 flex gap-3 rounded-card border border-line bg-subtle p-4">
              <Scale aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-subtle" />
              <p className="text-[13px] leading-relaxed text-ink-muted">
                This page describes what United States law can require of a provider that is subject
                to it. It is general information, not legal advice, and it is not an allegation that
                any vendor in the dataset has disclosed customer data. Whether a given authority
                applies to a specific product depends on facts this dataset does not record, such as
                contractual terms and the full corporate structure behind it. The table records
                jurisdiction and ownership as facts, not as verdicts.
              </p>
            </div>
          </section>

          <section aria-labelledby="table-heading">
            <SectionHeading
              id="table-heading"
              eyebrow="05"
              title="How this shaped the table"
              description="Each question the assessment forced on us became a separately sourced column. None is derived from another, and EU incorporation is never taken as evidence of EU processing."
              action={
                <Link
                  href="/#compare"
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-ink hover:underline"
                >
                  Open the comparison
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              }
            />
            <ul className="mt-6 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
              {TABLE_MAPPING.map((entry) => (
                <li key={entry.column} className="flex flex-col bg-surface p-5">
                  <h3 className="text-[14px] font-semibold text-ink">{entry.column}</h3>
                  <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-muted">
                    {entry.question}
                  </p>
                  <Link
                    href={entry.href}
                    className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-brand-ink hover:underline"
                  >
                    Where it is recorded
                    <ArrowRight aria-hidden="true" className="size-3" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-subtle">
              The three residency attributes, and why a single &ldquo;EU&rdquo; label is not enough,
              are explained in{" "}
              <Link href="/#eu-explainer" className="text-brand-ink hover:underline">
                EU company ≠ EU data residency
              </Link>
              . The categories{" "}
              <Link href="/categories/eu-gateways" className="text-brand-ink hover:underline">
                EU AI gateways
              </Link>{" "}
              and{" "}
              <Link href="/categories/eu-hosted" className="text-brand-ink hover:underline">
                EU-hosted gateways
              </Link>{" "}
              list the two populations separately for the same reason.
            </p>
          </section>
        </div>
      </Container>

      <JsonLd
        data={[
          breadcrumbJsonLd(BREADCRUMB),
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: WHY.pageTitle,
            description: WHY.pageDescription,
            url: canonical("/why"),
            publisher: { "@id": `${canonical("/")}#organization` },
          },
        ]}
      />
    </>
  );
}
