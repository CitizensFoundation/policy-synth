import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PolicySynthAgentBase } from "../baseAgent.js";
import { IEngineConstants } from "../constants.js";

export class SearchQueriesGenerator extends PolicySynthAgentBase {
  systemPrompt: string;
  userPrompt: string;

  constructor(
    memory: PsBaseMemoryData,
    numberOfQueriesToGenerate: number,
    question: string,
    overRideSystemPrompt?: string,
    overRideUserPrompt?: string
  ) {
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

  async generateSearchQueries(): Promise<string[]> {
    return await this.callLLM(
      "create-search-queries",
      IEngineConstants.createSearchQueriesModel,
      await this.renderMessages()
    );
  }
}
