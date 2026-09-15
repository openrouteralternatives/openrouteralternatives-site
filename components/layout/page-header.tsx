import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/container";

interface Crumb {
  name: string;
  path: string;
}

/** Shared page header: breadcrumb, title, supporting copy and optional stats. */
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumb,
  stats,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb: Crumb[];
  stats?: { label: string; value: string }[];
  children?: React.ReactNode;
}) {
  return (
    <header className="border-b border-line bg-subtle">
      <Container>
        <nav aria-label="Breadcrumb" className="pt-6">
          <ol className="flex flex-wrap items-center gap-1 text-[12.5px] text-ink-subtle">
            {breadcrumb.map((crumb, index) => {
              const isLast = index === breadcrumb.length - 1;
              return (
                <li key={crumb.path} className="flex items-center gap-1">
                  {isLast ? (
                    <span aria-current="page" className="text-ink-muted">
                      {crumb.name}
                    </span>
                  ) : (
                    <>
                      <Link href={crumb.path} className="hover:text-ink">
                        {crumb.name}
                      </Link>
                      <ChevronRight aria-hidden="true" className="size-3" />
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="py-9">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 max-w-3xl text-balance text-[30px] font-semibold tracking-[-0.03em] text-ink sm:text-[36px]">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-pretty text-[15px] leading-relaxed text-ink-muted">
              {description}
            </p>
          ) : null}
          {children}

          {stats && stats.length > 0 ? (
            <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-5">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dd className="tnum text-[20px] font-semibold leading-none tracking-[-0.02em] text-ink">
                    {stat.value}
                  </dd>
                  <dt className="mt-1.5 text-[12.5px] text-ink-muted">{stat.label}</dt>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </Container>
    </header>
  );
}
