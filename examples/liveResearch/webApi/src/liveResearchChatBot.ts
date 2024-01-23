import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import WebSocket from "ws";

import { PsBaseChatBot } from "@policysynth/api";
import { SearchQueriesGenerator } from "../../../../agents/src/agents/webResearch/searchQueriesGenerator.js";
import { SearchQueriesRanker } from "../../../../agents/src/agents/webResearch/searchQueriesRanker.js";
import { SearchWebScanner } from "../../../../agents/src/agents/webResearch/searchWebSanner.js";
import { SearchResultsRanker } from "../../../../agents/src/agents/webResearch/searchResultsRanker.js";
import { WebPageScanner } from "../../../../agents/src/agents/webResearch/webPageScanner.js";

const DEBUGGING = true;

export class LiveResearchChatBot extends PsBaseChatBot {
  numberOfQueriesToGenerate = 7;
  percentOfQueriesToSearch = 0.25;
  percentOfResultsToScan = 0.25;

  summarySystemPrompt = `Please review the web research below and give the user a full report.
    Take all the information provided and highlight the main points to answer the users question
    Do not output the analysis on an article by article basis, it needs to go deeper and wider than that.
    Provide links to the original webpages, if they are relevant, in markdown format as citations.
  `;

  jsonWebPageResearchSchema = `
    {
      mostRelevantParagraphs: string[],
      summary: string,
      howThisIsRelevant: string,
      relevanceScore: number
    }
  `;

  renderSystemPrompt() {
    return `Please provide thoughtful answers to the users followup questions.
       `;
  }

  sendAgentUpdate(message: string) {
    const botMessage = {
      sender: "bot",
      type: "agentUpdated",
      message: message,
    };

    this.clientSocket.send(JSON.stringify(botMessage));
  }

  async doLiveResearch(question: string) {
    // Generate search queries
    this.sendAgentStart("Generate search queries");
    const searchQueriesGenerator = new SearchQueriesGenerator(
      this.numberOfQueriesToGenerate,
      question
    );
    const searchQueries = await searchQueriesGenerator.generateSearchQueries();
    this.sendAgentCompleted(`Generated ${searchQueries.length} search queries`);

    console.log(`Search queries: ${JSON.stringify(searchQueries, null, 2)}`);

    // Rank search queries
    this.sendAgentStart("Pairwise Ranking Search Queries");
    const searchQueriesRanker = new SearchQueriesRanker(
      this.sendAgentUpdate.bind(this)
    );
    const rankedSearchQueries = await searchQueriesRanker.rankSearchQueries(
      searchQueries,
      question
    );
    console.log(`Ranked: ${JSON.stringify(rankedSearchQueries, null, 2)}`);
    this.sendAgentCompleted("Pairwise Ranking Completed");

    const queriesToSearch = rankedSearchQueries.slice(
      0,
      Math.floor(rankedSearchQueries.length * this.percentOfQueriesToSearch)
    );

    // Search the web
    this.sendAgentStart("Searching the Web...");
    const webSearch = new SearchWebScanner();
    const searchResults = await webSearch.search(queriesToSearch);
    this.sendAgentCompleted(`Found ${searchResults.length} Web Pages`);

    // Rank search results
    this.sendAgentStart("Pairwise Ranking Search Results");
    const searchResultsRanker = new SearchResultsRanker(
      this.sendAgentUpdate.bind(this)
    );
    const rankedSearchResults = await searchResultsRanker.rankSearchResults(
      searchResults,
      question
    );
    this.sendAgentCompleted("Pairwise Ranking Completed");

    const searchResultsToScan = rankedSearchResults.slice(
      0,
      Math.floor(rankedSearchResults.length * this.percentOfResultsToScan)
    );

    // Scan and Research Web pages
    this.sendAgentStart("Scan and Research Web pages");

    const webPageResearch = new WebPageScanner();
    const webScan = await webPageResearch.scan(
      searchResultsToScan.map((i) => i.url),
      this.jsonWebPageResearchSchema,
      undefined,
      this.sendAgentUpdate.bind(this)
    );
    this.sendAgentCompleted("Website Scaning Completed", true);

    console.log(
      `webScan: (${webScan.length}) ${JSON.stringify(webScan, null, 2)}`
    );

    this.renderResultsToUser(webScan);
  }

  async renderResultsToUser(research: object[]) {
    const summaryUserPrompt = `
      Results from the web research:
      ${JSON.stringify(research, null, 2)}
    `;

    const messages: any[] = [
      {
        role: "system",
        content: this.summarySystemPrompt,
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

  researchConversation = async (
    chatLog: PsSimpleChatLog[],
    numberOfSelectQueries: number,
    percentOfTopQueriesToSearch: number,
    percentOfTopResultsToScan: number
  ) => {
    this.numberOfQueriesToGenerate = numberOfSelectQueries;
    this.percentOfQueriesToSearch = percentOfTopQueriesToSearch;
    this.percentOfResultsToScan = percentOfTopResultsToScan;
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
