"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Tooltip trigger that is reachable by keyboard and readable by screen readers.
 *
 * Radix exposes the content on focus as well as hover, and the label is also
 * written into `aria-describedby`, so the explanation is never colour- or
 * hover-only.
 */
export function InfoTip({
  label,
  children,
  side = "top",
  className,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}) {
  return (
    <TooltipPrimitive.Root delayDuration={120}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          collisionPadding={12}
          className={cn(
            "z-50 max-w-[19rem] rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] leading-relaxed text-ink-muted shadow-pop",
            "data-[state=delayed-open]:animate-fade-up",
            className,
          )}
        >
          {label}
          <TooltipPrimitive.Arrow className="fill-[var(--surface)]" width={10} height={5} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
