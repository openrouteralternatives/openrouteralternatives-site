import type { Capability, EuResidency, Gateway, RankingSignal } from "@/types";
import { comparableValue, latestMeasured } from "@/lib/metric";

/**
 * Normalised attribute signals for score-ranked categories.
 *
 * Each signal reads one structured field from the canonical record and maps
 * it onto 0..1. Nothing here knows a gateway's name: a signal is a function of
 * recorded data only, so the same rule produces the same value for any entry
 * that records the same thing. A field with no recorded value returns null,
 * and the ranking treats that as earning nothing — a gateway is never credited
 * with an attribute the dataset does not record for it.
 *
 * Categories pick the signals they need and assign weights in
 * `data/categories.ts`, and each page states those weights in its ranking
 * criterion, so the ordering is reproducible from the published data.
 */

/** How strongly a residency label answers "are requests processed in the EU?". */
const RESIDENCY_STRENGTH: Record<EuResidency, number | null> = {
  "eu-by-default": 1,
  "eu-available": 0.75,
  "self-hosted": 0.6,
  "eu-routes": 0.5,
  "enterprise-only": 0.4,
  "not-stated": 0,
  "needs-verification": null,
};

/** How much of a guarantee each capability answer carries. */
const CAPABILITY_STRENGTH: Record<Capability, number> = {
  yes: 1,
  configurable: 0.5,
  enterprise: 0.4,
  no: 0,
  unknown: 0,
};

/** Deployment options that put the gateway inside infrastructure the customer controls. */
const CUSTOMER_CONTROLLED_DEPLOYMENTS = ["vpc", "on-prem", "self-hosted"] as const;

/**
 * Logarithmic 0..1 scale, so that 500 versus 700 models is a small difference
 * and 15 versus 150 a large one. `ceiling` is the value that scores 1.
 */
function logScale(value: number, ceiling: number): number {
  if (value <= 0) return 0;
  return Math.min(1, Math.log10(value + 1) / Math.log10(ceiling + 1));
}

const RANKABLE_STATUSES = ["measured", "official", "catalogue"] as const;

/**
 * The library of signals. Add one here and every category can declare it.
 * Weights are intentionally absent: they belong to the category, not the signal.
 */
export const SIGNALS = {
  euResidency: {
    id: "euResidency",
    label: "EU residency",
    value: (gateway: Gateway) =>
      RESIDENCY_STRENGTH[gateway.euResidency.value ?? "needs-verification"],
  },
  zeroDataRetention: {
    id: "zeroDataRetention",
    label: "Zero data retention",
    value: (gateway: Gateway) => {
      const field = gateway.zeroDataRetention;
      // Self-hosted gateways receive no traffic at the vendor, so the question
      // does not apply and the signal is left out rather than scored as zero.
      if (field.status === "not-applicable") return null;
      return field.value ? CAPABILITY_STRENGTH[field.value] : null;
    },
  },
  certifications: {
    id: "certifications",
    label: "Certifications",
    value: (gateway: Gateway) => {
      const list = gateway.certifications.value;
      return list ? Math.min(list.length, 3) / 3 : null;
    },
  },
  deploymentControl: {
    id: "deploymentControl",
    label: "Customer-controlled deployment",
    /**
     * One point for each of VPC, on-premise and self-hosted that is documented
     * (in the deployment list or as a "yes" capability), half a point where
     * the option exists only under an enterprise agreement or as a private
     * single-tenant deployment whose form the vendor does not specify.
     */
    value: (gateway: Gateway) => {
      const deployment = gateway.deployment.value;
      if (!deployment) return null;
      const capability = (value: Capability | null) =>
        value === "yes" ? 1 : value === "enterprise" || value === "configurable" ? 0.5 : 0;
      const vpc = deployment.includes("vpc") ? 1 : capability(gateway.vpc.value);
      const onPrem = deployment.includes("on-prem") ? 1 : capability(gateway.onPrem.value);
      const selfHosted = deployment.includes("self-hosted") ? 1 : 0;
      const privateOption = deployment.includes("private") ? 0.5 : 0;
      const points = Math.min(
        CUSTOMER_CONTROLLED_DEPLOYMENTS.length,
        vpc + onPrem + selfHosted + privateOption,
      );
      return points / CUSTOMER_CONTROLLED_DEPLOYMENTS.length;
    },
  },
  providerBreadth: {
    id: "providerBreadth",
    label: "Provider breadth",
    value: (gateway: Gateway) => {
      const hit = comparableValue(gateway.providers, [...RANKABLE_STATUSES]);
      return hit ? logScale(hit.value, 100) : null;
    },
  },
  modelBreadth: {
    id: "modelBreadth",
    label: "Model breadth",
    value: (gateway: Gateway) => {
      // A direct measurement is preferred; otherwise the figure the vendor publishes.
      const measured = latestMeasured(gateway.models)?.value;
      const value =
        measured ?? comparableValue(gateway.models, [...RANKABLE_STATUSES])?.value;
      return value === undefined ? null : logScale(value, 1000);
    },
  },
  modalityBreadth: {
    id: "modalityBreadth",
    label: "Modality breadth",
    value: (gateway: Gateway) => {
      const list = gateway.modalities.value;
      return list ? Math.min(list.length, 8) / 8 : null;
    },
  },
} satisfies Record<string, Omit<RankingSignal, "weight">>;

export type SignalId = keyof typeof SIGNALS;

/** A signal from the library with the weight a category assigns to it. */
export function signal(id: SignalId, weight = 1): RankingSignal {
  return { ...SIGNALS[id], weight };
}

/** Human-readable statement of a category's weighting, for its ranking criterion. */
export function describeSignals(signals: RankingSignal[]): string {
  return signals.map((s) => `${s.label} (weight ${s.weight})`).join(", ");
}
