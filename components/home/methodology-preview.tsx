import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";

const RULES = [
  {
    term: "A model",
    definition:
      "A distinct model addressable through the gateway's public API, deduplicated where possible. Routes are counted separately as model × provider combinations.",
  },
  {
    term: "A provider",
    definition:
      "A distinct upstream inference provider or model company reachable through the gateway. The same provider is not counted twice for being available in two regions.",
  },
  {
    term: "Company size",
    definition:
      "The LinkedIn company-size band, such as 11–50. Precise headcounts are never reconstructed from third-party databases.",
  },
  {
    term: "EU residency",
    definition:
      "A documented statement about where requests are processed. It is never inferred from where the company is incorporated.",
  },
];

export function MethodologyPreview() {
  return (
    <section aria-labelledby="methodology-preview-heading" className="border-y border-line bg-subtle">
      <Container>
        <div className="grid gap-10 py-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:py-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
              Methodology
            </p>
            <h2
              id="methodology-preview-heading"
              className="mt-2 text-balance text-[22px] font-semibold tracking-[-0.02em] text-ink sm:text-[26px]"
            >
              No overall score. Defined terms instead.
            </h2>
            <p className="mt-3 text-pretty text-[14.5px] leading-relaxed text-ink-muted">
              This directory does not publish a composite rating, and does not name a single best
              OpenRouter alternative. A gateway is only ranked against a stated, measurable
              criterion — everything else is presented as attributes you can filter and sort
              yourself.
            </p>
            <Link
              href="/methodology"
              className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-ink hover:underline"
            >
              Read the full methodology
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>

          <dl className="grid gap-px overflow-hidden rounded-card border border-line bg-line">
            {RULES.map((rule) => (
              <div key={rule.term} className="bg-surface p-5">
                <dt className="text-[13.5px] font-semibold text-ink">{rule.term}</dt>
                <dd className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                  {rule.definition}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
