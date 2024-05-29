# PsSubProblemsReportGenerator

The `PsSubProblemsReportGenerator` class is responsible for generating reports on sub-problems by summarizing and processing root causes from a CSV file. It extends the `BaseProblemSolvingAgent` class.

## Properties

| Name       | Type          | Description |
|------------|---------------|-------------|
| chat       | ChatOpenAI    | Instance of the ChatOpenAI class used for communication with the LLM. |
| logger     | any           | Logger instance for logging information, debug, and error messages. |

## Methods

| Name                        | Parameters                                                                 | Return Type                          | Description |
|-----------------------------|----------------------------------------------------------------------------|--------------------------------------|-------------|
| constructor                 | memoryData: PSMemoryData                                                   | void                                 | Initializes a new instance of the PsSubProblemsReportGenerator class. |
| renderPairwiseChoicesPrompt | items: Item[], previousSummary: string \| undefined                        | Promise<Array<HumanMessage \| SystemMessage>> | Renders a prompt for pairwise choices. |
| renderSummaryPrompt         | items: Item[], previousSummary: string \| undefined                        | Promise<Array<HumanMessage \| SystemMessage>> | Renders a prompt for summarizing items. |
| summarizeItems              | items: Item[], previousSummary: string \| undefined                        | Promise<string>                      | Summarizes the given items and returns the summary. |
| processCSV                  | filePath: string                                                           | Promise<string>                      | Processes a CSV file and returns the final summary. |
| processItemsInBatches       | items: Item[]                                                              | Promise<string>                      | Processes items in batches and returns the final summary. |
| process                     | none                                                                       | Promise<void>                        | Main process method to execute the summarization agent. |

## Example

```typescript
import { PsSubProblemsReportGenerator } from '@policysynth/agents/problems/tools/subProblemRootCausesReport.js';

const main = async () => {
  try {
    const projectId = process.argv[2];
    const fileName = `currentProject${projectId}.json`;

    // Load memory data from local file
    const fileData: string = await fs.readFile(fileName, 'utf-8');
    const memoryData = JSON.parse(fileData);

    const agent = new PsSubProblemsReportGenerator(memoryData);
    await agent.process();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error during execution: ${error.message}`);
    } else {
      console.error('Unknown error during execution');
    }
  }
};

main();
```

## Interfaces

### Item

Represents an item with details about a sub-problem.

| Name                     | Type     | Description |
|--------------------------|----------|-------------|
| title                    | string   | The title of the item. |
| description              | string   | The description of the item. |
| whyIsSubProblemImportant | string   | Explanation of why the sub-problem is important. |
| yearPublished            | number \| undefined | The year the item was published (optional). |