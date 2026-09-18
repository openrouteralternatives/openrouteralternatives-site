import { Check, ChevronDown, X } from "lucide-react";
import { SOURCE_HIERARCHY } from "@/data/sources";
import { BASELINE_DATE, DATASET_DATE, OPEN_DATASET_FIELDS } from "@/data/gateways";
import { REPOSITORY_URL } from "@/data/site";
import { categories } from "@/data/categories";
import { datasetStats, openFieldCount } from "@/lib/gateway";
import {
  DATA_STATUS,
  EU_RESIDENCY,
  EU_RESIDENCY_ORDER,
  METRIC_STATUS,
  METRIC_STATUS_ORDER,
  OBSERVABILITY,
  OBSERVABILITY_ORDER,
  OPENAI_COMPATIBILITY,
  OPENAI_COMPATIBILITY_ORDER,
} from "@/lib/taxonomy";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Container, SectionHeading } from "@/components/layout/container";

/**
 * The definitions a reader needs before trusting a cell. Always visible,
 * because they are short and the table sits directly above them.
 */
const DEFINITIONS: { id: string; term: string; definition: string }[] = [
  {
    id: "def-model",
    term: "Model",
    definition:
      "A distinct model addressable through the gateway's public API, after removing duplicates, serving-provider prefixes and routing variants. Measured from a public endpoint wherever one exists.",
  },
  {
    id: "def-provider",
    term: "Provider",
    definition:
      "A distinct upstream inference provider or model company reachable through the gateway. Not counted twice for being offered in two regions.",
  },
  {
    id: "def-route",
    term: "Route",
    definition:
      "One model served by one provider. The same model offered by four providers is one model and four routes, so route counts are never shown as model counts.",
  },
  {
    id: "def-endpoint",
    term: "Endpoint",
    definition:
      "An individually addressable API entry as the vendor publishes it. Recorded only where a vendor states one, and never computed from routes or modalities.",
  },
  {
    id: "def-snapshot",
    term: "Snapshot date",
    definition:
      "Every measured figure carries the day it was counted. Catalogues move, so a count is an observation, not an attribute, and superseded observations stay on the profile.",
  },
  {
    id: "def-openai",
    term: "OpenAI compatible",
    definition:
      "Whether the vendor documents an API that OpenAI clients can be pointed at. Yes, partial, no or unknown, read from documentation. A comparison attribute, never a score.",
  },
  {
    id: "def-jurisdiction",
    term: "Jurisdiction vs residency",
    definition:
      "Jurisdiction is where the operating company is incorporated. EU residency is where requests are processed. Gateway location and inference location are recorded separately again. None is inferred from another.",
  },
  {
    id: "def-unknown",
    term: "Unknown values",
    definition:
      "A cell with no number carries its reason instead: not published, configured by the customer, a different metric, conflicting sources, or simply not yet recorded. A blank is never a zero.",
  },
];

function Details({
  id,
  title,
  summary,
  children,
}: {
  id: string;
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <details
      id={id}
      className="group scroll-mt-20 border-t border-line first:border-t-0 open:bg-subtle/60"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-[14.5px] font-semibold tracking-[-0.01em] text-ink">
            {title}
          </span>
          <span className="mt-1 block text-[13px] leading-relaxed text-ink-muted">{summary}</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="mt-1 size-4 shrink-0 text-ink-subtle transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div className="flex flex-col gap-4 px-5 pb-6 text-[14px] leading-[1.7] text-ink-muted">
        {children}
      </div>
    </details>
  );
}

function Rule({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-card border-l-2 border-brand bg-brand-subtle px-4 py-3 text-[13.5px] leading-relaxed text-brand-ink">
      {children}
    </p>
  );
}

function TermList({
  entries,
}: {
  entries: { key: string; label: string; description: string; tone: Parameters<typeof Badge>[0]["tone"] }[];
}) {
  return (
    <ul className="flex flex-col gap-2.5">
      {entries.map((entry) => (
        <li key={entry.key} className="flex flex-col gap-1.5 sm:flex-row sm:gap-3">
          <span className="shrink-0 sm:w-44">
            <Badge tone={entry.tone} size="sm" dot>
              {entry.label}
            </Badge>
          </span>
          <span className="text-[13.5px] leading-relaxed">{entry.description}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Methodology, placed directly beneath the comparison table.
 *
 * The definitions are always visible; the longer explanations sit in native
 * disclosure elements so the section stays compact without losing anything
 * the former standalone page said.
 */
export function Methodology() {
  const stats = datasetStats(categories.length);
  const openFields = openFieldCount();

  return (
    <section
      id="methodology"
      aria-labelledby="methodology-heading"
      className="scroll-mt-20 border-y border-line bg-subtle py-14"
    >
      <Container>
        <SectionHeading
          id="methodology-heading"
          eyebrow="Methodology"
          title="How to read the table"
          description="No overall score is published and no company is called the best OpenRouter alternative. Where a category is ranked, its page states the recorded attributes and weights that order it. Each column is established the same way for every entry, and where a value cannot be established the cell says so."
        />

        <dl className="mt-8 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {DEFINITIONS.map((entry) => (
            <div key={entry.id} id={entry.id} className="bg-surface p-5">
              <dt className="text-[13.5px] font-semibold text-ink">{entry.term}</dt>
              <dd className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                {entry.definition}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 overflow-hidden rounded-card border border-line bg-surface shadow-card">
          <Details
            id="model-counting"
            title="Model and provider counting"
            summary="One counting rule, applied to every catalogue on the same day."
          >
            <p>
              Where a public model endpoint can be enumerated, the count is measured directly and
              displayed with the date it was taken. Where only a vendor-stated number exists, it is
              labelled as such and excluded from any ranking built on measured counts. The current
              measured baseline was taken on {formatDate(BASELINE_DATE)} and re-counted on{" "}
              {formatDate(DATASET_DATE)} across {stats.measuredCatalogues} gateways.
            </p>
            <p>A count excludes:</p>
            <ul className="flex flex-col gap-1.5 pl-4">
              {[
                "duplicate provider routes for the same base model",
                "quantisations of a model already counted",
                "turbo, fast or preview variants that represent the same base model",
                "deprecated or unavailable models still listed in an endpoint",
                "non-model pseudo-entries such as auto-routing aliases",
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
              A vendor floor such as &ldquo;500+&rdquo; is stored as a floor and rendered with the
              plus sign. Where a floor and a measured count both exist, both are shown rather than
              the larger one being chosen. Where a gateway routes only to providers the customer
              configures, no count is published for it at all.
            </p>
            <Rule>
              Measured and vendor-stated figures are never mixed in one ranking, and a route or
              endpoint count is never presented as a model count.
            </Rule>
          </Details>

          <Details
            id="snapshots"
            title="Snapshots and history"
            summary="Figures are dated observations. Refreshes add an observation; they never overwrite one."
          >
            <p>
              Model catalogues are re-measured on a fixed cadence and each refresh is published as a
              new dated observation. Company and social data are refreshed together so a snapshot
              stays internally consistent. Every profile lists every figure on record, including the
              vendor&rsquo;s own number alongside a measurement, so the gap between the two stays
              visible.
            </p>
            <p>
              A ranking assembled from figures counted on different days is weaker evidence than a
              single snapshot, and the category pages say which of the two they are.
            </p>
          </Details>

          <Details
            id="evidence"
            title="Evidence statuses"
            summary="What the small line under each number means."
          >
            <p>
              Every quantitative value carries one of these. The same vocabulary is used in the
              table, on profiles and in rankings:
            </p>
            <TermList
              entries={METRIC_STATUS_ORDER.map((key) => ({
                key,
                label: METRIC_STATUS[key].label,
                description: METRIC_STATUS[key].description,
                tone: METRIC_STATUS[key].tone,
              }))}
            />
            <p>Qualitative fields carry one of these instead:</p>
            <TermList
              entries={(Object.keys(DATA_STATUS) as (keyof typeof DATA_STATUS)[]).map((key) => ({
                key,
                label: DATA_STATUS[key].label,
                description: DATA_STATUS[key].description,
                tone: DATA_STATUS[key].tone,
              }))}
            />
            <p>
              {openFields} fields in the current revision are marked as not recorded rather than
              estimated. These are open across most of the dataset:
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
          </Details>

          <Details
            id="source-hierarchy"
            title="Source hierarchy"
            summary="Where sources disagree, the higher-ranked source wins."
          >
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
                    <span className="block text-[14px] font-medium text-ink">{source.label}</span>
                    <span className="mt-0.5 block text-[13.5px] leading-relaxed">
                      {source.description}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <p>
              Company jurisdiction is established from a registry or the vendor&rsquo;s own legal
              pages, never from a website domain, a team page or an office address. Certifications
              are recorded from the vendor&rsquo;s compliance pages and marked vendor-stated unless
              a certificate has been checked; the certified scope matters more than the acronym.
            </p>
          </Details>

          <Details
            id="eu-residency"
            title="EU jurisdiction, EU residency and location"
            summary="Four separate fields, populated from separate sources."
          >
            <Rule>
              EU incorporation is never treated as evidence of EU data residency. The two are
              separate columns, populated from separate sources.
            </Rule>
            <p>
              <strong className="font-medium text-ink">Jurisdiction</strong> is the country in
              which the operating legal entity is incorporated.{" "}
              <strong className="font-medium text-ink">Gateway location</strong> is where the
              gateway receives, authenticates and logs a request before forwarding it.{" "}
              <strong className="font-medium text-ink">Inference location</strong> is where the
              underlying model runs, which is usually set by the upstream provider and often differs
              per model. <strong className="font-medium text-ink">EU residency</strong> is a
              documented statement about where requests are processed, recorded with one of these
              labels. They describe different arrangements, not a scale:
            </p>
            <TermList
              entries={EU_RESIDENCY_ORDER.map((key) => ({
                key,
                label: EU_RESIDENCY[key].label,
                description: EU_RESIDENCY[key].description,
                tone: EU_RESIDENCY[key].tone,
              }))}
            />
          </Details>

          <Details
            id="openai-compatibility"
            title="OpenAI compatibility"
            summary="Read from documentation, shown as a label, never ranked."
          >
            <p>
              Compatibility with the OpenAI API decides how much client code moves unchanged, so it
              is recorded as its own attribute with one of four labels. It is established from the
              vendor&rsquo;s own documentation or from an endpoint this project exercised, and it is
              never inferred from the product category.
            </p>
            <TermList
              entries={OPENAI_COMPATIBILITY_ORDER.map((key) => ({
                key,
                label: OPENAI_COMPATIBILITY[key].label,
                description: OPENAI_COMPATIBILITY[key].description,
                tone: OPENAI_COMPATIBILITY[key].tone,
              }))}
            />
            <p>
              A gateway whose documentation has not been checked yet shows &ldquo;Unknown&rdquo;
              with a not-recorded status, which is a different statement from a documented unknown.
            </p>
          </Details>

          <Details
            id="observability"
            title="Observability"
            summary="Five levels of built-in observability, read from documentation and never scored."
          >
            <p>
              How much a gateway lets a team see of its own traffic decides how quickly cost,
              latency and failure questions can be answered without a second tool. It is recorded
              as one of five levels, established from the vendor&rsquo;s own documentation and
              product material rather than by exercising the dashboards. The levels describe how
              deep the built-in tooling goes; they are not a quality score, and nothing on this site
              is ranked by them.
            </p>
            <TermList
              entries={OBSERVABILITY_ORDER.map((key) => ({
                key,
                label: OBSERVABILITY[key].label,
                description: OBSERVABILITY[key].description,
                tone: OBSERVABILITY[key].tone,
              }))}
            />
            <p>
              A self-hosted gateway that exposes metrics and traces to the operator&rsquo;s own
              stack is rated on what it exposes, even where there is no hosted dashboard. Where the
              public material does not establish a richer layer, the level is the most it supports
              and is marked estimated rather than raised on assumption.
            </p>
          </Details>

          <Details
            id="company-data"
            title="Company, employee and social data"
            summary="Size bands, not headcounts. Snapshots, not rankings."
          >
            <p>
              Company size uses LinkedIn company-size bands such as 11&ndash;50. Precise headcounts
              are not reconstructed from third-party databases, because those figures are
              themselves estimates presented as facts. A band describes the company, not the
              product.
            </p>
            <p>
              LinkedIn and X follower figures are point-in-time snapshots, captured on the same day
              so the pair stays comparable, and displayed rounded by scale. They live in a Traction
              block on profiles and expanded rows, outside the default columns.
            </p>
            <Rule>
              Follower count is not a measure of product quality and is never used to order any
              list on this site.
            </Rule>
            <p>
              Ownership, parent company and acquisition status are recorded where a filing or a
              vendor announcement establishes them, because an acquisition can change a
              product&rsquo;s roadmap, pricing and data handling without changing its website. Two
              product names belonging to one company are recorded as a single entry.
            </p>
            <p>
              Funding is recorded as the number of disclosed financing rounds and the investors
              named in them, from the company&rsquo;s own announcements or, where it publishes none,
              from a named company database. Grants, strategic investments outside a disclosed
              round and acquisitions are described rather than counted. Funding that could not be
              publicly verified is shown as not publicly listed, never as zero, and a cloud
              provider&rsquo;s product or a community project records the field as not applicable,
              because a corporation&rsquo;s history is not the funding of one product.
            </p>
          </Details>

          <Details
            id="corrections"
            title="Corrections and bias"
            summary="Every vendor is measured with the same rule. Corrections are dated and reviewable."
          >
            <p>
              Vendors and readers can request a correction through the{" "}
              <a
                href={REPOSITORY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-ink hover:underline"
              >
                public repository
              </a>
              . Send the gateway, the field, the corrected value and a primary source: a public
              endpoint, a registry entry, a legal page or product documentation. A
              competitor&rsquo;s comparison article is never accepted as evidence for a
              rival&rsquo;s figures, in either direction.
            </p>
            <Rule>
              Historical figures are never silently overwritten. A superseded measurement stays
              visible next to the one that replaced it.
            </Rule>
            <p>
              The protections against bias are structural rather than promised: the ranking
              criterion for every category is printed on that category&rsquo;s page, the default
              table order is alphabetical, measured and provider-stated figures are never mixed
              inside one ranking, and no gateway is excluded from a list it qualifies for. Where the
              evidence favours one product, that product leads.
            </p>
          </Details>
        </div>
      </Container>
    </section>
  );
}
