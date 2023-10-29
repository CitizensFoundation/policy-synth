import { BaseProcessor } from "../../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";

export class CreateRootCausesSearchQueriesProcessor extends BaseProcessor {
  static rootCauseWebPageTypesArray: PSRootCauseWebPageTypes[] = [
    "caseStudies",
    "economicRootCause",
    "scientificRootCause",
    "culturalRootCause",
    "socialRootCause",
    "environmentalRootCause",
    "legalRootCause",
    "technologicalRootCause",
    "geopoliticalRootCause",
    "historicalRootCause",
    "ethicalRootCause",
  ];
  async renderCreatePrompt(searchResultType: PSRootCauseWebPageTypes) {
    return [
      new SystemChatMessage(`Adhere to the following guidelines:
        1. You generate high quality search queries for identifying root causes based on a Problem Statement.
        2. Always focus your search queries on the problem statement and its core ideas.
        3. Use your knowledge and experience to create the best possible search queries.
        4. Search queries should be concise, consistent, short, and succinct. They will be used to search on Google or Bing.
        5. You will be provided with a search query type, use this to guide your creation
        6. Create 10 high quality search queries
        7. All search queries should be focused on finding root causes for the problem.
        8. Never output in markdown format.
        9. Provide an output in the following JSON string array: [ searchQuery ]
        10. Never explain, just output JSON.
​
        Let's think step by step.
​
        `),
      new HumanChatMessage(`
         ${this.renderProblemStatement()}
​
         Search Query Type: ${searchResultType}
​
         Your high quality search queries in JSON string array:
       `),
    ];
  }
  async renderRefinePrompt(searchResultType: PSRootCauseWebPageTypes, searchResultsToRefine: string[]) {
    return [
      new SystemChatMessage(`
        Adhere to the following guidelines:
        1. You are an expert in refining search queries for identifying root causes based on a Problem Statement.
        2. Always focus your search queries on the problem statement and its core ideas.
        3. Use your knowledge and experience to refine the best possible search queries.
        4. Search queries should be concise, consistent, short, and succinct. They will be used to search on Google or Bing.
        5. You will be provided with a search query type, use this to guide your refinement
        7. All search queries should be focused on finding root causes for the problem.
        8. Never output in markdown format.
        9. Provide an output in the following JSON string array: [ searchQuery ]
​
        Let's think step by step.
​
        `),
      new HumanChatMessage(`
        ${this.renderProblemStatement()}
​
         Search Query Type: ${searchResultType}
​
         Search queries to refine:
         ${JSON.stringify(searchResultsToRefine, null, 2)}
​
         Your refined search queries in JSON string array:
       `),
    ];
  }
  async renderRankPrompt(searchResultType: PSRootCauseWebPageTypes, searchResultsToRank: string[]) {
    return [
      new SystemChatMessage(`
        Adhere to the following guidelines:
        1. You are an expert in ranking the most important search queries for identifying root causes based on a Problem Statement.
        2. Use your knowledge and experience to rank the search queries.
        3. Search queries should be concise, consistent, short, and succinct. They will be used to search on Google or Bing.
        4. You will be provided with a search query type, use this to guide your ranking
        5. All search queries should be focused on finding root causes for the problem.
        6. Never output in markdown format.
        7. Provide an output in the following JSON string array: [ searchQuery ]
​
        Let's think step by step.
        `),
      new HumanChatMessage(`
        ${this.renderProblemStatement()}
​
         Search Query Type: ${searchResultType}
​
         Search queries to rank:
         ${JSON.stringify(searchResultsToRank, null, 2)}
​
         Your ranked search queries in JSON string array:
       `),
    ];
  }
  async createRootCauseSearchQueries() {
    const problemStatement = this.memory.problemStatement;
    if (!problemStatement.rootCauseSearchQueries) {
      //@ts-ignore
      problemStatement.rootCauseSearchQueries = {};
    }
    for (const searchResultType of CreateRootCausesSearchQueriesProcessor.rootCauseWebPageTypesArray) {
      if (!problemStatement.rootCauseSearchQueries![searchResultType]) {
        this.logger.info(`Creating root cause search queries for result ${searchResultType} search results`);
        // create search queries for each type
        let searchResults = await this.callLLM(
          "create-root-causes-search-queries",
          IEngineConstants.createRootCauseSearchQueriesModel,
          await this.renderCreatePrompt(searchResultType),
        );
        this.logger.info(`Refine root cause search queries for ${searchResultType} search results`);
        searchResults = await this.callLLM(
          "create-root-causes-search-queries",
          IEngineConstants.createRootCauseSearchQueriesModel,
          await this.renderRefinePrompt(searchResultType, searchResults),
        );
        this.logger.info(`Ranking root cause search queries for ${searchResultType} search results`);
        searchResults = await this.callLLM(
          "create-root-causes-search-queries",
          IEngineConstants.createRootCauseSearchQueriesModel,
          await this.renderRankPrompt(searchResultType, searchResults),
        );
        this.logger.debug(`Search query type: ${searchResultType} - ${JSON.stringify(searchResults, null, 2)}`);
        problemStatement.rootCauseSearchQueries![searchResultType] = searchResults;
        await this.saveMemory();
      } else {
        this.logger.info(`Root Cause search queries for ${searchResultType} search results already exist`);
      }
    }
  }
  async process() {
    this.logger.info("Create Root Cause Search Queries Processor");
    super.process();
    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.createRootCauseSearchQueriesModel.temperature,
      maxTokens: IEngineConstants.createRootCauseSearchQueriesModel.maxOutputTokens,
      modelName: IEngineConstants.createRootCauseSearchQueriesModel.name,
      verbose: IEngineConstants.createRootCauseSearchQueriesModel.verbose,
    });
    this.logger.info("Creating root cause search queries");
    await this.createRootCauseSearchQueries();
    this.logger.info("Finished creating root cause search queries");
  }
}
