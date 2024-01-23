import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import WebSocket from "ws";

const DEBUGGING = true;

import { PsBaseChatBot } from "@policysynth/api";



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

  sendAgentStart(name: string, hasNoStreaming = true) {
    const botMessage = {
      sender: "bot",
      type: "agentStart",
      message: {
        name: name,
        noStreaming: hasNoStreaming,
      } as PsAgentStartWsOptions,
    };
    this.clientSocket.send(JSON.stringify(botMessage));
  }

  sendAgentCompleted(name: string, lastAgent = false, error: string | undefined = undefined) {
    const botMessage = {
      sender: "bot",
      type: "agentCompleted",
      message: {
        name: name,
        results: {
          isValid: true,
          validationErrors: error,
          lastAgent: lastAgent
        } as PsValidationAgentResult,
      } as PsAgentCompletedWsOptions,
    };

    this.clientSocket.send(JSON.stringify(botMessage));
  }

  async doLiveResearch(question: string) {
    const numberOfQueriesToGenerate = 10;
    const percentOfQueriesToSearch = 0.5;
    const percentOfResultsToScan = 0.5;

    const generateSearchQueriesPrompt = `
      Given the question below, generate a list of ${numberOfQueriesToGenerate} search queries that would be useful for answering the question.

      Question: ${question}
    `;

    this.sendAgentStart("Generate search queries");
    const searchQueriesGenerator = new SearchQueriesGenerator(generateSearchQueriesPrompt);
    const searchQueries = await searchQueriesGenerator.generateSearchQueries();
    this.sendAgentCompleted("Generate search queries");

    this.sendAgentStart("Rank search queries");
    const searchQueriesRanker = new SearchQueriesRanker(searchQueries, numberOfQueriesToGenerate, percentOfQueriesToSearch);
    const rankedSearchQueries = await searchQueriesRanker.rankSearchQueries();
    this.sendAgentCompleted("Rank search queries");

    const queriesToSearch = rankedSearchQueries.slice(0, Math.floor(rankedSearchQueries.length * percentOfQueriesToSearch));

    this.sendAgentStart("Search the web");
    const webSearch = new WebSearch(queriesToSearch);
    const searchResults = await webSearch.search();
    this.sendAgentCompleted("Search the web");

    this.sendAgentStart("Rank search results");
    const searchResultsRanker = new SearchResultsRanker(searchResults);
    const rankedSearchResults = await searchResultsRanker.rankSearchResults();
    this.sendAgentCompleted("Rank search results");

    const searchResultsToScan = rankedSearchResults.slice(0, Math.floor(rankedSearchResults.length * percentOfResultsToScan));

    this.sendAgentStart("Scan and Research Web pages");
    const webPageResearch = new WebPageResearch(searchResultsToScan, this.jsonWebPageResearchSchema);
    const research = await webPageResearch.research();
    this.sendAgentCompleted("Scan and Research Web pages", true);

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
