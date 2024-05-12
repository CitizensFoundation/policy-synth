import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { IEngineConstants } from "@policysynth/agents/constants.js";
export class SearchQueriesGenerator extends PolicySynthAgentBase {
    systemPrompt;
    userPrompt;
    memory;
    constructor(memory, numberOfQueriesToGenerate, instructions) {
        super(memory);
        this.memory = memory;
        this.systemPrompt =
            `Inspired by the instructions below, generate ${numberOfQueriesToGenerate} high quality search queries that will then be used in Google or Bing search.

      Always output as a JSON array of strings, where each string is a high quality search query:
        [searchQuery1, searchQuery2, ...]
    `;
        this.userPrompt =
            `Overall project title:
       ${this.memory.taskTitle}

       Overall project description:
       ${this.memory.taskDescription}

       Overall project instructions: ${this.memory.taskInstructions}

       User Instructions: ${instructions}

       ${this.memory.likelyRelevantNpmPackageDependencies?.length > 0
                ? `Likely relevant npm dependencies:\n${this.memory.likelyRelevantNpmPackageDependencies.join(`\n`)}`
                : ``}

    `;
        console.log(`User prompt is: ${this.userPrompt}`);
        this.chat = new ChatOpenAI({
            temperature: IEngineConstants.createSearchQueriesModel.temperature,
            maxTokens: IEngineConstants.createSearchQueriesModel.maxOutputTokens,
            modelName: IEngineConstants.createSearchQueriesModel.name,
            verbose: IEngineConstants.createSearchQueriesModel.verbose,
        });
    }
    async renderMessages() {
        return [
            new SystemMessage(this.systemPrompt),
            new HumanMessage(this.userPrompt),
        ];
    }
    async generateSearchQueries() {
        return await this.callLLM("create-search-queries", IEngineConstants.createSearchQueriesModel, await this.renderMessages());
    }
}
//# sourceMappingURL=searchQueriesGenerator.js.map