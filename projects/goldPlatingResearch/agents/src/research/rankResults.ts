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

    const addArticles = (articles: LawArticle[], source: "law" | "regulation") => {
      articles
        .filter((article) => article.research?.possibleGoldPlating)
        .forEach((article) => {
          rankableArticles.push({
            ...article,
            source,
            eloRating: article.eloRating || 1000
          });
        });
    };

    if (researchItem.nationalLaw) {
      addArticles(researchItem.nationalLaw.law.articles, "law");
    }

    if (researchItem.nationalRegulation) {
      researchItem.nationalRegulation.forEach((regulation) => {
        addArticles(regulation.articles, "regulation");
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
        `You are an AI expert trained to rank articles based on the severity and importance of identified gold-plating issues.

        Instructions:
        1. You will receive two articles with identified gold-plating issues.
        2. Your task is to analyze, compare, and rank these articles based on how the identified gold-plating issues add costs or stifle innovation for Icelandic companies and citizens, potentially harming their competitiveness. Focus on factors like additional regulatory costs, increased administrative burdens, and restrictions that may hinder innovation or growth.
        3. Output your decision as "One", "Two" or "Neither". Output nothing else. No explanation is required.
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
      if (!article.eloRating || article.eloRating === 0) {
        this.logger.error(
          `Article ${article.number} has invalid ELO rating (${article.eloRating}) after ranking`
        );
        article.eloRating = 1000; // Set a default score if invalid
      }

      const updateArticle = (targetArticle: LawArticle) => {
        if (targetArticle.eloRating !== article.eloRating) {
          targetArticle.eloRating = article.eloRating;
          this.logger.debug(`Updated ${article.source} article ${article.number} with ELO rating ${article.eloRating}`);
        }
      };

      if (article.source === "law" && researchItem.nationalLaw) {
        const lawArticle = researchItem.nationalLaw.law.articles.find(
          (a) => a.number === article.number
        );
        if (lawArticle) {
          updateArticle(lawArticle);
        } else {
          this.logger.error(`Law article ${article.number} not found in research item`);
        }
      } else if (
        article.source === "regulation" &&
        researchItem.nationalRegulation
      ) {
        let found = false;
        for (const regulation of researchItem.nationalRegulation) {
          const regulationArticle = regulation.articles.find(
            (a) => a.number === article.number
          );
          if (regulationArticle) {
            updateArticle(regulationArticle);
            found = true;
            break;
          }
        }
        if (!found) {
          this.logger.error(`Regulation article ${article.number} not found in research item`);
        }
      }
    });
  }
}
