# SearchQueriesGenerator

The `SearchQueriesGenerator` class is designed to generate high-quality search queries based on a given research question. It extends the `PolicySynthSimpleAgentBase` class and utilizes a language model to generate the queries.

## Properties

| Name                | Type   | Description                                                                 |
|---------------------|--------|-----------------------------------------------------------------------------|
| systemPrompt        | string | The system prompt used to instruct the language model.                      |
| userPrompt          | string | The user prompt containing the research question.                           |
| maxModelTokensOut   | number | The maximum number of tokens the model can output. Default is 4096.         |
| modelTemperature    | number | The temperature setting for the model, affecting the randomness of outputs. Default is 0.75. |

## Constructor

### `constructor(memory: PsSimpleAgentMemoryData, numberOfQueriesToGenerate: number, question: string, overRideSystemPrompt?: string, overRideUserPrompt?: string)`

Creates an instance of the `SearchQueriesGenerator` class.

| Parameter               | Type                     | Description                                                                                     |
|-------------------------|--------------------------|-------------------------------------------------------------------------------------------------|
| memory                  | PsSimpleAgentMemoryData  | The memory data for the agent.                                                                  |
| numberOfQueriesToGenerate | number                   | The number of search queries to generate.                                                       |
| question                | string                   | The research question for which to generate search queries.                                     |
| overRideSystemPrompt    | string (optional)        | An optional system prompt to override the default.                                              |
| overRideUserPrompt      | string (optional)        | An optional user prompt to override the default.                                                |

## Methods

### `async renderMessages(): Promise<string[]>`

Renders the system and user messages to be sent to the language model.

**Returns:** 
- `Promise<string[]>`: An array of messages to be sent to the language model.

### `async generateSearchQueries(): Promise<string[]>`

Generates search queries based on the provided research question.

**Returns:** 
- `Promise<string[]>`: A promise that resolves to an array of generated search queries.

## Example

```typescript
import { SearchQueriesGenerator } from '@policysynth/agents/webResearch/searchQueriesGenerator.js';

const memory = {}; // Assume this is a valid PsSimpleAgentMemoryData object
const numberOfQueriesToGenerate = 5;
const question = "What are the impacts of climate change on polar bears?";

const searchQueriesGenerator = new SearchQueriesGenerator(memory, numberOfQueriesToGenerate, question);

searchQueriesGenerator.generateSearchQueries().then((queries) => {
  console.log(queries);
});
```

This example demonstrates how to create an instance of the `SearchQueriesGenerator` class and generate search queries for a given research question.