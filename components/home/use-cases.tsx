import Link from "next/link";
import { ArrowRight, Layers, type LucideIcon } from "lucide-react";
import { categories, useCases } from "@/data/categories";
import { resolveCategory } from "@/lib/ranking";
import { CATEGORY_ICONS } from "@/components/categories/category-grid";
import { Container, SectionHeading } from "@/components/layout/container";

/**
 * Use-case cards.
 *
 * Each card lists two or three gateways drawn from the matching category by
 * that category's own criterion. Where the criterion produces no members, the
 * card says so instead of naming a gateway that has not qualified.
 */
export function UseCases() {
  return (
    <section aria-labelledby="use-cases-heading">
      <Container>
        <SectionHeading
          id="use-cases-heading"
          eyebrow="Start from a requirement"
          title="Which AI gateway is right for you?"
          description="There is no overall winner in this directory. Each card starts from a requirement and links to the category whose inclusion criterion matches it."
        />

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((useCase) => {
            const category = categories.find((c) => c.slug === useCase.categorySlug);
            if (!category) return null;

            const result = resolveCategory(category);
            const examples =
              result.ranked.length > 0
                ? result.ranked.slice(0, 3).map((entry) => entry.gateway)
                : result.members.slice(0, 3);
            const Icon: LucideIcon = CATEGORY_ICONS[useCase.icon] ?? Layers;

            return (
              <li key={useCase.slug} className="flex">
                <div className="flex w-full flex-col rounded-card border border-line bg-surface p-5 shadow-card">
                  <span className="flex size-8 items-center justify-center rounded-lg border border-line bg-subtle">
                    <Icon aria-hidden="true" className="size-4 text-ink-muted" />
                  </span>
                  <h3 className="mt-4 text-[14.5px] font-semibold tracking-[-0.01em] text-ink">
                    {useCase.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-muted">
                    {useCase.description}
                  </p>

                  <div className="mt-4 border-t border-line pt-3">
                    {examples.length > 0 ? (
                      <>
                        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
                          {result.ranked.length > 0 ? "Top by this metric" : "In this category"}
                        </p>
                        <ul className="mt-2 flex flex-col gap-1">
                          {examples.map((gateway) => (
                            <li key={gateway.id}>
                              <Link
                                href={`/gateways/${gateway.slug}`}
                                className="text-[13px] text-ink-muted hover:text-brand-ink"
                              >
                                {gateway.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="text-[12.5px] leading-relaxed text-ink-subtle">
                        No gateway in the dataset currently meets this criterion.
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/categories/${category.slug}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand-ink hover:underline"
                  >
                    Compare {category.name.toLowerCase()}
                    <ArrowRight aria-hidden="true" className="size-3" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
