import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CHANGE_KIND_LABEL, changelog } from "@/data/changelog";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Container, SectionHeading } from "@/components/layout/container";

export function LatestUpdates({ limit = 3 }: { limit?: number }) {
  const entries = changelog.slice(0, limit);

  return (
    <section aria-labelledby="updates-heading">
      <Container>
        <SectionHeading
          id="updates-heading"
          eyebrow="Changelog"
          title="Latest dataset updates"
          description="Figures are replaced through dated entries rather than silently overwritten, so a superseded number stays visible alongside what replaced it."
          action={
            <Link
              href="/changelog"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-ink hover:underline"
            >
              Full changelog
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          }
        />

        <ol className="mt-8 flex flex-col gap-3">
          {entries.map((entry) => (
            <li
              key={`${entry.date}-${entry.title}`}
              className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5 shadow-card sm:flex-row sm:gap-6"
            >
              <div className="flex shrink-0 items-center gap-3 sm:w-48 sm:flex-col sm:items-start sm:gap-2">
                <time
                  dateTime={entry.date}
                  className="tnum text-[12.5px] font-medium text-ink-muted"
                >
                  {formatDate(entry.date)}
                </time>
                <Badge tone="outline" size="xs">
                  {CHANGE_KIND_LABEL[entry.kind]}
                </Badge>
              </div>
              <div className="min-w-0">
                <h3 className="text-[14.5px] font-semibold tracking-[-0.01em] text-ink">
                  {entry.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
                  {entry.summary}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
