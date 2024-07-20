import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../base/scPairwiseAgent.js";
export class RankRootCausesSearchQueriesAgent extends BaseSmarterCrowdsourcingPairwiseAgent {
    disableRelativeProgress = true;
    rootCauseTypes = [
        "historicalRootCause",
        "economicRootCause",
        "scientificRootCause",
        "culturalRootCause",
        "socialRootCause",
        "environmentalRootCause",
        "legalRootCause",
        "technologicalRootCause",
        "geopoliticalRootCause",
        "ethicalRootCause",
        "caseStudies",
    ];
    async voteOnPromptPair(index, promptPair) {
        const itemOneIndex = promptPair[0];
        const itemTwoIndex = promptPair[1];
        const itemOne = this.allItems[index][itemOneIndex];
        const itemTwo = this.allItems[index][itemTwoIndex];
        const messages = [
            this.createSystemMessage(`
        You are an AI expert trained to rank search queries based on their relevance to problem statement and it's root causes.

        Instructions:
        1. You will receive a problem statement.
        2. You will also see two root causes web search queries, marked as "Search Query One" and "Search Query Two".
        3. Your task is to analyze, compare, and rank these search queries based on their relevance to the given problem and importance in relation to searching for root causes.
        5. If the problem statement refers to specific places or countries, it is not necessarily better to always include the name in the search query.
        6. Output your decision as "One", "Two" or "Neither" do not output anything else. No explanation is required.
        `),
            this.createHumanMessage(`
        ${this.renderProblemStatement()}

        Root Causes Search Queries to Rank:

        Search Query One:
        ${itemOne}

        Search Query Two:
        ${itemTwo}

        The Most Relevant Search Query Is:
       `),
        ];
        return await this.getResultsFromLLM(index, messages, itemOneIndex, itemTwoIndex);
    }
    async process() {
        this.logger.info("Rank Root Causes Search Queries Agent");
        super.process();
        for (let p = 0; p < this.rootCauseTypes.length; p++) {
            const searchQueryType = this.rootCauseTypes[p];
            this.logger.info(`Ranking search queries for ${searchQueryType}`);
            this.updatePrefix = `Ranking Queries for ${searchQueryType}`;
            const progress = (p + 1 / (this.rootCauseTypes.length - 1)) * 100;
            this.updateRangedProgress(progress, `Ranking Queries for ${searchQueryType}`);
            let queriesToRank = this.memory.problemStatement.rootCauseSearchQueries[searchQueryType];
            const index = -1;
            this.setupRankingPrompts(index, queriesToRank);
            await this.performPairwiseRanking(index);
            this.logger.info(`Ranking before: ${JSON.stringify(queriesToRank, null, 2)}`);
            this.memory.problemStatement.rootCauseSearchQueries[searchQueryType] = this.getOrderedListOfItems(index);
            this.logger.info(`Ranking after: ${JSON.stringify(this.memory.problemStatement.rootCauseSearchQueries[searchQueryType], null, 2)}`);
        }
        await this.saveMemory();
        this.logger.info("Rank Root Causes Search Queries Agent: Done");
    }
}
//# sourceMappingURL=rankRootCausesSearchQueries.js.map