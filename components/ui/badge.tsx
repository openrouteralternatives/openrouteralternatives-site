import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/taxonomy";

const badge = cva(
  "inline-flex items-center gap-1 rounded-md border font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-line bg-subtle text-ink-muted",
        ok: "border-transparent bg-ok-subtle text-ok",
        info: "border-transparent bg-info-subtle text-info",
        warn: "border-transparent bg-warn-subtle text-warn",
        caution: "border-transparent bg-caution-subtle text-caution",
        brand: "border-brand-line bg-brand-subtle text-brand-ink",
        outline: "border-line bg-transparent text-ink-muted",
      },
      size: {
        xs: "px-1.5 py-px text-[10.5px] leading-[1.45]",
        sm: "px-2 py-0.5 text-[11.5px] leading-[1.5]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: { tone: "neutral", size: "sm" },
  },
);

export type BadgeTone = Tone | "outline";

export interface BadgeProps extends VariantProps<typeof badge> {
  children: ReactNode;
  className?: string;
  /** Optional leading dot. Colour never carries meaning on its own — the label does. */
  dot?: boolean;
  title?: string;
}

export function Badge({ children, className, tone, size, dot, title }: BadgeProps) {
  return (
    <span className={cn(badge({ tone, size }), className)} title={title}>
      {dot ? (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current opacity-70" />
      ) : null}
      {children}
    </span>
  );
}
