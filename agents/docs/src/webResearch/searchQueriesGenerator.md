# SearchQueriesGenerator

This class is responsible for generating search queries based on a given question. It extends the `PolicySynthAgentBase` class and utilizes the OpenAI API to generate queries.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| systemPrompt  | string | The system prompt used for generating queries. |
| userPrompt    | string | The user prompt based on the research question. |

## Methods

| Name                 | Parameters        | Return Type       | Description                 |
|----------------------|-------------------|-------------------|-----------------------------|
| constructor          | memory: PsSmarterCrowdsourcingMemoryData, numberOfQueriesToGenerate: number, question: string, overRideSystemPrompt?: string, overRideUserPrompt?: string | - | Initializes the generator with memory, number of queries to generate, question, and optional overrides for prompts. |
| renderMessages       | -                 | Promise<SystemMessage[] \| HumanMessage[]> | Prepares the system and user prompts as messages. |
| generateSearchQueries| -                 | Promise<string[]> | Generates search queries using the configured OpenAI model and prompts. |

## Example

```typescript
import { SearchQueriesGenerator } from '@policysynth/agents/webResearch/searchQueriesGenerator.js';
import { PsSmarterCrowdsourcingMemoryData } from '@policysynth/agents/baseAgent.js';

const memoryData: PsSmarterCrowdsourcingMemoryData = {
  // example memory data
};

const generator = new SearchQueriesGenerator(
  memoryData,
  5,
  "What are the impacts of climate change on polar bears?",
  "Optional system prompt override",
  "Optional user prompt override"
);

generator.generateSearchQueries().then(queries => {
  console.log(queries);
});
```