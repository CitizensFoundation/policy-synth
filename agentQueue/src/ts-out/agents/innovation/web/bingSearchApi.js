import axios from "axios";
import { IEngineConstants } from "../../../constants.js";
import { Base } from "../../../base.js";
import ioredis from "ioredis";
const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
export class BingSearchApi extends Base {
    SUBSCRIPTION_KEY;
    constructor() {
        super();
        this.SUBSCRIPTION_KEY = process.env.AZURE_BING_SEARCH_KEY;
        if (!this.SUBSCRIPTION_KEY) {
            throw new Error("Missing the AZURE_BING_SEARCH_KEY environment variable");
        }
    }
    async search(query) {
        const requestParams = {
            method: "GET",
            url: `https://api.cognitive.microsoft.com/bing/v7.0/search?count=${IEngineConstants.maxSearchResults}&q=` +
                encodeURIComponent(query),
            headers: {
                "Ocp-Apim-Subscription-Key": this.SUBSCRIPTION_KEY,
            },
        };
        const outResults = [];
        const redisKey = `bs_web_v2:${query}`;
        const searchData = await redis.get(redisKey);
        if (searchData && searchData != null && searchData.length > 30) {
            this.logger.debug(`Using cached search data for ${query} ${searchData}`);
            return JSON.parse(searchData);
        }
        else {
            let retry = true;
            const maxRetries = IEngineConstants.mainSearchRetryCount;
            let retryCount = 0;
            while (retry && retryCount < maxRetries) {
                try {
                    const res = await axios(requestParams);
                    const body = res.data;
                    Object.keys(res.headers).forEach((header) => {
                        if (header.startsWith("bingapis-") ||
                            header.startsWith("x-msedge-")) {
                            console.log(`${header}: ${res.headers[header]}`);
                        }
                    });
                    this.logger.debug("\nBing Search JSON Response:\n");
                    this.logger.debug(JSON.stringify(body, null, "  "));
                    if (body.webPages) {
                        for (let i = 0; i < body.webPages.value.length; i++) {
                            outResults.push({
                                originalPosition: i + 1,
                                title: body.webPages.value[i].name,
                                url: body.webPages.value[i].url,
                                description: body.webPages.value[i].snippet,
                                date: body.webPages.value[i].dateLastCrawled,
                            });
                        }
                    }
                }
                catch (e) {
                    this.logger.error(`Failed to get search data for ${query}`);
                    this.logger.error("Bing Search Error: " + e.message);
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
        }
        if (outResults.length > 0) {
            await redis.set(redisKey, JSON.stringify(outResults));
        }
        return outResults;
    }
}
