import type { SelfHostedDetail } from "@/types";
import { field, unverified } from "@/types/field";

/**
 * Extra columns for the self-hosted comparison. Kept separate from the main
 * gateway record because they only apply to products the customer operates.
 */
export const selfHostedDetails: SelfHostedDetail[] = [
  {
    gatewayId: "maxim-ai",
    runtime: field("Go (Bifrost)", "vendor-stated", { sources: ["repo"] }),
    observability: field(
      "Agent evaluation, tracing and observability through the Maxim platform",
      "vendor-stated",
      { sources: ["site"] },
    ),
    routing: field(
      "Multi-provider routing, fallbacks and governance through the Bifrost gateway",
      "vendor-stated",
      { sources: ["repo"] },
    ),
    enterpriseOptions: field(
      "VPC and air-gapped deployment alongside the Apache-2.0 gateway",
      "vendor-stated",
      { sources: ["site"] },
    ),
    githubStars: unverified("Star counts are point-in-time and are not captured in this revision."),
    maintainer: field("H3 Labs Inc.", "verified", { sources: ["site"] }),
  },
  {
    gatewayId: "litellm",
    runtime: field("Python", "verified", { sources: ["repo"] }),
    observability: field("Built-in logging with callbacks to external observability tools", "vendor-stated", {
      sources: ["docs"],
    }),
    routing: field("Fallbacks, retries, load balancing and budget controls", "vendor-stated", {
      sources: ["docs"],
    }),
    enterpriseOptions: field("Commercial enterprise tier offered alongside the open-source proxy", "vendor-stated", {
      sources: ["docs"],
    }),
    githubStars: unverified("Star counts are point-in-time and are not captured in this revision."),
    maintainer: field("BerriAI", "verified", { sources: ["repo"] }),
  },
  {
    gatewayId: "kong-ai-gateway",
    runtime: field("Lua on NGINX (Kong Gateway data plane)", "verified", { sources: ["docs"] }),
    observability: field("Kong's existing logging, metrics and tracing plugins", "vendor-stated", {
      sources: ["docs"],
    }),
    routing: field("Provider routing, credential management and prompt policy plugins", "vendor-stated", {
      sources: ["docs"],
    }),
    enterpriseOptions: field("Kong Enterprise and Konnect; some AI plugins are enterprise-only", "vendor-stated", {
      sources: ["docs"],
    }),
    githubStars: unverified("Star counts are point-in-time and are not captured in this revision."),
    maintainer: field("Kong Inc.", "verified", { sources: ["repo"] }),
  },
  {
    gatewayId: "envoy-ai-gateway",
    runtime: field("Go, on Envoy Gateway and Kubernetes", "verified", { sources: ["repo"] }),
    observability: field("Envoy's existing metrics, access logs and tracing", "vendor-stated", {
      sources: ["docs"],
    }),
    routing: field("Upstream provider routing, credential injection and traffic policy", "vendor-stated", {
      sources: ["docs"],
    }),
    enterpriseOptions: field("No vendor tier; commercial support comes from Envoy ecosystem vendors", "vendor-stated", {
      sources: ["docs"],
    }),
    githubStars: unverified("Star counts are point-in-time and are not captured in this revision."),
    maintainer: field("Envoy project community", "verified", { sources: ["repo"] }),
  },
  {
    gatewayId: "portkey",
    runtime: field("TypeScript, deployable as an edge or container workload", "vendor-stated", {
      sources: ["repo"],
    }),
    observability: field("Logs and traces via the hosted control plane", "vendor-stated"),
    routing: field("Fallbacks, retries, conditional routing, caching and guardrails", "vendor-stated", {
      sources: ["repo"],
    }),
    enterpriseOptions: field("Hosted enterprise plans alongside the open-source gateway", "vendor-stated"),
    githubStars: unverified("Star counts are point-in-time and are not captured in this revision."),
    maintainer: field("Portkey", "verified", { sources: ["repo"] }),
  },
  {
    gatewayId: "helicone",
    runtime: field("TypeScript, deployable with Docker", "vendor-stated", { sources: ["repo"] }),
    observability: field("Request logging, cost tracking and session views are the core product", "vendor-stated", {
      sources: ["repo"],
    }),
    routing: field("Caching, rate limiting and provider fallbacks", "vendor-stated"),
    enterpriseOptions: field("Hosted plans alongside the self-hosted deployment", "vendor-stated"),
    githubStars: unverified("Star counts are point-in-time and are not captured in this revision."),
    maintainer: field("Helicone", "verified", { sources: ["repo"] }),
  },
];

export function getSelfHostedDetail(gatewayId: string): SelfHostedDetail | undefined {
  return selfHostedDetails.find((detail) => detail.gatewayId === gatewayId);
}
