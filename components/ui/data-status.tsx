import { HelpCircle } from "lucide-react";
import type { DataStatus, Field } from "@/types";
import { DATA_STATUS } from "@/lib/taxonomy";
import { Badge } from "@/components/ui/badge";
import { InfoTip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * The status label for a field. Always carries text, never colour alone.
 */
export function StatusChip({
  status,
  note,
  size = "xs",
  className,
}: {
  status: DataStatus;
  note?: string;
  size?: "xs" | "sm";
  className?: string;
}) {
  const term = DATA_STATUS[status];
  const description = note ? `${term.description} ${note}` : term.description;

  return (
    <InfoTip
      label={
        <span>
          <span className="font-medium text-ink">{term.label}. </span>
          {description}
        </span>
      }
    >
      <button
        type="button"
        className={cn("cursor-help rounded-md", className)}
        aria-label={`${term.label}: ${description}`}
      >
        <Badge tone={term.tone} size={size} dot>
          {term.label}
        </Badge>
      </button>
    </InfoTip>
  );
}

/**
 * Rendered wherever a field has no supported value. The status is the content,
 * so an empty cell can never be mistaken for a zero.
 */
export function NoValue({
  field,
  compact = false,
  variant = "badge",
  className,
}: {
  field: Field<unknown>;
  compact?: boolean;
  /** "text" is used in dense definition lists where a wall of chips reads as noise. */
  variant?: "badge" | "text";
  className?: string;
}) {
  const term = DATA_STATUS[field.status];
  const description = field.note ? `${term.description} ${field.note}` : term.description;

  if (compact) {
    return (
      <InfoTip
        label={
          <span>
            <span className="font-medium text-ink">{term.label}. </span>
            {description}
          </span>
        }
      >
        <button
          type="button"
          aria-label={`${term.label}: ${description}`}
          className={cn(
            "inline-flex cursor-help items-center gap-1 text-[12.5px] text-ink-subtle",
            className,
          )}
        >
          <span aria-hidden="true">—</span>
          <span className="sr-only">{term.label}</span>
          <HelpCircle aria-hidden="true" className="size-3 opacity-60" />
        </button>
      </InfoTip>
    );
  }

  if (variant === "text") {
    return (
      <InfoTip
        label={
          <span>
            <span className="font-medium text-ink">{term.label}. </span>
            {description}
          </span>
        }
      >
        <button
          type="button"
          aria-label={`${term.label}: ${description}`}
          className={cn(
            "cursor-help text-[13px] text-ink-subtle underline decoration-dotted decoration-from-font underline-offset-4",
            className,
          )}
        >
          {term.label}
        </button>
      </InfoTip>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <StatusChip status={field.status} note={field.note} />
    </span>
  );
}

/**
 * Provenance as a sentence, for folding into a parent element's tooltip.
 *
 * Used wherever the value already sits inside an interactive element, since a
 * second trigger there would nest a button inside a button.
 */
export function provenanceText(field: Field<unknown>): string {
  const term = DATA_STATUS[field.status];
  const description = field.note ? `${term.description} ${field.note}` : term.description;
  return `${term.label}. ${description}`;
}

/**
 * Non-interactive provenance mark.
 *
 * Renders the same glyph as `ProvenanceMark` but as plain text, for use inside
 * a button or link where nesting an interactive element would be invalid HTML.
 * The explanation must be carried by the parent's tooltip and accessible name
 * — see `provenanceText`.
 */
export function ProvenanceGlyph({ field }: { field: Field<unknown> }) {
  if (field.status === "verified") return null;
  return (
    <span
      aria-hidden="true"
      className="align-super text-[10px] font-semibold text-ink-subtle"
    >
      {field.status === "vendor-stated" ? "*" : "?"}
    </span>
  );
}

/**
 * Small marker appended to a value whose status is not `verified`, so a
 * displayed figure always says how much weight it can carry.
 *
 * This renders its own tooltip trigger, so it may only be used inside
 * non-interactive parents. Inside a button or link, use `ProvenanceGlyph`.
 */
export function ProvenanceMark({ field }: { field: Field<unknown> }) {
  if (field.status === "verified") return null;
  const term = DATA_STATUS[field.status];
  const description = field.note ? `${term.description} ${field.note}` : term.description;

  return (
    <InfoTip
      label={
        <span>
          <span className="font-medium text-ink">{term.label}. </span>
          {description}
        </span>
      }
    >
      <button
        type="button"
        aria-label={`${term.label}: ${description}`}
        className="cursor-help align-super text-[10px] font-semibold text-ink-subtle hover:text-ink-muted"
      >
        {field.status === "vendor-stated" ? "*" : "?"}
      </button>
    </InfoTip>
  );
}
