import axios from "axios";
import { PolicySynthSimpleAgentBase } from "../base/simpleAgent.js";
export class GoogleSearchApi extends PolicySynthSimpleAgentBase {
    needsAiModel = false;
    async search(query, numberOfResults) {
        const outResults = [];
        const maxPerRequest = 10;
        // Calculate how many calls we need to make
        const callsNeeded = Math.ceil(numberOfResults / maxPerRequest);
        for (let callIndex = 0; callIndex < callsNeeded; callIndex++) {
            const startIndex = callIndex * maxPerRequest + 1; // Google Custom Search uses 1-based indexing for "start"
            const resultsToFetch = Math.min(maxPerRequest, numberOfResults - outResults.length);
            const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_API_CX_ID}&num=${resultsToFetch}&start=${startIndex}`;
            try {
                const response = await axios.get(url);
                const results = response.data.items;
                if (results && results.length > 0) {
                    for (let i = 0; i < results.length; i++) {
                        const date = results[i].pagemap?.metatags?.[0]?.date;
                        let isoDate = "";
                        if (date) {
                            try {
                                isoDate = new Date(date).toISOString();
                            }
                            catch (error) {
                                console.error(`Error converting date ${date} to ISO string:`, error);
                            }
                        }
                        const entry = {
                            originalPosition: outResults.length + 1,
                            title: results[i].title,
                            url: results[i].link,
                            description: results[i].snippet,
                            date: isoDate,
                        };
                        outResults.push(entry);
                        console.log(JSON.stringify(entry, null, 2));
                        // If we have reached the requested numberOfResults, break early
                        if (outResults.length >= numberOfResults) {
                            break;
                        }
                    }
                }
                else {
                    console.log("No results found for this chunk.");
                }
            }
            catch (error) {
                console.error("An error occurred:", error);
                throw error;
            }
            // If we have reached the requested numberOfResults, stop making additional calls
            if (outResults.length >= numberOfResults) {
                break;
            }
        }
        return outResults;
    }
}
// TEST_GOOGLE_SEARCH=true GOOGLE_SEARCH_API_KEY= GOOGLE_SEARCH_API_CX_ID= node src/dist/agents/solutions/web/googleSearchApi.js
if (process.env.TEST_GOOGLE_SEARCH) {
    async function test() {
        const googleSearchApi = new GoogleSearchApi();
        try {
            const results = await googleSearchApi.search("liberal democracies: issues and solutions", 20);
            console.log("Search results:", results);
            process.exit(0);
        }
        catch (error) {
            console.error("Test failed:", error);
        }
    }
    test();
}
//# sourceMappingURL=googleSearchApi.js.map