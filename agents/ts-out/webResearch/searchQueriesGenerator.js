import { PolicySynthSimpleAgentBase } from "../base/simpleAgent.js";
export class SearchQueriesGenerator extends PolicySynthSimpleAgentBase {
    systemPrompt;
    userPrompt;
    maxModelTokensOut = 4096;
    modelTemperature = 0.75;
    constructor(memory, numberOfQueriesToGenerate, question, overRideSystemPrompt, overRideUserPrompt) {
        super(memory);
        this.systemPrompt =
            overRideSystemPrompt ||
                `
      Given the question below, generate ${numberOfQueriesToGenerate} high quality search queries that would be useful for answering the question.

      Always output as a JSON array of strings, where each string is a search query:
        [searchQuery1, searchQuery2, ...]
    `;
        this.userPrompt = overRideUserPrompt || `Research Question: ${question}`;
    }
    async renderMessages() {
        return [
            this.createSystemMessage(this.systemPrompt),
            this.createHumanMessage(this.userPrompt),
        ];
    }
    async generateSearchQueries() {
        return await this.callLLM("create-search-queries", await this.renderMessages());
    }
}
//# sourceMappingURL=searchQueriesGenerator.js.map