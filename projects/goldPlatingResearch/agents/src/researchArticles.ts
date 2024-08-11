import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelType,
  PsAiModelSize,
} from "@policysynth/agents/aiModelTypes.js";

export class GoldPlatingSearchAgent extends PolicySynthAgent {
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
    await this.updateRangedProgress(0, "Starting gold-plating search");

    await this.compareNationalLawToEULaw(researchItem);
    await this.compareNationalRegulationToEULaw(researchItem);
    //await this.compareNationalLawToEURegulation(researchItem);
    //await this.compareNationalRegulationToEURegulation(researchItem);

    await this.updateRangedProgress(100, "Gold-plating search completed");
  }

  private async compareNationalLawToEULaw(
    researchItem: GoldplatingResearchItem
  ): Promise<void> {
    if (!researchItem.nationalLaw || !researchItem.euDirective) return;

    const totalArticles = researchItem.nationalLaw.law.articles.length;
    for (let i = 0; i < totalArticles; i++) {
      this.logger.debug(`Analyzing national law article ${i}`);
      const article = researchItem.nationalLaw.law.articles[i];

      article.research = undefined;
      article.eloRating = undefined;
      await this.saveMemory();

      const progress = (i / totalArticles) * 25; // 25% of total progress
      await this.updateRangedProgress(
        progress,
        `Analyzing national law article ${article.number}`
      );

      const goldPlatingResult = (await this.analyzeGoldPlating(
        researchItem.nationalLaw.law.fullText,
        researchItem.euDirective.fullText,
        article.text,
        "law"
      )) as LlmAnalysisResponse;

      article.research = this.processGoldPlatingResult(
        goldPlatingResult,
        researchItem.nationalLaw.law.url
      );

      await this.saveMemory();
    }
  }

  private async compareNationalRegulationToEULaw(
    researchItem: GoldplatingResearchItem
  ): Promise<void> {
    if (!researchItem.nationalRegulation || !researchItem.euDirective) return;

    let totalArticles = 0;
    researchItem.nationalRegulation.forEach((regulation) => {
      totalArticles += regulation.articles.length;
    });

    let processedArticles = 0;
    for (const regulation of researchItem.nationalRegulation) {
      for (const article of regulation.articles) {
        this.logger.debug(
          `Analyzing national regulation article ${article.number}`
        );

        article.research = undefined;
        article.eloRating = undefined;

        await this.saveMemory();

        const progress = 25 + (processedArticles / totalArticles) * 25; // 25% to 50% of total progress
        await this.updateRangedProgress(
          progress,
          `Analyzing national regulation article ${article.number}`
        );

        const goldPlatingResult = await this.analyzeGoldPlating(
          regulation.fullText,
          researchItem.euDirective.fullText,
          article.text,
          "regulation"
        );

        article.research = this.processGoldPlatingResult(
          goldPlatingResult,
          regulation.url
        );

        processedArticles++;

        await this.saveMemory();
      }
    }
  }

  private async compareNationalLawToEURegulation(
    researchItem: GoldplatingResearchItem
  ): Promise<void> {
    if (!researchItem.nationalLaw || !researchItem.euRegulation) return;

    const totalArticles = researchItem.nationalLaw.law.articles.length;
    for (let i = 0; i < totalArticles; i++) {
      const article = researchItem.nationalLaw.law.articles[i];
      const progress = 50 + (i / totalArticles) * 25; // 50% to 75% of total progress
      await this.updateRangedProgress(
        progress,
        `Analyzing national law article ${article.number} against EU regulation`
      );

      const goldPlatingResult = await this.analyzeGoldPlating(
        researchItem.nationalLaw.law.fullText,
        researchItem.euRegulation.fullText,
        article.text,
        "law"
      );

      JSON.stringify(goldPlatingResult, null, 2);

      article.research = this.processGoldPlatingResult(
        goldPlatingResult,
        researchItem.nationalLaw.law.url
      );

      await this.saveMemory();
    }
  }

  private async compareNationalRegulationToEURegulation(
    researchItem: GoldplatingResearchItem
  ): Promise<void> {
    if (!researchItem.nationalRegulation || !researchItem.euRegulation) return;

    let totalArticles = 0;
    researchItem.nationalRegulation.forEach((regulation) => {
      totalArticles += regulation.articles.length;
    });

    let processedArticles = 0;
    for (const regulation of researchItem.nationalRegulation) {
      for (const article of regulation.articles) {
        const progress = 75 + (processedArticles / totalArticles) * 25; // 75% to 100% of total progress
        await this.updateRangedProgress(
          progress,
          `Analyzing national regulation article ${article.number} against EU regulation`
        );

        const goldPlatingResult = await this.analyzeGoldPlating(
          regulation.fullText,
          researchItem.euRegulation.fullText,
          article.text,
          "regulation"
        );

        article.research = this.processGoldPlatingResult(
          goldPlatingResult,
          regulation.url
        );
        processedArticles++;

        await this.saveMemory();
      }
    }
  }

  private async extractRelevantEuText(
    euLaw: string,
    type: string,
    articleToAnalyze: string,
    englishTranslationOfArticle: string
  ): Promise<string> {
    const systemPrompt = `You are an expert in EU law. Your task is to extract the most relevant parts of the EU law that could apply to the given national law article.
    Focus on sections that directly relate to the content of the national law article.
    Extract and output the unchanged EU law text without any comments before or after your EU law text extraction.`;

    const userPrompt = `Given the following EU law text and a national law article, please extract the most relevant parts of the EU law that could apply to the <national_${type}_article> or it's English translation <translation_of_national_${type}_article>.

<EuLaw>
${euLaw}
</EuLaw>

<national_${type}_article>${articleToAnalyze}</national_${type}_article>

<translation_of_national_${type}_article>${englishTranslationOfArticle}</translation_of_national_${type}_article>

Output the extracted relevant EU law text without comments:`;

    return (await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Medium,
      [
        this.createSystemMessage(systemPrompt),
        this.createHumanMessage(userPrompt),
      ],
      false,
      true
    )) as string;
  }

  private async translateToEnglish(
    euLaw: string,
    type: string,
    text: string
  ): Promise<string> {
    const systemPrompt = `You are a professional translator of Icelandic ${type} to EU standard English.
    The EU law is provided for reference for your translation, try to use similar terminology and structure in your translation.
    Your task is to accurately translate the given text to English. Preserve the original meaning.`;

    const userPrompt = `<EuLawForTerminlogyReference>${euLaw}</EuLawForTerminlogyReference>
Please translate the following text to English:

<TextToTranslateToEnglish>${text}</TextToTranslateToEnglish>

English translation:`;

    return (await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Medium,
      [
        this.createSystemMessage(systemPrompt),
        this.createHumanMessage(userPrompt),
      ],
      false
    )) as string;
  }

  private async analyzeGoldPlating(
    icelandicLaw: string,
    euLaw: string,
    articleToAnalyze: string,
    type: "law" | "regulation"
  ): Promise<any> {
    const translatedArticle = await this.translateToEnglish(
      euLaw,
      type,
      articleToAnalyze
    );
    this.logger.debug(`Translated article: ${translatedArticle}`);

    const relevantEuText = await this.extractRelevantEuText(
      euLaw,
      type,
      articleToAnalyze,
      translatedArticle
    );

    this.logger.debug(`Relevant EU text: ${relevantEuText}`);

    const systemMessage = this.createSystemMessage(
      this.getGoldPlatingSystemPrompt(type)
    );

    const userMessage = this.createHumanMessage(
      this.getGoldPlatingUserPrompt(
        icelandicLaw,
        euLaw,
        articleToAnalyze,
        type,
        relevantEuText,
        translatedArticle
      )
    );

    const result = (await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Large,
      [systemMessage, userMessage],
      true
    )) as LlmAnalysisResponse;

    result.euLawExtract = relevantEuText;
    result.englishTranslationOfIcelandicArticle = translatedArticle;

    this.logger.debug(
      `Full gold plating analysis result: ${JSON.stringify(result, null, 2)}`
    );

    return result;
  }

  private processGoldPlatingResult(
    result: LlmAnalysisResponse,
    url: string
  ): GoldPlatingResearch {
    const research: GoldPlatingResearch = {
      possibleGoldPlating: false,
      description: "",
      url: url,
      reasonForGoldPlating: "",
      recommendation: "",
      results: {
        detailedRules: "",
        expandedScope: "",
        exemptionsNotUtilized: "",
        stricterNationalLaws: "",
        disproportionatePenalties: "",
        earlierImplementation: "",
        conclusion: "",
      },
    };

    if (
      result.conclusion &&
      !result.conclusion.toLowerCase().includes("no gold plating was found") &&
      result.conclusion.toLowerCase().includes("gold plating was found")
    ) {
      research.possibleGoldPlating = true;
      research.description = result.conclusion;
      research.results = result.analysis;
      research.reasonForGoldPlating = result.reasonsForGoldPlating;
      research.euLawExtract = result.euLawExtract;
      research.englishTranslationOfIcelandicArticle =
        result.englishTranslationOfIcelandicArticle;
    }

    return research;
  }

  private extractReasonForGoldPlating(analysis: any): string {
    const reasons = [];
    for (const key in analysis) {
      if (
        analysis[key] &&
        !analysis[key].toLowerCase().includes("no evidence")
      ) {
        reasons.push(`${key}: ${analysis[key]}`);
      }
    }
    return reasons.join(" ");
  }

  private getGoldPlatingSystemPrompt(type: "law" | "regulation"): string {
    return `You are an expert legal analyst specializing in comparative law and regulations between Icelandic and EU legislation.
    Your task is to analyze whether the provided Icelandic ${type} implementing EU law exhibits any signs of gold plating.

First, let's define gold plating in the context of Icelandic ${type} implementing EU law:

Gold plating refers to the practice of:
1. Setting more detailed rules than the minimum requirements.
2. Expanding the scope of the directive beyond its original intent.
3. Not fully utilizing exemptions allowed in the directive.
4. Maintaining stricter national laws than what the directive requires.
5. Imposing penalties that are not in line with good legislative practice.
6. Implementing a directive earlier than the date specified in it.

Your task is to carefully analyze the Icelandic ${type} in comparison to the EU law and determine if there are any instances of gold plating. Follow these steps:

1. Carefully read both the Icelandic ${type} and the EU law for full context.
2. You might also have key text from the EU law to focus on, use that also but also look at the big picture from the full eu law.
3. Then review the <icelandic_${type}_article_to_analyse> provided, focusing on the six aspects of gold plating mentioned in the definition.
4. You will be provided with the full law but then one article at the time in a loop, calling you multiple times so only look at <icelandic_${type}_article_to_analyse> for your analysis.
5. For each aspect of gold plating, determine if it is present in the <icelandic_${type}_article_to_analyse>.
6. If you find an instance of gold plating, note the specific section of the <icelandic_${type}_article_to_analyse> where it occurs and explain how it differs from the EU law.
7. If you do not find any instances of gold plating for a particular aspect, state that clearly.
8. If you do find gold plating always start the conclusion with the word: "gold plating was found"

Present your analysis in the following JSON format:

{
  "analysis": {
    "detailedRules": "Your analysis here",
    "expandedScope": "Your analysis here",
    "exemptionsNotUtilized": "Your analysis here",
    "stricterNationalLaws": "Your analysis here",
    "disproportionatePenalties": "Your analysis here",
    "earlierImplementation": "Your analysis here"
  },
  "conclusion": "Summarize your findings here, stating whether gold plating was found and in which aspects",
  "reasonsForGoldPlating": "Provide reasons for gold plating only if found otherwise leave empty",
}

Remember to be thorough in your analysis and provide specific examples to support your conclusions.
If you're unsure about any aspect, state your uncertainty clearly.`;
  }

  private getGoldPlatingUserPrompt(
    icelandicLaw: string,
    euLaw: string,
    articleToAnalyze: string,
    type: "law" | "regulation",
    relevantEuText: string,
    translatedArticle: string
  ): string {
    return `Now, here is the Icelandic law to be analyzed:

<the_full_icelandic_law>
${icelandicLaw}
</the_full_icelandic_law>

And here is the corresponding EU law:

<the_full_eu_law>
${euLaw}
</the_full_eu_law>

${
  relevantEuText
    ? `<keyTextFromEuLawToCompareToIcelandicLaw>
${relevantEuText}
</keyTextFromEuLawToCompareToIcelandicLaw>`
    : ``
}

<icelandic_${type}_article_to_analyse>
${articleToAnalyze}
</icelandic_${type}_article_to_analyse>

<english_translation_of_${type}_article_to_analyze>
${translatedArticle}
</english_translation_of_${type}_article_to_analyze>

Your analysis of the <icelandic_${type}_article_to_analyse> in JSON format:`;
  }
}
