import { PsEngineerBaseWebResearchAgent } from "./baseResearchAgent.js";
export class PsEngineerDocsWebResearchAgent extends PsEngineerBaseWebResearchAgent {
    searchInstructions = "Extract documentation from web pages for a given task and npm modules. Only extract information that is highly relevant to the task. If npm modules are provided focus on finding official documentation covering the task the user presents.";
    scanType = "documentation";
}
//# sourceMappingURL=documentationWebResearch.js.map