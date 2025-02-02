import { PsEngineerBaseWebResearchAgent } from "./baseResearchAgent.js";
export class PsEngineerDocsWebResearchAgent extends PsEngineerBaseWebResearchAgent {
    searchInstructions = "We are looking for documentation that is highly relevant to the user task. If npm modules are provided to you focus on finding official documentation covering the task the user presents.";
    scanType = "documentation";
    rankingInstructions = "Rank the documentation based on relevance to the task and the context you have.";
    scanningSystemPrompt = "Extract relevant documentation from <TextContext> for a given task.";
}
//# sourceMappingURL=documentationWebResearch.js.map