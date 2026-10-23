import test from "node:test";
import assert from "node:assert/strict";
import {
  FirecrawlSearchApi,
  selectSearchProvider,
} from "../../deepResearch/firecrawlSearchApi.js";

test("Firecrawl is selectable alongside Google and Bing without changing existing priority", () => {
  const env = {
    GOOGLE_SEARCH_API_KEY: "google",
    GOOGLE_SEARCH_API_CX_ID: "cx",
    AZURE_BING_SEARCH_KEY: "bing",
    FIRECRAWL_API_KEY: "firecrawl",
  };
  assert.equal(selectSearchProvider(env), "google");
  assert.equal(
    selectSearchProvider({ ...env, PS_SEARCH_PROVIDER: "firecrawl" }),
    "firecrawl",
  );
  assert.equal(
    selectSearchProvider({ FIRECRAWL_API_KEY: "fixture" }),
    "firecrawl",
  );
  assert.throws(() =>
    selectSearchProvider({ ...env, PS_SEARCH_PROVIDER: "invalid" }),
  );
  assert.throws(() =>
    selectSearchProvider({
      PS_SEARCH_PROVIDER: "firecrawl",
      AZURE_BING_SEARCH_KEY: "bing",
    }),
  );
});
test("search-only adapter preserves result contract, date filters and actual credits", async () => {
  let calls = 0;
  const api = new FirecrawlSearchApi("fixture-key", async (url, init) => {
    calls++;
    assert.equal(url, "https://api.firecrawl.dev/v2/search");
    const body = JSON.parse(String(init?.body));
    assert.equal(
      body.query,
      "Idaho nursing before:2026-10-16 after:2025-01-01",
    );
    assert.equal(body.tbs, "qdr:d7,sbd:1");
    assert.equal(body.scrapeOptions, undefined);
    assert.equal(body.limit, 3);
    return Response.json({
      success: true,
      creditsUsed: 2,
      id: "provider-1",
      data: {
        web: [
          {
            url: "https://example.gov/license",
            title: "License",
            description: "Qualifications",
          },
        ],
      },
    });
  });
  const result = await api.searchWithUsage("Idaho nursing", 3, {
    before: "2026-10-16",
    after: "2025-01-01",
    dateRestrict: "d7",
    sort: "date",
  });
  assert.deepEqual(result.results, [
    {
      url: "https://example.gov/license",
      title: "License",
      description: "Qualifications",
      date: "",
      originalPosition: 1,
    },
  ]);
  assert.equal(result.usage.creditsUsed, 2);
  assert.equal(result.usage.requestId, "provider-1");
  assert.equal(api.usage.length, 1);
  await assert.rejects(api.search("q", 101));
  await assert.rejects(api.search("q", 1, { before: "2026-02-30" }));
  assert.equal(calls, 1);
});
test("ambiguous failures retain unknown usage, never retry and do not expose credentials", async () => {
  for (const response of [undefined, { success: true, data: { web: [] } }]) {
    let calls = 0;
    const api = new FirecrawlSearchApi("secret-fixture", async () => {
      calls++;
      if (!response) throw new Error("transport secret-fixture");
      return Response.json(response);
    });
    await assert.rejects(api.search("q", 1), (error) => {
      assert.ok(error instanceof Error);
      assert.ok(!error.message.includes("secret-fixture"));
      return true;
    });
    assert.equal(calls, 1);
    assert.equal(api.usage[0].creditsUsed, null);
  }
});
