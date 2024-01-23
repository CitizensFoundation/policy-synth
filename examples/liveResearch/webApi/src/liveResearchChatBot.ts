import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import WebSocket from "ws";

const DEBUGGING = true;

import { PsBaseChatBot } from "@policysynth/api";

class SearchQueriesGenerator {
  generateSearchQueriesPrompt: string;

  constructor(generateSearchQueriesPrompt: string) {
    this.generateSearchQueriesPrompt = generateSearchQueriesPrompt;
  }

  async generateSearchQueries() {
    const searchQueries = await this.openaiClient.search.completions.create({
      engine: "davinci",
      prompt: this.generateSearchQueriesPrompt,
      max_tokens: 4000,
      temperature: 0.7,
      stop: ["\n"],
    });

    return searchQueries;
  }
}

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

  async doLiveResearch(question: string) {
    const numberOfQueriesToGenerate = 10;
    const percentOfQueriesToSearch = 0.5;
    const percentOfResultsToScan = 0.5;

    const generateSearchQueriesPrompt = `
      Given the question below, generate a list of ${numberOfQueriesToGenerate} search queries that would be useful for answering the question.

      Question: ${question}
    `;

    const searchQueriesGenerator = new SearchQueriesGenerator(generateSearchQueriesPrompt);
    const searchQueries = await searchQueriesGenerator.generateSearchQueries();

    const searchQueriesRanker = new SearchQueriesRanker(searchQueries, numberOfQueriesToGenerate, percentOfQueriesToSearch);
    const rankedSearchQueries = await searchQueriesRanker.rankSearchQueries();

    const queriesToSearch = rankedSearchQueries.slice(0, Math.floor(rankedSearchQueries.length * percentOfQueriesToSearch));

    const webSearch = new WebSearch(queriesToSearch);
    const searchResults = await webSearch.search();

    const searchResultsRanker = new SearchResultsRanker(searchResults);
    const rankedSearchResults = await searchResultsRanker.rankSearchResults();

    const searchResultsToScan = rankedSearchResults.slice(0, Math.floor(rankedSearchResults.length * percentOfResultsToScan));

    const webPageResearch = new WebPageResearch(searchResultsToScan, this.jsonWebPageResearchSchema);
    const research = await webPageResearch.research();

    const summarySystemPrompt = `Please review the web research below and give the user a full report.
      Analyze the results step by step and output your results in markdown.
    `

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
    }]

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
    let messages: any[] = chatLog.map((message: PsSimpleChatLog) => {
      return {
        role: message.sender,
        content: message.message,
      };
    });

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
