import axios from "axios";
import { PolicySynthSimpleAgentBase } from "../base/simpleAgent.js";
export class BingSearchApi extends PolicySynthSimpleAgentBase {
    SUBSCRIPTION_KEY;
    constructor() {
        super();
        this.SUBSCRIPTION_KEY = process.env.AZURE_BING_SEARCH_KEY;
        if (!this.SUBSCRIPTION_KEY) {
            throw new Error("Missing the AZURE_BING_SEARCH_KEY environment variable");
        }
    }
    async search(query) {
        const maxBingResults = process.env.PS_MAX_BING_RESULTS ? parseInt(process.env.PS_MAX_BING_RESULTS) : 10;
        const requestParams = {
            method: "GET",
            url: `https://api.cognitive.microsoft.com/bing/v7.0/search?count=${maxBingResults}&q=` +
                encodeURIComponent(query),
            headers: {
                "Ocp-Apim-Subscription-Key": this.SUBSCRIPTION_KEY,
            },
        };
        const outResults = [];
        let retry = true;
        const maxRetries = process.env.PS_SEARCH_MAX_RETRIES
            ? parseInt(process.env.PS_SEARCH_MAX_RETRIES)
            : 3;
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
        return outResults;
    }
}
//# sourceMappingURL=bingSearchApi.js.map