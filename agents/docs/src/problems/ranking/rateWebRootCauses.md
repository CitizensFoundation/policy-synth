# RateWebRootCausesProcessor

This class extends `BaseProblemSolvingAgent` to provide functionality for rating web root causes based on their relevance and quality.

## Properties

| Name                        | Type                             | Description                                       |
|-----------------------------|----------------------------------|---------------------------------------------------|
| rootCauseWebPageVectorStore | RootCauseWebPageVectorStore      | Store for managing root cause web page vectors.   |

## Methods

| Name                   | Parameters                                                                                      | Return Type | Description                                                                 |
|------------------------|-------------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| simplifyRootCauseType  | rootCauseType: string                                                                           | string      | Simplifies the root cause type by removing specific substrings.             |
| renderProblemPrompt    | rawWebData: PSRootCauseRawWebPageData, rootCausesToRank: string[], rootCauseType: keyof PSRootCauseRawWebPageData | Promise<SystemMessage[] \| HumanMessage[]> | Prepares the problem prompt for the human message interface.                |
| rateWebRootCauses      | -                                                                                               | Promise<void> | Rates all web root causes by processing each type and updating scores.      |
| process                | -                                                                                               | Promise<void> | Processes the rating of web root causes, initializes chat configurations.   |

## Example

```typescript
import { RateWebRootCausesProcessor } from '@policysynth/agents/problems/ranking/rateWebRootCauses.js';
import { PSRootCauseRawWebPageData } from '@policysynth/agents/problems/ranking/types.js';

const processor = new RateWebRootCausesProcessor();

// Example usage of rendering a problem prompt
const exampleWebData: PSRootCauseRawWebPageData = {
  url: "https://example.com",
  someRootCauseField: ["Example Root Cause 1", "Example Root Cause 2"]
};

processor.renderProblemPrompt(exampleWebData, exampleWebData.someRootCauseField, 'someRootCauseField').then(messages => {
  messages.forEach(message => console.log(message.content));
});

// Example usage of processing ratings
processor.process().then(() => {
  console.log("Processing complete.");
}).catch(error => {
  console.error("Error during processing:", error);
});
```