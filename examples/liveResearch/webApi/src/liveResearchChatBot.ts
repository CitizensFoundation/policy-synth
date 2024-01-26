import { PsBaseChatBot } from "@policysynth/api/base/chat/baseChatBot.js";

import { SearchQueriesRanker } from "@policysynth/agents/webResearch/searchQueriesRanker.js";
import { SearchQueriesGenerator } from "@policysynth/agents/webResearch/searchQueriesGenerator.js";
import { ResearchWeb } from "@policysynth/agents/webResearch/researchWeb.js";
import { SearchResultsRanker } from "@policysynth/agents/webResearch/searchResultsRanker.js";
import { WebPageScanner } from "@policysynth/agents/webResearch/webPageScanner.js";

export class LiveResearchChatBot extends PsBaseChatBot {
  numberOfQueriesToGenerate = 7;
  percentOfQueriesToSearch = 0.25;
  percentOfResultsToScan = 0.25;

  summarySystemPrompt = `Please review the web research below and give the user a full report.
    Take all the information provided and highlight the main points to answer the users question in detail.
    Do not output the analysis on an article by article basis, it needs to go deeper and wider than that to answer the users question.
    Provide links to the original webpages, if they are relevant, in markdown format as citations.
  `;

  // For directing the LLMs to focus on the most relevant parts of each web page
  jsonWebPageResearchSchema = `
    {
      mostRelevantParagraphs: string[],
      summary: string,
      howThisIsRelevant: string,
      relevanceScore: number
    }
  `;

  renderFollowupSystemPrompt() {
    return `Please provide thoughtful answers to the users followup questions.`;
  }

  async doLiveResearch(question: string) {
    try {
      this.startBroadcastingLiveCosts();

      // Generate search queries
      this.sendAgentStart("Generate search queries");
      const searchQueriesGenerator = (this.currentAgent =
        new SearchQueriesGenerator(
          this.memory,
          this.numberOfQueriesToGenerate,
          question
        ));
      const searchQueries =
        await searchQueriesGenerator.generateSearchQueries();
      this.sendAgentCompleted(
        `Generated ${searchQueries.length} search queries`
      );

      // Rank search queries
      this.sendAgentStart("Pairwise Ranking Search Queries");
      const searchQueriesRanker = (this.currentAgent = new SearchQueriesRanker(
        this.memory,
        this.sendAgentUpdate.bind(this)
      ));

      const rankedSearchQueries = await searchQueriesRanker.rankSearchQueries(
        searchQueries,
        question
      );
      this.sendAgentCompleted("Pairwise Ranking Completed");

      const queriesToSearch = rankedSearchQueries.slice(
        0,
        Math.floor(rankedSearchQueries.length * this.percentOfQueriesToSearch)
      );

      // Search the web
      this.sendAgentStart("Searching the Web...");
      const webSearch = this.currentAgent = new ResearchWeb();
      const searchResults = await webSearch.search(queriesToSearch);
      this.sendAgentCompleted(`Found ${searchResults.length} Web Pages`);

      // Rank search results
      this.sendAgentStart("Pairwise Ranking Search Results");
      const searchResultsRanker = this.currentAgent = new SearchResultsRanker(
        this.memory,
        this.sendAgentUpdate.bind(this)
      );
      const rankedSearchResults =  await searchResultsRanker.rankSearchResults(
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

      const webPageResearch = this.currentAgent = new WebPageScanner();
      const webScan = await webPageResearch.scan(
        searchResultsToScan.map((i) => i.url),
        this.jsonWebPageResearchSchema,
        undefined,
        this.sendAgentUpdate.bind(this)
      );
      this.sendAgentCompleted("Website Scanning Completed", true);

      this.stopBroadcastingLiveCosts();

      console.log(
        `webScan: (${webScan.length}) ${JSON.stringify(webScan, null, 2)}`
      );

      this.renderResultsToUser(webScan);
    } catch (err) {
      console.error(`Error in doLiveResearch: ${err}`);
    } finally {
      this.stopBroadcastingLiveCosts();
    }
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
        content: this.renderFollowupSystemPrompt(),
      };

      messages.unshift(systemMessage);

      const stream = await this.openaiClient.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages,
        max_tokens: 4000,
        temperature: 0.7,
        stream: true,
      });

      this.streamWebSocketResponses(stream);
    }
  };
}
