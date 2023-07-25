import { BaseProcessor } from "../baseProcessor.js";
import { getJson as serpApiGetJson } from "serpapi";
import { IEngineConstants } from "../../../constants.js";
import ioredis from "ioredis";
import { BingSearchApi } from "./bingSearchApi.js";
const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
export class SearchWebProcessor extends BaseProcessor {
    async callSearchApi(query) {
        if (process.env.AZURE_BING_SEARCH_KEY) {
            const bingSearchApi = new BingSearchApi();
            return await bingSearchApi.search(query);
        }
        else if (process.env.SERP_API_KEY) {
            const searchResults = await this.serpApiSearch(query);
            const outResults = [];
            for (let i = 0; i < searchResults.organic_results.length; i++) {
                outResults.push({
                    originalPosition: searchResults.organic_results[i].position,
                    title: searchResults.organic_results[i].title,
                    url: searchResults.organic_results[i].link,
                    description: searchResults.organic_results[i].snippet,
                    date: searchResults.organic_results[i].date,
                });
            }
            return outResults;
        }
        else {
            this.logger.error("Missing search API key");
            throw new Error("Missing search API key");
        }
    }
    async serpApiSearch(q) {
        const redisKey = `s_web_v3:${q}`;
        const searchData = await redis.get(redisKey);
        if (searchData && searchData != null && searchData.length > 30) {
            this.logger.debug(`Using cached search data for ${q} ${searchData}`);
            return JSON.parse(searchData);
        }
        else {
            let retry = true;
            const maxRetries = IEngineConstants.mainSearchRetryCount;
            let retryCount = 0;
            const params = {
                q,
                hl: "en",
                gl: "us",
                api_key: process.env.SERP_API_KEY,
            };
            let response;
            this.logger.debug(`Search Params: ${JSON.stringify(params, null, 2)}`);
            while (retry && retryCount < maxRetries) {
                try {
                    response = await serpApiGetJson("google", params);
                    retry = false;
                    this.logger.info("Got search data from SerpApi");
                }
                catch (e) {
                    this.logger.error(`Failed to get search data for ${q}`);
                    this.logger.error(e);
                    if (retryCount < maxRetries) {
                        retry = false;
                        throw e;
                    }
                    else {
                        await new Promise((resolve) => setTimeout(resolve, 5000 + retryCount * 5000));
                        retryCount++;
                    }
                }
            }
            if (response) {
                await redis.set(redisKey, JSON.stringify(response));
                this.logger.debug(JSON.stringify(response, null, 2));
                this.logger.debug(`Returning search data`);
                return response;
            }
            else {
                this.logger.error(`Failed to get search data for ${q}`);
                throw new Error(`Failed to get search data for ${q}`);
            }
        }
    }
    async getQueryResults(queriesToSearch) {
        let searchResults = [];
        for (let q = 0; q < queriesToSearch.length; q++) {
            const generalSearchData = await this.callSearchApi(queriesToSearch[q]);
            this.logger.debug(`Got Search Data 1: ${JSON.stringify(generalSearchData)}`);
            if (generalSearchData) {
                searchResults = [...searchResults, ...generalSearchData];
            }
            else {
                this.logger.error("No search results");
            }
            this.logger.debug("Got Search Results 2");
            this.logger.debug(`Search Results: ${JSON.stringify(searchResults)}`);
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
        return { searchResults };
    }
    async processSubProblems(searchQueryType) {
        for (let s = 0; s <
            Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems); s++) {
            let queriesToSearch = this.memory.subProblems[s].searchQueries[searchQueryType].slice(0, IEngineConstants.maxTopQueriesToSearchPerType);
            const results = await this.getQueryResults(queriesToSearch);
            if (!this.memory.subProblems[s].searchResults) {
                this.memory.subProblems[s].searchResults = {
                    pages: {
                        general: [],
                        scientific: [],
                        news: [],
                        openData: [],
                    },
                };
            }
            this.memory.subProblems[s].searchResults.pages[searchQueryType] =
                results.searchResults;
            await this.processEntities(s, searchQueryType);
            await this.saveMemory();
        }
    }
    async processEntities(subProblemIndex, searchQueryType) {
        for (let e = 0; e <
            Math.min(this.memory.subProblems[subProblemIndex].entities.length, IEngineConstants.maxTopEntitiesToSearch); e++) {
            let queriesToSearch = this.memory.subProblems[subProblemIndex].entities[e].searchQueries[searchQueryType].slice(0, IEngineConstants.maxTopQueriesToSearchPerType);
            const results = await this.getQueryResults(queriesToSearch);
            if (!this.memory.subProblems[subProblemIndex].entities[e].searchResults) {
                this.memory.subProblems[subProblemIndex].entities[e].searchResults = {
                    pages: {
                        general: [],
                        scientific: [],
                        news: [],
                        openData: [],
                    },
                };
            }
            this.memory.subProblems[subProblemIndex].entities[e].searchResults.pages[searchQueryType] = results.searchResults;
            await this.saveMemory();
        }
    }
    async processProblemStatement(searchQueryType) {
        let queriesToSearch = this.memory.problemStatement.searchQueries[searchQueryType].slice(0, IEngineConstants.maxTopQueriesToSearchPerType);
        this.logger.info("Getting search data for problem statement");
        const results = await this.getQueryResults(queriesToSearch);
        this.memory.problemStatement.searchResults.pages[searchQueryType] =
            results.searchResults;
        await this.saveMemory();
    }
    async process() {
        this.logger.info("Search Web Processor");
        super.process();
        try {
            for (const searchQueryType of [
                "general",
                "scientific",
                "openData",
                "news",
            ]) {
                await this.processProblemStatement(searchQueryType);
                await this.processSubProblems(searchQueryType);
            }
        }
        catch (error) {
            this.logger.error("Error processing web search");
            this.logger.error(error);
            throw error;
        }
        await this.saveMemory();
    }
}
