# AnalyseExternalSolutions

This class extends `BaseProblemSolvingAgent` to analyze external solutions against specific requirements and generate reports.

## Properties

| Name       | Type   | Description               |
|------------|--------|---------------------------|
| folderPath | string | Path to save analysis results. |

## Methods

| Name                      | Parameters                                  | Return Type                                | Description                                                                 |
|---------------------------|---------------------------------------------|--------------------------------------------|-----------------------------------------------------------------------------|
| renderAnalysisPrompt      | solutionDescription: string, requirement: string | Promise<SystemMessage[] \| HumanMessage[]> | Prepares the analysis prompt for the language model.                        |
| compareSolutionToExternal | solutionDescription: string, requirement: string | Promise<PsExternalSolutionAnalysisResults> | Compares a solution to an external standard and returns analysis results.   |
| analyze                   | -                                           | Promise<void>                              | Analyzes all solutions against external standards and generates reports.    |
| toCSV                     | analysisResult: PsExternalSolutionAnalysis | string                                    | Converts analysis results into a CSV format.                                |
| processAnalysis           | folderPath: string                          | Promise<void>                              | Processes the analysis for all solutions and saves the results.             |
| saveCSV                   | analysisResults: PsExternalSolutionAnalysis[] | Promise<void>                              | Saves the analysis results in CSV format in the specified folder.           |

## Example

```typescript
import { AnalyseExternalSolutions } from '@policysynth/agents/solutions/tools/analyseExternalSolutions.js';

async function runAnalysis() {
  const folderPath = './data/analysis';
  const projectId = '123';
  const memory = { currentMemory: undefined }; // Example memory data

  const analysis = new AnalyseExternalSolutions({}, memory);
  await analysis.processAnalysis(folderPath);
}

runAnalysis();
```