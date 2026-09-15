import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Building2,
  GitBranch,
  Landmark,
  Layers,
  Network,
  Server,
  Shapes,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { CategoryDefinition } from "@/types";
import { resolveCategory } from "@/lib/ranking";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Layers,
  Network,
  Landmark,
  ShieldCheck,
  Shapes,
  Building2,
  Bot,
  GitBranch,
  Server,
};

/**
 * Category discovery grid.
 *
 * Every card states the criterion that decides inclusion, so a visitor can see
 * what a list means before opening it.
 */
export function CategoryGrid({ categories }: { categories: CategoryDefinition[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => {
        const Icon = CATEGORY_ICONS[category.icon] ?? Layers;
        const { members } = resolveCategory(category);

        return (
          <li key={category.slug} className="flex">
            <Link
              href={`/categories/${category.slug}`}
              className="group flex w-full flex-col rounded-card border border-line bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg border border-line bg-subtle">
                  <Icon aria-hidden="true" className="size-4 text-ink-muted" />
                </span>
                <span className="tnum rounded-md border border-line bg-subtle px-1.5 py-0.5 text-[11px] text-ink-subtle">
                  {members.length}
                </span>
              </div>

              <h3 className="mt-4 text-[14.5px] font-semibold tracking-[-0.01em] text-ink group-hover:text-brand-ink">
                {category.name}
              </h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-muted">
                {category.inclusionCriterion}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-subtle group-hover:text-brand-ink">
                Compare
                <ArrowRight aria-hidden="true" className="size-3" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
