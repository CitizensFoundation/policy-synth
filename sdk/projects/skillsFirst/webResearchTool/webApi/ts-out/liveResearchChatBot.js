import { PsBaseChatBot } from "@policysynth/api/base/chat/baseChatBot.js";
import { SearchQueriesRanker } from "@policysynth/agents/webResearch/searchQueriesRanker.js";
import { SearchQueriesGenerator } from "@policysynth/agents/webResearch/searchQueriesGenerator.js";
import { ResearchWeb } from "@policysynth/agents/webResearch/researchWeb.js";
import { SearchResultsRanker } from "@policysynth/agents/webResearch/searchResultsRanker.js";
import { WebPageScanner } from "@policysynth/agents/webResearch/webPageScanner.js";
import { promises as fs } from "fs";
export class LiveResearchChatBot extends PsBaseChatBot {
    constructor() {
        super(...arguments);
        this.numberOfQueriesToGenerate = 7;
        this.percentOfQueriesToSearch = 0.25;
        this.percentOfResultsToScan = 0.25;
        this.persistMemory = true;
        this.summarySystemPrompt = `Please analyse those sources step by step and provide a summary of the most relevant information.
    Provide links to the original webpages, if they are relevant, in markdown format as citations.
  `;
        // For directing the LLMs to focus on the most relevant parts of each web page
        this.jsonWebPageResearchSchema = `
    //MOST IMPORTANT INSTRUCTIONS: You are a researchers for the Skills First project and we are looking for any information that can help us identify law or regulations that are barriers to Skills First policies in New Jersey.
    {
      potentialSourcesOfInformationAboutBarriersToSkillsFirstPolicies: string[],
      potentialDescriptionOfBarriersToSkillsFirstPolicies: string[],
      summary: string,
      howThisIsRelevant: string,
      relevanceScore: number
    }
  `;
        this.researchConversation = async (chatLog, numberOfSelectQueries, percentOfTopQueriesToSearch, percentOfTopResultsToScan) => {
            this.numberOfQueriesToGenerate = numberOfSelectQueries;
            this.percentOfQueriesToSearch = percentOfTopQueriesToSearch;
            this.percentOfResultsToScan = percentOfTopResultsToScan;
            this.setChatLog(chatLog);
            console.log("In LIVE RESEARH conversation");
            let messages = chatLog.map((message) => {
                return {
                    role: message.sender,
                    content: message.message,
                };
            });
            console.log(`messages: ${JSON.stringify(messages, null, 2)}`);
            if (messages.length === 1) {
                this.doLiveResearch(messages[0].content);
            }
            else {
                this.startBroadcastingLiveCosts();
                const systemMessage = {
                    role: "system",
                    content: this.renderFollowupSystemPrompt(),
                };
                messages.unshift(systemMessage);
                try {
                    const stream = await this.openaiClient.chat.completions.create({
                        model: "gpt-4-0125-preview",
                        messages,
                        max_tokens: 4000,
                        temperature: 0.7,
                        stream: true,
                    });
                    await this.streamWebSocketResponses(stream);
                }
                catch (err) {
                    console.error(`Error in doLiveResearch: ${err}`);
                }
                finally {
                    this.stopBroadcastingLiveCosts();
                }
            }
        };
    }
    renderFollowupSystemPrompt() {
        return `Please provide thoughtful answers to the users followup questions.`;
    }
    async doLiveResearch(question) {
        try {
            this.startBroadcastingLiveCosts();
            console.log(`In doLiveResearch: ${question}`);
            console.log(`this.memory: ${JSON.stringify(this.memory, null, 2)}`);
            // Generate search queries
            this.sendAgentStart("Generate search queries");
            const searchQueriesGenerator = new SearchQueriesGenerator(this.memory, this.numberOfQueriesToGenerate, question);
            const searchQueries = await searchQueriesGenerator.generateSearchQueries();
            this.sendAgentCompleted(`Generated ${searchQueries.length} search queries`);
            // Rank search queries
            this.sendAgentStart("Pairwise Ranking Search Queries");
            const searchQueriesRanker = new SearchQueriesRanker(this.memory, this.sendAgentUpdate.bind(this));
            const rankedSearchQueries = await searchQueriesRanker.rankSearchQueries(searchQueries, question, searchQueries.length * 10);
            this.sendAgentCompleted("Pairwise Ranking Completed");
            const queriesToSearch = rankedSearchQueries.slice(0, Math.floor(rankedSearchQueries.length * this.percentOfQueriesToSearch));
            // Add "New Jersey" to the each search query
            //TODO: Do not hard code "New Jersey"
            queriesToSearch.forEach((query) => {
                query += " New Jersey";
            });
            // Search the web
            this.sendAgentStart("Searching the Web...");
            const webSearch = new ResearchWeb(this.memory);
            const searchResults = await webSearch.search(queriesToSearch);
            this.sendAgentCompleted(`Found ${searchResults.length} Web Pages`);
            // Rank search results
            this.sendAgentStart("Pairwise Ranking Search Results");
            const searchResultsRanker = new SearchResultsRanker(this.memory, this.sendAgentUpdate.bind(this));
            const rankedSearchResults = await searchResultsRanker.rankSearchResults(searchResults, question, searchResults.length * 10);
            this.sendAgentCompleted("Pairwise Ranking Completed");
            const searchResultsToScan = rankedSearchResults.slice(0, Math.floor(rankedSearchResults.length * this.percentOfResultsToScan));
            // Scan and Research Web pages
            this.sendAgentStart("Scan and Research Web pages");
            const webPageResearch = new WebPageScanner(this.memory);
            const webScan = await webPageResearch.scan(searchResultsToScan.map((i) => i.url), this.jsonWebPageResearchSchema, undefined, this.sendAgentUpdate.bind(this));
            this.sendAgentCompleted("Website Scanning Completed", true);
            console.log(`webScan: (${webScan.length}) ${JSON.stringify(webScan, null, 2)}`);
            // Create a webScan.json filename with a timestamp
            const timestamp = new Date().toISOString().replace(/:/g, "-");
            try {
                await fs.writeFile(`/tmp/webScan_${timestamp}.json`, JSON.stringify(webScan, null, 2));
                console.log("webScan.json has been saved to /tmp directory.");
            }
            catch (err) {
                console.error(`Error saving webScan.json: ${err}`);
            }
            await this.renderResultsToUser(webScan, question);
        }
        catch (err) {
            console.error(`Error in doLiveResearch: ${err}`);
        }
        finally {
            this.stopBroadcastingLiveCosts();
        }
    }
    async renderResultsToUser(research, question) {
        const summaryUserPrompt = `
      Research Question: ${question}

      Results from the web research:
      ${JSON.stringify(research, null, 2)}
    `;
        this.addToExternalSolutionsMemoryCosts(summaryUserPrompt + this.summarySystemPrompt, "in");
        const messages = [
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
            model: "gpt-4-0125-preview",
            messages,
            max_tokens: 4000,
            temperature: 0.45,
            stream: true,
        });
        await this.streamWebSocketResponses(stream);
    }
}
