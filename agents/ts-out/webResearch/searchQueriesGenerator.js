import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PolicySynthAgentBase } from "../baseAgent.js";
import { PsConstants } from "../constants.js";
export class SearchQueriesGenerator extends PolicySynthAgentBase {
    systemPrompt;
    userPrompt;
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
        this.chat = new ChatOpenAI({
            temperature: PsConstants.createSearchQueriesModel.temperature,
            maxTokens: PsConstants.createSearchQueriesModel.maxOutputTokens,
            modelName: PsConstants.createSearchQueriesModel.name,
            verbose: PsConstants.createSearchQueriesModel.verbose,
        });
    }
    async renderMessages() {
        return [
            new SystemMessage(this.systemPrompt),
            new HumanMessage(this.userPrompt),
        ];
    }
    async generateSearchQueries() {
        return await this.callLLM("create-search-queries", PsConstants.createSearchQueriesModel, await this.renderMessages());
    }
}
//# sourceMappingURL=searchQueriesGenerator.js.map