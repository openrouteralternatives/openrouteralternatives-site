import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hasFlag, parseNumberFlag, parseSlugFilter, parseStringFlag, parseStringFlags } from "./args";

describe("parseSlugFilter", () => {
  it("accepts comma lists and repeated flags", () => {
    assert.deepEqual(parseSlugFilter(["--gateway", "a,b", "--gateway", "c"]), ["a", "b", "c"]);
  });
  it("accepts the inline form and trims whitespace", () => {
    assert.deepEqual(parseSlugFilter(["--gateway=a, b ,,"]), ["a", "b"]);
  });
  it("returns an empty list when absent", () => {
    assert.deepEqual(parseSlugFilter(["--limit", "3"]), []);
  });
});

describe("parseNumberFlag", () => {
  it("reads spaced and inline forms", () => {
    assert.equal(parseNumberFlag(["--limit", "5"], "--limit"), 5);
    assert.equal(parseNumberFlag(["--limit=7"], "--limit"), 7);
  });
  it("returns undefined for missing or non-numeric values", () => {
    assert.equal(parseNumberFlag([], "--limit"), undefined);
    assert.equal(parseNumberFlag(["--limit", "many"], "--limit"), undefined);
  });
});

describe("parseStringFlag / parseStringFlags / hasFlag", () => {
  it("does not swallow the next flag as a value", () => {
    assert.equal(parseStringFlag(["--url", "--dry"], "--url"), undefined);
  });
  it("collects every occurrence of a repeatable flag", () => {
    assert.deepEqual(parseStringFlags(["--header", "a: 1", "--header=b: 2"], "--header"), ["a: 1", "b: 2"]);
  });
  it("detects boolean switches", () => {
    assert.equal(hasFlag(["--dry"], "--dry"), true);
    assert.equal(hasFlag([], "--dry"), false);
  });
});
