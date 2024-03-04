import { Page, Browser } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { IEngineConstants } from "../../constants.js";

import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { ChatOpenAI } from "@langchain/openai";
import ioredis from "ioredis";
import { GetWebPagesProcessor } from "../../solutions/web/getWebPages.js";
import { RootCauseExamplePrompts } from "./rootCauseExamplePrompts.js";
import { RootCauseWebPageVectorStore } from "../../vectorstore/rootCauseWebPage.js";
import { CreateRootCausesSearchQueriesProcessor } from "../create/createRootCauseSearchQueries.js";

const redis = new ioredis(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");

//@ts-ignore
puppeteer.use(StealthPlugin());

const onlyCheckWhatNeedsToBeScanned = true;
class RootCauseTypeLookup {
  private static rootCauseTypeMapping: Record<PSRootCauseWebPageTypes, keyof PSRootCauseRawWebPageData> = {
    historicalRootCause: "allPossibleHistoricalRootCausesIdentifiedInTextContext",
    economicRootCause: "allPossibleEconomicRootCausesIdentifiedInTextContext",
    scientificRootCause: "allPossibleScientificRootCausesIdentifiedInTextContext",
    culturalRootCause: "allPossibleCulturalRootCausesIdentifiedInTextContext",
    socialRootCause: "allPossibleSocialRootCausesIdentifiedInTextContext",
    environmentalRootCause: "allPossibleEnvironmentalRootCausesIdentifiedInTextContext",
    legalRootCause: "allPossibleLegalRootCausesIdentifiedInTextContext",
    technologicalRootCause: "allPossibleTechnologicalRootCausesIdentifiedInTextContext",
    geopoliticalRootCause: "allPossibleGeopoliticalRootCausesIdentifiedInTextContext",
    ethicalRootCause: "allPossibleEthicalRootCausesIdentifiedInTextContext",
    caseStudies: "allPossibleRootCausesCaseStudiesIdentifiedInTextContext",
  };

  public static getPropertyName(rootCauseType: PSRootCauseWebPageTypes): string | undefined {
    return this.rootCauseTypeMapping[rootCauseType];
  }
}

export class GetRootCausesWebPagesProcessor extends GetWebPagesProcessor {
  rootCauseWebPageVectorStore = new RootCauseWebPageVectorStore();
  renderRootCauseScanningPrompt(type: PSRootCauseWebPageTypes, text: string) {
    const nameOfColumn = RootCauseTypeLookup.getPropertyName(type);
    if (!nameOfColumn) {
      throw new Error(`No corresponding property found for type: ${type}`);
    }

    return [
      // Update with our own problem statement from GPT
      new SystemMessage(
        `
        Your are an expert in analyzing textual data:

        Important Instructions:
        1. Examine the "Text context" to identify root causes for the specified problem statement.
        2. Identify any specific raw potential ${type} in the "Text Context" and include them in the '${nameOfColumn}' JSON array. We will analyse this later.
        3. Always write out the relevanceToProblemStatement & ${nameOfColumn}

        - Only use information found within the "Text Context" - do not create your own data.
        - Never output in markdown format.
        - Always output your results in the JSON format with no additional explanation.
        - Let's think step-by-step.

        Example:

        Web page type: ${type}

        Text context:
        ${RootCauseExamplePrompts.render(type)}
        `,
      ),
      // Only add what is required here
      new HumanMessage(
        `
        ${this.renderProblemStatement()}

        Web page type: ${type}

        Text Context:
        ${text}

        JSON Output:
        `,
      ),
    ];
  }
  async getRootCauseTokenCount(text: string, type: PSRootCauseWebPageTypes) {
    const emptyMessages = this.renderRootCauseScanningPrompt(type, "");

    const promptTokenCount = await this.chat!.getNumTokensFromMessages(emptyMessages);

    const textForTokenCount = new HumanMessage(text);

    const textTokenCount = await this.chat!.getNumTokensFromMessages([textForTokenCount]);

    const totalTokenCount = promptTokenCount.totalCount + textTokenCount.totalCount + IEngineConstants.getPageAnalysisModel.maxOutputTokens;

    return { totalTokenCount, promptTokenCount };
  }

  async getRootCauseTextAnalysis(type: PSRootCauseWebPageTypes, text: string): Promise<PSRootCauseRawWebPageData | PSRefinedRootCause[]> {
    try {
      const { totalTokenCount, promptTokenCount } = await this.getRootCauseTokenCount(text, type);

      this.logger.debug(`Total token count: ${totalTokenCount} Prompt token count: ${JSON.stringify(promptTokenCount)}`);

      let textAnalysis: PSRootCauseRawWebPageData;

      if (IEngineConstants.getPageAnalysisModel.tokenLimit < totalTokenCount) {
        const maxTokenLengthForChunk = IEngineConstants.getPageAnalysisModel.tokenLimit - promptTokenCount.totalCount - 512;

        this.logger.debug(`Splitting text into chunks of ${maxTokenLengthForChunk} tokens`);

        const splitText = this.splitText(text, maxTokenLengthForChunk, undefined);

        this.logger.debug(`Got ${splitText.length} splitTexts`);

        for (let t = 0; t < splitText.length; t++) {
          const currentText = splitText[t];

          let nextAnalysis = await this.getRootCauseAIAnalysis(type, currentText);

          if (nextAnalysis) {
            if (t == 0) {
              textAnalysis = nextAnalysis;
            } else {
              textAnalysis = this.mergeAnalysisData(textAnalysis!, nextAnalysis) as PSRootCauseRawWebPageData;
            }

            this.logger.debug(`Refined root cause text analysis (${t}): ${JSON.stringify(textAnalysis, null, 2)}`);
          } else {
            this.logger.error(`Error getting AI analysis for text ${currentText}`);
          }
        }
      } else {
        textAnalysis = await this.getRootCauseAIAnalysis(type, text);
        this.logger.debug(`Text analysis ${JSON.stringify(textAnalysis, null, 2)}`);
      }

      return textAnalysis!;
    } catch (error) {
      this.logger.error(`Error in getTextAnalysis: ${error}`);
      throw error;
    }
  }

  async getRootCauseAIAnalysis(type: PSRootCauseWebPageTypes, text: string) {
    this.logger.info("Get Root Cause AI Analysis");
    const messages = this.renderRootCauseScanningPrompt(type, text);

    const analysis = (await this.callLLM(
      "web-get-root-causes-pages",
      IEngineConstants.getPageAnalysisModel,
      messages,
      true,
      true,
    )) as PSRootCauseRawWebPageData;

    return analysis;
  }

  mergeAnalysisData(data1: PSRootCauseRawWebPageData, data2: PSRootCauseRawWebPageData): PSRootCauseRawWebPageData {
    return {
      allPossibleEconomicRootCausesIdentifiedInTextContext: [
        ...(data1.allPossibleEconomicRootCausesIdentifiedInTextContext || []),
        ...(data2.allPossibleEconomicRootCausesIdentifiedInTextContext || []),
      ],
      allPossibleScientificRootCausesIdentifiedInTextContext: [
        ...(data1.allPossibleScientificRootCausesIdentifiedInTextContext || []),
        ...(data2.allPossibleScientificRootCausesIdentifiedInTextContext || []),
      ],
      allPossibleCulturalRootCausesIdentifiedInTextContext: [
        ...(data1.allPossibleCulturalRootCausesIdentifiedInTextContext || []),
        ...(data2.allPossibleCulturalRootCausesIdentifiedInTextContext || []),
      ],
      allPossibleEnvironmentalRootCausesIdentifiedInTextContext: [
        ...(data1.allPossibleEnvironmentalRootCausesIdentifiedInTextContext || []),
        ...(data2.allPossibleEnvironmentalRootCausesIdentifiedInTextContext || []),
      ],
      allPossibleLegalRootCausesIdentifiedInTextContext: [
        ...(data1.allPossibleLegalRootCausesIdentifiedInTextContext || []),
        ...(data2.allPossibleLegalRootCausesIdentifiedInTextContext || []),
      ],
      allPossibleTechnologicalRootCausesIdentifiedInTextContext: [
        ...(data1.allPossibleTechnologicalRootCausesIdentifiedInTextContext || []),
        ...(data2.allPossibleTechnologicalRootCausesIdentifiedInTextContext || []),
      ],
      allPossibleGeopoliticalRootCausesIdentifiedInTextContext: [
        ...(data1.allPossibleGeopoliticalRootCausesIdentifiedInTextContext || []),
        ...(data2.allPossibleGeopoliticalRootCausesIdentifiedInTextContext || []),
      ],
      allPossibleHistoricalRootCausesIdentifiedInTextContext: [
        ...(data1.allPossibleHistoricalRootCausesIdentifiedInTextContext || []),
        ...(data2.allPossibleHistoricalRootCausesIdentifiedInTextContext || []),
      ],
      allPossibleEthicalRootCausesIdentifiedInTextContext: [
        ...(data1.allPossibleEthicalRootCausesIdentifiedInTextContext || []),
        ...(data2.allPossibleEthicalRootCausesIdentifiedInTextContext || []),
      ],
      allPossibleSocialRootCausesIdentifiedInTextContext: [
        ...(data1.allPossibleSocialRootCausesIdentifiedInTextContext || []),
        ...(data2.allPossibleSocialRootCausesIdentifiedInTextContext || []),
      ],
      allPossibleRootCausesCaseStudiesIdentifiedInTextContext: [
        ...(data1.allPossibleRootCausesCaseStudiesIdentifiedInTextContext || []),
        ...(data2.allPossibleRootCausesCaseStudiesIdentifiedInTextContext || []),
      ],
      rootCauseRelevanceToProblemStatement: data1.rootCauseRelevanceToProblemStatement,
      rootCauseRelevanceToProblemStatementScore: data1.rootCauseRelevanceToProblemStatementScore || data2.rootCauseRelevanceToProblemStatementScore,
      rootCauseRelevanceToTypeScore: data1.rootCauseRelevanceToTypeScore || data2.rootCauseRelevanceToTypeScore,
      rootCauseConfidenceScore: data1.rootCauseConfidenceScore || data2.rootCauseConfidenceScore,
      rootCauseQualityScore: data1.rootCauseQualityScore || data2.rootCauseQualityScore,
      url: data1.url,
      searchType: data1.searchType,
      groupId: data1.groupId,
      communityId: data1.communityId,
      domainId: data1.domainId,
      _additional: data1._additional || data2._additional,
    };
  }

  async processPageText(
    text: string,
    subProblemIndex: undefined = undefined,
    url: string,
    type: IEngineWebPageTypes | PSRootCauseWebPageTypes,
    entityIndex: number | undefined,
    policy: undefined = undefined,
  ) {
    this.logger.debug(`Processing page text ${text.slice(0, 150)} for ${url} for ${type} search results`);

    try {
      const textAnalysis = (await this.getRootCauseTextAnalysis(type as PSRootCauseWebPageTypes, text)) as unknown as PSRootCauseRawWebPageData;

      if (textAnalysis) {
        textAnalysis.url = url;
        textAnalysis.searchType = type as PSRootCauseWebPageTypes;
        textAnalysis.groupId = this.memory.groupId;
        textAnalysis.communityId = this.memory.communityId;
        textAnalysis.domainId = this.memory.domainId;

        this.logger.debug(`Saving text analysis ${JSON.stringify(textAnalysis, null, 2)}`);

        try {
          await this.rootCauseWebPageVectorStore.postWebPage(textAnalysis);
          this.totalPagesSave += 1;
          this.logger.info(`Total ${this.totalPagesSave} saved pages`);
        } catch (e: any) {
          this.logger.error(`Error posting web page for url ${url}`);
          this.logger.error(e);
          this.logger.error(e.stack);
        }
      } else {
        this.logger.warn(`No text analysis for ${url}`);
      }
    } catch (e: any) {
      this.logger.error(`Error in processPageText`);
      this.logger.error(e.stack || e);
    }
  }

  async getAndProcessRootCausePage(url: string, browserPage: Page, type: PSRootCauseWebPageTypes) {
    if (url == "https://www.oecd.org/pisa/PISA%202018%20Insights%20and%20Interpretations%20FINAL%20PDF.pdf") {
      this.logger.info("Skipping the current url:" + url);
      return true;
    }
    let hasPage = undefined;
    if (onlyCheckWhatNeedsToBeScanned) {
      try {
        this.logger.info('Checking if a page exists ' + url);
        hasPage = await this.rootCauseWebPageVectorStore.webPageExist(this.memory.groupId, url, type);
        if (hasPage) {
          this.logger.warn(`Already have scanned ${type} / ${url}`);
        } else {
          this.logger.warn(`Need to scan ${type} / ${url}`);
        }
      } catch(e:any) {
        this.logger.error("Error with try in getAndProcessRootCausePage");
        this.logger.error(e);
      }
    }
    if (!hasPage) {
      if (url.toLowerCase().endsWith(".pdf")) {
        await this.getAndProcessPdf(undefined, url, type, undefined);
      } else {
        await this.getAndProcessHtml(undefined, url, browserPage, type, undefined);
      }
    }

    return true;
  }

  async processRootCauses(browser: Browser) {
    const problemStatement = this.memory.problemStatement;
    const newPage = await browser.newPage();
    newPage.setDefaultTimeout(IEngineConstants.webPageNavTimeout);
    newPage.setDefaultNavigationTimeout(IEngineConstants.webPageNavTimeout);
    await newPage.setUserAgent(IEngineConstants.currentUserAgent);

    for (const searchResultType of CreateRootCausesSearchQueriesProcessor.rootCauseWebPageTypesArray) {
      let urlsToGet = problemStatement.rootCauseSearchResults![searchResultType];
      if (urlsToGet) {
        urlsToGet = urlsToGet.slice(0, Math.floor(urlsToGet.length * IEngineConstants.maxRootCausePercentOfSearchResultWebPagesToGet));
        for (let i = 0; i < urlsToGet.length; i++) {
          await this.getAndProcessRootCausePage(urlsToGet[i].url, newPage, searchResultType);
        }
      } else {
        console.error(`No urls to get for ${searchResultType} (${this.lastPopulationIndex})`);
      }

      await this.saveMemory();
    }

    await newPage.close();

    this.logger.info("Finished and closed page for current problem");
  }

  async getAllPages() {
    const browser = await puppeteer.launch({ headless: "new" });
    this.logger.debug("Launching browser");

    const browserPage = await browser.newPage();
    browserPage.setDefaultTimeout(IEngineConstants.webPageNavTimeout);
    browserPage.setDefaultNavigationTimeout(IEngineConstants.webPageNavTimeout);

    await browserPage.setUserAgent(IEngineConstants.currentUserAgent);

    await this.processRootCauses(browser);

    await this.saveMemory();

    await browser.close();

    this.logger.info("Browser closed");
  }

  async process() {
    this.logger.info("Get Root Cause Web Pages Processor");
    //super.process();

    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.getPageAnalysisModel.temperature,
      maxTokens: IEngineConstants.getPageAnalysisModel.maxOutputTokens,
      modelName: IEngineConstants.getPageAnalysisModel.name,
      verbose: IEngineConstants.getPageAnalysisModel.verbose,
    });

    await this.getAllPages();

    this.logger.info(`Saved ${this.totalPagesSave} pages`);
    this.logger.info("Get Root Cause Web Pages Processor Complete");
  }
}
