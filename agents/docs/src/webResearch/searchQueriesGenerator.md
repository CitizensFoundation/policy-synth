# SearchQueriesGenerator

This class extends `PolicySynthAgentBase` to generate search queries based on a given question. It utilizes a language model to produce a specified number of high-quality search queries.

## Properties

| Name                     | Type   | Description                                                                 |
|--------------------------|--------|-----------------------------------------------------------------------------|
| systemPrompt             | string | The prompt given to the system for generating search queries.               |
| userPrompt               | string | The prompt representing the user's research question.                       |

## Methods

| Name                  | Parameters                                                                                                   | Return Type      | Description                                                                                   |
|-----------------------|--------------------------------------------------------------------------------------------------------------|------------------|-----------------------------------------------------------------------------------------------|
| constructor           | memory: PsBaseMemoryData, numberOfQueriesToGenerate: number, question: string, overRideSystemPrompt?: string, overRideUserPrompt?: string | None             | Initializes the class with memory, number of queries to generate, question, and optional prompts. |
| renderMessages        | None                                                                                                         | Promise<Message[]> | Prepares system and human messages based on the prompts.                                      |
| generateSearchQueries | None                                                                                                         | Promise<string[]> | Generates search queries using the language model based on the provided question.             |

## Example

```typescript
import { SearchQueriesGenerator } from '@policysynth/agents/webResearch/searchQueriesGenerator.js';
import { PsBaseMemoryData } from 'path/to/PsBaseMemoryData';

const memoryData: PsBaseMemoryData = /* Initialize memory data */;
const numberOfQueries = 5;
const question = "What are the impacts of climate change on polar bears?";

const searchQueriesGenerator = new SearchQueriesGenerator(memoryData, numberOfQueries, question);

searchQueriesGenerator.generateSearchQueries().then((queries) => {
  console.log(queries);
});
```