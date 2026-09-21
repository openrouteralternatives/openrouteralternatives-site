import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WHY } from "@/data/why";
import { Container } from "@/components/layout/container";

/**
 * Short statement of why the project exists, placed between the trust strip
 * and the comparison table. Deliberately two paragraphs: the homepage leads
 * with the table, and the full reasoning, including the US legal authorities
 * involved, lives on /why.
 */
export function WhyIntro() {
  return (
    <section id="why" aria-labelledby="why-heading" className="scroll-mt-20 border-b border-line">
      <Container>
        <div className="grid gap-6 py-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16 lg:py-14">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
              {WHY.eyebrow}
            </p>
            <h2
              id="why-heading"
              className="mt-2 text-balance text-[22px] font-semibold tracking-[-0.02em] text-ink sm:text-[26px]"
            >
              {WHY.headline}
            </h2>
          </div>

          <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-ink-muted">
            {WHY.summary.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            <Link
              href="/why"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-ink hover:underline"
            >
              Read the full reasoning, including the US laws that apply
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
