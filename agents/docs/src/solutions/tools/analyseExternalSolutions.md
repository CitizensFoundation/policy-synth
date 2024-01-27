# AnalyseExternalSolutions

This class extends `BaseProlemSolvingAgent` to analyze external solutions against specific requirements and generate analysis reports.

## Properties

| Name       | Type   | Description               |
|------------|--------|---------------------------|
| folderPath | string | Path to save analysis reports. |

## Methods

| Name                      | Parameters                                      | Return Type                                      | Description                                                                 |
|---------------------------|-------------------------------------------------|--------------------------------------------------|-----------------------------------------------------------------------------|
| renderAnalysisPrompt      | solutionDescription: string, requirement: string | Promise<SystemMessage[] \| HumanMessage[]>       | Prepares the analysis prompt for the language model.                        |
| compareSolutionToExternal | solutionDescription: string, requirement: string | Promise<IEngineExternalSolutionAnalysisResults>  | Compares a solution to external solutions and returns the analysis results. |
| analyze                   | -                                               | Promise<void>                                    | Analyzes external solutions against requirements.                           |
| toCSV                     | analysisResult: IEngineExternalSolutionAnalysis | string                                           | Converts analysis results to CSV format.                                    |
| processAnalysis           | folderPath: string                              | Promise<void>                                    | Processes the analysis for a given folder path.                             |
| saveCSV                   | analysisResults: IEngineExternalSolutionAnalysis[] | Promise<void>                                   | Saves analysis results as CSV files in the specified folder.                |

## Example

```javascript
// Example usage of AnalyseExternalSolutions
import { AnalyseExternalSolutions } from '@policysynth/agents/solutions/tools/analyseExternalSolutions.js';

async function exampleRun() {
  const folderPath = './analysisReports';
  const projectId = 'your_project_id_here';
  const redisOutput = await redis.get(`st_mem:${projectId}:id`);
  const memory = JSON.parse(redisOutput) as PsBaseMemoryData;

  const analysis = new AnalyseExternalSolutions({} as any, memory);
  await analysis.processAnalysis(folderPath);
}

exampleRun();
```