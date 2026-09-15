import {
  AtSign,
  BookOpen,
  Database,
  GitBranch,
  Globe,
  Landmark,
  Users,
  Scale,
  Tag,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import type { Source, SourceKind } from "@/types/source";
import { SOURCE_KIND } from "@/lib/taxonomy";
import { sourceRank } from "@/data/sources";
import { formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";

const ICONS: Record<SourceKind, LucideIcon> = {
  "official-website": Globe,
  "models-api": Terminal,
  documentation: BookOpen,
  pricing: Tag,
  legal: Scale,
  registry: Landmark,
  linkedin: Users,
  x: AtSign,
  repository: GitBranch,
  "project-baseline": Database,
};

/**
 * Compact provenance chips. A chip with a URL opens the source; a chip without
 * one (the project's own research baseline) is rendered as a plain marker.
 */
export function SourceChips({
  sources,
  className,
  showDates = false,
}: {
  sources: Source[];
  className?: string;
  showDates?: boolean;
}) {
  if (sources.length === 0) return null;

  const ordered = [...sources].sort((a, b) => sourceRank(a.kind) - sourceRank(b.kind));

  return (
    <ul className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {ordered.map((source) => {
        const Icon = ICONS[source.kind];
        const label = source.label || SOURCE_KIND[source.kind].label;
        const suffix =
          showDates && source.retrieved ? ` · ${formatDateShort(source.retrieved)}` : "";

        return (
          <li key={`${source.id}-${source.kind}`}>
            {source.url ? (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-[11.5px] text-ink-muted transition-colors hover:border-line-strong hover:bg-subtle hover:text-ink"
              >
                <Icon aria-hidden="true" className="size-3" />
                {label}
                {suffix}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-line bg-subtle px-2 py-1 text-[11.5px] text-ink-subtle">
                <Icon aria-hidden="true" className="size-3" />
                {label}
                {suffix}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
