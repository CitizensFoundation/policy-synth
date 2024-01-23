import { PsBaseChatBot } from "@policysynth/api";
import {
  SearchQueriesGenerator,
  SearchQueriesRanker,
  ResearchWeb,
  SearchResultsRanker,
  WebPageScanner,
} from "@policysynth/agents";
import { v4 as uuidv4 } from "uuid";

export class LiveResearchChatBot extends PsBaseChatBot {
  numberOfQueriesToGenerate = 7;
  percentOfQueriesToSearch = 0.25;
  percentOfResultsToScan = 0.25;
  memory!: IEngineInnovationMemoryData;

  summarySystemPrompt = `Please review the web research below and give the user a full report.
    Take all the information provided and highlight the main points to answer the users question in detail.
    Do not output the analysis on an article by article basis, it needs to go deeper and wider than that to answer the users question.
    Provide links to the original webpages, if they are relevant, in markdown format as citations.
  `;

  getEmptyMemory() {
    return {
      redisKey: `webResearch-${uuidv4}`,
      groupId: 1,
      communityId: 2,
      domainId: 1,
      stage: "create-sub-problems",
      currentStage: "create-sub-problems",
      stages: {
        "create-root-causes-search-queries": {},
        "web-search-root-causes": {},
        "web-get-root-causes-pages": {},
        "rank-web-root-causes": {},
        "rate-web-root-causes": {},
        "web-get-refined-root-causes": {},
        "get-metadata-for-top-root-causes": {},
        "create-problem-statement-image": {},
        "create-sub-problems": {},
        "rank-sub-problems": {},
        "policies-seed": {},
        "policies-create-images": {},
        "create-entities": {},
        "rank-entities": {},
        "reduce-sub-problems": {},
        "create-search-queries": {},
        "rank-root-causes-search-results": {},
        "rank-root-causes-search-queries": {},
        "create-sub-problem-images": {},
        "rank-search-queries": {},
        "web-search": {},
        "rank-web-solutions": {},
        "rate-solutions": {},
        "rank-search-results": {},
        "web-get-pages": {},
        "create-seed-solutions": {},
        "create-pros-cons": {},
        "create-solution-images": {},
        "rank-pros-cons": {},
        "rank-solutions": {},
        "group-solutions": {},
        "evolve-create-population": {},
        "evolve-mutate-population": {},
        "evolve-recombine-population": {},
        "evolve-reap-population": {},
        "topic-map-solutions": {},
        "evolve-rank-population": {},
        "analyse-external-solutions": {},
        "create-evidence-search-queries": {},
        "web-get-evidence-pages": {},
        "web-search-evidence": {},
        "rank-web-evidence": {},
        "rate-web-evidence": {},
        "web-get-refined-evidence": {},
        "get-metadata-for-top-evidence": {},
        "validation-agent": {},
      },
      timeStart: Date.now(),
      totalCost: 0,
      customInstructions: {},
      problemStatement: {
        description: "problemStatement",
        searchQueries: {
          general: [],
          scientific: [],
          news: [],
          openData: [],
        },
        searchResults: {
          pages: {
            general: [],
            scientific: [],
            news: [],
            openData: [],
          },
        },
      },
      subProblems: [],
      currentStageData: undefined,
    } as IEngineInnovationMemoryData;
  }

  // For directing the LLMs to focus on the most relevant parts of each web page
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

    // Rank search queries
    this.sendAgentStart("Pairwise Ranking Search Queries");
    const searchQueriesRanker = new SearchQueriesRanker(
      this.sendAgentUpdate.bind(this)
    );
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
    const webSearch = new ResearchWeb();
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

    this.memory = this.getEmptyMemory();

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
