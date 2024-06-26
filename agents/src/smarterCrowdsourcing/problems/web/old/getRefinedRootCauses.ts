import { Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { PsConstants } from "../../../../constants.js";

import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { ChatOpenAI } from "@langchain/openai";
import ioredis from "ioredis";
import { GetWebPagesProcessor } from "../../../solutions/web/getWebPages.js";
import { RootCauseExamplePrompts } from "../rootCauseExamplePrompts.js";
import { RootCauseWebPageVectorStore } from "../../../../vectorstore/rootCauseWebPage.js";
import { CreateRootCausesSearchQueriesProcessor } from "../../create/createRootCauseSearchQueries.js";
import { GetRootCausesWebPagesProcessor } from "../getRootCausesWebPages.js";

const redis = new ioredis(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

//@ts-ignore
puppeteer.use(StealthPlugin());

export class GetRefinedRootCausesProcessor extends GetRootCausesWebPagesProcessor {
  renderRootCauseScanningPrompt(type: PSRootCauseWebPageTypes, text: string) {
    return [
      this.createSystemMessage(
        `You are an expert in analyzing root causes for a particular problem statement:

        Important Instructions:
        1. Examine the "<text context>" and analyze it for root causes that relate to the specified problem statement and root cause type.
        2. Always output your results in the following JSON format:
         [
            {
              rootCauseDescription: string;
              rootCauseTitle: string;
              rootCauseDescriptionForPairwiseRanking: string;
              whyRootCauseIsImportant: string;
              rootCauseRelevanceToTypeScore: number;
              rootCauseRelevanceScore: number;
              rootCauseQualityScore: number;
              rootCauseConfidenceScore: number;
            }
          ]
        3. rootCauseDescription should describe each root cause in full in one to two paragraphs.
        4. rootCauseDescriptionForPairwiseRanking should provide a standalone description of each root cause in around 10-20 words.
        5. Never use acronyms in rootCauseDescription even if they are used in the text context
        6. Never use the words "is a root cause" in the rootCauseDescription or rootCauseDescriptionForPairwiseRanking fields.
        7. Output scores in the ranges of 0-100.
        `
      ),
      this.createHumanMessage(
        `
        ${this.renderProblemStatement()}

        Root Cause Type: ${type}

        ${
          this.memory.customInstructions.createSubProblems
            ? `General information about what we are looking for:
        ${this.memory.customInstructions.createSubProblems}`
            : ``
        }

        <text context>
        ${text}
        </text context>

        Let's think step by step.

        JSON Output:
        `
      ),
    ];
  }

  async getRootCauseRefinedTextAnalysis(
    type: PSRootCauseWebPageTypes,
    text: string,
    url: string
  ) {
    try {
      const { totalTokenCount, promptTokenCount } =
        await this.getRootCauseTokenCount(text, type);

      this.logger.debug(
        `Total token count: ${totalTokenCount} Prompt token count: ${JSON.stringify(
          promptTokenCount
        )}`
      );

      let textAnalysis: PSRefinedRootCause[];

      if (
        this.tokenInLimit < totalTokenCount
      ) {
        const maxTokenLengthForChunk =
          this.tokenInLimit -
          promptTokenCount -
          64;

        this.logger.debug(
          `Splitting text into chunks of ${maxTokenLengthForChunk} tokens`
        );

        const splitText = this.splitText(
          text,
          maxTokenLengthForChunk,
          undefined
        );

        this.logger.debug(`Got ${splitText.length} splitTexts`);

        for (let t = 0; t < splitText.length; t++) {
          const currentText = splitText[t];

          let nextAnalysis = await this.getRefinedRootCauseTextAIAnalysis(
            type,
            currentText
          );

          if (nextAnalysis) {
            for (let rootCause of nextAnalysis) {
              this.logger.debug(
                `Root Cause: ${JSON.stringify(rootCause, null, 2)}`
              );
              if (rootCause.rootCauseTitle && rootCause.rootCauseDescription) {
                this.memory.subProblems.push({
                  title: rootCause.rootCauseTitle,
                  description: rootCause.rootCauseDescription,
                  whyIsSubProblemImportant: rootCause.whyRootCauseIsImportant,
                  shortDescriptionForPairwiseRanking:
                    rootCause.rootCauseDescriptionForPairwiseRanking,
                  fromSearchType: type,
                  fromUrl: url,
                  solutions: {
                    populations: [],
                  },
                  entities: [],
                  searchQueries: {
                    general: [],
                    scientific: [],
                    news: [],
                    openData: [],
                  },
                  searchResults: {
                    pages: {
                      general: [],
                      scientific: [],
                      news: [],
                      openData: [],
                    },
                  },
                });
              } else {
                this.logger.warn(
                  `No title or description found for ${JSON.stringify(
                    rootCause,
                    null,
                    2
                  )}`
                );
              }
            }
          } else {
            this.logger.error(
              `Error getting AI analysis for text ${currentText}`
            );
          }
        }
      } else {
        textAnalysis = await this.getRefinedRootCauseTextAIAnalysis(type, text);
        for (let rootCause of textAnalysis) {
          this.logger.debug(
            `Root Cause: ${JSON.stringify(rootCause, null, 2)}`
          );
          if (rootCause.rootCauseTitle && rootCause.rootCauseDescription) {
            this.memory.subProblems.push({
              title: rootCause.rootCauseTitle,
              description: rootCause.rootCauseDescription,
              whyIsSubProblemImportant: rootCause.whyRootCauseIsImportant,
              shortDescriptionForPairwiseRanking:
                rootCause.rootCauseDescriptionForPairwiseRanking,
              fromSearchType: type,
              fromUrl: url,
              solutions: {
                populations: [],
              },
              entities: [],
              searchQueries: {
                general: [],
                scientific: [],
                news: [],
                openData: [],
              },
              searchResults: {
                pages: {
                  general: [],
                  scientific: [],
                  news: [],
                  openData: [],
                },
              },
            });
          } else {
            this.logger.warn(
              `No title or description found for ${JSON.stringify(
                rootCause,
                null,
                2
              )}`
            );
          }
        }
        //this.logger.debug(
        //  `Text analysis ${JSON.stringify(textAnalysis, null, 2)}`
        //);
      }
      await this.saveMemory();

      return textAnalysis!;
    } catch (error) {
      this.logger.error(`Error in getTextAnalysis: ${error}`);
      throw error;
    }
  }

  async getRefinedRootCauseTextAIAnalysis(
    type: PSRootCauseWebPageTypes,
    text: string
  ) {
    this.logger.info("Get Refined Root Cause AI Analysis");
    const messages = this.renderRootCauseScanningPrompt(type, text);

    const analysis = (await this.callLLM(
      "web-get-refined-root-causes",
      this.getRefinedEvidenceModel,
      messages,
      true,
      true
    )) as PSRefinedRootCause[];

    return analysis;
  }

  //TODO: Look into this, do we need a merge
  mergeRefinedAnalysisData(
    data1: PSRefinedRootCause,
    data2: PSRefinedRootCause
  ): PSRefinedRootCause {
    return {
      rootCauseTitle: data1.rootCauseTitle,
      rootCauseDescription: data1.rootCauseDescription,
      rootCauseDescriptionForPairwiseRanking:
        data1.rootCauseDescriptionForPairwiseRanking,
      whyRootCauseIsImportant: data1.whyRootCauseIsImportant,
      rootCauseRelevanceToProblemStatement:
        data1.rootCauseRelevanceToProblemStatement,
      rootCauseRelevanceToProblemStatementScore:
        data1.rootCauseRelevanceToProblemStatementScore,
      rootCauseRelevanceToTypeScore: data1.rootCauseRelevanceToTypeScore,
      rootCauseQualityScore: data1.rootCauseQualityScore,
      rootCauseConfidenceScore: data1.rootCauseConfidenceScore,
      hasBeenRefined: true,
    };
  }

  async processPageText(
    text: string,
    subProblemIndex: number | undefined,
    url: string,
    type:
      | PsWebPageTypes
      | PSEvidenceWebPageTypes
      | PSRootCauseWebPageTypes,
    entityIndex: number | undefined,
    policy: PSPolicy | undefined = undefined
  ) {
    this.logger.debug(`Processing ${url} for ${type}`);

    try {
      const refinedAnalysis = (await this.getRootCauseRefinedTextAnalysis(
        type as PSRootCauseWebPageTypes,
        text,
        url
      )) as unknown as PSRefinedRootCause[];

      // TODO: fix any type
      return refinedAnalysis as any;
    } catch (e: any) {
      this.logger.error(`Error in processPageText`);
      this.logger.error(e.stack || e);
      throw e;
    }
  }

  async getAndProcessRootCausePage(
    url: string,
    browserPage: Page,
    type: PSRootCauseWebPageTypes
  ) {
    if (url.toLowerCase().endsWith(".pdf")) {
      await this.getAndProcessPdf(-1, url, type, undefined, undefined);
    } else {
      await this.getAndProcessHtml(
        -1,
        url,
        browserPage,
        type,
        undefined,
        undefined
      );
    }

    return true;
  }

  async refineWebRootCauses(page: Page) {
    const limit = this.topWebPagesToGetForRefineRootCausesScan;

    let typeCount = 0;

    const clearSubProblems = false;

    if (clearSubProblems) {
      this.memory.subProblems = [];
    }

    if (this.memory.customInstructions.rootCauseUrlsToScan) {
      for (const url of this.memory.customInstructions.rootCauseUrlsToScan) {
        console.log(`Processing ${url}`);
        await this.getAndProcessRootCausePage(url, page, "adminSubmitted");
      }
    }

    const runMainEvent = false;

    if (runMainEvent) {
      try {
        for (const rootCauseType of this.rootCauseFieldTypes) {
          typeCount++;
          const searchType =
            this.simplifyRootCauseType(rootCauseType);
          const results =
            await this.rootCauseWebPageVectorStore.getTopPagesForProcessing(
              this.memory.groupId,
              searchType,
              limit
            );

          this.logger.debug(
            `Got ${results.data.Get["RootCauseWebPage"].length} WebPage results from Weaviate`
          );

          if (results.data.Get["RootCauseWebPage"].length === 0) {
            this.logger.error(`No results for ${searchType}`);
            continue;
          }

          let pageCounter = 0;
          for (const retrievedObject of results.data.Get["RootCauseWebPage"]) {
            const webPage = retrievedObject as PSRootCauseRawWebPageData;
            const id = webPage._additional!.id!;

            this.logger.info(`Score ${webPage.totalScore} for ${webPage.url}`);
            if (webPage.totalScore && webPage.totalScore > 0) {
              this.logger.debug(
                `All scores ${webPage.rootCauseRelevanceToProblemStatementScore} ${webPage.rootCauseRelevanceToTypeScore} ${webPage.rootCauseConfidenceScore} ${webPage.rootCauseQualityScore}`
              );

              // TODO: need to store vectorStoreId some other way (see getMetaDataForTopWebRootCauses.processPageText)
              // policy.vectorStoreId = id;

              await this.getAndProcessRootCausePage(
                webPage.url,
                page,
                searchType as PSRootCauseWebPageTypes
              );
            } else {
              this.logger.info(
                "Skipping the current WebPage as it has a score of 0/null"
              );
            }
            this.logger.info(
              `(+${pageCounter++}) - ${rootCauseType} - ${typeCount} - Updated`
            );
          }
        }
      } catch (error: any) {
        this.logger.error(error.stack || error);
        throw error;
      }
    }
  }

  async getAllPages() {
    const browser = await puppeteer.launch({ headless: true });
    this.logger.debug("Launching browser");

    const browserPage = await browser.newPage();
    browserPage.setDefaultTimeout(this.webPageNavTimeout);
    browserPage.setDefaultNavigationTimeout(this.webPageNavTimeout);

    await browserPage.setUserAgent(this.currentUserAgent);

    try {
      await this.refineWebRootCauses(browserPage);
      this.logger.debug("Finished refining root causes");
    } catch (error: any) {
      this.logger.error(error.stack || error);
      throw error;
    }

    await this.saveMemory();

    await browser.close();

    this.logger.info("Browser closed");
  }

  async process() {
    this.logger.info("Refined Root Causes Web Pages Processor");
    super.process();

    this.chat = new ChatOpenAI({
      temperature: this.getRefinedRootCausesModel.temperature,
      maxTokens: this.getRefinedRootCausesModel.maxOutputTokens,
      modelName: this.getRefinedRootCausesModel.name,
      verbose: this.getRefinedRootCausesModel.verbose,
    });

    await this.getAllPages();

    this.logger.info(`Refined ${this.totalPagesSave} pages`);
    this.logger.info("Refine Root Causes Web Pages Processor Complete");
  }
}
