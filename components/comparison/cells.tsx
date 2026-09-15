import Link from "next/link";
import type { Capability, Deployment, Field, Gateway, Modality } from "@/types";
import {
  CAPABILITY,
  DEPLOYMENT,
  EU_RESIDENCY,
  JURISDICTION,
  MODALITY,
  OWNERSHIP_STATUS,
  PRICING_TRANSPARENCY,
  PRODUCT_STATUS,
} from "@/lib/taxonomy";
import { flagEmoji, formatCount } from "@/lib/format";
import { MetricCell } from "@/components/ui/metric-value";
import { Badge } from "@/components/ui/badge";
import { InfoTip } from "@/components/ui/tooltip";
import {
  NoValue,
  ProvenanceGlyph,
  ProvenanceMark,
  provenanceText,
} from "@/components/ui/data-status";
import { GatewayLogo } from "@/components/gateways/gateway-logo";
import { cn } from "@/lib/utils";

/** Gateway name cell: mark, linked name, one-line differentiator. */
export function GatewayCell({ gateway }: { gateway: Gateway }) {
  return (
    <div className="flex items-center gap-3">
      <GatewayLogo gateway={gateway} size="md" />
      <div className="min-w-0">
        <Link
          href={`/gateways/${gateway.slug}`}
          className="block truncate text-[13.5px] font-semibold text-ink hover:text-brand-ink"
        >
          {gateway.name}
        </Link>
        <p className="truncate text-[11.5px] text-ink-subtle">{gateway.differentiator}</p>
      </div>
    </div>
  );
}

/**
 * Model count.
 *
 * Delegates entirely to the shared metric component, so a measured count, a
 * vendor figure, a customer-configured gateway and an unpublished catalogue
 * all render through one consistent treatment.
 */
export function ModelsCell({ gateway }: { gateway: Gateway }) {
  return <MetricCell metric={gateway.models} />;
}

export function RoutesCell({ gateway }: { gateway: Gateway }) {
  return <MetricCell metric={gateway.routes} />;
}

export function EndpointsCell({ gateway }: { gateway: Gateway }) {
  return <MetricCell metric={gateway.endpoints} />;
}

/** Ownership status, with the parent company where there is one. */
export function OwnershipCell({ gateway }: { gateway: Gateway }) {
  const status = gateway.ownershipStatus;
  if (!status.value) return <NoValue compact field={status} />;

  const term = OWNERSHIP_STATUS[status.value];
  const parent = gateway.parentCompany.value;
  const description = status.note ? `${term.description} ${status.note}` : term.description;

  return (
    <div className="flex flex-col items-start gap-1">
      <InfoTip label={description}>
        <button type="button" className="cursor-help" aria-label={`${term.label}: ${description}`}>
          <Badge tone={term.tone} size="xs" dot>
            {term.label}
          </Badge>
        </button>
      </InfoTip>
      {parent ? <span className="truncate text-[11.5px] text-ink-subtle">{parent}</span> : null}
    </div>
  );
}

/** Product development status, rendered only when it is not simply active. */
export function ProductStatusBadge({ gateway }: { gateway: Gateway }) {
  const status = gateway.productStatus;
  if (!status.value || status.value === "active") return null;
  const term = PRODUCT_STATUS[status.value];
  const description = status.note ? `${term.description} ${status.note}` : term.description;

  return (
    <InfoTip label={description}>
      <button type="button" className="cursor-help" aria-label={`${term.label}: ${description}`}>
        <Badge tone={term.tone} size="xs" dot>
          {term.label}
        </Badge>
      </button>
    </InfoTip>
  );
}

export function PricingCell({ gateway }: { gateway: Gateway }) {
  const pricing = gateway.pricingTransparency;
  if (!pricing.value || pricing.value === "unresolved") {
    return <NoValue compact field={pricing} />;
  }
  const term = PRICING_TRANSPARENCY[pricing.value];
  const description = pricing.note ? `${term.description} ${pricing.note}` : term.description;

  return (
    <InfoTip label={description}>
      <button type="button" className="cursor-help" aria-label={`${term.label}: ${description}`}>
        <Badge tone={term.tone} size="xs">
          {term.label}
        </Badge>
      </button>
    </InfoTip>
  );
}

export function ProvidersCell({ gateway }: { gateway: Gateway }) {
  return <MetricCell metric={gateway.providers} />;
}

/** Modality badges, truncated so the table stays readable. */
export function ModalityCell({
  field,
  limit = 4,
}: {
  field: Field<Modality[]>;
  limit?: number;
}) {
  const modalities = field.value;
  if (!modalities || modalities.length === 0) return <NoValue compact field={field} />;

  const shown = modalities.slice(0, limit);
  const hidden = modalities.slice(limit);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map((modality) => (
        <InfoTip key={modality} label={MODALITY[modality].description}>
          <button type="button" className="cursor-help" aria-label={MODALITY[modality].description}>
            <Badge tone="outline" size="xs">
              {MODALITY[modality].label}
            </Badge>
          </button>
        </InfoTip>
      ))}
      {hidden.length > 0 ? (
        <InfoTip
          label={
            <span>
              Also documented:{" "}
              {hidden.map((modality) => MODALITY[modality].label).join(", ")}.
            </span>
          }
        >
          <button
            type="button"
            className="cursor-help"
            aria-label={`${hidden.length} more modalities: ${hidden
              .map((modality) => MODALITY[modality].label)
              .join(", ")}`}
          >
            <Badge tone="neutral" size="xs">
              +{hidden.length} more
            </Badge>
          </button>
        </InfoTip>
      ) : null}
    </div>
  );
}

/**
 * Jurisdiction: country of incorporation plus an EU / non-EU marker.
 * Deliberately never rendered next to residency without a separating column.
 */
export function JurisdictionCell({ gateway }: { gateway: Gateway }) {
  const bucket = JURISDICTION[gateway.jurisdictionBucket];
  const country = gateway.country;

  return (
    <div className="flex flex-col items-start gap-1">
      {country.value ? (
        <span className="flex items-center gap-1.5 text-[13px] text-ink">
          {gateway.countryCode.value ? (
            <span aria-hidden="true" className="text-[13px] leading-none">
              {flagEmoji(gateway.countryCode.value)}
            </span>
          ) : null}
          <span className="truncate">{country.value}</span>
          <ProvenanceMark field={country} />
        </span>
      ) : (
        <NoValue compact field={country} />
      )}
      <InfoTip label={bucket.description}>
        <button type="button" className="cursor-help" aria-label={bucket.description}>
          <Badge tone={bucket.tone} size="xs">
            {bucket.badge ?? bucket.label}
          </Badge>
        </button>
      </InfoTip>
    </div>
  );
}

/** EU residency status badge with the explanation attached. */
export function ResidencyCell({ gateway }: { gateway: Gateway }) {
  const field = gateway.euResidency;
  const key = field.value ?? "needs-verification";
  const term = EU_RESIDENCY[key];
  const description = field.note ? `${term.description} ${field.note}` : term.description;

  return (
    <InfoTip label={description}>
      <button type="button" className="cursor-help" aria-label={`${term.label}: ${description}`}>
        <Badge tone={term.tone} size="sm" dot>
          {term.label}
        </Badge>
      </button>
    </InfoTip>
  );
}

export function DeploymentCell({ field }: { field: Field<Deployment[]> }) {
  if (!field.value || field.value.length === 0) return <NoValue compact field={field} />;

  return (
    <div className="flex flex-wrap gap-1">
      {field.value.map((deployment) => (
        <InfoTip key={deployment} label={DEPLOYMENT[deployment].description}>
          <button
            type="button"
            className="cursor-help"
            aria-label={DEPLOYMENT[deployment].description}
          >
            <Badge tone="outline" size="xs">
              {DEPLOYMENT[deployment].label}
            </Badge>
          </button>
        </InfoTip>
      ))}
    </div>
  );
}

export function CapabilityCell({ field }: { field: Field<Capability> }) {
  if (!field.value || field.value === "unknown") return <NoValue compact field={field} />;
  const term = CAPABILITY[field.value];
  const description = field.note ? `${term.description} ${field.note}` : term.description;

  return (
    <InfoTip label={description}>
      <button type="button" className="cursor-help" aria-label={`${term.label}: ${description}`}>
        <Badge tone={term.tone} size="xs">
          {term.label}
        </Badge>
      </button>
    </InfoTip>
  );
}

export function CertificationsCell({ field }: { field: Field<string[]> }) {
  if (!field.value) return <NoValue compact field={field} />;

  // A verified empty list is a researched absence: the vendor states it holds
  // none, which is a different and more useful fact than "not yet checked".
  if (field.value.length === 0) {
    const description =
      field.note ?? "The vendor does not claim any security certifications.";
    return (
      <InfoTip label={description}>
        <button
          type="button"
          className="cursor-help"
          aria-label={`None claimed: ${description}`}
        >
          <Badge tone="warn" size="xs" dot>
            None claimed
          </Badge>
        </button>
      </InfoTip>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {field.value.map((certification) => (
        <Badge key={certification} tone="outline" size="xs">
          {certification}
        </Badge>
      ))}
      <ProvenanceMark field={field} />
    </div>
  );
}

export function EmployeesCell({ gateway }: { gateway: Gateway }) {
  const field = gateway.employees;
  if (!field.value) return <NoValue compact field={field} />;

  const label = `LinkedIn company-size band. Precise headcounts are not derived from third-party databases. ${provenanceText(field)}`;

  return (
    <InfoTip label={label}>
      <button
        type="button"
        className="tnum cursor-help text-[13px] text-ink"
        aria-label={`LinkedIn company-size band ${field.value.band}. ${label}`}
      >
        {field.value.band}
        <ProvenanceGlyph field={field} />
      </button>
    </InfoTip>
  );
}

export function LocationsCell({ field }: { field: Field<string[]> }) {
  if (!field.value || field.value.length === 0) return <NoValue compact field={field} />;

  return (
    <span className="text-[12.5px] leading-snug text-ink-muted">
      {field.value.join(", ")}
      <ProvenanceMark field={field} />
    </span>
  );
}

/** Social cell used for the LinkedIn and X columns. */
export function SocialCell({
  url,
  followers,
  network,
  className,
}: {
  url: string | null;
  followers: Field<number>;
  network: "LinkedIn" | "X";
  className?: string;
}) {
  if (followers.value === null && !url) {
    return <NoValue compact field={followers} />;
  }

  const body =
    followers.value !== null ? (
      <span className="tnum text-[13px] text-ink">
        {formatCount(followers.value)}
        <ProvenanceGlyph field={followers} />
      </span>
    ) : (
      <span className="text-[12.5px] text-ink-muted">Profile</span>
    );

  // Without a link there is no interactive parent, so the provenance can carry
  // its own tooltip.
  if (!url) {
    if (followers.value === null) return <span className={className}>{body}</span>;
    const label = `${network} followers on the snapshot date. ${provenanceText(followers)}`;
    return (
      <InfoTip label={label}>
        <button type="button" aria-label={label} className={cn("cursor-help", className)}>
          {body}
        </button>
      </InfoTip>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={cn("hover:text-brand-ink", className)}
      aria-label={
        followers.value === null
          ? `${network} profile`
          : `${network} profile. ${formatCount(followers.value)} followers. ${provenanceText(followers)}`
      }
    >
      {body}
    </a>
  );
}
