import Link from "next/link";
import { FOOTER_SECTIONS } from "@/data/site";
import { Container } from "@/components/layout/container";
import { Wordmark } from "@/components/layout/wordmark";
import { formatDate } from "@/lib/format";

export function Footer({ datasetDate }: { datasetDate: string }) {
  return (
    <footer className="mt-24 border-t border-line bg-subtle">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <Wordmark showDomain />
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-ink-muted">
              A comparison directory of AI gateways, model routers and multi-provider AI APIs.
              Every figure carries its source and the date it was observed.
            </p>
            <p className="mt-4 text-[12.5px] text-ink-subtle">
              Dataset revision {formatDate(datasetDate)}
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                {section.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13.5px] text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Container>
    </footer>
  );
}
