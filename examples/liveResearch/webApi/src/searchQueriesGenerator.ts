import { PolicySynthAgentBase, IEngineConstants } from "@policysynth/agents";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";

export class SearchQueriesGenerator extends PolicySynthAgentBase {
  systemPrompt: string;
  userPrompt: string;

  constructor(
    numberOfQueriesToGenerate: number,
    question: string,
    overRideSystemPrompt?: string,
    overRideUserPrompt?: string
  ) {
    super();
    this.systemPrompt =
      overRideSystemPrompt ||
      `
      Given the question below, generate ${numberOfQueriesToGenerate} high quality search queries that would be useful for answering the question.
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
