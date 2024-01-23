import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import WebSocket from "ws";

import { PsBaseChatBot } from "@policysynth/api";
import { SearchQueriesGenerator } from "./searchQueriesGenerator.js";
import { SearchQueriesRanker } from "./searchQueriesRanker.js";
import { SearchWebScanner } from "./searchWebSanner.js";
import { SearchResultsRanker } from "./searchResultsRanker.js";
import { WebPageScanner } from "./webPageScanner.js";

const DEBUGGING = true;

export class LiveResearchChatBot extends PsBaseChatBot {
  jsonWebPageResearchSchema = `
    {
      shortSummary: string,
      mostRelevantParagraphs: string[],
      typesOfPlantsMentioned: string[],
      authors: string,
      relevanceScore: number,
    }
  `;

  renderSystemPrompt() {
    return `Please provide thoughtful answers to the users followup questions.
       `;
  }

  async doLiveResearch(question: string) {
    const numberOfQueriesToGenerate = 6;
    const percentOfQueriesToSearch = 0.2;
    const percentOfResultsToScan = 0.2;

    this.sendAgentStart("Generate search queries");
    const searchQueriesGenerator = new SearchQueriesGenerator(
      numberOfQueriesToGenerate,
      question
    );
    const searchQueries = await searchQueriesGenerator.generateSearchQueries();
    this.sendAgentCompleted("Generate search queries");
    console.log(`Search queries: ${JSON.stringify(searchQueries, null, 2)}`);

    this.sendAgentStart("Rank search queries");
    const searchQueriesRanker = new SearchQueriesRanker();
    const rankedSearchQueries = await searchQueriesRanker.rankSearchQueries(
      searchQueries,
      question
    );
    console.log(`Ranked: ${JSON.stringify(rankedSearchQueries, null, 2)}`);
    this.sendAgentCompleted("Rank search queries");

    const queriesToSearch = rankedSearchQueries.slice(
      0,
      Math.floor(rankedSearchQueries.length * percentOfQueriesToSearch)
    );

    this.sendAgentStart("Search the web");
    const webSearch = new SearchWebScanner();
    const searchResults = await webSearch.search(queriesToSearch);
    this.sendAgentCompleted("Search the web");

    this.sendAgentStart("Rank search results");
    const searchResultsRanker = new SearchResultsRanker();
    const rankedSearchResults = await searchResultsRanker.rankSearchResults(
      searchResults,
      question
    );
    this.sendAgentCompleted("Rank search results");

    const searchResultsToScan = rankedSearchResults.slice(
      0,
      Math.floor(rankedSearchResults.length * percentOfResultsToScan)
    );
    this.sendAgentStart("Scan and Research Web pages");

    const webPageResearch = new WebPageScanner();
    const webScan = await webPageResearch.scan(
      searchResultsToScan.map((i) => i.url),
      this.jsonWebPageResearchSchema
    );
    this.sendAgentCompleted("Scan and Research Web pages", true);

    const research = webScan;

    const summarySystemPrompt = `Please review the web research below and give the user a full report.
      Analyze the results step by step and output your results in markdown.
    `;

    const summaryUserPrompt = `
      Results from the web research:
      ${JSON.stringify(research, null, 2)}
    `;

    const messages: any[] = [
      {
        role: "system",
        content: summarySystemPrompt,
      },
      {
        role: "user",
        content: summaryUserPrompt,
      },
    ];

    const stream = await this.openaiClient.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages,
      max_tokens: 4000,
      temperature: 0.45,
      stream: true,
    });

    this.streamWebSocketResponses(stream);
  }

  conversation = async (chatLog: PsSimpleChatLog[]) => {
    console.log("In LIVE RESEARH conversation");
    let messages: any[] = chatLog.map((message: PsSimpleChatLog) => {
      return {
        role: message.sender,
        content: message.message,
      };
    });

    console.log(`messages: ${JSON.stringify(messages, null, 2)}`);

    if (messages.length === 1) {
      this.doLiveResearch(messages[0].content);
    } else {
      const systemMessage = {
        role: "system",
        content: this.renderSystemPrompt(),
      };

      messages.unshift(systemMessage);

      if (DEBUGGING) {
        console.log("=====================");
        console.log(JSON.stringify(messages, null, 2));
        console.log("=====================");
      }

      const stream = await this.openaiClient.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages,
        max_tokens: 4000,
        temperature: 0.7,
        stream: true,
      });

      this.streamWebSocketResponses(stream);
    }
  };
}
