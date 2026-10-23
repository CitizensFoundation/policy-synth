/** Search-only Firecrawl v2 adapter, alongside GoogleSearchApi and BingSearchApi.
 * https://docs.firecrawl.dev/api-reference/endpoint/search
 * No automatic retries: a lost response may already have consumed credits.
 */
export interface FirecrawlSearchUsage {
  provider: "firecrawl";
  operation: "search";
  creditsUsed: number | null;
  requestId?: string;
  resultCount: number;
  at: string;
}

export class FirecrawlSearchApi {
  readonly needsAiModel = false;
  readonly usage: FirecrawlSearchUsage[] = [];
  constructor(
    private readonly apiKey = process.env.FIRECRAWL_API_KEY,
    private readonly request: typeof fetch = fetch,
  ) {}

  async search(
    query: string,
    numberOfResults: number,
    options: PsSearchOptions = {},
  ): Promise<PsSearchResultItem[]> {
    return (await this.searchWithUsage(query, numberOfResults, options))
      .results;
  }

  async searchWithUsage(
    query: string,
    numberOfResults: number,
    options: PsSearchOptions = {},
  ) {
    if (!this.apiKey?.trim())
      throw new Error("Missing FIRECRAWL_API_KEY environment variable");
    if (
      !Number.isInteger(numberOfResults) ||
      numberOfResults < 1 ||
      numberOfResults > 100
    )
      throw new Error("Firecrawl search requires 1–100 results");
    const date = (value: string) => {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        !Number.isFinite(Date.parse(value)) ||
        new Date(value).toISOString().slice(0, 10) !== value
      )
        throw new Error("Search dates must use valid YYYY-MM-DD dates");
      return value;
    };
    if (options.before) query += ` before:${date(options.before)}`;
    if (options.after) query += ` after:${date(options.after)}`;
    if (!query.trim() || query.length > 500)
      throw new Error("Firecrawl query must contain 1–500 characters");
    const filters: string[] = [];
    if (options.dateRestrict) {
      const match = /^([dwmy])([1-9]\d{0,3})$/.exec(options.dateRestrict);
      if (!match)
        throw new Error(
          "Unsupported Firecrawl dateRestrict; use d7, w2, m1 or y1",
        );
      filters.push(`qdr:${match[1]}${match[2]}`);
    }
    if (options.sort) {
      if (options.sort === "date") filters.push("sbd:1");
      else {
        const match =
          /^date:r:(\d{4})(\d{2})(\d{2}):(\d{4})(\d{2})(\d{2})$/.exec(
            options.sort,
          );
        if (!match || options.dateRestrict)
          throw new Error("Unsupported or conflicting Firecrawl date sort");
        const from = date(`${match[1]}-${match[2]}-${match[3]}`);
        const to = date(`${match[4]}-${match[5]}-${match[6]}`);
        if (from > to) throw new Error("Search date range is reversed");
        filters.push(
          `cdr:1,cd_min:${match[2]}/${match[3]}/${match[1]},cd_max:${match[5]}/${match[6]}/${match[4]}`,
        );
      }
    }
    const usage: FirecrawlSearchUsage = {
      provider: "firecrawl",
      operation: "search",
      creditsUsed: null,
      resultCount: 0,
      at: new Date().toISOString(),
    };
    this.usage.push(usage);
    try {
      const response = await this.request(
        "https://api.firecrawl.dev/v2/search",
        {
          method: "POST",
          signal: AbortSignal.timeout(90_000),
          headers: {
            authorization: `Bearer ${this.apiKey}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            query,
            limit: numberOfResults,
            sources: ["web"],
            ...(filters.length ? { tbs: filters.join(",") } : {}),
          }),
        },
      );
      if (!response.ok)
        throw new Error(
          `Firecrawl search failed (HTTP ${response.status}); outcome may need reconciliation`,
        );
      // Bound the response while receiving. Never log headers or provider error bodies.
      if (!response.body)
        throw new Error("Firecrawl returned no response body");
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 2 * 1024 * 1024)
            throw new Error("Firecrawl search response exceeds 2 MiB");
          chunks.push(value);
        }
      } finally {
        await reader.cancel().catch(() => undefined);
        reader.releaseLock();
      }
      const payload = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
        success?: boolean;
        creditsUsed?: unknown;
        id?: unknown;
        data?: {
          web?: {
            url?: unknown;
            title?: unknown;
            description?: unknown;
            date?: unknown;
          }[];
        };
      };
      if (
        typeof payload.creditsUsed === "number" &&
        Number.isSafeInteger(payload.creditsUsed) &&
        payload.creditsUsed >= 0
      )
        usage.creditsUsed = payload.creditsUsed;
      if (typeof payload.id === "string") usage.requestId = payload.id;
      if (
        payload.success !== true ||
        !Array.isArray(payload.data?.web) ||
        usage.creditsUsed === null
      )
        throw new Error(
          "Firecrawl search response or credit usage is incomplete; reconcile before retrying",
        );
      const results: PsSearchResultItem[] = payload.data.web
        .slice(0, numberOfResults)
        .map((item, index) => {
          if (
            typeof item.url !== "string" ||
            !/^https?:$/.test(new URL(item.url).protocol)
          )
            throw new Error("Invalid Firecrawl search result URL");
          return {
            url: item.url,
            title: String(item.title ?? ""),
            description: String(item.description ?? ""),
            date: typeof item.date === "string" ? item.date : "",
            originalPosition: index + 1,
          };
        });
      usage.resultCount = results.length;
      return { results, usage: { ...usage } };
    } catch {
      // Some HTTP implementations attach authorization/config to thrown errors.
      throw new Error(
        "Firecrawl search failed or returned incomplete data; inspect recorded credit usage before retrying",
      );
    }
  }
}

/** Preserve existing automatic priority, with an explicit provider override. */
export function selectSearchProvider(
  env: NodeJS.ProcessEnv = process.env,
): "google" | "bing" | "firecrawl" {
  const available = {
    google: !!(env.GOOGLE_SEARCH_API_KEY && env.GOOGLE_SEARCH_API_CX_ID),
    bing: !!env.AZURE_BING_SEARCH_KEY,
    firecrawl: !!env.FIRECRAWL_API_KEY,
  };
  const requested = env.PS_SEARCH_PROVIDER;
  if (requested) {
    if (
      !(
        requested === "google" ||
        requested === "bing" ||
        requested === "firecrawl"
      )
    )
      throw new Error("PS_SEARCH_PROVIDER must be google, bing or firecrawl");
    if (!available[requested])
      throw new Error(
        `Missing credentials for selected search provider: ${requested}`,
      );
    return requested;
  }
  if (available.google) return "google";
  if (available.bing) return "bing";
  if (available.firecrawl) return "firecrawl";
  throw new Error("Missing search API key");
}
