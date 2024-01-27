# RankWebRootCausesProcessor

This class extends `BaseProlemSolvingAgent` to rank web root causes by importance to a problem statement. It utilizes a vector store for root cause web pages and leverages language models for processing and ranking.

## Properties

| Name                         | Type                                  | Description                                      |
|------------------------------|---------------------------------------|--------------------------------------------------|
| rootCauseWebPageVectorStore  | RootCauseWebPageVectorStore           | Instance of RootCauseWebPageVectorStore.         |

## Methods

| Name                  | Parameters                                                                                   | Return Type                  | Description                                                                                   |
|-----------------------|----------------------------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------------------------|
| renderProblemPrompt   | rootCausesToRank: string[], rootCauseType: keyof PSRootCauseRawWebPageData                   | Promise<SystemMessage[]>    | Generates the problem prompt for the language model to filter and rank root causes.          |
| rankWebRootCauses     |                                                                                              | Promise<void>               | Iterates over root cause types, retrieves web pages, and ranks root causes using a language model. |
| process               |                                                                                              | Promise<void>               | Initializes the chat model and starts the process of ranking web root causes.                |

## Example

```javascript
import { RankWebRootCausesProcessor } from '@policysynth/agents/problems/ranking/rankWebRootCauses.js';

// Initialize the processor with necessary configurations
const processor = new RankWebRootCausesProcessor();

// Example method call to start the process
processor.process().then(() => {
  console.log("Finished ranking all web root causes");
}).catch(error => {
  console.error("Error during ranking process:", error);
});
```