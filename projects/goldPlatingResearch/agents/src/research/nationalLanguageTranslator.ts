import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelType,
  PsAiModelSize,
} from "@policysynth/agents/aiModelTypes.js";

export class NationalLanguageTranslationAgent extends PolicySynthAgent {
  declare memory: GoldPlatingMemoryData;
  modelSize: PsAiModelSize = PsAiModelSize.Large;
  maxModelTokensOut = 8192;
  modelTemperature = 0.0;

  constructor(
    agent: PsAgent,
    memory: GoldPlatingMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
  }

  async processItem(researchItem: GoldplatingResearchItem): Promise<void> {
    await this.updateRangedProgress(
      0,
      "Starting national language translation"
    );

    await this.translateNationalLaw(researchItem);
    await this.translateNationalRegulation(researchItem);

    await this.updateRangedProgress(
      100,
      "National language translation completed"
    );
  }

  private async translateNationalLaw(
    researchItem: GoldplatingResearchItem
  ): Promise<void> {
    if (!researchItem.nationalLaw) return;

    const articles = researchItem.nationalLaw.law.articles;
    const totalArticles = articles.length;

    for (let i = 0; i < totalArticles; i++) {
      const article = articles[i];
      const progress = (i / totalArticles) * 50; // 0% to 50% of total progress
      await this.updateRangedProgress(
        progress,
        `Translating national law article ${article.number}`
      );

      if (article.research) {
        article.researchNationalLanguageTranslation =
          await this.translateResearch(article.research);
        await this.saveMemory();
      }
    }
  }

  private async translateNationalRegulation(
    researchItem: GoldplatingResearchItem
  ): Promise<void> {
    if (!researchItem.nationalRegulation) return;

    let totalArticles = 0;
    researchItem.nationalRegulation.forEach((regulation) => {
      totalArticles += regulation.articles.length;
    });

    let processedArticles = 0;
    for (const regulation of researchItem.nationalRegulation) {
      for (const article of regulation.articles) {
        const progress = 50 + (processedArticles / totalArticles) * 50; // 50% to 100% of total progress
        await this.updateRangedProgress(
          progress,
          `Translating national regulation article ${article.number}`
        );

        if (article.research) {
          article.researchNationalLanguageTranslation =
            await this.translateResearch(article.research);
          await this.saveMemory();
        }

        processedArticles++;
      }
    }
  }

  private async translateResearch(
    research: GoldPlatingResearch
  ): Promise<GoldPlatingResearch> {
    try {
      const translatedResearch: GoldPlatingResearch = {
        url: research.url,
        results: await this.translateResearchResults(research.results),
        possibleGoldPlating: research.possibleGoldPlating,
        likelyJustified: research.likelyJustified,
        justification: await this.translateText(research.justification),
        description: await this.translateText(research.description),
        reasonForGoldPlating: await this.translateText(
          research.reasonForGoldPlating
        ),
        recommendation: await this.translateText(research.recommendation),
        supportTextExplanation: await this.translateText(
          research.supportTextExplanation
        ),
      };

      return translatedResearch;
    } catch (error) {
      console.error("Failed to translate research results", error);
      throw error;
    }
  }

  private async translateResearchResults(
    results: ResearchResults
  ): Promise<ResearchResults> {
    try {
      const translatedResults: ResearchResults = {
        detailedRules: await this.translateText(results.detailedRules),
        expandedScope: await this.translateText(results.expandedScope),
        exemptionsNotUtilized: await this.translateText(
          results.exemptionsNotUtilized
        ),
        stricterNationalLaws: await this.translateText(
          results.stricterNationalLaws
        ),
        disproportionatePenalties: await this.translateText(
          results.disproportionatePenalties
        ),
        earlierImplementation: await this.translateText(
          results.earlierImplementation
        ),
        conclusion: await this.translateText(results.conclusion),
        euDirectiveArticlesNumbers: results.euDirectiveArticlesNumbers,
        possibleReasons: await this.translateText(results.possibleReasons),
        goldPlatingWasFound: results.goldPlatingWasFound,
      };
      return translatedResults;
    } catch (error) {
      console.error("Failed to translate research results", error);
      throw error;
    }
  }

  private async translateText(text: string | undefined): Promise<string> {
    if (!text) return "No text provided for translation";

    const systemMessage = this.createSystemMessage(
      `You are a professional translator for Icelandic legal documents that come from EU law. Translate the given text from English to Icelandic, maintaining the original meaning and tone.
       Important: Only output the translation, do not include any additional information or context.`
    );

    const userMessage = this.createHumanMessage(
      `Please translate the following text to Icelandic:\n\n${text}`
    );

    const translatedText = (await this.callModel(
      PsAiModelType.Text,
      this.modelSize,
      [systemMessage, userMessage],
      false
    )) as string;

    return translatedText || "No translation available";
  }
}
