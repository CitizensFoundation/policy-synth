import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getSingleWebSearchTool,
  PsBuiltInToolConfigurationError,
  wrapBuiltInToolProviderError,
} from "../../aiModels/builtInToolSupport.js";

describe("built-in tool support", () => {
  it("accepts one web-search tool and rejects unsupported or duplicate tools", () => {
    const webSearch: PsBuiltInTool = {
      type: "web_search",
      includeSources: true,
    };
    assert.equal(getSingleWebSearchTool([webSearch], "Test"), webSearch);
    assert.equal(getSingleWebSearchTool(undefined, "Test"), undefined);

    assert.throws(
      () =>
        getSingleWebSearchTool(
          [{ type: "code_interpreter", container: "auto" }],
          "Test"
        ),
      (error: unknown) =>
        error instanceof PsBuiltInToolConfigurationError &&
        error.isPsNonRetryableModelError
    );
    assert.throws(
      () => getSingleWebSearchTool([webSearch, webSearch], "Test"),
      /at most one web_search/
    );
  });

  it("marks provider capability rejections as non-retryable", () => {
    const providerError = Object.assign(
      new Error("google_search is not supported for this model"),
      { status: 400 }
    );
    const wrapped = wrapBuiltInToolProviderError(
      providerError,
      "Gemini",
      true
    );
    assert.ok(wrapped instanceof PsBuiltInToolConfigurationError);
    assert.equal(wrapped.isPsNonRetryableModelError, true);

    const transient = Object.assign(new Error("service unavailable"), {
      status: 503,
    });
    assert.equal(
      wrapBuiltInToolProviderError(transient, "Gemini", true),
      transient
    );
  });
});
