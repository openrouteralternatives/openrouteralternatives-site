import Image from "next/image";
import type { Gateway } from "@/types";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: "size-7 rounded-md text-[10px]", px: 28, pad: "p-1" },
  md: { box: "size-9 rounded-lg text-[11.5px]", px: 36, pad: "p-1.5" },
  lg: { box: "size-14 rounded-xl text-base", px: 56, pad: "p-2" },
} as const;

export type GatewayLogoSize = keyof typeof SIZES;

/**
 * Brand mark for a gateway.
 *
 * A record with a `logo` path renders that locally stored asset from
 * `/public/logos`; every other record renders a stable monogram. Both variants
 * occupy an identical, fixed-size box so a table row or card never shifts when
 * an image loads, and no entry depends on hotlinking a third party's image.
 *
 * Presence of the file is checked by `npm run audit`, which is why there is no
 * runtime error handler here: a missing asset fails the audit rather than
 * rendering a broken image.
 *
 * Marks are rendered small and inside a quiet border so they aid recognition
 * without competing with the data around them.
 */
export function GatewayLogo({
  gateway,
  size = "md",
  className,
}: {
  gateway: Gateway;
  size?: GatewayLogoSize;
  className?: string;
}) {
  const spec = SIZES[size];

  if (gateway.logo) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-hidden border border-line bg-white",
          spec.box,
          spec.pad,
          className,
        )}
      >
        <Image
          src={gateway.logo}
          alt={`${gateway.name} logo`}
          width={spec.px}
          height={spec.px}
          // Icons are tiny static files; skipping the optimizer keeps SVG
          // sources working and avoids a runtime image route for 30 marks.
          unoptimized
          className="size-full object-contain"
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center border border-line bg-subtle font-semibold tracking-tight text-ink-muted",
        spec.box,
        className,
      )}
    >
      {initials(gateway.name)}
    </span>
  );
}
