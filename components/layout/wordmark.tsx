import { cn } from "@/lib/utils";

/**
 * Wordmark for the directory.
 *
 * A typographic mark with a small routing glyph — three inbound lanes
 * converging on one outbound line — rather than a logo for an invented brand.
 */
export function Wordmark({
  className,
  showDomain = false,
}: {
  className?: string;
  showDomain?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-[22px] shrink-0 text-brand"
        fill="none"
      >
        <rect x="0.75" y="0.75" width="22.5" height="22.5" rx="6" className="fill-brand-subtle" />
        <path
          d="M6 7.5h3.2c1.5 0 2.1.9 2.7 2.1.6 1.2 1.2 2.1 2.7 2.1H18M6 16.5h3.2c1.5 0 2.1-.9 2.7-2.1.6-1.2 1.2-2.1 2.7-2.1H18M6 12h2.2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="12" r="1.6" fill="currentColor" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-[14.5px] font-semibold tracking-[-0.02em] text-ink">
          OpenRouter Alternatives
        </span>
        {showDomain ? (
          <span className="mt-1 font-mono text-[10.5px] tracking-tight text-ink-subtle">
            openrouteralternatives.eu
          </span>
        ) : null}
      </span>
    </span>
  );
}
