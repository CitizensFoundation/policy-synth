# RankWebRootCausesProcessor

This class extends `BaseProblemSolvingAgent` to rank web root causes by processing and updating root cause data from a vector store.

## Properties

| Name                        | Type                             | Description                                       |
|-----------------------------|----------------------------------|---------------------------------------------------|
| rootCauseWebPageVectorStore | RootCauseWebPageVectorStore      | Instance of RootCauseWebPageVectorStore.          |

## Methods

| Name                  | Parameters                                                                 | Return Type       | Description                                                                                     |
|-----------------------|----------------------------------------------------------------------------|-------------------|-------------------------------------------------------------------------------------------------|
| renderProblemPrompt   | rootCausesToRank: string[], rootCauseType: keyof PSRootCauseRawWebPageData | Promise<Message[]> | Generates the problem prompt messages for ranking root causes.                                  |
| rankWebRootCauses     | -                                                                          | Promise<void>     | Processes and ranks web root causes by fetching, ranking, and updating them in the vector store.|
| process               | -                                                                          | Promise<void>     | Initializes the chat model and processes the ranking of web root causes.                        |

## Example

```typescript
import { RankWebRootCausesProcessor } from '@policysynth/agents/problems/ranking/rankWebRootCauses.js';

const processor = new RankWebRootCausesProcessor();

// Example usage to process and rank web root causes
processor.process().then(() => {
  console.log("Processing and ranking of web root causes completed.");
}).catch(error => {
  console.error("An error occurred:", error);
});
```