# GetWebPagesBaseAgent

The `GetWebPagesBaseAgent` class is designed to retrieve and process web pages, either in HTML or PDF format. It utilizes the Firecrawl API for scraping when available, and falls back to Puppeteer for HTML and PDF processing when the API is not available. The class also implements caching mechanisms to store and retrieve processed data efficiently.

## Properties

| Name             | Type                  | Description                                                                 |
|------------------|-----------------------|-----------------------------------------------------------------------------|
| firecrawlApiKey  | `string` \| `undefined` | API key for Firecrawl, used for web scraping.                               |
| firecrawlAgent   | `FirecrawlScrapeAgent` \| `undefined` | Instance of FirecrawlScrapeAgent for handling web scraping tasks.           |

## Methods

| Name                      | Parameters                                                                 | Return Type                | Description                                                                                           |
|---------------------------|----------------------------------------------------------------------------|----------------------------|-------------------------------------------------------------------------------------------------------|
| constructor               | `agent: PsAgent`, `memory: PsAgentMemoryData \| undefined`, `startProgress: number`, `endProgress: number` | `void`                     | Initializes the agent with the given parameters and sets up Firecrawl if the API key is available.    |
| generateFileName          | `url: string`, `suffix: string`                                            | `string`                   | Generates a hashed file name for caching purposes based on the URL and suffix.                       |
| getCacheDirectory         | `void`                                                                     | `string`                   | Returns the directory path for caching web pages.                                                     |
| getCachedData             | `url: string`, `suffix: string`                                            | `Promise<string[] \| string \| Buffer \| null>` | Retrieves cached data if available for the given URL and suffix.                                      |
| cacheData                 | `url: string`, `suffix: string`, `data: string \| Buffer \| string[]`      | `Promise<void>`            | Caches the given data for the specified URL and suffix.                                               |
| getAndProcessPdfFallback  | `url: string`                                                              | `Promise<string>`          | Processes PDF files using Puppeteer as a fallback if Firecrawl is not available.                      |
| getAndProcessHtmlFallback | `url: string`                                                              | `Promise<string[]>`        | Processes HTML pages using Puppeteer as a fallback if Firecrawl is not available.                     |
| getAndProcessWithFirecrawl| `url: string`, `format: PageFormat`, `crawlIfDomainIs: string \| undefined` | `Promise<string[]>`        | Processes pages using the Firecrawl API, fetching both raw HTML and markdown, and caches the results. |
| getAndProcessPage         | `url: string`, `format: PageFormat = "markdown"`, `crawlIfDomainIs: string \| undefined` | `Promise<string \| string[]>` | Public method to retrieve and process a single page, using Firecrawl or Puppeteer as appropriate.     |

## Example

```typescript
import { GetWebPagesBaseAgent } from '@policysynth/agents/webResearch/getWebPagesBase.js';

// Example usage of GetWebPagesBaseAgent
const agent = new GetWebPagesBaseAgent(psAgentInstance, memoryData, 0, 100);
const pageContent = await agent.getAndProcessPage('https://example.com', 'markdown');
console.log(pageContent);
```

This class provides a robust mechanism for fetching and processing web pages, with support for caching and multiple processing strategies based on available resources.