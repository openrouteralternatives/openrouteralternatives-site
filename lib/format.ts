import type { Funding } from "@/types";

/** Formatting helpers. Numbers in this dataset are measurements, so they are
 *  always rendered with grouping and tabular figures. */

export function formatCount(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/**
 * Renders a count with its precision.
 *
 * A vendor floor such as "50+" must never be shown as an exact 50, because the
 * two support different claims. The underlying number still sorts normally.
 */
export function formatQualifiedCount(
  n: number,
  qualifier?: "exact" | "at-least",
): string {
  return qualifier === "at-least" ? `${formatCount(n)}+` : formatCount(n);
}

/**
 * One line for a funding record: the disclosed round count and, where the
 * company states one, the total raised. Investors are rendered separately.
 * Zero reads as "no disclosed rounds", which is a fact, not a blank.
 */
export function formatFunding(funding: Funding): string {
  const rounds =
    funding.rounds === 0
      ? "No disclosed rounds"
      : `${formatCount(funding.rounds)} disclosed ${funding.rounds === 1 ? "round" : "rounds"}`;
  return funding.totalRaised ? `${rounds} · ${funding.totalRaised} raised` : rounds;
}

/**
 * Social follower counts are point-in-time snapshots, so they are rounded by
 * scale rather than shown to the unit.
 */
export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`;
  return formatCount(n);
}

const DATE_LONG = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

const DATE_SHORT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return DATE_LONG.format(new Date(`${iso}T00:00:00Z`));
}

export function formatDateShort(iso: string): string {
  return DATE_SHORT.format(new Date(`${iso}T00:00:00Z`));
}

/** Regional indicator flag from an ISO 3166-1 alpha-2 code. */
export function flagEmoji(countryCode: string): string {
  if (countryCode.length !== 2) return "";
  return String.fromCodePoint(
    ...countryCode
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1a5 + c.charCodeAt(0)),
  );
}

export function initials(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9 .]/g, " ").trim();
  const parts = cleaned.split(/[\s.]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
