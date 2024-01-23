# SearchQueriesGenerator

The `SearchQueriesGenerator` class is a specialized agent that extends the `PolicySynthAgentBase` class. It is designed to generate a set of high-quality search queries based on a given research question. The class uses the `ChatOpenAI` component to interact with an AI model and produce search queries.

## Properties

| Name                        | Type   | Description                                                                 |
|-----------------------------|--------|-----------------------------------------------------------------------------|
| systemPrompt                | string | The prompt used to instruct the AI on generating search queries.            |
| userPrompt                  | string | The prompt that contains the research question for which queries are needed.|

## Methods

| Name                   | Parameters                                             | Return Type            | Description                                                                                   |
|------------------------|--------------------------------------------------------|------------------------|-----------------------------------------------------------------------------------------------|
| constructor            | numberOfQueriesToGenerate: number, question: string, overRideSystemPrompt?: string, overRideUserPrompt?: string | none                   | Initializes a new instance of the `SearchQueriesGenerator` with the provided parameters.       |
| renderMessages         | none                                                   | Promise<SystemMessage[] \| HumanMessage[]> | Prepares the system and user messages to be sent to the AI model.                             |
| generateSearchQueries  | none                                                   | Promise<string[]>      | Generates search queries by calling the AI model with the prepared messages.                   |

## Examples

```typescript
// Example usage of SearchQueriesGenerator
const numberOfQueries = 5;
const researchQuestion = "What are the impacts of climate change on marine biodiversity?";
const searchQueriesGenerator = new SearchQueriesGenerator(numberOfQueries, researchQuestion);

searchQueriesGenerator.generateSearchQueries().then((queries) => {
  console.log(queries); // Outputs an array of search queries
});
```