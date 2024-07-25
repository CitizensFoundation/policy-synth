import axios, { AxiosRequestConfig } from "axios";
import { PolicySynthSimpleAgentBase } from "../base/simpleAgent.js";

//TODO: Make a operations version of this with API costs
export class GoogleSearchApi extends PolicySynthSimpleAgentBase {
  needsAiModel = false;

  public async search(query: string): Promise<PsSearchResultItem[]> {
    const outResults: PsSearchResultItem[] = [];
    try {
      const url = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_API_CX_ID}`;
      const response = await axios.get(url);
      const results = response.data.items;

      if (results && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          const date = results[i].pagemap?.metatags?.[0]?.date;
          let isoDate;
          try {
            isoDate = new Date(date).toISOString();
          } catch (error) {
            isoDate = "";
            console.error(`Error converting date ${date} to ISO string:`,error);
          }
          const entry = {
            originalPosition: i + 1,
            title: results[i].title,
            url: results[i].link,
            description: results[i].snippet,
            date: isoDate,
          }
          outResults.push(entry);
          console.log(JSON.stringify(entry, null, 2))
        }
      } else {
        console.log("No results found.");
      }

      return outResults;
    } catch (error) {
      console.error("An error occurred:", error);
      throw error;
    }
  }
}

// TEST_GOOGLE_SEARCH=true GOOGLE_SEARCH_API_KEY= GOOGLE_SEARCH_API_CX_ID= node src/dist/agents/solutions/web/googleSearchApi.js

if (process.env.TEST_GOOGLE_SEARCH) {
  async function test() {
    const googleSearchApi = new GoogleSearchApi();
    try {
      const results = await googleSearchApi.search("liberal democracies: issues and solutions");
      console.log("Search results:", results);
      process.exit(0);
    } catch (error) {
      console.error("Test failed:", error);
    }
  }
  test();
}
