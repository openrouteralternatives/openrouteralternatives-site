import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { baseHost, classify, selectPages } from "./discover";

describe("classify", () => {
  it("recognises pricing, legal, security and documentation paths", () => {
    assert.equal(classify("https://example.com/pricing"), "pricing");
    assert.equal(classify("https://example.com/legal/privacy-policy"), "legal");
    assert.equal(classify("https://example.com/trust"), "security");
    assert.equal(classify("https://docs.example.com/quickstart"), "documentation");
    assert.equal(classify("https://example.com/blog/hello"), null);
  });
});

describe("selectPages", () => {
  it("keeps same-site pages the dataset does not cite, one of each kind first", () => {
    const links = [
      "https://example.com/pricing/",
      "https://example.com/pricing/enterprise",
      "https://cdn.other.com/pricing",
      "https://example.com/terms",
      "https://docs.example.com/",
      "https://example.com/blog",
      "https://example.com/security",
      "https://example.com/pricing#faq",
    ];
    const cited = new Set(["https://example.com/terms"]);
    const pages = selectPages(links, "https://example.com", cited, 3);
    // One page per kind before any second page of a kind; the cited terms
    // page, the other host and the blog are excluded.
    assert.deepEqual(pages.map((p) => p.kind).sort(), ["documentation", "pricing", "security"]);
    // The shallow /pricing wins over /pricing/enterprise, and the fragment and
    // trailing-slash variants collapse into it.
    assert.equal(pages.find((p) => p.kind === "pricing")?.url, "https://example.com/pricing");
  });
  it("treats subdomains as the same site", () => {
    assert.equal(baseHost("https://docs.example.com/x"), "example.com");
  });
});
