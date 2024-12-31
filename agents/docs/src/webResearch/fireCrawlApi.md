# FirecrawlScrapeAgent

The `FirecrawlScrapeAgent` class is a specialized agent for scraping web pages using the Firecrawl service. It extends the `PolicySynthAgent` and provides functionality to scrape URLs, handle rate limits, and filter out legal or privacy policy documents.

## Properties

| Name             | Type                  | Description                                                                 |
|------------------|-----------------------|-----------------------------------------------------------------------------|
| needsAiModel     | boolean               | Indicates if the agent requires an AI model.                                |
| app              | FirecrawlApp          | An instance of the Firecrawl application used for web scraping.             |
| crawlPageLimit   | number                | The maximum number of pages to crawl. Default is 75.                        |

## Constructor

### FirecrawlScrapeAgent

Creates an instance of the `FirecrawlScrapeAgent`.

#### Parameters

- `agent: PsAgent` - The agent configuration.
- `memory: PsAgentMemoryData | undefined` - The memory data for the agent.
- `startProgress: number` - The starting progress value.
- `endProgress: number` - The ending progress value.

#### Throws

- `Error` - If the `FIRECRAWL_API_KEY` environment variable is missing.

## Methods

### getDomainAndPath

Extracts the primary domain and path from a given URL.

#### Parameters

- `url: string` - The URL to extract the domain and path from.

#### Returns

- `string` - The extracted domain and path.

### checkIfLegalOrPrivacyPolicy

Checks if a document is solely a legal privacy policy or terms of service.

#### Parameters

- `document: string` - The document to analyze.

#### Returns

- `Promise<PrivacyPolicyCheckResult>` - The result indicating if the document is only a privacy policy or terms of service.

### scrapeUrl

Scrapes a URL using Firecrawl. Handles rate limits and retries if necessary.

#### Parameters

- `url: string` - The URL to scrape.
- `formats: ("markdown" | "html" | "rawHtml" | "content" | "links" | "screenshot" | "screenshot@fullPage" | "extract")[]` - An array of formats to request. Default is `["markdown", "rawHtml"]`.
- `maxRetries: number` - Maximum number of retries upon rate limits. Default is 3.
- `skipImages: boolean` - Whether to skip images during scraping. Default is false.
- `crawlIfDomainIs: string | undefined` - Only crawl if the domain matches this value.

#### Returns

- `Promise<any>` - The scrape response from Firecrawl.

#### Throws

- `Error` - If scraping fails after the maximum number of retries.

## Example

```typescript
import { FirecrawlScrapeAgent } from '@policysynth/agents/webResearch/fireCrawlApi.js';
import { PsAgent } from '../dbModels/agent.js';

const agent = new PsAgent(/* agent configuration */);
const memory = undefined; // or some PsAgentMemoryData
const startProgress = 0;
const endProgress = 100;

const firecrawlAgent = new FirecrawlScrapeAgent(agent, memory, startProgress, endProgress);

firecrawlAgent.scrapeUrl('https://example.com', ['markdown', 'html'])
  .then(response => {
    console.log('Scrape successful:', response);
  })
  .catch(error => {
    console.error('Scrape failed:', error);
  });
```

This class provides a robust mechanism for scraping web pages while handling rate limits and filtering out unwanted content. It leverages the Firecrawl service for efficient web scraping.