# SearchWebForRootCausesProcessor

This class extends `SearchWebProcessor` to implement the functionality for searching the web for root causes related to a problem statement. It manages the search process, including handling API rate limits and storing search results.

## Properties

| Name           | Type   | Description               |
|----------------|--------|---------------------------|
| searchCounter  | number | Tracks the number of searches performed. |

## Methods

| Name        | Parameters | Return Type | Description |
|-------------|------------|-------------|-------------|
| searchWeb   |            | Promise<void> | Performs the web search for root causes based on predefined queries and stores the results. |
| process     |            | Promise<void> | Initiates the search process and logs the progress and completion of the search for root causes. |

## Example

```javascript
import { SearchWebForRootCausesProcessor } from '@policysynth/agents/problems/web/searchWebForRootCauses.js';

const searchProcessor = new SearchWebForRootCausesProcessor();
searchProcessor.process()
  .then(() => console.log('Search for root causes completed.'))
  .catch(error => console.error('Error during search for root causes:', error));
```