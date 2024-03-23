# RateWebRootCausesProcessor

This class extends `BaseProblemSolvingAgent` to rate web root causes.

## Properties

| Name                        | Type                              | Description |
|-----------------------------|-----------------------------------|-------------|
| rootCauseWebPageVectorStore | RootCauseWebPageVectorStore       | Instance of `RootCauseWebPageVectorStore` used for storing and retrieving web page vectors. |

## Methods

| Name                    | Parameters                                                                                                      | Return Type | Description |
|-------------------------|-----------------------------------------------------------------------------------------------------------------|-------------|-------------|
| simplifyRootCauseType   | rootCauseType: string                                                                                           | string      | Simplifies the root cause type by removing specific substrings. |
| renderProblemPrompt     | rawWebData: PSRootCauseRawWebPageData, rootCausesToRank: string[], rootCauseType: keyof PSRootCauseRawWebPageData | Promise     | Prepares the problem prompt for the language model based on the root causes to rank. |
| rateWebRootCauses       |                                                                                                                 | Promise     | Rates all web root causes by interacting with the language model and updating the vector store. |
| process                 |                                                                                                                 | Promise     | Processes the task of rating web root causes. Initializes the chat model and handles errors. |

## Example

```javascript
import { RateWebRootCausesProcessor } from '@policysynth/agents/problems/ranking/rateWebRootCauses.js';

// Initialize the processor
const processor = new RateWebRootCausesProcessor();

// Example usage of simplifying root cause type
const simplifiedType = processor.simplifyRootCauseType('allPossibleIdentifiedInTextContextRootCause');
console.log(simplifiedType); // Output: RootCause

// Assuming existence of PSRootCauseRawWebPageData, rootCausesToRank, and rootCauseType
// Example usage of renderProblemPrompt (async call)
processor.renderProblemPrompt(rawWebData, rootCausesToRank, rootCauseType)
  .then(prompt => console.log(prompt));

// Example usage of rateWebRootCauses (async call)
processor.rateWebRootCauses()
  .then(() => console.log('Rating completed'));

// Example usage of process (async call)
processor.process()
  .then(() => console.log('Processing completed'));
```