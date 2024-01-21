# ReduceSubProblemsProcessor

The `ReduceSubProblemsProcessor` class is responsible for reducing a list of sub-problems by selecting the top sub-problems that are not duplicates and represent a wide range of issues. It extends the `BaseProcessor` class.

## Properties

| Name     | Type   | Description               |
|----------|--------|---------------------------|
| chat     | ChatOpenAI | Instance of ChatOpenAI used for communication with OpenAI's language model. |

## Methods

| Name                  | Parameters                          | Return Type       | Description                                                                 |
|-----------------------|-------------------------------------|-------------------|-----------------------------------------------------------------------------|
| renderSelectPrompt    | problemStatement: string, subProblemsToConsider: IEngineSubProblem[] | Promise<HumanMessage[]> | Generates the prompt messages for selecting sub-problems.                   |
| reduceSubProblems     | subProblemsToConsider: IEngineSubProblem[] | Promise<void>    | Reduces the list of sub-problems by removing solutions and duplicates.      |
| process               | None                                | Promise<void>    | Orchestrates the process of reducing sub-problems and updates the memory.   |

## Examples

```typescript
// Example usage of ReduceSubProblemsProcessor
const processor = new ReduceSubProblemsProcessor();
const subProblemsToConsider: IEngineSubProblem[] = [
  // ... array of sub-problems with their details
];
await processor.reduceSubProblems(subProblemsToConsider);
```