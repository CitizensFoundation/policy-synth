import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

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
    let rankablePossibleArticles = this.collectRankableArticles(
      researchItem,
      "possibleGoldPlating"
    );

    this.setupRankingPrompts(
      -1,
      rankablePossibleArticles,
      rankablePossibleArticles.length * 15
    );

    this.logger.info(
      `Ranking possible gold-plating articles for ${researchItem.name} possibleGoldPlating`
    );

    await this.performPairwiseRanking(-1);

    const rankedArticles = this.getOrderedListOfItems(-1, true) as LawArticle[];

    this.logger.debug(
      `Ranked possible gold-plating articles for ${
        researchItem.name
      } possibleGoldPlating: ${JSON.stringify(rankedArticles, null, 2)}`
    );

    let rankableJustifiedArticles = this.collectRankableArticles(
      researchItem,
      "justifiedGoldPlating"
    );

    this.setupRankingPrompts(
      -2,
      rankableJustifiedArticles,
      rankableJustifiedArticles.length * 15
    );

    this.logger.info(
      `Ranking justified gold-plating articles for ${researchItem.name} justifiedGoldPlating`
    );

    await this.performPairwiseRanking(-2);

    const rankedJustifiedArticles = this.getOrderedListOfItems(
      -2,
      true
    ) as LawArticle[];

    this.logger.debug(
      `Ranked justified gold-plating articles for ${
        researchItem.name
      } justifiedGoldPlating: ${JSON.stringify(
        rankedJustifiedArticles,
        null,
        2
      )}`
    );
  }

  private collectRankableArticles(
    researchItem: GoldplatingResearchItem,
    collectionType: "possibleGoldPlating" | "justifiedGoldPlating"
  ): LawArticle[] {
    const rankableArticles: LawArticle[] = [];

    const addArticles = (
      articles: LawArticle[],
      source: "law" | "regulation"
    ) => {
      articles
        .filter((article) =>
          collectionType == "possibleGoldPlating"
            ? article.research?.possibleGoldPlating
            : article.research?.likelyJustified
        )
        .forEach((article) => {
          rankableArticles.push(article);
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

    const itemOne = this.allItems![index]![itemOneIndex] as LawArticle;
    const itemTwo = this.allItems![index]![itemTwoIndex] as LawArticle;

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
        Text: ${itemOne.text}
        ${itemOne.research?.supportTextExplanation ? `Support text explanation: ${itemOne.research?.supportTextExplanation}` : '' }

        Article Two:
        Number: ${itemTwo.number}
        Text: ${itemTwo.text}
        ${itemTwo.research?.supportTextExplanation ? `Support text explanation: ${itemTwo.research?.supportTextExplanation}` : '' }

        The Article with Burdensome Gold-Plating Is:
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
}
