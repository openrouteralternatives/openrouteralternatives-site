import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
  width = "default",
}: {
  children: ReactNode;
  className?: string;
  width?: "default" | "wide" | "reading" | "prose";
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        width === "default" && "max-w-[1320px]",
        width === "wide" && "max-w-[1520px]",
        width === "reading" && "max-w-[1060px]",
        width === "prose" && "max-w-[760px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Consistent section header: eyebrow, title, supporting line, optional action. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  id,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={id}
          className="text-balance text-[22px] font-semibold tracking-[-0.02em] text-ink sm:text-[26px]"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-pretty text-[14.5px] leading-relaxed text-ink-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
