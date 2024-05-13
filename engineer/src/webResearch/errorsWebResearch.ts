import { PsEngineerBaseWebResearchAgent } from "./baseResearchAgent.js";

export class PsEngineerErrorWebResearchAgent extends PsEngineerBaseWebResearchAgent {
  numberOfQueriesToGenerate = 8;
  percentOfQueriesToSearch = 0.2;
  percentOfResultsToScan = 0.2;
  maxTopContentResultsToUse = 3;

  searchInstructions = "Extract relevant potential solutions typescript documentation from web pages for a given task and typescript/javascript npm modules. \
  Only extract information that is highly relevant to the task.";
  scanType: PsEngineerWebResearchTypes = "solutionsForErrors";
}