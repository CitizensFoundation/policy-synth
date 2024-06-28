import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../scPairwiseAgent.js";
export class RankRootCausesSearchResultsProcessor extends BaseSmarterCrowdsourcingPairwiseAgent {
    async voteOnPromptPair(index, promptPair) {
        const itemOneIndex = promptPair[0];
        const itemTwoIndex = promptPair[1];
        const itemOne = this.allItems[index][itemOneIndex];
        const itemTwo = this.allItems[index][itemTwoIndex];
        const messages = [
            this.createSystemMessage(`
        You are an AI expert trained to rank root causes search results based on their relevance to the problem statement.
        We will later visit those websites to discover the root causes presented in the problem statement.

        Instructions:
        1. You will receive a problem statement.
        2. You will also see two root causes web search results, marked as "Search Result One" and "Search Result Two".
        3. Your task is to analyze, compare, and rank these search results based on their relevance to the given problem and importance in relation root causes.
        4. Output your decision as either "One", "Two" or "Neither". No explanation is required.
        5. Let's think step by step.
        `),
            this.createHumanMessage(`
        ${this.renderProblemStatement()}

        Root Causes Search Results to Rank:

        Search Results One:
        ${itemOne.title}
        ${itemOne.description}
        ${itemOne.url}

        Search Results Two:
        ${itemTwo.title}
        ${itemTwo.description}
        ${itemTwo.url}

        The Most Relevant Search Results Is:
       `),
        ];
        return await this.getResultsFromLLM(index, messages, itemOneIndex, itemTwoIndex);
    }
    async process() {
        this.logger.info("Rank Root Causes Search Results Processor");
        super.process();
        for (const searchQueryType of this.rootCauseTypes) {
            this.logger.info(`Ranking search results for ${searchQueryType}`);
            let queriesToRank = this.memory.problemStatement.rootCauseSearchResults[searchQueryType];
            const index = -1;
            const seenUrls = new Set();
            queriesToRank = queriesToRank.filter(item => {
                if (seenUrls.has(item.url)) {
                    return false;
                }
                seenUrls.add(item.url);
                return true;
            });
            this.setupRankingPrompts(index, queriesToRank, queriesToRank.length * 7);
            await this.performPairwiseRanking(index);
            this.logger.info(`Ranking search results before: ${JSON.stringify(queriesToRank.map(item => item.title), null, 2)}`);
            this.memory.problemStatement.rootCauseSearchResults[searchQueryType] = this.getOrderedListOfItems(index);
            this.logger.info(`Ranking results after: ${JSON.stringify(this.memory.problemStatement.rootCauseSearchResults[searchQueryType].map(item => item.title), null, 2)}`);
        }
        await this.saveMemory();
        this.logger.info("Rank Root Causes Search Results Processor: Done");
    }
}
//# sourceMappingURL=rankRootCausesSearchResults.js.map