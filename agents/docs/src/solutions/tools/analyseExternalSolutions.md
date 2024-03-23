# AnalyseExternalSolutions

This class extends `BaseProblemSolvingAgent` to analyze external solutions against specific requirements and generate analysis reports.

## Properties

| Name       | Type   | Description               |
|------------|--------|---------------------------|
| folderPath | string | Path to save analysis reports. |

## Methods

| Name                      | Parameters                                      | Return Type                                      | Description                                                                 |
|---------------------------|-------------------------------------------------|--------------------------------------------------|-----------------------------------------------------------------------------|
| renderAnalysisPrompt      | solutionDescription: string, requirement: string | Promise<SystemMessage[] \| HumanMessage[]>       | Prepares the analysis prompt for the language model based on a solution and a requirement. |
| compareSolutionToExternal | solutionDescription: string, requirement: string | Promise<IEngineExternalSolutionAnalysisResults>  | Compares a solution description to an external solution based on a requirement. |
| analyze                   | -                                               | Promise<void>                                    | Analyzes external solutions against requirements and generates analysis results. |
| toCSV                     | analysisResult: IEngineExternalSolutionAnalysis | string                                           | Converts analysis results into a CSV format string. |
| processAnalysis           | folderPath: string                              | Promise<void>                                    | Initializes the analysis process with a specified folder path for saving reports. |
| saveCSV                   | analysisResults: IEngineExternalSolutionAnalysis[] | Promise<void>                                  | Saves analysis results as CSV files in the specified folder path. |

## Example

```typescript
import { AnalyseExternalSolutions } from '@policysynth/agents/solutions/tools/analyseExternalSolutions.js';
import ioredis from "ioredis";
import { PsBaseMemoryData } from "path/to/PsBaseMemoryDataDefinition";

const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");

async function run() {
  const projectId = process.argv[2];
  const folderPath = process.argv[3];

  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!) as PsBaseMemoryData;

    const analysis = new AnalyseExternalSolutions({} as any, memory);
    await analysis.processAnalysis(folderPath);
    process.exit(0);
  } else {
    console.log("No project id provided - analyse external solutions");
    process.exit(1);
  }
}

run();
```