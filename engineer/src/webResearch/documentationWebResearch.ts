import { PsEngineerBaseWebResearchAgent } from "./baseResearchAgent.js";

export class PsEngineerDocsWebResearchAgent extends PsEngineerBaseWebResearchAgent {
  searchInstructions = "Extract relevant typescript documentation from web pages for a given task and typesscript/javascript npm modules. Only extract information that is highly relevant to the task. If npm modules are provided to you focus on finding official documentation covering the task the user presents.";
  scanType: "codeExamples" | "documentation" = "documentation";
}