import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelType,
  PsAiModelSize,
} from "@policysynth/agents/aiModelTypes.js";

export class GoldPlatingSearchAgent extends PolicySynthAgent {
  declare memory: GoldPlatingMemoryData;

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
    await this.compareNationalLawToEURegulation(researchItem);
    await this.compareNationalRegulationToEURegulation(researchItem);

    await this.updateRangedProgress(100, "Gold-plating search completed");
  }

  private async compareNationalLawToEULaw(
    researchItem: GoldplatingResearchItem
  ): Promise<void> {
    if (!researchItem.nationalLaw || !researchItem.euDirective) return;

    const totalArticles = researchItem.nationalLaw.law.articles.length;
    for (let i = 0; i < totalArticles; i++) {
      const article = researchItem.nationalLaw.law.articles[i];
      const progress = (i / totalArticles) * 25; // 25% of total progress
      await this.updateRangedProgress(
        progress,
        `Analyzing national law article ${article.number}`
      );

      const goldPlatingResult = await this.analyzeGoldPlating(
        researchItem.nationalLaw.law.fullText,
        researchItem.euDirective.fullText,
        article.text
      );

      article.research = this.processGoldPlatingResult(goldPlatingResult);
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
        const progress = 25 + (processedArticles / totalArticles) * 25; // 25% to 50% of total progress
        await this.updateRangedProgress(
          progress,
          `Analyzing national regulation article ${article.number}`
        );

        const goldPlatingResult = await this.analyzeGoldPlating(
          regulation.fullText,
          researchItem.euDirective.fullText,
          article.text
        );

        article.research = this.processGoldPlatingResult(goldPlatingResult);
        processedArticles++;
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
        article.text
      );

      article.research = this.processGoldPlatingResult(goldPlatingResult);
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
          article.text
        );

        article.research = this.processGoldPlatingResult(goldPlatingResult);
        processedArticles++;
      }
    }
  }

  private async analyzeGoldPlating(
    icelandicLaw: string,
    euLaw: string,
    articleToAnalyze: string
  ): Promise<any> {
    const systemMessage = this.createSystemMessage(
      this.getGoldPlatingSystemPrompt()
    );
    const userMessage = this.createHumanMessage(
      this.getGoldPlatingUserPrompt(icelandicLaw, euLaw, articleToAnalyze)
    );

    const result = await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Large,
      [systemMessage, userMessage],
      true
    );

    return result;
  }

  private processGoldPlatingResult(result: any): GoldPlatingResearch {
    const research: GoldPlatingResearch = {
      possibleGoldplating: false,
      description: "",
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
      result.conclusion.toLowerCase().includes("gold plating was found")
    ) {
      research.possibleGoldplating = true;
      research.description = result.conclusion;
      research.reasonForGoldPlating = this.extractReasonForGoldPlating(
        result.analysis
      );
      research.recommendation =
        "Further review recommended to address potential gold-plating issues.";
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

  private getGoldPlatingSystemPrompt(): string {
    return `You are an expert legal analyst specializing in comparative law between Icelandic and EU legislation. Your task is to analyze whether the provided Icelandic law implementing EU law exhibits any signs of gold plating.

First, let's define gold plating in the context of Icelandic Law implementing EU law:

Gold plating refers to the practice of:
1. Setting more detailed rules than the minimum requirements.
2. Expanding the scope of the directive beyond its original intent.
3. Not fully utilizing exemptions allowed in the directive.
4. Maintaining stricter national laws than what the directive requires.
5. Imposing penalties that are not in line with good legislative practice.
6. Implementing a directive earlier than the date specified in it.

Your task is to carefully analyze the Icelandic law in comparison to the EU law and determine if there are any instances of gold plating. Follow these steps:

1. Carefully read both the Icelandic law and the EU law.
2. Compare the two laws, focusing on the six aspects of gold plating mentioned in the definition.
3. You will be provided with the full law but also an article to focus your analysis on only provide analysis for the Icelandic Article To Analyse.
4. For each aspect of gold plating, determine if it is present in the Icelandic law.
5. If you find an instance of gold plating, note the specific section or article of the Icelandic law where it occurs and explain how it differs from the EU law.
6. If you do not find any instances of gold plating for a particular aspect, state that clearly.

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
  "conclusion": "Summarize your findings here, stating whether gold plating was found and in which aspects"
}

Remember to be thorough in your analysis and provide specific examples from both laws to support your conclusions. If you're unsure about any aspect, state your uncertainty clearly.`;
  }

  private getGoldPlatingUserPrompt(
    icelandicLaw: string,
    euLaw: string,
    articleToAnalyze: string
  ): string {
    return `Now, here is the Icelandic law to be analyzed:

<icelandic_law>
${icelandicLaw}
</icelandic_law>

And here is the corresponding EU law:

<eu_law>
${euLaw}
</eu_law>

<icelandic_law_article_to_analyse>
${articleToAnalyze}
</icelandic_law_article_to_analyse>

Your analysis of the law article in JSON format:`;
  }
}
