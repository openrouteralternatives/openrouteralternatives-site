import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Gateway } from "@/types";
import { field, unverified } from "@/types/field";
import { metric, notPublished, official } from "@/lib/metric";
import { emptyCandidates, type CandidateClaim } from "./claims";
import { compareCandidates, normalizeEntity, numberIn, sameSet } from "./compare";

const claim = (value: unknown): CandidateClaim => ({
  value,
  evidence: null,
  sourceUrl: "https://example.com",
  sourceKind: "website",
  retrieved: "2026-09-21",
});

/** Only the fields compare.ts reads. */
const gateway = {
  slug: "example",
  openaiCompatible: field("yes", "vendor-stated"),
  models: metric(official("500+", "2026-09-17")),
  providers: metric(notPublished("none")),
  endpoints: metric(notPublished("none")),
  routes: metric(official("972", "2026-09-17")),
  euResidency: field("eu-by-default", "vendor-stated"),
  gatewayLocations: unverified(),
  certifications: field(["SOC 2 Type II", "ISO/IEC 27001"], "vendor-stated"),
  deployment: field(["hosted", "vpc"], "vendor-stated"),
  zeroDataRetention: field("configurable", "vendor-stated"),
  pricingTransparency: field("public-with-enterprise", "verified"),
  legalEntity: field("Example Holding B.V.", "verified"),
} as unknown as Gateway;

describe("normalisers", () => {
  it("compare entities without legal-form punctuation", () => {
    assert.equal(normalizeEntity("Example Holding B.V."), normalizeEntity("example holding BV"));
  });
  it("read the first number out of a vendor figure", () => {
    assert.equal(numberIn("1,600+ endpoints"), 1600);
    assert.equal(numberIn("no figure"), null);
  });
  it("compare lists as sets, ignoring case and punctuation", () => {
    assert.equal(sameSet(["SOC 2 Type II", "ISO/IEC 27001"], ["iso-iec-27001", "soc2 type ii"]), true);
    assert.equal(sameSet(["SOC 2"], ["SOC 2", "HIPAA"]), false);
  });
});

describe("compareCandidates", () => {
  it("gives one verdict per candidate against the recorded value", () => {
    const candidates = emptyCandidates("example", "Example", "2026-09-21");
    candidates.fields.openaiCompatible = [claim("yes"), claim("partial")];
    candidates.fields.modelCountClaim = [claim("500+ models")];
    candidates.fields.legalEntity = [claim("Example Holding BV")];
    candidates.fields.certifications = [claim(["SOC 2"])];
    candidates.fields.gatewayRegions = [claim(["eu-west-1"])];
    candidates.fields.euResidencyClaim = [claim("EU processing is the default")];
    candidates.fields.governingLaw = [claim("Netherlands")];
    candidates.fields.endpointCountClaim = [claim("972 provider routes")];

    const byField = Object.fromEntries(compareCandidates(gateway, candidates).map((c) => [c.field, c]));

    assert.deepEqual(byField.openaiCompatible.candidates.map((c) => c.verdict), ["matches", "differs"]);
    assert.equal(byField.modelCountClaim.candidates[0].verdict, "matches");
    assert.equal(byField.legalEntity.candidates[0].verdict, "matches");
    assert.equal(byField.certifications.candidates[0].verdict, "differs");
    assert.equal(byField.gatewayRegions.candidates[0].verdict, "dataset-empty");
    assert.equal(byField.euResidencyClaim.candidates[0].verdict, "review");
    assert.equal(byField.governingLaw.candidates[0].verdict, "no-dataset-field");
    // No endpoint figure is recorded, so the route count is shown for comparison.
    assert.equal(byField.endpointCountClaim.datasetValue, "972 (routes)");
    assert.equal(byField.endpointCountClaim.candidates[0].verdict, "matches");
  });

  it("skips fields with no claims", () => {
    const candidates = emptyCandidates("example", "Example", "2026-09-21");
    candidates.fields.certifications = [];
    assert.deepEqual(compareCandidates(gateway, candidates), []);
  });
});
