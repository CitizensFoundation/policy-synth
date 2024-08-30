import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelType,
  PsAiModelSize,
} from "@policysynth/agents/aiModelTypes.js";

export class JustifyGoldPlatingAgent extends PolicySynthAgent {
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
      "Starting gold-plating justification analysis"
    );

    await this.justifyNationalLawGoldPlating(researchItem);
    await this.justifyNationalRegulationGoldPlating(researchItem);

    await this.updateRangedProgress(
      100,
      "Gold-plating justification analysis completed"
    );
  }

  private async justifyNationalLawGoldPlating(
    researchItem: GoldplatingResearchItem
  ): Promise<void> {
    if (!researchItem.nationalLaw) return;

    const articles = researchItem.nationalLaw.law.articles;
    const totalArticles = articles.length;

    for (let i = 0; i < totalArticles; i++) {
      this.logger.info(
        `Analyzing justification for national law article ${articles[i].number}`
      );
      const article = articles[i];
      const progress = (i / totalArticles) * 50; // 0% to 50% of total progress
      await this.updateRangedProgress(
        progress,
        `Analyzing justification for national law article ${article.number}`
      );

      if (article.research?.possibleGoldPlating) {
        let justification;

        if (article.research.supportTextExplanation) {
          //this.logger.debug(`Support text explanation for article ${article.number}:\n\n${article.research.supportTextExplanation}`);
          justification = await this.analyzeJustification(
            article,
            researchItem.euDirective.fullText,
            article.research.englishTranslationOfIcelandicArticle!,
            article.research.euLawExtract,
            "law"
          );
        } else {
          this.logger.info(
            `No support text explanation for article ${article.number}`
          );
        }

        if (!justification) {
          const secondCheck = await this.checkEURegulationMinimums(
            article,
            researchItem.euDirective.fullText,
            article.research.englishTranslationOfIcelandicArticle!,
            article.research.euLawExtract,
            "law"
          );
          if (secondCheck.justifiedGoldPlating) {
            article.research.likelyJustified = true;
            article.research.justification =
              secondCheck.justificationForGoldPlating;
          } else {
            article.research.likelyJustified = false;
            article.research.justification =
              "No justification found for gold-plating";
          }
        } else if (justification) {
          article.research.likelyJustified = justification.justifiedGoldPlating;
          article.research.justification =
            justification.justificationForGoldPlating;
        }

        await this.saveMemory();
      } else {
        this.logger.info(
          `No possible gold-plating for article ${article.number}`
        );
      }
    }
  }

  private async justifyNationalRegulationGoldPlating(
    researchItem: GoldplatingResearchItem
  ): Promise<void> {
    if (!researchItem.nationalRegulation) return;

    let totalArticles = 0;
    researchItem.nationalRegulation.forEach((regulation) => {
      totalArticles += regulation.articles.length;
    });

    let processedArticles = 0;
    for (const regulation of researchItem.nationalRegulation) {
      const allSupportText = regulation.articles
        .map((article) => article.research?.supportTextExplanation || "")
        .join("\n\n");

      for (const article of regulation.articles) {
        const progress = 50 + (processedArticles / totalArticles) * 50; // 50% to 100% of total progress
        await this.updateRangedProgress(
          progress,
          `Analyzing justification for national regulation article ${article.number}`
        );

        if (article.research?.possibleGoldPlating) {
          /*const justification = await this.analyzeJustification(
            article,
            researchItem.euDirective.fullText,
            article.research.englishTranslationOfIcelandicArticle!,
            article.research.euLawExtract || "N/A",
            "regulation"
          );

          this.logger.debug(
            `Justification: ${JSON.stringify(justification, null, 2)}`
          );*/

          if (true /*!justification.justifiedGoldPlating*/) {
            const secondCheck = await this.checkEURegulationMinimums(
              article,
              researchItem.euDirective.fullText,
              article.research.englishTranslationOfIcelandicArticle!,
              article.research.euLawExtract,
              "regulation"
            );

            this.logger.debug(
              `secondCheck: ${JSON.stringify(secondCheck, null, 2)}`
            );

            if (secondCheck.justifiedGoldPlating) {
              article.research.likelyJustified = true;
              article.research.justification =
                secondCheck.justificationForGoldPlating;
            } else {
              article.research.likelyJustified = false;
              article.research.justification =
                "No justification found for gold-plating";
            }
          } else {
            /*article.research.likelyJustified =
              justification.justifiedGoldPlating;
            article.research.justification =
              justification.justificationForGoldPlating;*/
          }

          await this.saveMemory();
        }

        processedArticles++;
      }
    }
  }

  private async analyzeJustification(
    article: LawArticle | RegulationArticle,
    euDirectiveFullText: string,
    englishTranslation: string,
    euLawExtract: string | undefined,
    type: "law" | "regulation",
    allSupportText?: string
  ): Promise<{
    justificationForGoldPlating: string;
    justifiedGoldPlating: boolean;
  }> {
    const systemMessage = this.createSystemMessage(
      this.getJustificationAnalysisSystemPrompt(
        euDirectiveFullText,
        allSupportText
      )
    );

    const userMessage = this.createHumanMessage(
      this.getJustificationAnalysisUserPrompt(
        article,
        englishTranslation,
        euLawExtract,
        type
      )
    );

    //this.logger.debug(`analyzeJustification - userMessage: ${JSON.stringify(userMessage, null, 2)}`);

    const result = (await this.callModel(
      PsAiModelType.Text,
      this.modelSize,
      [systemMessage, userMessage],
      true
    )) as {
      justificationForGoldPlating: string;
      justifiedGoldPlating: boolean;
    };

    return result;
  }

  private async checkEURegulationMinimums(
    article: LawArticle | RegulationArticle,
    euDirectiveFullText: string,
    englishTranslation: string,
    euLawExtract: string | undefined,
    type: "law" | "regulation"
  ): Promise<{
    justificationForGoldPlating: string;
    justifiedGoldPlating: boolean;
  }> {
    const systemMessage = this.createSystemMessage(
      this.getEURegulationMinimumsSystemPrompt(
        euDirectiveFullText,
        euLawExtract
      )
    );

    const userMessage = this.createHumanMessage(
      this.getEURegulationMinimumsUserPrompt(
        article,
        englishTranslation,
        euLawExtract,
        type
      )
    );

    //this.logger.debug(`checkEURegulationMinimums - userMessage: ${JSON.stringify(userMessage, null, 2)}`);

    const result = (await this.callModel(
      PsAiModelType.Text,
      this.modelSize,
      [systemMessage, userMessage],
      true
    )) as {
      justificationForGoldPlating: string;
      justifiedGoldPlating: boolean;
    };

    return result;
  }

  private getJustificationAnalysisSystemPrompt(
    euDirectiveFullText: string,
    allSupportText?: string
  ): string {
    const skipFullEuDirective = true;
    return `<JustificationAnalysisSystem>
You are an expert legal analyst specializing in EU and national law comparisons.
Your task is to analyze gold-plating that has been confirmed in national laws or regulations and determine if there's a full justification for it.

Consider the following when analyzing:
1. The context and intent of the national law or regulation.
2. Any specific national circumstances that might necessitate stricter or more detailed rules.
3. The potential benefits of gold-plating for the national legal or regulatory framework.
4. Whether the gold-plating aligns with the overall objectives of the EU directive.
5. Only set justifiedGoldPlating to true if the gold-plating is justified and necessary.

${
  !skipFullEuDirective
    ? `Here is the full text of the EU Directive for reference:

<FullEuDirective>
${euDirectiveFullText}
</FullEuDirective>`
    : ``
}

${
  allSupportText
    ? `<AllLawSupportExplainationText>${allSupportText}</AllLawSupportExplainationText>`
    : ``
}

Provide your analysis in JSON format with two fields:

\`\`\`json
  {
    justificationForGoldPlating: string;
    justifiedGoldPlating: boolean;
  }
  \`\`\`
</JustificationAnalysisSystem>`;
  }

  private getJustificationAnalysisUserPrompt(
    article: LawArticle | RegulationArticle,
    englishTranslation: string,
    euLawExtract: string | undefined,
    type: "law" | "regulation"
  ): string {
    return `Article with possible justifiable gold-plating:
Number: ${article.number}
Type: ${type}

<ArticleText>${article.text}</ArticleText>

${
  euLawExtract
    ? `<RelevantEUDirectiveExtract>
${euLawExtract}
</RelevantEUDirectiveExtract>`
    : ``
}

<ArticleEnglishTranslation>${englishTranslation}</ArticleEnglishTranslation>

<GoldplatingFoundInPreviousStep>${
      article.research?.description
    }</GoldplatingFoundInPreviousStep>

${
  article.research?.supportTextExplanation
    ? `<SupportTextExplanationToReviewForJustification>${article.research?.supportTextExplanation}<SupportTextExplanationToReviewForJustification>`
    : ""
}


Let's think step by step. First, start by outlining your reasoning in analysing if there is justification for gold plating, then output in JSON markdown format:`;
  }

  private getEURegulationMinimumsSystemPrompt(
    euDirectiveFullText: string,
    euLawExtract: string | undefined
  ): string {
    const skipFullEuDirective = true;
    return `<EURegulationMinimumsSystem>
You are an expert legal analyst specializing in EU and national law comparisons.
Your task is to analyze gold-plating in an article that has been confirmed in national laws or regulations and determine if there's a full justification for it.

Consider the following:
1. Whether the EU directive explicitly states that it sets minimum standards.
2. If the directive uses language that suggests member states should or may elaborate on certain points.
3. Only set justifiedGoldPlating to true if the gold-plating is justified and necessary.

${
  !skipFullEuDirective || !euLawExtract
    ? `<FullEuDirective>
${euDirectiveFullText}
</FullEuDirective>`
    : ``
}

Let's think step by step. First, start by outlining your reasoning in analysing if there is justification for gold plating, then output in JSON markdown format:
\`\`\`json
  {
    justificationForGoldPlating: string;
    justifiedGoldPlating: boolean;
  }
  \`\`\`
</EURegulationMinimumsSystem>`;
  }

  private getEURegulationMinimumsUserPrompt(
    article: LawArticle | RegulationArticle,
    englishTranslation: string,
    euLawExtract: string | undefined,
    type: "law" | "regulation"
  ): string {
    return `Article with potential gold-plating:
Number: ${article.number}
Type: ${type}

<ArticleText>${article.text}</ArticleText>

${
  euLawExtract
    ? `<RelevantEUDirectiveExtract>
${euLawExtract}
</RelevantEUDirectiveExtract>`
    : ``
}

<ArticleEnglishTranslation>${englishTranslation}</ArticleEnglishTranslation>

<GoldplatingFoundInPreviousStep>${article.research?.description}</GoldplatingFoundInPreviousStep>

Let's think step by step. First, start by outlining your reasoning in analysing if there is justification for gold plating, then output in this JSON markdown format:`;
  }
}
