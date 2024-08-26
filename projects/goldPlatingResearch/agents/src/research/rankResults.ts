import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

let havePrintedDebugPrompt = false;

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
    let rankablePossibleArticles = this.collectArticles(
      researchItem,
      "notJustifiedGoldPlating"
    );

    this.setupRankingPrompts(
      -1,
      rankablePossibleArticles,
      rankablePossibleArticles.length * 15
    );

    this.logger.info(
      `Ranking possible gold-plating articles for ${researchItem.name} notJustifiedGoldPlating`
    );

    await this.performPairwiseRanking(-1);

    const rankedArticles = this.getOrderedListOfItems(-1, true) as LawArticle[];

    await this.saveMemory();

    this.logger.debug(
      `Ranked possible gold-plating articles for ${
        researchItem.name
      } notJustifiedGoldPlating: ${JSON.stringify(rankedArticles, null, 2)}`
    );

    let rankableJustifiedArticles = this.collectArticles(
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

  private collectArticles(
    researchItem: GoldplatingResearchItem,
    collectionType: "justifiedGoldPlating" | "notJustifiedGoldPlating"
  ): LawArticle[] {
    const rankableArticles: LawArticle[] = [];

    const addArticles = (articles: LawArticle[]) => {
      articles
        .filter((article) =>
          collectionType == "justifiedGoldPlating"
            ? article.research?.likelyJustified === true
            : article.research?.likelyJustified === false
        )
        .forEach((article) => {
          rankableArticles.push(article);
        });
    };

    if (researchItem.nationalLaw) {
      addArticles(researchItem.nationalLaw.law.articles);
      researchItem.nationalLaw.law.articles.forEach((article) => {
        article.source = "law";
      });
    }

    if (researchItem.nationalRegulation) {
      researchItem.nationalRegulation.forEach((regulation) => {
        addArticles(regulation.articles);
        regulation.articles.forEach((article) => {
          article.source = "regulation";
        });
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
        `You are an AI expert trained to rank articles based on how burdensome their "gold plating" is.
         Gold plating refers to the practice of adding unnecessary or overly burdensome requirements to laws or regulations adopted from EU law.

        Instructions:
        1. You will receive two articles with identified gold-plating issues.
        2. Your task is to analyze, compare, and rank these articles based on how the identified gold-plating issues add costs or stifle innovation for Icelandic companies and citizens, potentially harming their competitiveness.
        4. Focus on factors like additional regulatory costs, increased administrative burdens, and restrictions that may hinder innovation or growth.
        5. Output your decision as "One", "Two" or "Neither". Output nothing else. No explanation is required.
        `
      ),
      this.createHumanMessage(
        `Gold-Plating Articles to Rank:

        <ArticleOne>
          Text: ${itemOne.research?.englishTranslationOfIcelandicArticle || itemOne.text}
          Gold-plating found: ${itemOne.research?.description}
          ${itemOne.research?.justification ? `Possible justification: ${itemOne.research?.justification}` : '' }
        </ArticleOne>

        <ArticleTwo>
          Text: ${itemTwo.research?.englishTranslationOfIcelandicArticle || itemTwo.text}
          Gold-plating found: ${itemTwo.research?.description}
          ${itemTwo.research?.justification ? `Possible justification: ${itemTwo.research?.justification}` : '' }
        </ArticleTwo>

        The Article number with more burdensome Gold-Plating Is:
        `
      ),
    ];

    if (!havePrintedDebugPrompt) {
      this.logger.debug(
        `Prompting user to rank articles: ${JSON.stringify(messages, null, 2)}`
      );
      havePrintedDebugPrompt = true;
    }

    return await this.getResultsFromLLM(
      index,
      messages,
      itemOneIndex,
      itemTwoIndex
    );
  }
}
