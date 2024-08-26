import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelType,
  PsAiModelSize,
} from "@policysynth/agents/aiModelTypes.js";

let havePrintedDebugPrompt = false;

export class SupportTextReviewAgent extends PolicySynthAgent {
  declare memory: GoldPlatingMemoryData;
  modelSize: PsAiModelSize = PsAiModelSize.Medium;
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
    await this.updateRangedProgress(0, "Starting support text review");

    await this.reviewNationalLawSupportText(researchItem);
    //await this.reviewNationalRegulationSupportText(researchItem);

    await this.updateRangedProgress(100, "Support text review completed");
  }

  private async reviewNationalLawSupportText(
    researchItem: GoldplatingResearchItem
  ): Promise<void> {
    if (
      !researchItem.nationalLaw ||
      !researchItem.nationalLaw.supportArticleText
    ) {
      this.logger.warn(
        `No national law or support text found for research item`
      );
      return;
    }

    const articles = researchItem.nationalLaw.law.articles;
    const totalArticles = articles.length;

    for (let i = 0; i < totalArticles; i++) {
      const article = articles[i];
      const progress = (i / totalArticles) * 50; // 0% to 50% of total progress
      await this.updateRangedProgress(
        progress,
        `Reviewing support text for national law article ${article.number}`
      );

      if (article.research?.possibleGoldPlating) {
        const supportArticleId =
          researchItem.supportArticleTextArticleIdMapping[
            this.normalizeArticleNumber(article.number)
          ] || this.normalizeArticleNumber(article.number);

        this.logger.debug(`Analytics Support article ID: ${supportArticleId}`);

        if (supportArticleId) {
          let supportArticle;

          for (
            let r = 0;
            r < researchItem.nationalLaw.supportArticleText.articles.length;
            r++
          ) {
            const realArticleId = this.normalizeArticleNumber(
              researchItem.nationalLaw.supportArticleText.articles[r].number
            );
            if (realArticleId == supportArticleId) {
              supportArticle =
                researchItem.nationalLaw.supportArticleText.articles[r];
              break;
            }
          }

          this.logger.debug(`Analysing ${supportArticleId}`);

          if (supportArticle) {
            const explanation = await this.analyzeSupportText(
              article,
              supportArticle
            );
            article.research.supportTextExplanation = explanation;

            this.logger.debug(
              `Support text EXPLAINATION for article ${article.number}: ${explanation}`
            );

            await this.saveMemory();
          } else {
            this.logger.error(
              `No support text found for article ${article.number} in national law`
            );
          }
        } else {
          this.logger.error(
            `No support text found for article ${article.number} in national law`
          );
        }
      }
    }
  }

  private normalizeArticleNumber(number: string | number): number {
    if (typeof number === "number") {
      return number;
    } else if (typeof number === "string") {
      try {
        const intValue = parseInt(number.replace(/(\.|gr|Um)/g, "").trim());
        return intValue;
      } catch (error) {
        this.logger.error(`Failed to normalize article number: ${number}`);
        return 0;
      }
    } else {
      return number;
    }
  }

  private async reviewNationalRegulationSupportText(
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
          `Reviewing support text for national regulation article ${article.number}`
        );

        if (article.research?.possibleGoldPlating) {
          // For regulations, we don't have separate support text, so we'll use the article's own text as context
          const explanation = await this.analyzeSupportText(article, article);
          article.research.supportTextExplanation = explanation;
        }

        processedArticles++;
      }
    }
  }

  private async analyzeSupportText(
    article: LawArticle | RegulationArticle,
    supportArticle: LawArticle | RegulationArticle
  ): Promise<string> {
    const systemMessage = this.createSystemMessage(
      this.getSupportTextAnalysisSystemPrompt()
    );

    const userMessage = this.createHumanMessage(
      this.getSupportTextAnalysisUserPrompt(article, supportArticle)
    );

    if (!havePrintedDebugPrompt) {
      this.logger.debug(`Support text analysis system prompt: ${JSON.stringify(systemMessage, null, 2)}`);
      this.logger.debug(`Support text analysis user prompt: ${JSON.stringify(userMessage, null, 2)}`);
      havePrintedDebugPrompt = true;
    }

    const result = (await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Large,
      [systemMessage, userMessage],
      false
    )) as string;

    return result;
  }

  private getSupportTextAnalysisSystemPrompt(): string {
    return `You are an expert legal analyst specializing in interpreting support texts for laws and regulations. Your task is to analyze the support text for a given article that has been identified as potentially containing gold-plating.

Your analysis should focus on:
1. Explaining any justifications provided in the support text for the potential gold-plating.
2. Identifying any additional context that might clarify why the article was implemented in its current form.
3. Noting any explicit mentions of intentional divergence from EU directive and the reasons given.
4. Highlighting any explanations for stricter rules, expanded scope, or earlier implementation.

Provide a concise but comprehensive explanation based on the support text. If the support text does not provide relevant information, state that clearly.`;
  }

  private getSupportTextAnalysisUserPrompt(
    article: LawArticle | RegulationArticle,
    supportArticle: LawArticle | RegulationArticle
  ): string {
    return `Article with potential gold-plating:
<LawArticleInEnglish>${article.research?.englishTranslationOfIcelandicArticle || article.text}</LawArticleInEnglish>
<GoldPlatingConcern>${article.research?.description}</GoldPlatingConcern>

<SupportTextAboutTheLawArticle>
${supportArticle.text}
</SupportTextAboutTheLawArticle>

Please analyze the support text and provide an explanation for the potential gold-plating:`;
  }
}
