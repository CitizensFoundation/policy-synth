# SearchWebForRootCausesProcessor

This class extends `SearchWebProcessor` to specifically handle the searching of web data for root causes related to a problem statement. It manages API rate limits, logs search activities, and stores search results.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| searchCounter | number | Counter for the number of searches performed. |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| searchWeb  | -                 | Promise<void> | Performs web searches for root causes, handles API rate limits, and logs activities. |
| process    | -                 | Promise<void> | Initiates the process of searching for root causes on the web and logs the process flow. |

## Example

```typescript
import { SearchWebForRootCausesProcessor } from '@policysynth/agents/problems/web/searchWebForRootCauses.js';

const searchProcessor = new SearchWebForRootCausesProcessor();
await searchProcessor.process();
```