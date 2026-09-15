import Link from "next/link";
import { ArrowRight, Building2, Cpu, Server } from "lucide-react";
import { Container, SectionHeading } from "@/components/layout/container";

const LAYERS = [
  {
    step: "01",
    icon: Building2,
    title: "Company jurisdiction",
    body: "Where the operating company is incorporated. It determines which courts and corporate law apply — not where your requests go.",
    example: "A French company can run its gateway anywhere.",
  },
  {
    step: "02",
    icon: Server,
    title: "Gateway location",
    body: "Where the gateway receives, authenticates and logs your request before forwarding it. This is where your prompt first lands.",
    example: "An EU company can still terminate requests in us-east-1.",
  },
  {
    step: "03",
    icon: Cpu,
    title: "Inference location",
    body: "Where the underlying model actually runs. It is set by the upstream provider, and often differs per model within one gateway.",
    example: "An EU gateway can still route to a US-hosted model.",
  },
];

/**
 * The site's central editorial point, given its own section: three separate
 * attributes that are routinely collapsed into one claim.
 */
export function EuExplainer() {
  return (
    <section aria-labelledby="eu-explainer-heading">
      <Container>
        <SectionHeading
          id="eu-explainer-heading"
          eyebrow="Data residency"
          title="EU company ≠ EU data residency"
          description="Three separate attributes get collapsed into a single claim. This directory records them in three separate columns, and never infers one from another."
          action={
            <Link
              href="/eu-vs-eu-hosted"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-ink hover:underline"
            >
              Read the full explanation
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          }
        />

        <ol className="mt-8 grid gap-4 lg:grid-cols-3 lg:gap-0">
          {LAYERS.map((layer, index) => {
            const Icon = layer.icon;
            return (
              <li key={layer.step} className="relative flex">
                <div
                  className={`flex w-full flex-col rounded-card border border-line bg-surface p-5 shadow-card lg:rounded-none ${
                    index === 0 ? "lg:rounded-l-card" : ""
                  } ${index === 2 ? "lg:rounded-r-card" : "lg:border-r-0"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-lg border border-line bg-subtle">
                      <Icon aria-hidden="true" className="size-4 text-ink-muted" />
                    </span>
                    <span className="font-mono text-[11px] text-ink-subtle">{layer.step}</span>
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.01em] text-ink">
                    {layer.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-muted">
                    {layer.body}
                  </p>
                  <p className="mt-4 border-t border-line pt-3 text-[12.5px] leading-relaxed text-ink-subtle">
                    {layer.example}
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
      </Container>
    </section>
  );
}
