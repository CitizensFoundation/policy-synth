import { PsEngineerBaseWebResearchAgent } from "./baseResearchAgent.js";
export class PsEngineerDocsWebResearchAgent extends PsEngineerBaseWebResearchAgent {
    searchInstructions = "Extract relevant typescript documentation from web pages for a given task and typescript/javascript npm modules. Only extract information that is highly relevant to the task. If npm modules are provided to you focus on finding official documentation covering the task the user presents.";
    scanType = "documentation";
    rankingInstructions = "Rank the documentation based on relevance to the task.";
    scanningSystemPrompt = "Scan the documentation for relevant information.";
}
//# sourceMappingURL=documentationWebResearch.js.map