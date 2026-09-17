import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import type { Capability, Field, Gateway } from "@/types";
import {
  CAPABILITY,
  DEPLOYMENT,
  EU_RESIDENCY,
  GATEWAY_TYPE,
  JURISDICTION,
  MODALITY,
  OPENAI_COMPATIBILITY,
  OWNERSHIP_STATUS,
  PRICING_TRANSPARENCY,
  PRODUCT_STATUS,
} from "@/lib/taxonomy";
import { resolveSources, routesOrEndpoints, secondaryCoverage } from "@/lib/gateway";
import { allObservations, metricDisplay } from "@/lib/metric";
import { categoriesFor } from "@/lib/ranking";
import { MetricBlock, MetricStatusChip } from "@/components/ui/metric-value";
import { getSelfHostedDetail } from "@/data/self-hosted";
import {
  flagEmoji,
  formatDate,
  formatFollowers,
  formatQualifiedCount,
} from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { NoValue, ProvenanceMark, StatusChip } from "@/components/ui/data-status";
import { SourceChips } from "@/components/ui/source-chips";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GatewayLogo } from "@/components/gateways/gateway-logo";
import { OpenAiCompatibilityCell } from "@/components/comparison/cells";
import { Container } from "@/components/layout/container";

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line pt-10">
      <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-ink">{title}</h2>
      {description ? (
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
          {description}
        </p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="shrink-0 text-[12.5px] text-ink-subtle sm:w-52">{label}</dt>
      <dd className="min-w-0 text-[13.5px] leading-relaxed text-ink">{children}</dd>
    </div>
  );
}

function TextField({ field }: { field: Field<string> }) {
  if (!field.value) return <NoValue variant="text" field={field} />;
  return (
    <span>
      {field.value}
      <ProvenanceMark field={field} />
    </span>
  );
}

function NumberField({ field }: { field: Field<number> }) {
  if (field.value === null) return <NoValue variant="text" field={field} />;
  return (
    <span className="tnum">
      {formatQualifiedCount(field.value, field.qualifier)}
      <ProvenanceMark field={field} />
    </span>
  );
}

/** Renders an enum field whose labels live in the taxonomy. */
function TermField<T extends string>({
  field,
  terms,
}: {
  field: Field<T>;
  terms: Record<
    string,
    { label: string; tone: "neutral" | "ok" | "info" | "warn" | "caution" | "brand" }
  >;
}) {
  if (!field.value || field.value === "unresolved") {
    return <NoValue variant="text" field={field} />;
  }
  const term = terms[field.value];
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Badge tone={term.tone} size="sm">
        {term.label}
      </Badge>
      {field.note ? <span className="text-[12.5px] text-ink-muted">{field.note}</span> : null}
    </span>
  );
}

function ListField({ field }: { field: Field<string[]> }) {
  if (!field.value || field.value.length === 0) return <NoValue variant="text" field={field} />;
  return (
    <span>
      {field.value.join(", ")}
      <ProvenanceMark field={field} />
    </span>
  );
}

function CapabilityField({ field }: { field: Field<Capability> }) {
  if (!field.value || field.value === "unknown") return <NoValue variant="text" field={field} />;
  const term = CAPABILITY[field.value];
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Badge tone={term.tone} size="sm">
        {term.label}
      </Badge>
      {field.note ? <span className="text-[12.5px] text-ink-muted">{field.note}</span> : null}
    </span>
  );
}

function Bullets({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) {
    return <p className="text-[13.5px] leading-relaxed text-ink-subtle">{empty}</p>;
  }
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li
          key={item}
          className="relative pl-4 text-[14px] leading-relaxed text-ink-muted before:absolute before:left-0 before:top-[0.62em] before:size-1.5 before:rounded-full before:bg-line-strong"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function GatewayProfile({ gateway }: { gateway: Gateway }) {
  const residency = EU_RESIDENCY[gateway.euResidency.value ?? "needs-verification"];
  const jurisdiction = JURISDICTION[gateway.jurisdictionBucket];
  const type = GATEWAY_TYPE[gateway.type];
  const selfHosted = getSelfHostedDetail(gateway.id);
  const coverage = routesOrEndpoints(gateway);
  const secondary = secondaryCoverage(gateway);
  const memberOf = categoriesFor(gateway);

  return (
    <TooltipProvider delayDuration={120}>
      <article>
        {/* Hero */}
        <header className="border-b border-line bg-subtle">
          <Container>
            <nav aria-label="Breadcrumb" className="pt-6">
              <ol className="flex flex-wrap items-center gap-1 text-[12.5px] text-ink-subtle">
                <li>
                  <Link href="/" className="hover:text-ink">
                    Home
                  </Link>
                </li>
                <ChevronRight aria-hidden="true" className="size-3" />
                <li>
                  <Link href="/gateways" className="hover:text-ink">
                    Gateways
                  </Link>
                </li>
                <ChevronRight aria-hidden="true" className="size-3" />
                <li aria-current="page" className="text-ink-muted">
                  {gateway.name}
                </li>
              </ol>
            </nav>

            <div className="flex flex-col gap-6 py-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-4">
                <GatewayLogo gateway={gateway} size="lg" />
                <div className="min-w-0">
                  <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-ink sm:text-[34px]">
                    {gateway.name}
                  </h1>
                  {gateway.formerName ? (
                    <p className="mt-1 text-[13px] text-ink-subtle">
                      Formerly {gateway.formerName} — recorded once, so the rename cannot split
                      this company into two entries.
                    </p>
                  ) : null}
                  <p className="mt-2 max-w-2xl text-pretty text-[15px] leading-relaxed text-ink-muted">
                    {gateway.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge tone={type.tone} size="md">
                      {type.label}
                    </Badge>
                    <Badge tone={jurisdiction.tone} size="md" dot>
                      {gateway.countryCode.value ? (
                        <span aria-hidden="true">{flagEmoji(gateway.countryCode.value)}</span>
                      ) : null}
                      {gateway.country.value ?? "Jurisdiction unresolved"}
                    </Badge>
                    <Badge tone={residency.tone} size="md" dot>
                      <span className="opacity-70">EU residency</span>
                      <span aria-hidden="true" className="opacity-40">
                        ·
                      </span>
                      {residency.label}
                    </Badge>
                    {gateway.productStatus.value &&
                    gateway.productStatus.value !== "active" &&
                    gateway.productStatus.value !== "unresolved" ? (
                      <Badge
                        tone={PRODUCT_STATUS[gateway.productStatus.value].tone}
                        size="md"
                        dot
                      >
                        {PRODUCT_STATUS[gateway.productStatus.value].label}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>

              {gateway.website ? (
                <a
                  href={gateway.website}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex h-9 shrink-0 items-center gap-2 self-start rounded-lg border border-line bg-surface px-4 text-[13.5px] font-medium text-ink transition-colors hover:border-line-strong"
                >
                  Visit website
                  <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </a>
              ) : (
                <span className="shrink-0 self-start text-[12.5px] text-ink-subtle">
                  Official URL not confirmed
                </span>
              )}
            </div>
          </Container>
        </header>

        {/* Quick stats */}
        <Container>
          <dl className="grid gap-px overflow-hidden rounded-card border border-line bg-line shadow-card sm:grid-cols-2 lg:grid-cols-4 mt-8">
            <div className="bg-surface p-5">
              <dd>
                <MetricBlock metric={gateway.models} label="Models" />
              </dd>
              <dt className="sr-only">Models</dt>
            </div>

            <div className="bg-surface p-5">
              <dt className="sr-only">Providers</dt>
              <dd>
                <MetricBlock metric={gateway.providers} label="Providers" />
              </dd>
            </div>

            <div className="bg-surface p-5">
              <dt className="text-[11px] font-medium uppercase tracking-[0.07em] text-ink-subtle">
                Employees
              </dt>
              <dd className="mt-1.5">
                {gateway.employees.value ? (
                  <>
                    <span className="tnum text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink">
                      {gateway.employees.value.band}
                    </span>
                    <span className="mt-2 block text-[12px] text-ink-subtle">
                      LinkedIn size band
                    </span>
                  </>
                ) : (
                  <StatusChip
                    status={gateway.employees.status}
                    note={gateway.employees.note}
                    size="sm"
                  />
                )}
              </dd>
            </div>

            <div className="bg-surface p-5">
              <dt className="text-[11px] font-medium uppercase tracking-[0.07em] text-ink-subtle">
                Last verified
              </dt>
              <dd className="mt-1.5">
                <span className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
                  {formatDate(gateway.lastVerified)}
                </span>
                <span className="mt-2 block text-[12px] text-ink-subtle">
                  Record reviewed as a whole
                </span>
              </dd>
            </div>
          </dl>

          <div className="grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
            <div className="flex flex-col gap-10">
              <section id="why" className="scroll-mt-20">
                <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-ink">
                  Why teams consider it
                </h2>
                <div className="mt-5">
                  <Bullets
                    items={gateway.strengths}
                    empty="Nothing is recorded yet. Points are added here only when they follow from a value in the dataset, never as general praise."
                  />
                </div>
              </section>

              <Section
                id="trade-offs"
                title="Trade-offs"
                description="Documented constraints and fields that remain open. An unresolved field is listed as unresolved rather than left out."
              >
                <Bullets
                  items={gateway.limitations}
                  empty="No constraints recorded in this dataset revision."
                />
              </Section>

              <Section
                id="coverage"
                title="Model and provider coverage"
                description="Models are distinct models addressable through the public API. Routes are model × provider combinations and are counted separately."
              >
                <dl>
                  <Row label="Routes / endpoints">
                    <span>
                      <span className="tnum font-medium">
                        {metricDisplay(coverage.metric.current) ?? "—"}
                      </span>
                      {metricDisplay(coverage.metric.current) ? (
                        <span className="text-[12.5px] text-ink-muted"> {coverage.kind}</span>
                      ) : null}{" "}
                      <MetricStatusChip value={coverage.metric.current} />
                      {secondary ? (
                        <span className="mt-1 block text-[13px] text-ink-muted">
                          Also{" "}
                          <span className="tnum font-medium text-ink">
                            {metricDisplay(secondary.metric.current)}
                          </span>{" "}
                          {secondary.kind} <MetricStatusChip value={secondary.metric.current} />
                        </span>
                      ) : null}
                      <span className="mt-1 block text-[12.5px] text-ink-subtle">
                        A route is one model served by one provider; an endpoint is an
                        individually addressable API entry as the vendor publishes it. Both are
                        counted separately from models and never derived from each other or from
                        modalities.
                      </span>
                    </span>
                  </Row>
                  <Row label="OpenAI compatible">
                    <span className="inline-flex flex-col gap-1.5">
                      <span>
                        <OpenAiCompatibilityCell field={gateway.openaiCompatible} size="sm" />
                      </span>
                      <span className="text-[12.5px] leading-relaxed text-ink-muted">
                        {gateway.openaiCompatible.value !== null
                          ? OPENAI_COMPATIBILITY[gateway.openaiCompatible.value].description
                          : "Not recorded in the current dataset revision. Compatibility is read from vendor documentation, never assumed."}
                        {gateway.openaiCompatible.value !== null && gateway.openaiCompatible.note
                          ? ` ${gateway.openaiCompatible.note}`
                          : ""}
                      </span>
                    </span>
                  </Row>
                  <Row label="Modalities">
                    {gateway.modalities.value && gateway.modalities.value.length > 0 ? (
                      <span className="flex flex-wrap gap-1.5">
                        {gateway.modalities.value.map((modality) => (
                          <Badge key={modality} tone="outline" size="sm">
                            {MODALITY[modality].label}
                          </Badge>
                        ))}
                        <ProvenanceMark field={gateway.modalities} />
                      </span>
                    ) : (
                      <NoValue field={gateway.modalities} />
                    )}
                  </Row>
                </dl>

                {allObservations(gateway.models).length > 1 ? (
                  <div className="mt-6">
                    <h3 className="text-[12.5px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
                      Every figure on record
                    </h3>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                      Superseded measurements are kept rather than overwritten, and a provider&rsquo;s
                      own figure is kept alongside a measurement rather than replacing it.
                    </p>
                    <ol className="mt-3 flex flex-col gap-2.5">
                      {allObservations(gateway.models).map((entry, index) => (
                          <li
                            key={`${entry.date ?? "undated"}-${index}`}
                            className="border-b border-line pb-2.5 last:border-b-0"
                          >
                            <span className="flex items-baseline justify-between gap-4 text-[13px]">
                              <span className="text-ink-muted">
                                {entry.date ? formatDate(entry.date) : "Undated"}
                              </span>
                              <span className="tnum font-medium text-ink">
                                {metricDisplay(entry) ?? "—"}
                              </span>
                            </span>
                            <span className="mt-1 flex flex-wrap items-baseline gap-x-2">
                              <MetricStatusChip value={entry} />
                              {entry.scope ? (
                                <span className="text-[11.5px] text-ink-subtle">
                                  scope: {entry.scope === "llm" ? "LLM catalogue" : "all modalities"}
                                </span>
                              ) : null}
                            </span>
                            {entry.note ? (
                              <span className="mt-1 block text-[12px] leading-relaxed text-ink-subtle">
                                {entry.note}
                              </span>
                            ) : null}
                          </li>
                        ))}
                    </ol>
                  </div>
                ) : null}
              </Section>

              <Section
                id="infrastructure"
                title="Data and infrastructure"
                description="Where requests are received and where models run are recorded separately, and neither is inferred from the company's country of incorporation."
              >
                <dl>
                  <Row label="EU data residency">
                    <span className="inline-flex flex-col gap-1.5">
                      <span>
                        <Badge tone={residency.tone} size="sm" dot>
                          {residency.label}
                        </Badge>
                      </span>
                      <span className="text-[12.5px] leading-relaxed text-ink-muted">
                        {residency.description}
                        {gateway.euResidency.note ? ` ${gateway.euResidency.note}` : ""}
                      </span>
                    </span>
                  </Row>
                  <Row label="Gateway location">
                    <ListField field={gateway.gatewayLocations} />
                  </Row>
                  <Row label="Inference location">
                    <ListField field={gateway.inferenceLocations} />
                  </Row>
                  <Row label="Deployment">
                    {gateway.deployment.value && gateway.deployment.value.length > 0 ? (
                      <span className="flex flex-wrap gap-1.5">
                        {gateway.deployment.value.map((deployment) => (
                          <Badge key={deployment} tone="outline" size="sm">
                            {DEPLOYMENT[deployment].label}
                          </Badge>
                        ))}
                        <ProvenanceMark field={gateway.deployment} />
                      </span>
                    ) : (
                      <NoValue field={gateway.deployment} />
                    )}
                  </Row>
                  <Row label="Zero data retention">
                    <CapabilityField field={gateway.zeroDataRetention} />
                  </Row>
                  <Row label="BYOK">
                    <CapabilityField field={gateway.byok} />
                  </Row>
                  <Row label="BYOM">
                    <CapabilityField field={gateway.byom} />
                  </Row>
                  <Row label="VPC">
                    <CapabilityField field={gateway.vpc} />
                  </Row>
                  <Row label="On-premise">
                    <CapabilityField field={gateway.onPrem} />
                  </Row>
                  <Row label="Open source">
                    <CapabilityField field={gateway.openSource} />
                  </Row>
                  <Row label="Licence">
                    <TextField field={gateway.license} />
                  </Row>
                  <Row label="Repository">
                    {gateway.repository.value ? (
                      <a
                        href={gateway.repository.value}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-brand-ink hover:underline"
                      >
                        {gateway.repository.value.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <NoValue field={gateway.repository} />
                    )}
                  </Row>
                </dl>

                {selfHosted ? (
                  <div className="mt-6 rounded-card border border-line bg-subtle p-5">
                    <h3 className="text-[13.5px] font-semibold text-ink">
                      Self-hosted operating detail
                    </h3>
                    <dl className="mt-3">
                      <Row label="Runtime">
                        <TextField field={selfHosted.runtime} />
                      </Row>
                      <Row label="Routing features">
                        <TextField field={selfHosted.routing} />
                      </Row>
                      <Row label="Observability">
                        <TextField field={selfHosted.observability} />
                      </Row>
                      <Row label="Enterprise options">
                        <TextField field={selfHosted.enterpriseOptions} />
                      </Row>
                      <Row label="Maintainer">
                        <TextField field={selfHosted.maintainer} />
                      </Row>
                      <Row label="GitHub stars">
                        <NumberField field={selfHosted.githubStars} />
                      </Row>
                    </dl>
                  </div>
                ) : null}
              </Section>

              <Section
                id="company"
                title="Company"
                description="Company jurisdiction describes where the operating entity is incorporated. It carries no implication about data residency."
              >
                <dl>
                  <Row label="Legal entity">
                    <TextField field={gateway.legalEntity} />
                  </Row>
                  <Row label="Country">
                    <TextField field={gateway.country} />
                  </Row>
                  <Row label="City">
                    <TextField field={gateway.city} />
                  </Row>
                  <Row label="Founded">
                    <NumberField field={gateway.founded} />
                  </Row>
                  <Row label="Employees">
                    {gateway.employees.value ? (
                      <span>
                        {gateway.employees.value.band}
                        <ProvenanceMark field={gateway.employees} />
                      </span>
                    ) : (
                      <NoValue field={gateway.employees} />
                    )}
                  </Row>
                  <Row label="Funding">
                    <TextField field={gateway.funding} />
                  </Row>
                  <Row label="Ownership">
                    <TermField field={gateway.ownershipStatus} terms={OWNERSHIP_STATUS} />
                  </Row>
                  <Row label="Ownership detail">
                    <TextField field={gateway.ownership} />
                  </Row>
                  <Row label="Product status">
                    <TermField field={gateway.productStatus} terms={PRODUCT_STATUS} />
                  </Row>
                  <Row label="Parent company">
                    <TextField field={gateway.parentCompany} />
                  </Row>
                  <Row label="Certifications">
                    <ListField field={gateway.certifications} />
                  </Row>
                  <Row label="DPA">
                    <CapabilityField field={gateway.dpa} />
                  </Row>
                  <Row label="Subprocessors">
                    <TextField field={gateway.subprocessors} />
                  </Row>
                  <Row label="Pricing model">
                    <TextField field={gateway.pricingModel} />
                  </Row>
                  <Row label="Pricing disclosure">
                    <TermField field={gateway.pricingTransparency} terms={PRICING_TRANSPARENCY} />
                  </Row>
                </dl>

                {gateway.social.linkedinFollowers.value !== null ||
                gateway.social.xFollowers.value !== null ? (
                  <div className="mt-6 rounded-card border border-line bg-subtle p-5">
                    <h3 className="text-[12.5px] font-semibold uppercase tracking-[0.07em] text-ink-subtle">
                      Traction
                    </h3>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                      A point-in-time snapshot of audience size. It is not a product property, and
                      nothing on this site is ordered by it.
                    </p>
                    <dl className="mt-3 flex flex-wrap gap-x-10 gap-y-3">
                      {gateway.social.linkedinFollowers.value !== null ? (
                        <div>
                          <dt className="text-[11.5px] text-ink-subtle">LinkedIn followers</dt>
                          <dd className="tnum mt-0.5 text-[16px] font-semibold text-ink">
                            {formatFollowers(gateway.social.linkedinFollowers.value)}
                            <ProvenanceMark field={gateway.social.linkedinFollowers} />
                          </dd>
                        </div>
                      ) : null}
                      {gateway.social.xFollowers.value !== null ? (
                        <div>
                          <dt className="text-[11.5px] text-ink-subtle">X followers</dt>
                          <dd className="tnum mt-0.5 text-[16px] font-semibold text-ink">
                            {formatFollowers(gateway.social.xFollowers.value)}
                            <ProvenanceMark field={gateway.social.xFollowers} />
                          </dd>
                        </div>
                      ) : null}
                      {gateway.social.snapshotDate ? (
                        <div>
                          <dt className="text-[11.5px] text-ink-subtle">Captured</dt>
                          <dd className="mt-0.5 text-[16px] font-semibold text-ink">
                            {formatDate(gateway.social.snapshotDate)}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                ) : null}
              </Section>

              <Section
                id="sources"
                title="Sources"
                description="Every value above traces to one of these. Sources without a link are internal research records rather than public pages."
              >
                <SourceChips sources={gateway.sources} showDates />
                <p className="mt-5 text-[13px] text-ink-muted">
                  Record last verified {formatDate(gateway.lastVerified)}.{" "}
                  <Link href="/#corrections" className="text-brand-ink hover:underline">
                    Request a correction
                  </Link>{" "}
                  if something here is wrong or out of date.
                </p>
              </Section>
            </div>

            {/* Sidebar */}
            <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
              <div className="rounded-card border border-line bg-surface p-5 shadow-card">
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.07em] text-ink-subtle">
                  Best for
                </h2>
                <div className="mt-3">
                  <Bullets
                    items={gateway.bestFor}
                    empty="Not recorded. A fit statement is only published where the dataset supports it."
                  />
                </div>
              </div>

              <div className="rounded-card border border-line bg-surface p-5 shadow-card">
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.07em] text-ink-subtle">
                  On this page
                </h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {[
                    ["why", "Why teams consider it"],
                    ["trade-offs", "Trade-offs"],
                    ["coverage", "Coverage"],
                    ["infrastructure", "Data & infrastructure"],
                    ["company", "Company"],
                    ["sources", "Sources"],
                  ].map(([id, label]) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className="text-[13.5px] text-ink-muted transition-colors hover:text-ink"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-card border border-line bg-subtle p-5">
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.07em] text-ink-subtle">
                  Categories
                </h2>
                {memberOf.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {memberOf.map((category) => (
                      <li key={category.slug}>
                        <Link href={`/categories/${category.slug}`}>
                          <Badge tone="outline" size="sm">
                            {category.name}
                          </Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-[13px] leading-relaxed text-ink-subtle">
                    Not listed in a category yet. Category membership follows from recorded values,
                    so it fills in as fields are verified.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </Container>
      </article>
    </TooltipProvider>
  );
}

/** Sources referenced by a specific field, used by the expandable table row. */
export function fieldSources(gateway: Gateway, field: Field<unknown>) {
  return resolveSources(gateway, field.sources);
}
