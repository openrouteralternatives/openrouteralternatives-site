import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { collectClaims, emptyCandidates } from "./claims";
import type { ExtractedGateway } from "./schema";

const target = { url: "https://example.com/pricing", kind: "pricing" as const };

describe("collectClaims", () => {
  it("keeps only claims the page explicitly made, with their evidence", () => {
    const into = emptyCandidates("x", "X", "2026-09-21").fields;
    const extracted: ExtractedGateway = {
      openaiCompatible: { found: true, value: "yes", evidence: "  Fully OpenAI compatible.  " },
      modelCountClaim: { found: false },
      providerCountClaim: { found: true, value: "" },
      certifications: { found: true, value: [] },
      legalEntity: { found: true, value: "Example B.V." },
    };
    const added = collectClaims(extracted, target, "2026-09-21", into);
    assert.equal(added, 2);
    assert.deepEqual(Object.keys(into).sort(), ["legalEntity", "openaiCompatible"]);
    assert.equal(into.openaiCompatible?.[0].evidence, "Fully OpenAI compatible.");
    assert.equal(into.legalEntity?.[0].evidence, null);
    assert.equal(into.legalEntity?.[0].sourceUrl, target.url);
    assert.equal(into.legalEntity?.[0].sourceKind, "pricing");
  });

  it("keeps disagreeing pages side by side instead of resolving them", () => {
    const into = emptyCandidates("x", "X", "2026-09-21").fields;
    collectClaims({ modelCountClaim: { found: true, value: "500+" } }, target, "2026-09-21", into);
    collectClaims(
      { modelCountClaim: { found: true, value: "600+" } },
      { url: "https://example.com/docs", kind: "documentation" },
      "2026-09-21",
      into,
    );
    assert.equal(into.modelCountClaim?.length, 2);
    assert.deepEqual(
      into.modelCountClaim?.map((c) => c.value),
      ["500+", "600+"],
    );
  });
});
