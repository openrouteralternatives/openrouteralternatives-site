import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CHANGE_KIND_LABEL, changelog } from "@/data/changelog";
import { getGateway } from "@/lib/gateway";
import { formatDate } from "@/lib/format";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = pageMetadata({
  title: "Changelog",
  description:
    "Dated record of every change to the AI gateway comparison dataset: model catalogue refreshes, company data updates, social snapshots and corrections.",
  path: "/changelog",
  keywords: ["AI gateway dataset changelog", "model count updates"],
});

export default function ChangelogPage() {
  const totalChanges = changelog.reduce((sum, entry) => sum + entry.changes.length, 0);

  return (
    <>
      <PageHeader
        eyebrow="Updates"
        title="Changelog"
        description="Figures are replaced through dated entries, never silently overwritten. A superseded value stays visible next to the one that replaced it, with the source for the change."
        breadcrumb={[
          { name: "Home", path: "/" },
          { name: "Changelog", path: "/changelog" },
        ]}
        stats={[
          { label: "Entries", value: String(changelog.length) },
          { label: "Recorded changes", value: String(totalChanges) },
          { label: "Latest", value: formatDate(changelog[0].date) },
        ]}
      />

      <Container>
        <div className="py-12">
          <ol className="relative flex flex-col gap-8 border-l border-line pl-6 sm:pl-8">
            {changelog.map((entry) => (
              <li key={`${entry.date}-${entry.title}`} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[1.68rem] top-1.5 size-2.5 rounded-full border-2 border-canvas bg-line-strong sm:-left-[2.18rem]"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <time
                    dateTime={entry.date}
                    className="tnum text-[13px] font-medium text-ink-muted"
                  >
                    {formatDate(entry.date)}
                  </time>
                  <Badge tone="outline" size="xs">
                    {CHANGE_KIND_LABEL[entry.kind]}
                  </Badge>
                </div>

                <h2 className="mt-2 text-[17px] font-semibold tracking-[-0.02em] text-ink">
                  {entry.title}
                </h2>
                <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-ink-muted">
                  {entry.summary}
                </p>

                {entry.changes.length > 0 ? (
                  <div className="mt-4 overflow-hidden rounded-card border border-line bg-surface shadow-card">
                    <div className="scroll-shadow-x overflow-x-auto">
                      <table className="w-full min-w-[46rem] text-left">
                        <caption className="sr-only">
                          Individual changes recorded on {formatDate(entry.date)}
                        </caption>
                        <thead>
                          <tr className="border-b border-line bg-subtle">
                            {["Gateway", "Field", "Previous", "New", "Source"].map((heading) => (
                              <th
                                key={heading}
                                scope="col"
                                className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-muted"
                              >
                                {heading}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {entry.changes.map((change, index) => {
                            const gateway = change.gateway ? getGateway(change.gateway) : undefined;
                            return (
                              <tr
                                key={`${change.field}-${change.gateway ?? "dataset"}-${index}`}
                                className="border-b border-line last:border-b-0"
                              >
                                <td className="px-4 py-3 align-top text-[13px]">
                                  {gateway ? (
                                    <Link
                                      href={`/gateways/${gateway.slug}`}
                                      className="font-medium text-ink hover:text-brand-ink"
                                    >
                                      {gateway.name}
                                    </Link>
                                  ) : (
                                    <span className="text-ink-subtle">Dataset-wide</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 align-top text-[13px] text-ink-muted">
                                  {change.field}
                                </td>
                                <td className="px-4 py-3 align-top text-[13px] text-ink-subtle">
                                  {change.previous ?? "—"}
                                </td>
                                <td className="tnum px-4 py-3 align-top text-[13px] font-medium text-ink">
                                  {change.next ?? "—"}
                                </td>
                                <td className="px-4 py-3 align-top text-[12.5px] text-ink-muted">
                                  {change.source ?? "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ol>

          <div className="mt-12 rounded-card border border-line bg-subtle p-6">
            <h2 className="text-[15px] font-semibold text-ink">Spotted something wrong?</h2>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
              Corrections are dated and logged here with the previous value, the new value and the
              source. Send the gateway, the field, the corrected value and a primary source — a
              public endpoint, registry entry, legal page or product documentation.
            </p>
            <Link
              href="/methodology#corrections"
              className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-ink hover:underline"
            >
              How corrections are handled
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>
      </Container>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Changelog", path: "/changelog" },
        ])}
      />
    </>
  );
}
