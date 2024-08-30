import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelType,
  PsAiModelSize,
} from "@policysynth/agents/aiModelTypes.js";

const promptDebugOutput = true;

let havePrintedFinalReivewUserPrompt = false;
let havePrintedFinalReivewSystemPrompt = false;
let havePrintedGoldPlatingUserPrompt = false;
let havePrintedGoldPlatingSystemPrompt = false;

const alwaysSkipFullIcelandicLawOrRegulation = true;
const skipFullDirectiveForMainGoldplatingAnalysis = true;

const overrideArticleResults = false;

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

      if (!overrideArticleResults && article.research) {
        this.logger.info(
          `Article ${article.number} already analyzed, skipping`
        );
      } else {
        article.research = undefined;
        article.eloRating = undefined;
        await this.saveMemory();

        const progress = (i / totalArticles) * 25; // 25% of total progress
        await this.updateRangedProgress(
          progress,
          `Analyzing national law article ${article.number}`
        );

        const goldPlatingResult = (await this.analyzeGoldPlating(
          researchItem.nationalLaw.law.articles,
          researchItem.euDirective.fullText,
          article,
          "law"
        )) as LlmAnalysisResponse;

        article.research = this.processGoldPlatingResult(
          goldPlatingResult,
          researchItem.nationalLaw.law.url
        );

        await this.saveMemory();
      }
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

        if (!overrideArticleResults && article.research) {
          this.logger.info(
            `Article ${article.number} already analyzed, skipping`
          );
        } else {
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
            article,
            "regulation"
          );

          article.research = this.processGoldPlatingResult(
            goldPlatingResult,
            regulation.url
          );

          await this.saveMemory();
        }

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
        article,
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
          article,
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
    let systemPrompt = `You are an expert in EU directive. Your task is to extract the all relevant parts of the EU directive that could apply to the given national law article.
    Focus on sections that relate to the content of the national law article.
    Always include the article numbers in your extraction.
    Extract and only output unchanged exctracted text from the <FullEuDirective>.

    <FullEuDirective>
    ${euLaw}
    </FullEuDirective>
`;

    if (process.env.PS_ANTHROPIC_BETA_CONTEXT_CACHING) {
      systemPrompt = `<EuRelevantText>${systemPrompt}</EuRelevantText>`;
    }

    const userPrompt = `Given the <FullEuDirective> and the national law article below, please extract all relevant parts of the EU directive that could apply to the <national_${type}_article> or it's English translation <translation_of_national_${type}_article>.

<national_${type}_article>${articleToAnalyze}</national_${type}_article>

<translation_of_national_${type}_article>${englishTranslationOfArticle}</translation_of_national_${type}_article>

Output the extracted relevant EU directive text without comments before or after:`;

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
    let systemPrompt = `You are a professional translator of Icelandic ${type} to EU standard English.
    The EU directive is provided for reference for your translation, try to use similar terminology and structure in your translation.
    Your task is to accurately translate the given text to English. Preserve the original meaning.

    <EuDirectiveForTerminlogyReference>${euLaw}</EuDirectiveForTerminlogyReference>`;

    if (process.env.PS_ANTHROPIC_BETA_CONTEXT_CACHING) {
      systemPrompt = `<TranslationTextSystemPrompt>${systemPrompt}</TranslationTextSystemPrompt>`;
    }

    const userPrompt = `Please translate the following text to English:

<TextToTranslateToEnglish>${text}</TextToTranslateToEnglish>

Your English translation without any comments:`;

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

  goldPlatingTypes = [
    "Setting more detailed rules than the minimum requirements",
    "Expanding the scope of the directive beyond its original intent",
    "Not fully utilizing exemptions allowed in the directive",
    "Maintaining stricter national laws than what the directive requires",
    // "Imposing penalties that are not in line with good legislative practice",
    // "Implementing a directive earlier than the date specified in it",
  ];

  private async analyzeGoldPlating(
    icelandicLawInput: string | LawArticle[],
    euLaw: string,
    articleToAnalyze: LawArticle,
    type: "law" | "regulation"
  ): Promise<any> {
    const translatedArticle = await this.translateToEnglish(
      euLaw,
      type,
      articleToAnalyze.text
    );

    this.logger.debug(`Translated article: ${translatedArticle}`);

    const relevantEuText = await this.extractRelevantEuText(
      euLaw,
      type,
      articleToAnalyze.text,
      translatedArticle
    );

    this.logger.debug(`------------> Relevant EU text: ${relevantEuText}`);

    let icelandicLaw: string;
    if (typeof icelandicLawInput === "string") {
      icelandicLaw = icelandicLawInput;
    } else if (Array.isArray(icelandicLawInput)) {
      if (icelandicLawInput.length > 30) {
        icelandicLaw = ``;
      } else if (icelandicLawInput.length > 100) {
        const articleIndex = icelandicLawInput.findIndex(
          (article) => article.number === articleToAnalyze.number
        );

        let outputParts = [];

        // Add first 10 articles
        outputParts.push(
          ...icelandicLawInput
            .slice(0, 10)
            .map((article) => `Article: ${article.number}\n${article.text}\n\n`)
        );

        // Add omission indicator after first 10 articles if needed
        if (articleIndex > 15) {
          const omittedCount = articleIndex - 15;
          outputParts.push(
            `\n..... ${omittedCount} more article${
              omittedCount > 1 ? "s" : ""
            } omitted .....\n\n`
          );
        }

        // Add 5 articles before the article to analyze
        const startIndex = Math.max(10, articleIndex - 5);
        outputParts.push(
          ...icelandicLawInput
            .slice(startIndex, articleIndex)
            .map((article) => `Article: ${article.number}\n${article.text}\n\n`)
        );

        // Add the article to analyze
        outputParts.push(
          `Article: ${articleToAnalyze.number}\n${articleToAnalyze.text}\n\n`
        );

        // Add 5 articles after the article to analyze
        const endIndex = Math.min(icelandicLawInput.length, articleIndex + 6);
        outputParts.push(
          ...icelandicLawInput
            .slice(articleIndex + 1, endIndex)
            .map((article) => `Article: ${article.number}\n${article.text}\n\n`)
        );

        // Add omission indicator at the end if needed
        if (endIndex < icelandicLawInput.length) {
          const omittedCount = icelandicLawInput.length - endIndex;
          outputParts.push(
            `\n..... ${omittedCount} more article${
              omittedCount > 1 ? "s" : ""
            } omitted .....\n`
          );
        }

        icelandicLaw = outputParts.join("");

        this.logger.debug(
          `----------------------> Icelandic law is too long, outputting only relevant parts\n\n${icelandicLaw}\n\n`
        );
      } else {
        icelandicLaw = icelandicLawInput
          .map((article) => `Article: ${article.number}\n${article.text}\n\n`)
          .join("\n");
      }
    } else {
      throw new Error("Invalid Icelandic law input");
    }

    const goldPlatingAnalyses: OneGoldplatingTypeResearch[] = [];

    if (alwaysSkipFullIcelandicLawOrRegulation) {
      icelandicLaw = "";
    }

    for (const goldPlatingType of this.goldPlatingTypes) {
      const systemMessage = this.createSystemMessage(
        this.getGoldPlatingSystemPrompt(
          goldPlatingType,
          type,
          icelandicLaw,
          euLaw,
          relevantEuText
        )
      );
      const userMessage = this.createHumanMessage(
        this.getGoldPlatingUserPrompt(
          icelandicLaw,
          euLaw,
          articleToAnalyze.text,
          type,
          relevantEuText,
          translatedArticle,
          goldPlatingType
        )
      );

      if (promptDebugOutput && !havePrintedGoldPlatingUserPrompt) {
        this.logger.debug(JSON.stringify(userMessage, null, 2));
        havePrintedGoldPlatingUserPrompt = true;
      }

      if (promptDebugOutput && !havePrintedGoldPlatingSystemPrompt) {
        this.logger.debug(JSON.stringify(systemMessage, null, 2));
        havePrintedGoldPlatingSystemPrompt = true;
      }

      const result = (await this.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Medium,
        [systemMessage, userMessage],
        true
      )) as OneGoldplatingTypeResearch;

      result.goldPlatingType = goldPlatingType;

      goldPlatingAnalyses.push(result);

      this.logger.debug(
        `Gold plating analysis result: ${JSON.stringify(result, null, 2)}`
      );
    }

    const finalResults = await this.performFinalAnalysis(
      icelandicLaw,
      euLaw,
      articleToAnalyze.text,
      type,
      translatedArticle,
      goldPlatingAnalyses,
      relevantEuText
    );

    finalResults.euLawExtract = relevantEuText;
    finalResults.englishTranslationOfIcelandicArticle = translatedArticle;

    this.logger.debug(
      `Full gold plating analysis result: ${JSON.stringify(
        finalResults,
        null,
        2
      )}`
    );

    return finalResults;
  }

  private async performFinalAnalysis(
    icelandicLaw: string,
    euLaw: string,
    articleToAnalyze: string,
    type: "law" | "regulation",
    translatedArticle: string,
    goldPlatingAnalyses: OneGoldplatingTypeResearch[],
    euLawExtract: string
  ): Promise<LlmAnalysisResponse> {
    // First, let's create the ResearchResults object from the goldPlatingAnalyses
    const researchResults: ResearchResults = {
      detailedRules: goldPlatingAnalyses[0].goldPlatingIssueAnalysis,
      expandedScope: goldPlatingAnalyses[1].goldPlatingIssueAnalysis,
      exemptionsNotUtilized: goldPlatingAnalyses[2].goldPlatingIssueAnalysis,
      stricterNationalLaws: goldPlatingAnalyses[3].goldPlatingIssueAnalysis,
      disproportionatePenalties: goldPlatingAnalyses[4]
        ? goldPlatingAnalyses[4].goldPlatingIssueAnalysis
        : "Not analyzed",
      earlierImplementation: goldPlatingAnalyses[5]
        ? goldPlatingAnalyses[5].goldPlatingIssueAnalysis
        : "Not analyzed",
      conclusion: "",
      euDirectiveArticlesNumbers: goldPlatingAnalyses.flatMap(
        (analysis) => analysis.goldPlatingForEuDirectiveArticlesNumbers
      ),
      possibleReasons: goldPlatingAnalyses
        .map((analysis) => analysis.goldPlatingPossibleReasons)
        .filter((reason) => reason !== "")
        .join(" "),
      goldPlatingWasFound: goldPlatingAnalyses.some(
        (analysis) => analysis.goldPlatingWasFound
      ),
    };

    // Now, let's call the LLM to generate the final conclusion and reasons for gold plating
    const systemMessage = this.createSystemMessage(
      this.getFinalAnalysisSystemPrompt()
    );

    const userMessage = this.createHumanMessage(
      this.getFinalAnalysisUserPrompt(
        icelandicLaw,
        euLaw,
        articleToAnalyze,
        type,
        translatedArticle,
        goldPlatingAnalyses,
        euLawExtract
      )
    );

    if (promptDebugOutput && !havePrintedFinalReivewSystemPrompt) {
      this.logger.debug(JSON.stringify(systemMessage, null, 2));
      havePrintedFinalReivewSystemPrompt = true;
    }

    if (promptDebugOutput && !havePrintedFinalReivewUserPrompt) {
      this.logger.debug(JSON.stringify(userMessage, null, 2));
      havePrintedFinalReivewUserPrompt = true;
    }

    const finalAnalysis = (await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Large,
      [systemMessage, userMessage],
      true
    )) as { conclusion: string };

    return {
      analysis: researchResults,
      conclusion: finalAnalysis.conclusion,
      reasonsForGoldPlating: "",
      euLawExtract: undefined,
      englishTranslationOfIcelandicArticle: undefined,
    };
  }

  private getFinalAnalysisSystemPrompt(): string {
    return `You are an expert legal analyst specializing in comparative law and regulations between Icelandic and EU legislation.
  Your task is to provide a conclusion for gold plating based on the individual analyses of six different types of gold plating.

  Your analysis should:
  1. Provide an overall conclusion on whether gold plating was found in the previous individual analyses and to what extent

  Present your analysis in the following JSON format without any comments before or after:

   \`\`\`json
  {
    "conclusion": string;
  }
  \`\`\`
`;
  }

  private getFinalAnalysisUserPrompt(
    icelandicLaw: string,
    euLaw: string,
    articleToAnalyze: string,
    type: "law" | "regulation",
    translatedArticle: string,
    goldPlatingAnalyses: OneGoldplatingTypeResearch[],
    euLawExtract: string
  ): string {
    const showIcelandicLaw = false;

    return `${
      showIcelandicLaw
        ? `Here is the Icelandic ${type} that was analyzed:<the_full_icelandic_${type}>
  ${icelandicLaw}
  </the_full_icelandic_${type}>`
        : ""
    }

  ${
    euLawExtract
      ? `<keyTextFromEuDirective> ${euLawExtract} </keyTextFromEuDirective>`
      : `
      <the_full_eu_directive>
  ${euLaw}
  </the_full_eu_directive>
    `
  }

  <icelandic_${type}_article_analysed>
  ${articleToAnalyze}
  </icelandic_${type}_article_analysed>

  <english_translation_of_${type}_article_analyzed>
  ${translatedArticle}
  </english_translation_of_${type}_article_analyzed>

  Here are the individual analyses for each type of gold plating:

  ${goldPlatingAnalyses
    .map((analysis) => JSON.stringify(analysis, null, 2))
    .join("\n\n")}

  Please provide your conclusion and reasons for gold plating in the specified JSON format without any explainations:`;
  }

  private processGoldPlatingResult(
    result: LlmAnalysisResponse,
    url: string
  ): GoldPlatingResearch {
    const research: GoldPlatingResearch = {
      possibleGoldPlating: result.analysis.goldPlatingWasFound,
      description: result.conclusion,
      url: url,
      reasonForGoldPlating: result.reasonsForGoldPlating,
      recommendation: "",
      results: {
        detailedRules: result.analysis.detailedRules,
        expandedScope: result.analysis.expandedScope,
        exemptionsNotUtilized: result.analysis.exemptionsNotUtilized,
        stricterNationalLaws: result.analysis.stricterNationalLaws,
        disproportionatePenalties:
          result.analysis.disproportionatePenalties || "Not analyzed",
        earlierImplementation:
          result.analysis.earlierImplementation || "Not analyzed",
        conclusion: result.conclusion,
        euDirectiveArticlesNumbers: result.analysis.euDirectiveArticlesNumbers,
        possibleReasons: result.analysis.possibleReasons,
        goldPlatingWasFound: result.analysis.goldPlatingWasFound,
      },
      euLawExtract: result.euLawExtract,
      englishTranslationOfIcelandicArticle:
        result.englishTranslationOfIcelandicArticle,
    };

    return research;
  }

  renderGoldPlatingType(goldPlatingType: string) {
    const goldPlatingDescriptions = {
      "Setting more detailed rules than the minimum requirements":
        "Adding regulatory requirements beyond what is required by the Directive in question.",
      "Expanding the scope of the directive beyond its original intent":
        "Gold plating often involves the inclusion of additional obligations or standards that extend the scope of a directive beyond its intended purpose. For example, a directive may be designed to regulate specific activities within a limited sector, but during national implementation, additional sectors or activities might be included that the directive was not originally meant to cover. This can result in increased regulatory burdens for businesses and stakeholders who were not the intended targets of the EU legislation.",
      "Not fully utilizing exemptions allowed in the directive":
        "EU directives often provide derogations, allowing member states to choose more lenient requirements or to exempt certain entities or activities from the directive's obligations. When Iceland does not fully exploit these derogations, it effectively results in a stricter implementation than required. For instance, a directive may allow smaller businesses to be exempt from certain compliance measures. However, by choosing not to apply this exemption, Icelandic regulators could impose unnecessary burdens on businesses that would otherwise have been exempted, leading to gold plating.",
      "Maintaining stricter national laws than what the directive requires":
        "Gold plating can occur when Icelandic legislation retains existing national regulatory requirements that exceed the minimum standards set by the directive, even when those national rules are no longer necessary. In some cases, the implementation of an EU directive may be used as an opportunity to introduce additional national regulations or standards that go beyond what the directive requires. For example, a directive might set out basic environmental standards, but Iceland might retain or introduce stricter national environmental controls that were not mandated by the directive. While this can align with Icelandic policy objectives, it may create compliance challenges for businesses that now need to meet dual layers of regulation—both national and EU-based.",
      "Imposing penalties that are not in line with good legislative practice":
        "Gold plating is often seen when sanctions or penalties are more severe than what is required to ensure compliance with the directive. For instance, a directive may suggest administrative fines as a deterrent, but Iceland could choose to impose criminal sanctions or substantially higher fines than necessary. Additionally, implementing enforcement measures that exceed the directive's requirements may be seen as disproportionate, particularly when the original intent of the directive was to offer flexibility to member states.",
      "Implementing a directive earlier than the date specified in it":
        "While EU directives typically include a set deadline by which member states must comply, gold plating occurs when Iceland chooses to implement the requirements of the directive before the specified deadline. Early implementation might be intended to show proactive compliance or to align with national strategies, but it can impose unnecessary pressure on industries and stakeholders who need time to adapt. It also creates a competitive disadvantage compared to other jurisdictions that might take the full allotted time to implement the directive, thereby benefiting from more gradual adjustments.",
    } as Record<string, string>;

    return `Goldplating type to look for:
  ${goldPlatingType}

  Gold Plating type to look for description:
  ${goldPlatingDescriptions[goldPlatingType]}`;
  }

  private getGoldPlatingSystemPrompt(
    goldPlatingType: string,
    type: "law" | "regulation",
    icelandicFullLaw: string,
    euLaw: string,
    euLawExtract: string
  ): string {
    const showFullEuDirective =
      !skipFullDirectiveForMainGoldplatingAnalysis || !euLawExtract;
    let systemPrompt = `You are an expert legal analyst specializing in comparative law and regulations between Icelandic and EU legislation.
    Your task is to analyze whether the provided Icelandic ${type} implementing EU directive exhibits any signs of gold plating.`;

    if (!process.env.PS_ANTHROPIC_BETA_CONTEXT_CACHING) {
      systemPrompt += `First, let's define the type of gold plating in the context of Icelandic ${type} implementing EU directive that we are looking for:

      ${this.renderGoldPlatingType(goldPlatingType)}

      Your analysis should focus solely on this aspect of gold plating.`;
    }

    systemPrompt += `
 Follow these steps:

 ${
   icelandicFullLaw
     ? `
  - Your task is to carefully analyze the Icelandic ${type} in comparison to the EU directive and determine if there are any instances of gold plating for this gold plating type.
  - You will be provided with the full law but then one article at the time in a loop, calling you multiple times so only look at <icelandic_${type}_article_to_analyse> for your analysis.
  `
     : `
  - Your task is to carefully analyze the Icelandic ${type} article in comparison to the EU directive and determine if there are any instances of gold plating for this gold plating type.
  - You are being provided with one article at the time from the Icelandic ${type}, keep that in mind and only focus on that one ${type} article in your gold plating analysis.
  `
 }
 ${
   euLawExtract
     ? `- You will have key text from the EU directive in <keyTextFromEuDirectiveToCompareToIcelandicLaw> to focus on ${
         showFullEuDirective ? `but also look at the full EuDirective` : ``
       }`
     : ``
 }
 ${
   !euLawExtract
     ? `- You will have the full EU directive to compare to the Icelandic ${type} article`
     : ""
 }
- Review the <icelandic_${type}_article_to_analyse> provided, focusing on the provided type of gold plating.
- If you find an instance of gold plating explain how it differs from the EU directive.
- If you do not find any instances of gold plating for a particular aspect, just output no gold plating was found.
  `;

    const outputFormat = `Output in this format without any explainations before or after:

  <ReasoningStepsNeededForGoldPlatingAnalysis>
    ...
  </ReasoningStepsNeededForGoldPlatingAnalysis>

  <YourActualReasoningInAnalyzingIfThereIsGoldPlating>
    ...
  </YourActualReasoningInAnalyzingIfThereIsGoldPlating>

  \`\`\`json
  {
    "goldPlatingIssueAnalysis": string;
    "goldPlatingWasFound": boolean;
    "goldPlatingForEuDirectiveArticlesNumbers": ["Article X", "Article Y"],
    "goldPlatingPossibleReasons": "Provide reasons for gold plating if found, otherwise leave empty"
  }
  \`\`\`
  `;

    if (process.env.PS_ANTHROPIC_BETA_CONTEXT_CACHING) {
      systemPrompt = `<GoldPlatingSystemPromptFor${type}>${systemPrompt} ${
        !skipFullDirectiveForMainGoldplatingAnalysis || !euLawExtract
          ? this.renderEuAndIcelandicLaws(euLaw, icelandicFullLaw)
          : ""
      }\n${outputFormat}\n</GoldPlatingSystemPromptFor${type}>`;
    } else {
      systemPrompt += `\n\n${outputFormat}`;
    }
    return systemPrompt;
  }

  renderEuAndIcelandicLaws(euLaw: string, icelandicLaw: string) {
    this.logger.debug(`Rendering EU ${icelandicLaw ? 'and Icelandic' : ''} laws`);
    return `${
      !icelandicLaw
        ? ``
        : `Now, here is the Icelandic law to be analyzed:

      <the_full_icelandic_law>
      ${icelandicLaw}
      </the_full_icelandic_law>

      And here is the corresponding EU directive:`
    }

      <the_full_eu_directive>
      ${euLaw}
      </the_full_eu_directive>
      `;
  }

  private getGoldPlatingUserPrompt(
    icelandicLaw: string,
    euLaw: string,
    articleToAnalyze: string,
    type: "law" | "regulation",
    relevantEuText: string,
    translatedArticle: string,
    goldplatingType: string
  ): string {
    let finalPrompt = "";
    if (!process.env.PS_ANTHROPIC_BETA_CONTEXT_CACHING) {
      finalPrompt += this.renderEuAndIcelandicLaws(euLaw, icelandicLaw);
    } else {
      finalPrompt += this.renderGoldPlatingType(goldplatingType);
    }
    finalPrompt += `${
      relevantEuText
        ? `<keyTextFromEuDirectiveToCompareToIcelandicLaw>
${relevantEuText}
</keyTextFromEuDirectiveToCompareToIcelandicLaw>`
        : ``
    }

<icelandic_${type}_article_to_analyse>
${articleToAnalyze}
</icelandic_${type}_article_to_analyse>

<english_translation_of_${type}_article_to_analyze>
${translatedArticle}
</english_translation_of_${type}_article_to_analyze>

Your analysis of the <icelandic_${type}_article_to_analyse> in JSON format without explainations:`;
    return finalPrompt;
  }
}
