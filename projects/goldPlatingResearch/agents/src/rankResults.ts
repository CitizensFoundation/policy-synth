import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

interface RankableArticle extends LawArticle {
  source: "law" | "regulation";
}

export class FoundGoldPlatingRankingAgent extends PairwiseRankingAgent {
  override memory: GoldPlatingMemoryData;
  defaultModelSize = PsAiModelSize.Medium;

  updatePrefix = "Rank Gold-Plating Articles";

  constructor(
    agent: PsAgent,
    memory: GoldPlatingMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
  }

  async processItem(researchItem: GoldplatingResearchItem): Promise<void> {
    const rankableArticles = this.collectRankableArticles(researchItem);

    this.setupRankingPrompts(
      -1,
      rankableArticles,
      rankableArticles.length * 15
    );
    await this.performPairwiseRanking(-1);

    const rankedArticles = this.getOrderedListOfItems(-1, true) as RankableArticle[];
    this.updateArticlesWithRankings(researchItem, rankedArticles);
  }

  private collectRankableArticles(
    researchItem: GoldplatingResearchItem
  ): RankableArticle[] {
    const rankableArticles: RankableArticle[] = [];

    if (researchItem.nationalLaw) {
      rankableArticles.push(
        ...researchItem.nationalLaw.law.articles
          .filter((article) => article.research?.possibleGoldPlating)
          .map((article) => ({ ...article, source: "law" as const }))
      );
    }

    if (researchItem.nationalRegulation) {
      researchItem.nationalRegulation.forEach((regulation) => {
        rankableArticles.push(
          ...regulation.articles
            .filter((article) => article.research?.possibleGoldPlating)
            .map((article) => ({ ...article, source: "regulation" as const }))
        );
      });
    }

    return rankableArticles;
  }

  async voteOnPromptPair(
    index: number,
    promptPair: number[]
  ): Promise<PsPairWiseVoteResults> {
    const itemOneIndex = promptPair[0];
    const itemTwoIndex = promptPair[1];

    const itemOne = this.allItems![index]![itemOneIndex] as RankableArticle;
    const itemTwo = this.allItems![index]![itemTwoIndex] as RankableArticle;

    const messages = [
      this.createSystemMessage(
        `
        You are an AI expert trained to rank articles based on the severity and importance of identified gold-plating issues.

        Instructions:
        1. You will receive two articles with identified gold-plating issues.
        2. Your task is to analyze, compare, and rank these articles based on the severity and potential impact of the gold-plating.
        3. Consider factors such as the extent of divergence from EU law, potential economic impact, and implications for citizens or businesses.
        4. Output your decision as "One", "Two" or "Neither". Output nothing else. No explanation is required.
        `
      ),
      this.createHumanMessage(
        `Gold-Plating Articles to Rank:

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
        `
      ),
    ];

    return await this.getResultsFromLLM(
      index,
      messages,
      itemOneIndex,
      itemTwoIndex
    );
  }

  private updateArticlesWithRankings(
    researchItem: GoldplatingResearchItem,
    rankedArticles: RankableArticle[]
  ): void {
    rankedArticles.forEach((article) => {
      if (!article.eloRating) {
        this.logger.error(
          `Article ${article.number} has no ELO rating after ranking`
        );
      }
      if (article.source === "law" && researchItem.nationalLaw) {
        const lawArticle = researchItem.nationalLaw.law.articles.find(
          (a) => a.number === article.number
        );
        if (lawArticle) {
          lawArticle.eloRating = article.eloRating;
          this.logger.debug(`Updated law article ${article.number} with ELO rating ${article.eloRating}`);
        }
      } else if (
        article.source === "regulation" &&
        researchItem.nationalRegulation
      ) {
        for (const regulation of researchItem.nationalRegulation) {
          const regulationArticle = regulation.articles.find(
            (a) => a.number === article.number
          );
          if (regulationArticle) {
            regulationArticle.eloRating = article.eloRating;
            this.logger.debug(`Updated regulation article ${article.number} with ELO rating ${article.eloRating}`);
            break;
          }
        }
      }
    });
  }
}
