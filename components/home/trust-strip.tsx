import Link from "next/link";
import { CalendarClock, FileSearch, Gauge, Scale, type LucideIcon } from "lucide-react";
import { TRUST_POINTS } from "@/data/site";
import { Container } from "@/components/layout/container";

const ICONS: Record<string, LucideIcon> = {
  Gauge,
  FileSearch,
  CalendarClock,
  Scale,
};

export function TrustStrip() {
  return (
    <section aria-label="How this comparison is built" className="border-b border-line bg-subtle">
      <Container>
        <ul className="grid gap-x-10 gap-y-7 py-7 sm:grid-cols-2 lg:grid-cols-4 lg:py-8">
          {TRUST_POINTS.map((point) => {
            const Icon = ICONS[point.icon] ?? Gauge;
            return (
              <li key={point.title}>
                <Link
                  href={point.href}
                  className="group flex h-full flex-col gap-2 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon aria-hidden="true" className="size-4 text-ink-subtle" />
                    <span className="text-[13.5px] font-semibold text-ink group-hover:text-brand-ink">
                      {point.title}
                    </span>
                  </span>
                  <span className="text-[13px] leading-relaxed text-ink-muted">{point.body}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
