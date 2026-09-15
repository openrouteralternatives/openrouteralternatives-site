import type { Metadata } from "next";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { SOURCE_HIERARCHY } from "@/data/sources";
import { BASELINE_DATE, DATASET_DATE, OPEN_DATASET_FIELDS } from "@/data/gateways";
import { categories } from "@/data/categories";
import { datasetStats, openFieldCount } from "@/lib/gateway";
import {
  DATA_STATUS,
  EU_RESIDENCY,
  EU_RESIDENCY_ORDER,
  METRIC_STATUS,
  METRIC_STATUS_ORDER,
} from "@/lib/taxonomy";
import { formatDate } from "@/lib/format";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = pageMetadata({
  title: "Methodology",
  description:
    "How this directory counts models and providers, records company size and social data, separates EU incorporation from EU data residency, ranks sources, and handles corrections.",
  path: "/methodology",
  keywords: ["AI gateway methodology", "model count methodology", "EU data residency"],
});

const SECTIONS = [
  { id: "scope", label: "Scope" },
  { id: "model-counting", label: "Model counting" },
  { id: "no-model-count", label: "Why some have no count" },
  { id: "evidence", label: "Evidence statuses" },
  { id: "provider-counting", label: "Provider counting" },
  { id: "employee-data", label: "Employee data" },
  { id: "social-data", label: "Social data" },
  { id: "jurisdiction", label: "Jurisdiction" },
  { id: "gateway-location", label: "Gateway location" },
  { id: "inference-location", label: "Inference location" },
  { id: "eu-residency", label: "EU residency" },
  { id: "certifications", label: "Certifications" },
  { id: "ownership", label: "Ownership" },
  { id: "source-hierarchy", label: "Source hierarchy" },
  { id: "data-status", label: "Data status labels" },
  { id: "update-schedule", label: "Update schedule" },
  { id: "corrections", label: "Corrections" },
  { id: "disclosure", label: "Keeping bias out" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line pt-9">
      <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-ink">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-[14.5px] leading-[1.75] text-ink-muted">
        {children}
      </div>
    </section>
  );
}

function Rule({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-card border-l-2 border-brand bg-brand-subtle px-4 py-3 text-[14px] leading-relaxed text-brand-ink">
      {children}
    </p>
  );
}

export default function MethodologyPage() {
  const stats = datasetStats(categories.length);
  const openFields = openFieldCount();

  return (
    <>
      <PageHeader
        eyebrow="How this works"
        title="Methodology"
        description="This directory publishes no overall score and names no single best OpenRouter alternative. What follows is exactly how each column is established, and what happens when it cannot be."
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Methodology", path: "/methodology" },
        ]}
        stats={[
          { label: "Gateways tracked", value: String(stats.gatewaysTracked) },
          { label: "Directly measured catalogues", value: String(stats.measuredCatalogues) },
          { label: "Fields still open", value: String(openFields) },
          { label: "Dataset revision", value: formatDate(DATASET_DATE) },
        ]}
      />

      <Container width="reading">
        <div className="grid grid-cols-1 gap-12 py-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-14">
          <nav aria-label="Methodology sections" className="lg:sticky lg:top-20 lg:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
              Contents
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 lg:flex-col lg:gap-1.5">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-[13px] text-ink-muted transition-colors hover:text-ink"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex max-w-[68ch] flex-col gap-9">
            <div className="flex flex-col gap-4 text-[14.5px] leading-[1.75] text-ink-muted">
              <Rule>
                No arbitrary overall score is published, and no company is called the best
                OpenRouter alternative without a specific measurable criterion attached to that
                claim.
              </Rule>
              <p>
                Comparison sites tend to fail in one of two ways: they invent a composite rating
                nobody can reproduce, or they fill gaps with plausible numbers. This directory does
                neither. Where a value is not established, the field says so — {openFields} fields
                in the current revision are marked as needing verification rather than estimated.
              </p>
            </div>

            <Section id="scope" title="Scope">
              <p>
                The primary comparison covers managed, multi-provider AI gateways and model
                routers. Secondary categories cover EU AI gateways, EU-hosted gateways, enterprise
                AI gateways, multimodal gateways, agent-focused gateways, self-hosted and
                open-source gateways, hyperscaler AI platforms and AI API aggregators.
              </p>
              <p>
                A product qualifies if it presents access to models from more than one upstream
                provider through a single interface. Single-provider APIs are out of scope, as are
                pure observability tools with no routing surface.
              </p>
            </Section>

            <Section id="model-counting" title="Model counting">
              <p>
                A <strong className="font-medium text-ink">model</strong> means a distinct model
                addressable through a gateway&rsquo;s public API, deduplicated where possible.
                Routes are counted separately as model × provider combinations, because the same
                model offered by four providers is one model and four routes.
              </p>
              <p>
                Where a public model endpoint can be enumerated, the count is measured directly and
                displayed with the date it was taken. Where only a vendor-stated number exists, it
                is labelled vendor-stated and marked with an asterisk, and it is excluded from any
                ranking built on measured counts.
              </p>
              <p>A count excludes:</p>
              <ul className="flex flex-col gap-1.5 pl-4">
                {[
                  "duplicate provider routes for the same base model",
                  "quantisations of a model already counted",
                  "turbo, fast or preview variants that represent the same base model",
                  "deprecated or unavailable models still listed in an endpoint",
                ].map((item) => (
                  <li
                    key={item}
                    className="relative pl-4 before:absolute before:left-0 before:top-[0.68em] before:size-1 before:rounded-full before:bg-line-strong"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                A vendor floor such as &ldquo;500+&rdquo; is stored as a floor and rendered with
                the plus sign. It is never shown as an exact figure, and where a floor and a
                measured count both exist for one gateway, both are displayed rather than the
                larger one being chosen.
              </p>
              <Rule>
                Measured and vendor-stated figures are never mixed in one ranking. A vendor-stated
                total cannot outrank a measured one on this site.
              </Rule>
              <p>
                Counts are snapshots, not attributes. The current catalogue baseline was measured on{" "}
                {formatDate(BASELINE_DATE)} across {stats.measuredCatalogues} gateways. The dataset
                stores measurements as a dated series, so a refresh adds an observation rather than
                overwriting history.
              </p>
            </Section>

            <Section
              id="no-model-count"
              title="Why some gateways don&rsquo;t have a model count"
            >
              <p>
                AI gateways expose their catalogues in completely different ways. Some publish a
                public endpoint that can be enumerated. Some publish an approximate figure on a
                marketing page. Some publish a count of routes or endpoints that looks like a model
                count but is not one. And infrastructure gateways let the customer point them at
                whatever providers they like, so there is no fixed catalogue to count at all.
              </p>
              <Rule>
                A blank model count does not mean weaker model coverage. It usually means the
                product&rsquo;s architecture does not expose a single comparable catalogue.
              </Rule>
              <p>
                So instead of leaving a gap, every figure on this site carries the kind of evidence
                behind it, and every absent figure carries the reason. A gateway marked
                &ldquo;Configured by you&rdquo; is not less capable than one showing a number — it
                is a different shape of product, and pretending otherwise would make the comparison
                worse, not better.
              </p>
            </Section>

            <Section id="evidence" title="Evidence statuses">
              <p>
                Every quantitative value carries one of these. The same vocabulary is used in the
                table, on profiles and in rankings:
              </p>
              <ul className="flex flex-col gap-2.5">
                {METRIC_STATUS_ORDER.map((key) => (
                  <li key={key} className="flex flex-col gap-1.5 sm:flex-row sm:gap-3">
                    <span className="shrink-0 sm:w-44">
                      <Badge tone={METRIC_STATUS[key].tone} size="sm" dot>
                        {METRIC_STATUS[key].label}
                      </Badge>
                    </span>
                    <span className="text-[13.5px] leading-relaxed">
                      {METRIC_STATUS[key].description}
                    </span>
                  </li>
                ))}
              </ul>
              <Rule>
                Rankings only ever compare values of the same kind. A measured count is never
                ranked against a provider&rsquo;s own figure, a route count or a catalogue measured
                at a different scope.
              </Rule>
            </Section>

            <Section id="provider-counting" title="Provider counting">
              <p>
                A <strong className="font-medium text-ink">provider</strong> means a distinct
                upstream AI inference provider or model company reachable through the gateway. The
                same provider is not counted twice for being offered in two regions, and a
                reseller is not counted separately from the provider it resells.
              </p>
              <p>
                Provider counts are measured from a public catalogue wherever one exposes them, and
                otherwise taken from what the provider publishes. Where a provider publishes two
                different figures under two different definitions, both are recorded and the
                discrepancy is stated rather than resolved.
              </p>
              <p>
                Where a gateway routes only to providers the customer configures, no count is
                published for it at all — the honest answer there is that the number is whatever
                the operator sets up.
              </p>
              <Rule>
                A <strong className="font-medium">route</strong> is a model × provider combination,
                not a model. Several vendors publish endpoint counts that look like model counts;
                those figures are recorded in the Routes column, never the Models column.
              </Rule>
            </Section>

            <Section id="employee-data" title="Employee data">
              <p>
                Company size uses LinkedIn company-size bands — 1–10, 11–50, 51–200 and so on.
                Precise headcounts are not reconstructed from third-party databases, because those
                figures are themselves estimates presented as facts.
              </p>
              <p>
                A band describes the company, not the product. A large company can run a small
                gateway, and a ten-person company can run a large one.
              </p>
            </Section>

            <Section id="social-data" title="Social data">
              <p>
                LinkedIn and X figures are point-in-time snapshots. Both are captured on the same
                day so the two numbers stay comparable, and they are displayed rounded by scale
                rather than to the unit.
              </p>
              <Rule>
                Follower count is not a measure of product quality, and it is never used to order
                any list on this site.
              </Rule>
            </Section>

            <Section id="jurisdiction" title="Jurisdiction">
              <p>
                Jurisdiction means the country in which the operating legal entity is incorporated,
                established from a company registry or the vendor&rsquo;s own legal pages. Where the
                entity cannot be established, the jurisdiction is recorded as unresolved rather
                than inferred from a website domain, a team page or an office address.
              </p>
            </Section>

            <Section id="gateway-location" title="Gateway location">
              <p>
                Gateway location is where the gateway receives, authenticates and logs a request
                before forwarding it upstream. It is a property of infrastructure and is recorded
                only from vendor documentation that states it.
              </p>
            </Section>

            <Section id="inference-location" title="Inference location">
              <p>
                Inference location is where the underlying model actually runs. It is usually set
                by the upstream provider rather than the gateway, and it frequently differs between
                models within a single gateway. It is therefore recorded as its own field and never
                derived from gateway location.
              </p>
            </Section>

            <Section id="eu-residency" title="EU residency">
              <Rule>
                EU incorporation is never treated as evidence of EU data residency. The two are
                separate columns, populated from separate sources.
              </Rule>
              <p>
                Residency is recorded with one of the following labels. Each describes a different
                arrangement, so the set is deliberately not a scale:
              </p>
              <ul className="flex flex-col gap-2.5">
                {EU_RESIDENCY_ORDER.map((key) => (
                  <li key={key} className="flex flex-col gap-1.5 sm:flex-row sm:gap-3">
                    <span className="shrink-0 sm:w-44">
                      <Badge tone={EU_RESIDENCY[key].tone} size="sm" dot>
                        {EU_RESIDENCY[key].label}
                      </Badge>
                    </span>
                    <span className="text-[13.5px] leading-relaxed">
                      {EU_RESIDENCY[key].description}
                    </span>
                  </li>
                ))}
              </ul>
              <p>
                <Link href="/eu-vs-eu-hosted" className="text-brand-ink hover:underline">
                  EU vs EU-hosted
                </Link>{" "}
                works through why these distinctions matter in practice.
              </p>
            </Section>

            <Section id="certifications" title="Certifications">
              <p>
                Certifications are recorded from the vendor&rsquo;s own compliance pages and marked
                vendor-stated unless a certificate or audit report has been checked. Scope matters
                more than the acronym: an ISO/IEC 27001 certificate covers a defined scope, which
                may or may not include the gateway you are evaluating.
              </p>
              <p>
                No certification is recorded for a vendor in the current revision except the
                hyperscaler platforms, whose compliance programmes are published in detail.
              </p>
            </Section>

            <Section id="ownership" title="Ownership and acquisitions">
              <p>
                Ownership, parent company and acquisition status are recorded where a filing or a
                vendor announcement establishes them. Ownership is its own column because an
                acquisition can change a product&rsquo;s roadmap, pricing and data handling without
                changing anything visible on its website.
              </p>
              <p>
                Two product names belonging to one company are recorded as a single entry, so the
                dataset cannot double-count a vendor — Respan and Keywords AI are the same company
                and appear once, under the current name.
              </p>
              <p>
                Where a product is still available but no longer actively developed, that is
                recorded as a product status rather than left for a buyer to discover later.
              </p>
            </Section>

            <Section id="source-hierarchy" title="Source hierarchy">
              <p>
                Where sources disagree, the higher-ranked source wins. Competitor content is not
                evidence in either direction.
              </p>
              <ol className="flex flex-col gap-2.5">
                {SOURCE_HIERARCHY.map((source) => (
                  <li
                    key={source.label}
                    className="flex gap-3 rounded-card border border-line bg-surface p-4"
                  >
                    <span
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                        source.accepted ? "bg-ok-subtle text-ok" : "bg-muted text-ink-subtle"
                      }`}
                    >
                      {source.accepted ? (
                        <Check aria-hidden="true" className="size-3" />
                      ) : (
                        <X aria-hidden="true" className="size-3" />
                      )}
                    </span>
                    <span>
                      <span className="block text-[14px] font-medium text-ink">
                        {source.label}
                      </span>
                      <span className="mt-0.5 block text-[13.5px] leading-relaxed">
                        {source.description}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section id="data-status" title="Data status labels">
              <p>
                Every value in the dataset carries one of six statuses. Hovering or focusing a
                status chip anywhere on the site shows the same definition:
              </p>
              <ul className="flex flex-col gap-2.5">
                {(Object.keys(DATA_STATUS) as (keyof typeof DATA_STATUS)[]).map((key) => (
                  <li key={key} className="flex flex-col gap-1.5 sm:flex-row sm:gap-3">
                    <span className="shrink-0 sm:w-44">
                      <Badge tone={DATA_STATUS[key].tone} size="sm" dot>
                        {DATA_STATUS[key].label}
                      </Badge>
                    </span>
                    <span className="text-[13.5px] leading-relaxed">
                      {DATA_STATUS[key].description}
                    </span>
                  </li>
                ))}
              </ul>
              <p>
                These fields are open across the whole dataset in this revision, and are shown as
                needing verification rather than estimated:
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {OPEN_DATASET_FIELDS.map((field) => (
                  <li
                    key={field}
                    className="rounded-md border border-line bg-subtle px-2 py-1 text-[12.5px] text-ink-muted"
                  >
                    {field}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="update-schedule" title="Update schedule">
              <p>
                Model catalogues are re-measured on a fixed cadence and each refresh is published as
                a new dated observation. Company and social data are refreshed together so that a
                snapshot stays internally consistent.
              </p>
              <p>
                The current catalogue baseline is {formatDate(BASELINE_DATE)}. Every dated change is
                listed in the{" "}
                <Link href="/changelog" className="text-brand-ink hover:underline">
                  changelog
                </Link>
                .
              </p>
            </Section>

            <Section id="corrections" title="Corrections">
              <p>
                Vendors and readers can request a correction. A correction is dated and logged in
                the changelog with the previous value, the new value and the source for the change.
              </p>
              <Rule>
                Major historical figures are never silently overwritten. A superseded measurement
                stays visible next to the one that replaced it.
              </Rule>
              <p>
                To request one, send the gateway name, the field, the corrected value and a primary
                source — a public endpoint, a registry entry, a legal page or product documentation.
                A competitor&rsquo;s comparison article is never accepted as authoritative evidence
                for a rival&rsquo;s metrics, in either direction.
              </p>
            </Section>

            <Section id="disclosure" title="Keeping bias out">
              <Rule>
                Every vendor in this index is evaluated with the same published methodology, and
                no entry is given a position it has not earned with a comparable figure.
              </Rule>
              <p>
                The protections are structural rather than promised. The ranking criterion for
                every category is written on that category&rsquo;s own page. The default table
                order is alphabetical rather than any ranking. Measured counts and provider-stated
                figures are never mixed inside one ranking. And no gateway is excluded from a list
                it qualifies for.
              </p>
              <p>
                Where the evidence favours one product, that product leads. On the current dataset
                that means Requesty leads the measured catalogue ranking, OpenRouter leads provider
                network breadth, Azure AI Foundry leads modality coverage, nexos.ai leads company
                scale among EU-incorporated vendors, TrueFoundry leads social reach, and Cortecs
                has the strongest EU-only inference posture. If a figure here does not hold up, the
                corrections process above applies to it like any other.
              </p>
            </Section>
          </div>
        </div>
      </Container>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Methodology", path: "/methodology" },
        ])}
      />
    </>
  );
}
