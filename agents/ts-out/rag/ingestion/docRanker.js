import { SimplePairwiseRankingsAgent } from "../../base/simplePairwiseRanking.js";
export class IngestionDocumentRanker extends SimplePairwiseRankingsAgent {
    rankingRules;
    overallTopic;
    constructor(memory = undefined, progressFunction = undefined) {
        super(memory);
        this.progressFunction = progressFunction;
    }
    async voteOnPromptPair(index, promptPair) {
        const itemOneIndex = promptPair[0];
        const itemTwoIndex = promptPair[1];
        const itemOne = this.allItems[index][itemOneIndex];
        const itemTwo = this.allItems[index][itemTwoIndex];
        const messages = [
            this.createSystemMessage(`
        You are an AI expert trained to documents based on their relevance to the users ranking rules.

        Instructions:
        1. The user will provide you with ranking rules you should follow.
        2. You will also see document chunks, each marked as "Document One" and "Document Two".
        3. Your task is to analyze, compare, and rank these document chunks based on their relevance to the users rankinng rules.
        4. Output your decision as either "One", "Two" or "Neither". No explanation is required.
        5. Let's think step by step.
        `),
            this.createHumanMessage(`
        User Ranking Rules:
        ${this.rankingRules}

        Overall Topic:
        ${this.overallTopic}

        Documents to Rank:

        Document One:
        ${itemOne.fullDescriptionOfAllContents}

        Document Two:
        ${itemTwo.fullDescriptionOfAllContents}

        The Most Relevant Document Is:
       `),
        ];
        return await this.getResultsFromLLM(index, "ingestion-agent", messages, itemOneIndex, itemTwoIndex);
    }
    async rankDocuments(docsToRank, rankingRules, overallTopic, eloRatingKey) {
        this.rankingRules = rankingRules;
        this.overallTopic = overallTopic;
        this.setupRankingPrompts(-1, docsToRank, docsToRank.length * 10, this.progressFunction);
        await this.performPairwiseRanking(-1);
        return this.getOrderedListOfItems(-1, true, eloRatingKey);
    }
}
//# sourceMappingURL=docRanker.js.map