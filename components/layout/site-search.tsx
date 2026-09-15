"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, CornerDownLeft } from "lucide-react";
import type { SearchIndexEntry } from "@/lib/search";
import { formatCount } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Site-wide search.
 *
 * Opens from the header button or ⌘K / Ctrl+K. Arrow keys move through
 * results and Enter opens the highlighted profile, so the whole flow works
 * without a pointer.
 */
export function SiteSearch({
  index,
  variant = "button",
  placeholder = "Search gateways, providers or capabilities...",
  className,
}: {
  index: SearchIndexEntry[];
  variant?: "button" | "input";
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.slice(0, 8);
    return index.filter((entry) => entry.haystack.includes(q)).slice(0, 10);
  }, [index, query]);

  // Reset the highlighted row whenever the query changes, adjusted during
  // render rather than in an effect.
  const [lastQuery, setLastQuery] = React.useState(query);
  if (lastQuery !== query) {
    setLastQuery(query);
    setActive(0);
  }

  const go = React.useCallback(
    (slug: string) => {
      setOpen(false);
      setQuery("");
      router.push(`/gateways/${slug}`);
    },
    [router],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      go(results[active].slug);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {variant === "input" ? (
          <button
            type="button"
            className={cn(
              "group flex w-full items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 text-left shadow-card transition-colors hover:border-line-strong sm:px-5",
              className,
            )}
          >
            <Search aria-hidden="true" className="size-[18px] shrink-0 text-ink-subtle" />
            <span className="flex-1 truncate text-[14.5px] text-ink-subtle">{placeholder}</span>
            <kbd className="hidden shrink-0 rounded border border-line bg-subtle px-1.5 py-0.5 font-mono text-[10.5px] text-ink-subtle sm:block">
              ⌘K
            </kbd>
          </button>
        ) : (
          <button
            type="button"
            aria-label="Search gateways"
            className={cn(
              "flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[13px] text-ink-subtle transition-colors hover:border-line-strong hover:text-ink-muted",
              className,
            )}
          >
            <Search aria-hidden="true" className="size-4" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden rounded border border-line bg-subtle px-1 py-px font-mono text-[10px] lg:block">
              ⌘K
            </kbd>
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px]" />
        <Dialog.Content
          onKeyDown={onKeyDown}
          className="fixed left-1/2 top-[12vh] z-50 w-[min(38rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-surface shadow-pop animate-fade-up"
        >
          <Dialog.Title className="sr-only">Search gateways</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search the comparison dataset by gateway name, country, capability or certification.
          </Dialog.Description>

          <div className="flex items-center gap-3 border-b border-line px-4">
            <Search aria-hidden="true" className="size-4 shrink-0 text-ink-subtle" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              aria-label="Search gateways"
              className="h-13 w-full bg-transparent py-4 text-[14.5px] text-ink outline-none placeholder:text-ink-subtle"
            />
          </div>

          <div className="max-h-[min(24rem,60vh)] overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-ink-muted">
                No gateway in the dataset matches “{query}”.
              </p>
            ) : (
              <ul role="listbox" aria-label="Search results">
                {results.map((entry, i) => (
                  <li key={entry.slug}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === active}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(entry.slug)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        i === active ? "bg-subtle" : "hover:bg-subtle",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-ink">
                          {entry.name}
                        </span>
                        <span className="block truncate text-[12px] text-ink-subtle">
                          {entry.differentiator}
                        </span>
                      </span>
                      <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
                        {entry.models !== null ? (
                          <Badge tone="outline" size="xs">
                            <span className="tnum">{formatCount(entry.models)}</span> models
                          </Badge>
                        ) : null}
                        <Badge tone="outline" size="xs">
                          {entry.residency}
                        </Badge>
                      </span>
                      {i === active ? (
                        <CornerDownLeft
                          aria-hidden="true"
                          className="size-3.5 shrink-0 text-ink-subtle"
                        />
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-line bg-subtle px-4 py-2 text-[11.5px] text-ink-subtle">
            <span>Search covers gateway names, countries, capabilities and certifications.</span>
            <span className="hidden sm:inline">↑↓ to move · ↵ to open · esc to close</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
