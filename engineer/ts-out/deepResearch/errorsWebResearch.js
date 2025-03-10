import { PsEngineerBaseWebResearchAgent } from "./baseResearchAgent.js";
export class PsEngineerErrorWebResearchAgent extends PsEngineerBaseWebResearchAgent {
    numberOfQueriesToGenerate = 8;
    percentOfQueriesToSearch = 0.2;
    percentOfResultsToScan = 0.2;
    maxTopContentResultsToUse = 3;
    searchInstructions = "Extract relevant potential solutions typescript documentation from web pages for a given task and typescript/javascript npm modules. \
  Only extract information that is highly relevant to the task.";
    scanType = "solutionsForErrors";
    rankingInstructions = "Rank the documentation based on relevance to the task.";
    scanningSystemPrompt = "Extract relevant potential solutions typescript documentation from <TextContext> for a given task.";
}
//# sourceMappingURL=errorsWebResearch.js.map