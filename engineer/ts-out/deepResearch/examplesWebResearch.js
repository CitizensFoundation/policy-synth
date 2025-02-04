import { PsEngineerBaseWebResearchAgent } from "./baseResearchAgent.js";
export class PsEngineerExamplesWebResearchAgent extends PsEngineerBaseWebResearchAgent {
    searchInstructions = "We are looking for source code examples from web pages for a the task given by the user and npm modules, if any.";
    scanType = "codeExamples";
    rankingInstructions = "Rank the source code examples based on relevance to the task.";
    scanningSystemPrompt = "Extract source code examples from <TextContext> for a the task given by the user.";
}
//# sourceMappingURL=examplesWebResearch.js.map