import { ArrowUpRight, Bug, FileSearch, ListPlus, PenLine, Code2, type LucideIcon } from "lucide-react";
import { REPOSITORY_URL } from "@/data/site";
import { Container, SectionHeading } from "@/components/layout/container";

const WAYS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: PenLine,
    title: "Correct inaccurate data",
    body: "Open an issue or a pull request against the record, with the field, the corrected value and a primary source.",
  },
  {
    icon: ListPlus,
    title: "Add a missing gateway",
    body: "A multi-provider gateway, router or AI API that is not tracked yet. Only the fields you can source need to be filled.",
  },
  {
    icon: FileSearch,
    title: "Improve a source",
    body: "Replace a vendor marketing claim with a registry filing, legal page, public endpoint or documentation link.",
  },
  {
    icon: Bug,
    title: "Report outdated information",
    body: "Catalogues, ownership and residency options change. Point at what moved and when you observed it.",
  },
  {
    icon: Code2,
    title: "Improve the site",
    body: "Accessibility, performance, table behaviour, or the data-collection scripts. The stack is Next.js and TypeScript.",
  },
];

/**
 * How to contribute.
 *
 * The dataset and the code are public. Corrections arrive through the
 * repository so every change is dated, attributed and reviewable, which is
 * the same discipline the dataset applies to its own figures.
 */
export function Contribute() {
  return (
    <section
      id="contribute"
      aria-labelledby="contribute-heading"
      className="scroll-mt-20 border-y border-line bg-subtle"
    >
      <Container>
        <div className="grid gap-10 py-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16 lg:py-16">
          <div>
            <SectionHeading
              id="contribute-heading"
              eyebrow="Open project"
              title="How to contribute"
              description="The dataset, the methodology and the site are maintained in the open. Anyone can propose a correction or an addition, and every change is reviewed against a primary source before it becomes canonical."
            />
            <a
              href={REPOSITORY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-[13.5px] font-medium text-canvas transition-colors hover:bg-ink/88"
            >
              Contribute on GitHub
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </a>
            <p className="mt-3 text-[12.5px] leading-relaxed text-ink-subtle">
              A competitor&rsquo;s comparison page is never accepted as evidence, in either direction.
              Registry filings, legal pages, public endpoints and product documentation are.
            </p>
          </div>

          <ul className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
            {WAYS.map((way) => {
              const Icon = way.icon;
              return (
                <li key={way.title} className="flex gap-3 bg-surface p-5 last:sm:col-span-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-subtle">
                    <Icon aria-hidden="true" className="size-4 text-ink-muted" />
                  </span>
                  <span>
                    <span className="block text-[13.5px] font-semibold text-ink">{way.title}</span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-ink-muted">
                      {way.body}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
