import Image from "next/image";
import type { Gateway } from "@/types";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: "size-7 text-[10px] rounded-md", px: 28 },
  md: { box: "size-9 text-[11.5px] rounded-lg", px: 36 },
  lg: { box: "size-14 text-base rounded-xl", px: 56 },
} as const;

/**
 * Brand mark for a gateway.
 *
 * Logos are only rendered when a locally stored asset exists in
 * `/public/logos`. Otherwise a stable monogram is drawn, so no entry depends on
 * hotlinking a third party's image.
 */
export function GatewayLogo({
  gateway,
  size = "md",
  className,
}: {
  gateway: Gateway;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const spec = SIZES[size];

  if (gateway.logo) {
    return (
      <Image
        src={gateway.logo}
        alt=""
        width={spec.px}
        height={spec.px}
        className={cn("shrink-0 border border-line bg-surface object-contain", spec.box, className)}
      />
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
