import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
export class FoundGoldPlatingRankingAgent extends PairwiseRankingAgent {
    memory;
    defaultModelSize = PsAiModelSize.Small;
    updatePrefix = "Rank Gold-Plating Articles";
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
    }
    async processItem(researchItem) {
        const rankableArticles = this.collectRankableArticles(researchItem);
        this.setupRankingPrompts(-1, rankableArticles, rankableArticles.length * 15);
        await this.performPairwiseRanking(-1);
        const rankedArticles = this.getOrderedListOfItems(-1);
        this.updateArticlesWithRankings(researchItem, rankedArticles);
    }
    collectRankableArticles(researchItem) {
        const rankableArticles = [];
        if (researchItem.nationalLaw) {
            rankableArticles.push(...researchItem.nationalLaw.law.articles
                .filter((article) => article.research?.possibleGoldplating)
                .map((article) => ({ ...article, source: "law" })));
        }
        if (researchItem.nationalRegulation) {
            researchItem.nationalRegulation.forEach((regulation) => {
                rankableArticles.push(...regulation.articles
                    .filter((article) => article.research?.possibleGoldplating)
                    .map((article) => ({ ...article, source: "regulation" })));
            });
        }
        return rankableArticles;
    }
    async voteOnPromptPair(index, promptPair) {
        const itemOneIndex = promptPair[0];
        const itemTwoIndex = promptPair[1];
        const itemOne = this.allItems[index][itemOneIndex];
        const itemTwo = this.allItems[index][itemTwoIndex];
        const messages = [
            this.createSystemMessage(`
        You are an AI expert trained to rank articles based on the severity and importance of identified gold-plating issues.

        Instructions:
        1. You will receive two articles with identified gold-plating issues.
        2. Your task is to analyze, compare, and rank these articles based on the severity and potential impact of the gold-plating.
        3. Consider factors such as the extent of divergence from EU law, potential economic impact, and implications for citizens or businesses.
        4. Output your decision as "One", "Two" or "Neither". Output nothing else. No explanation is required.
        `),
            this.createHumanMessage(`Gold-Plating Articles to Rank:

        Article One:
        Number: ${itemOne.number}
        Source: ${itemOne.source}
        Text: ${itemOne.text}
        Gold-plating issue: ${itemOne.research?.reasonForGoldPlating}
        Support text explanation: ${itemOne.research?.supportTextExplanation}

        Article Two:
        Number: ${itemTwo.number}
        Source: ${itemTwo.source}
        Text: ${itemTwo.text}
        Gold-plating issue: ${itemTwo.research?.reasonForGoldPlating}
        Support text explanation: ${itemTwo.research?.supportTextExplanation}

        The Article with More Severe or Important Gold-Plating Is:
        `),
        ];
        return await this.getResultsFromLLM(index, messages, itemOneIndex, itemTwoIndex);
    }
    updateArticlesWithRankings(researchItem, rankedArticles) {
        rankedArticles.forEach((article, index) => {
            const eloRating = 2000 - index * (500 / rankedArticles.length); // Simple ELO-like rating
            if (article.source === "law" && researchItem.nationalLaw) {
                const lawArticle = researchItem.nationalLaw.law.articles.find((a) => a.number === article.number);
                if (lawArticle) {
                    lawArticle.eloRating = eloRating;
                }
            }
            else if (article.source === "regulation" &&
                researchItem.nationalRegulation) {
                for (const regulation of researchItem.nationalRegulation) {
                    const regulationArticle = regulation.articles.find((a) => a.number === article.number);
                    if (regulationArticle) {
                        regulationArticle.eloRating = eloRating;
                        break; // Exit the loop once we've found and updated the article
                    }
                }
            }
        });
    }
}
//# sourceMappingURL=rankResults.js.map