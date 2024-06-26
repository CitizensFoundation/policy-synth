import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PsConstants } from "../../constants.js";
export class CreateRootCausesSearchQueriesProcessor extends BaseProblemSolvingAgent {
    generateInLanguage = "Icelandic";
    static rootCauseWebPageTypesArray = [
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
    async renderCreatePrompt(searchResultType) {
        return [
            new SystemMessage(`Instructions:
      1. You generate high quality search queries for identifying root causes based on a Problem Statement and a Search Query Type.
      2. Always focus your search queries on the problem statement and its core ideas, frame creatively with the Search Query Type provided.
      3. Use your knowledge and experience to create the best possible search queries.
      4. Search queries should be concise, consistent, short, and succinct. They will be used to search on Google or Bing.
      5. Always create 40 high quality search queries with a wide range
      6. If the search query is about a specific place or country do not include the name of the place or country in the search query but in some.
      7. List the search queries in a JSON string array.
      8. Never explain, just output JSON.

      ${this.generateInLanguage
                ? `9. You are generating search queries in the ${this.generateInLanguage} language.`
                : ""}
​
      Let's think step by step.
        `),
            new HumanMessage(`
         ${this.renderProblemStatement()}
​
         Search Query Type: ${searchResultType}
​
         Your high quality search queries in JSON string array:
       `),
        ];
    }
    async renderRefinePrompt(searchResultType, searchResultsToRefine) {
        return [
            new SystemMessage(`
        Adhere to the following guidelines:
        1. You are an expert in refining search queries for identifying root causes based on a Problem Statement.
        2. Always focus your search queries on the problem statement and its core ideas.
        3. Use your knowledge and experience to refine the best possible search queries.
        4. Search queries should be concise, consistent, short, and succinct. They will be used to search on Google or Bing.
        5. You will be provided with a search query type, use this to guide your refinement
        6. All search queries should be focused on finding root causes for the problem.
        7. List the search queries in a JSON string array
​
        Let's think step by step.
​
        `),
            new HumanMessage(`
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
    async renderRankPrompt(searchResultType, searchResultsToRank) {
        return [
            new SystemMessage(`
        Adhere to the following guidelines:
        1. You are an expert in ranking the most important search queries for identifying root causes based on a Problem Statement.
        2. Use your knowledge and experience to rank the search queries.
        3. Search queries should be concise, consistent, short, and succinct. They will be used to search on Google or Bing.
        4. You will be provided with a search query type, use this to guide your ranking
        5. All search queries should be focused on finding root causes for the problem.
        6. List the search queries in a JSON string array
​
        Let's think step by step.
        `),
            new HumanMessage(`
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
        const rankeSearchQueriesHere = false;
        const refineSearchQueriesHere = false;
        const regenerate = true;
        if (!problemStatement.rootCauseSearchQueries) {
            //@ts-ignore
            problemStatement.rootCauseSearchQueries = {};
        }
        for (const searchResultType of CreateRootCausesSearchQueriesProcessor.rootCauseWebPageTypesArray) {
            if (regenerate ||
                !problemStatement.rootCauseSearchQueries[searchResultType]) {
                this.logger.info(`Creating root cause search queries for result ${searchResultType} search results`);
                // create search queries for each type
                let searchResults = await this.callLLM("create-root-causes-search-queries", PsConstants.createRootCauseSearchQueriesModel, await this.renderCreatePrompt(searchResultType));
                if (refineSearchQueriesHere) {
                    this.logger.info(`Refine root cause search queries for ${searchResultType} search results`);
                    searchResults = await this.callLLM("create-root-causes-search-queries", PsConstants.createRootCauseSearchQueriesModel, await this.renderRefinePrompt(searchResultType, searchResults));
                }
                if (rankeSearchQueriesHere) {
                    this.logger.info(`Ranking root cause search queries for ${searchResultType} search results`);
                    searchResults = await this.callLLM("create-root-causes-search-queries", PsConstants.createRootCauseSearchQueriesModel, await this.renderRankPrompt(searchResultType, searchResults));
                }
                this.logger.debug(`Search query type: ${searchResultType} - ${JSON.stringify(searchResults, null, 2)}`);
                problemStatement.rootCauseSearchQueries[searchResultType] =
                    searchResults;
                await this.saveMemory();
            }
            else {
                this.logger.info(`Root Cause search queries for ${searchResultType} search results already exist`);
            }
        }
    }
    async process() {
        this.logger.info("Create Root Cause Search Queries Processor");
        super.process();
        this.chat = new ChatOpenAI({
            temperature: PsConstants.createRootCauseSearchQueriesModel.temperature,
            maxTokens: PsConstants.createRootCauseSearchQueriesModel.maxOutputTokens,
            modelName: PsConstants.createRootCauseSearchQueriesModel.name,
            verbose: PsConstants.createRootCauseSearchQueriesModel.verbose,
        });
        this.logger.info("Creating root cause search queries");
        await this.createRootCauseSearchQueries();
        this.logger.info("Finished creating root cause search queries");
    }
}
//# sourceMappingURL=createRootCauseSearchQueries.js.map