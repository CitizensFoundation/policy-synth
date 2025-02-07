# FirecrawlScrapeAgent

The `FirecrawlScrapeAgent` class is a specialized agent that extends the `PolicySynthAgent` class. It is designed to scrape web pages using the Firecrawl service, with additional functionality to filter out legal documents like privacy policies or terms of service.

## Properties

| Name             | Type                      | Description                                                                 |
|------------------|---------------------------|-----------------------------------------------------------------------------|
| needsAiModel     | boolean                   | Indicates if the agent requires an AI model.                                |
| app              | FirecrawlApp              | An instance of the Firecrawl application used for web scraping.             |
| crawlPageLimit   | number                    | The maximum number of pages to crawl. Default is set to 50.                 |

## Constructor

### FirecrawlScrapeAgent

Creates an instance of the `FirecrawlScrapeAgent`.

#### Parameters

- `agent: PsAgent` - The agent configuration.
- `memory: PsAgentMemoryData | undefined` - The memory data for the agent.
- `startProgress: number` - The starting progress value.
- `endProgress: number` - The ending progress value.

## Methods

### getDomainAndPath

Extracts the primary domain and path from a given URL.

#### Parameters

- `url: string` - The URL to extract the domain and path from.

#### Returns

- `string` - The extracted domain and path.

### checkIfLegalOrPrivacyPolicy

Determines if a given document is solely a legal privacy policy or terms of service.

#### Parameters

- `document: string` - The document to analyze.

#### Returns

- `Promise<PrivacyPolicyCheckResult>` - The result indicating if the document is only a privacy policy or terms of service.

### scrapeUrl

Scrapes a URL using Firecrawl. Handles rate limits by retrying after a specified time.

#### Parameters

- `url: string` - The URL to scrape.
- `formats: ("markdown" | "html" | "rawHtml" | "content" | "links" | "screenshot" | "screenshot@fullPage" | "extract")[]` - An array of formats to request. Default is `["markdown", "rawHtml"]`.
- `maxRetries: number` - Maximum number of retries upon rate limits. Default is 3.
- `skipImages: boolean` - Whether to skip images during scraping. Default is false.
- `crawlIfDomainIs: string | undefined` - Only crawl if the domain matches this value.

#### Returns

- `Promise<any>` - The scrape response from Firecrawl.

## Example

```typescript
import { FirecrawlScrapeAgent } from '@policysynth/agents/deepResearch/fireCrawlApi.js';
import { PsAgent } from '../dbModels/agent.js';

// Example usage of FirecrawlScrapeAgent
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

This documentation provides a detailed overview of the `FirecrawlScrapeAgent` class, its properties, constructor, methods, and an example of how to use it.