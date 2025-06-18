import axios from "axios";
import { PolicySynthSimpleAgentBase } from "../base/simpleAgent.js";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function googleRequestWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  let attempt = 1;
  const maxAttempts = 30;

  // initial backoff in seconds
  let backoffSec = 1;
  // maximum wait: 60s
  const maxBackoffSec = 60;

  while (attempt <= maxAttempts) {
    try {
      return await fn();
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        console.warn(
          `Got 429 on attempt #${attempt}. Will back off for ${backoffSec}s, then retry.`
        );
        await sleep(backoffSec * 1000);
        backoffSec = Math.min(backoffSec * 2, maxBackoffSec);
        attempt++;
        continue;
      }

      // For other errors, throw immediately
      throw error;
    }
  }
  throw new Error(
    `Exceeded ${maxAttempts} retries after 429 responses. Aborting.`
  );
}

export class GoogleSearchApi extends PolicySynthSimpleAgentBase {
  needsAiModel = false;

  public async search(
    query: string,
    numberOfResults: number,
    options: PsSearchOptions = {}
  ): Promise<PsSearchResultItem[]> {
    let finalQuery = query;
    if (options.before) {
      finalQuery += ` before:${options.before}`;
    }
    if (options.after) {
      finalQuery += ` after:${options.after}`;
    }

    const extraParams: string[] = [];
    if (options.dateRestrict) {
      extraParams.push(`dateRestrict=${encodeURIComponent(options.dateRestrict)}`);
    }
    if (options.sort) {
      extraParams.push(`sort=${encodeURIComponent(options.sort)}`);
    }
    const outResults: PsSearchResultItem[] = [];
    const maxPerRequest = 10;

    // Calculate how many calls we need to make
    const callsNeeded = Math.ceil(numberOfResults / maxPerRequest);

    for (let callIndex = 0; callIndex < callsNeeded; callIndex++) {
      const startIndex = callIndex * maxPerRequest + 1; // Google Custom Search uses 1-based indexing for "start"
      const resultsToFetch = Math.min(
        maxPerRequest,
        numberOfResults - outResults.length
      );

      let url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        finalQuery
      )}&key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${
        process.env.GOOGLE_SEARCH_API_CX_ID
      }&num=${resultsToFetch}&start=${startIndex}`;

      if (extraParams.length > 0) {
        url += `&${extraParams.join("&")}`;
      }

      try {
        // Use our custom requestWithRetry wrapper
        const response = await googleRequestWithRetry(() => axios.get(url));
        const results = response.data.items;

        if (results && results.length > 0) {
          for (const item of results) {
            const date = item?.pagemap?.metatags?.[0]?.date;
            let isoDate = "";

            if (date) {
              try {
                isoDate = new Date(date).toISOString();
              } catch (error) {
                console.error(`Error converting date ${date} to ISO string:`, error);
              }
            }

            const entry = {
              originalPosition: outResults.length + 1,
              title: item.title,
              url: item.link,
              description: item.snippet,
              date: isoDate,
            };

            outResults.push(entry);
            console.log(JSON.stringify(entry, null, 2));

            // If we have reached the requested numberOfResults, break early
            if (outResults.length >= numberOfResults) {
              break;
            }
          }
        } else {
          console.log("No results found for this chunk.");
        }
      } catch (error) {
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