"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Capability, Field, Gateway } from "@/types";
import { CAPABILITY, OWNERSHIP_STATUS, PRICING_TRANSPARENCY, PRODUCT_STATUS } from "@/lib/taxonomy";
import { formatDate, formatFollowers, formatQualifiedCount } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { NoValue, ProvenanceMark } from "@/components/ui/data-status";
import { MetricCell } from "@/components/ui/metric-value";
import { SourceChips } from "@/components/ui/source-chips";

function Definition({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-t border-line py-2.5 first:border-t-0 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="shrink-0 text-[12px] font-medium uppercase tracking-[0.06em] text-ink-subtle sm:w-40">
        {label}
      </dt>
      <dd className="min-w-0 text-[13.5px] leading-relaxed text-ink">{children}</dd>
    </div>
  );
}

function TextValue({ field }: { field: Field<string> }) {
  if (!field.value) return <NoValue variant="text" field={field} />;
  return (
    <span>
      {field.value}
      <ProvenanceMark field={field} />
    </span>
  );
}

function NumberValue({ field }: { field: Field<number> }) {
  if (field.value === null) return <NoValue variant="text" field={field} />;
  return (
    <span className="tnum">
      {formatQualifiedCount(field.value, field.qualifier)}
      <ProvenanceMark field={field} />
    </span>
  );
}

/** Renders one of the enum fields whose label set lives in the taxonomy. */
function TermValue<T extends string>({
  field,
  terms,
}: {
  field: Field<T>;
  terms: Record<string, { label: string; tone: "neutral" | "ok" | "info" | "warn" | "caution" | "brand" }>;
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

/**
 * Social reach, kept deliberately separate from the comparison fields.
 *
 * Follower counts are a point-in-time snapshot of audience size, not a product
 * property, and nothing on this site is ordered by them.
 */
function Traction({ gateway }: { gateway: Gateway }) {
  const { linkedinFollowers, xFollowers, snapshotDate } = gateway.social;
  if (linkedinFollowers.value === null && xFollowers.value === null) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-card border border-line bg-surface px-4 py-3">
      <span className="text-[11px] font-medium uppercase tracking-[0.07em] text-ink-subtle">
        Traction
      </span>
      {linkedinFollowers.value !== null ? (
        <span className="text-[13px] text-ink-muted">
          LinkedIn{" "}
          <span className="tnum font-medium text-ink">
            {formatFollowers(linkedinFollowers.value)}
          </span>
          <ProvenanceMark field={linkedinFollowers} />
        </span>
      ) : null}
      {xFollowers.value !== null ? (
        <span className="text-[13px] text-ink-muted">
          X{" "}
          <span className="tnum font-medium text-ink">{formatFollowers(xFollowers.value)}</span>
          <ProvenanceMark field={xFollowers} />
        </span>
      ) : null}
      {snapshotDate ? (
        <span className="text-[12px] text-ink-subtle">Snapshot {formatDate(snapshotDate)}</span>
      ) : null}
      <span className="text-[12px] text-ink-subtle">
        Audience size, not product quality. Nothing here is ranked by it.
      </span>
    </div>
  );
}

function CapabilityValue({ field }: { field: Field<Capability> }) {
  if (!field.value || field.value === "unknown") return <NoValue variant="text" field={field} />;
  const term = CAPABILITY[field.value];
  return (
    <span className="inline-flex items-center gap-2">
      <Badge tone={term.tone} size="sm">
        {term.label}
      </Badge>
      {field.note ? <span className="text-[12.5px] text-ink-muted">{field.note}</span> : null}
    </span>
  );
}

function ListValue({ field }: { field: Field<string[]> }) {
  if (!field.value || field.value.length === 0) return <NoValue variant="text" field={field} />;
  return (
    <span>
      {field.value.join(", ")}
      <ProvenanceMark field={field} />
    </span>
  );
}

function Bullets({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-[12px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
        {title}
      </h4>
      {items.length === 0 ? (
        <p className="mt-2 text-[13px] text-ink-subtle">
          Nothing recorded in the current dataset revision.
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1.5">
          {items.map((item) => (
            <li
              key={item}
              className="relative pl-4 text-[13.5px] leading-relaxed text-ink-muted before:absolute before:left-0 before:top-[0.6em] before:size-1 before:rounded-full before:bg-line-strong"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The detail panel revealed when a table row is expanded. */
export function ExpandedRow({ gateway }: { gateway: Gateway }) {
  return (
    <div className="animate-expand bg-subtle px-4 py-5 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
            Company and coverage
          </h3>
          <dl className="mt-3">
            <Definition label="Legal entity">
              <TextValue field={gateway.legalEntity} />
            </Definition>
            <Definition label="Founded">
              <NumberValue field={gateway.founded} />
            </Definition>
            <Definition label="Funding">
              <TextValue field={gateway.funding} />
            </Definition>
            <Definition label="Ownership">
              <TermValue field={gateway.ownershipStatus} terms={OWNERSHIP_STATUS} />
            </Definition>
            <Definition label="Ownership detail">
              <TextValue field={gateway.ownership} />
            </Definition>
            <Definition label="Product status">
              <TermValue field={gateway.productStatus} terms={PRODUCT_STATUS} />
            </Definition>
            <Definition label="Parent company">
              <TextValue field={gateway.parentCompany} />
            </Definition>
            <Definition label="Routes">
              <MetricCell metric={gateway.routes} align="left" />
            </Definition>
            <Definition label="Endpoints">
              <MetricCell metric={gateway.endpoints} align="left" />
            </Definition>
            <Definition label="Inference regions">
              <ListValue field={gateway.inferenceLocations} />
            </Definition>
          </dl>
        </div>

        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
            Deployment and governance
          </h3>
          <dl className="mt-3">
            <Definition label="BYOK">
              <CapabilityValue field={gateway.byok} />
            </Definition>
            <Definition label="BYOM">
              <CapabilityValue field={gateway.byom} />
            </Definition>
            <Definition label="VPC">
              <CapabilityValue field={gateway.vpc} />
            </Definition>
            <Definition label="On-prem">
              <CapabilityValue field={gateway.onPrem} />
            </Definition>
            <Definition label="Open source">
              <CapabilityValue field={gateway.openSource} />
            </Definition>
            <Definition label="DPA">
              <CapabilityValue field={gateway.dpa} />
            </Definition>
            <Definition label="Subprocessors">
              <TextValue field={gateway.subprocessors} />
            </Definition>
            <Definition label="Pricing disclosure">
              <TermValue field={gateway.pricingTransparency} terms={PRICING_TRANSPARENCY} />
            </Definition>
            <Definition label="Certifications">
              <ListValue field={gateway.certifications} />
            </Definition>
          </dl>
        </div>
      </div>

      <Traction gateway={gateway} />

      <div className="mt-8 grid gap-8 sm:grid-cols-3">
        <Bullets title="Strengths" items={gateway.strengths} />
        <Bullets title="Limitations" items={gateway.limitations} />
        <Bullets title="Best for" items={gateway.bestFor} />
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-[12px] uppercase tracking-[0.06em] text-ink-subtle">Sources</span>
          <SourceChips sources={gateway.sources} showDates />
          <span className="text-[12px] text-ink-subtle">
            Last verified {formatDate(gateway.lastVerified)}
          </span>
        </div>
        <Link
          href={`/gateways/${gateway.slug}`}
          className="inline-flex shrink-0 items-center gap-1.5 text-[13.5px] font-medium text-brand-ink hover:underline"
        >
          View full profile
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
