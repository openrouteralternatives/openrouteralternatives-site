import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { countModels, extractModelIds } from "./count";

describe("extractModelIds", () => {
  it("reads OpenAI-style, bare arrays and provider maps", () => {
    assert.deepEqual(extractModelIds({ object: "list", data: [{ id: "a" }, { id: "b" }] }), ["a", "b"]);
    assert.deepEqual(extractModelIds(["a", { name: "b" }]), ["a", "b"]);
    assert.deepEqual(extractModelIds({ openai: ["gpt-4o"], google: ["gemini-2.5-pro"] }), [
      "openai/gpt-4o",
      "google/gemini-2.5-pro",
    ]);
  });
  it("returns null when no list can be found", () => {
    assert.equal(extractModelIds({ error: "unauthorised" }), null);
    assert.equal(extractModelIds("text"), null);
  });
});

describe("countModels", () => {
  it("applies the four steps of the counting rule and records what each removed", () => {
    const result = countModels([
      "openai/gpt-4o",
      "openai/gpt-4o",
      "azure/gpt-4o",
      "meta-llama/llama-3-70b:free",
      "meta-llama/llama-3-70b",
      "openrouter/auto",
      "anthropic/claude-sonnet-4",
    ]);
    assert.equal(result.raw, 7);
    assert.deepEqual(
      result.steps.map((s) => [s.rule.split(" ")[0], s.remaining]),
      [
        ["exact", 6],
        ["non-model", 5],
        ["routing", 4],
        ["serving-provider", 3],
      ],
    );
    assert.deepEqual(result.steps[0].removed, ["openai/gpt-4o"]);
    assert.deepEqual(result.steps[1].removed, ["openrouter/auto"]);
    assert.deepEqual(result.steps[3].removed, ["azure/gpt-4o"]);
    assert.deepEqual(result.ids, ["claude-sonnet-4", "gpt-4o", "llama-3-70b"]);
    assert.equal(result.final, 3);
  });

  it("can keep prefixes when they name the author rather than the serving provider", () => {
    const result = countModels(["a/model", "b/model"], { collapsePrefixes: false });
    assert.equal(result.final, 2);
    assert.equal(result.steps.length, 3);
  });
});
