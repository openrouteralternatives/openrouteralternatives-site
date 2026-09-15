import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Gateway } from "@/types";
import { EU_RESIDENCY, MODALITY } from "@/lib/taxonomy";
import { flagEmoji } from "@/lib/format";
import { metricDisplay } from "@/lib/metric";
import { METRIC_STATUS } from "@/lib/taxonomy";
import { Badge } from "@/components/ui/badge";
import { GatewayLogo } from "@/components/gateways/gateway-logo";
import { cn } from "@/lib/utils";

function Metric({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-[14.5px] font-semibold text-ink">{value}</dd>
      {sub ? <p className="truncate text-[11px] text-ink-subtle">{sub}</p> : null}
    </div>
  );
}

/** Card used by the featured grid and by category pages. */
export function GatewayCard({ gateway, className }: { gateway: Gateway; className?: string }) {
  const modalities = (gateway.modalities.value ?? []).slice(0, 3);
  const residency = EU_RESIDENCY[gateway.euResidency.value ?? "needs-verification"];

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-card border border-line bg-surface shadow-card transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised",
        className,
      )}
    >
      <div className="flex items-start gap-3 p-5">
        <GatewayLogo gateway={gateway} size="lg" className="size-11 rounded-lg text-[13px]" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15.5px] font-semibold tracking-[-0.01em] text-ink">
            <Link href={`/gateways/${gateway.slug}`} className="after:absolute after:inset-0">
              {gateway.name}
            </Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-ink-muted">
            {gateway.countryCode.value ? (
              <span aria-hidden="true">{flagEmoji(gateway.countryCode.value)}</span>
            ) : null}
            {gateway.country.value ?? "Jurisdiction not established"}
          </p>
        </div>
      </div>

      <p className="px-5 text-[13px] leading-relaxed text-ink-muted">{gateway.differentiator}</p>

      <dl className="mt-4 grid grid-cols-2 gap-4 px-5">
        <Metric
          label="Models"
          value={
            metricDisplay(gateway.models.current) ?? (
              <span className="text-[13px] font-normal text-ink-subtle">
                {METRIC_STATUS[gateway.models.current.status].label}
              </span>
            )
          }
          sub={
            metricDisplay(gateway.models.current)
              ? METRIC_STATUS[gateway.models.current.status].short
              : undefined
          }
        />
        <Metric
          label="Providers"
          value={
            metricDisplay(gateway.providers.current) ?? (
              <span className="text-[13px] font-normal text-ink-subtle">
                {METRIC_STATUS[gateway.providers.current.status].label}
              </span>
            )
          }
          sub={
            metricDisplay(gateway.providers.current)
              ? METRIC_STATUS[gateway.providers.current.status].short
              : undefined
          }
        />
      </dl>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 p-5 pt-4">
        <Badge tone={residency.tone} size="xs" dot>
          {residency.label}
        </Badge>
        {modalities.map((modality) => (
          <Badge key={modality} tone="outline" size="xs">
            {MODALITY[modality].label}
          </Badge>
        ))}
      </div>

      <div className="border-t border-line px-5 py-3">
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-subtle group-hover:text-brand-ink">
          View profile
          <ArrowRight aria-hidden="true" className="size-3" />
        </span>
      </div>
    </article>
  );
}
