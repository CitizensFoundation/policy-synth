import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { HTTPResponse, Page } from "puppeteer";
import puppeteer, { Browser } from "puppeteer-extra";
import { PdfReader } from "pdfreader";
import axios from "axios";

import { createGzip, gunzipSync, gzipSync } from "zlib";
import { promisify } from "util";
import { writeFile, readFile, existsSync } from "fs";
import { htmlToText } from "html-to-text";
import { GetWebPagesProcessor } from "../solutions/web/getWebPages.js";
import { IEngineConstants } from "../../constants.js";

const gzip = promisify(createGzip);
const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

export class WebPageScanner extends GetWebPagesProcessor {
  jsonSchemaForResults: string | undefined;
  systemPromptOverride: string | undefined;
  collectedWebPages: any[] = [];

  progressFunction: Function | undefined;

  constructor() {
    super(undefined as any, undefined as any);
  }

  renderScanningPrompt(
    problemStatement: IEngineProblemStatement,
    text: string,
    subProblemIndex?: number,
    entityIndex?: number
  ) {
    return [
      new SystemMessage(
        this.systemPromptOverride ||
          `Your are an AI expert in researching website data:

        Important Instructions:
        1. Examine the "Text context" and determine how it relates to the problem statement and any specified sub problem.
        2. Think step-by-step.
        3. Use this JSON schema to output your results:
          ${this.jsonSchemaForResults}
        `
      ),
      new HumanMessage(
        `
        Text Context:
        ${text}

        JSON Output:
        `
      ),
    ];
  }

  async getTokenCount(text: string, subProblemIndex: number | undefined) {
    const words = text.split(" ");
    const tokenCount = words.length*1.25
    const promptTokenCount = { totalCount: 500, countPerMessage: [] };
    const totalTokenCount =
      tokenCount + 500 +
      IEngineConstants.getSolutionsPagesAnalysisModel.maxOutputTokens;

    return { totalTokenCount, promptTokenCount };
  }

  async getAIAnalysis(
    text: string,
    subProblemIndex?: number,
    entityIndex?: number
  ) {
    this.logger.info("Get AI Analysis");
    const messages = this.renderScanningPrompt(
      "" as any,
      text,
      subProblemIndex,
      entityIndex
    );

    console.log(`getAIAnalysis messages: ${JSON.stringify(messages, null, 2)}`);

    const analysis = await this.callLLM(
      "web-get-pages",
      IEngineConstants.getSolutionsPagesAnalysisModel,
      messages,
      true,
      true
    ) as IEngineWebPageAnalysisData;

    console.log(`getAIAnalysis analysis: ${JSON.stringify(analysis, null, 2)}`);
    return analysis;
  }

  getAllTextForTokenCheck(text: string, subProblemIndex: number | undefined) {
    const promptMessages = this.renderScanningPrompt("" as any, "", -1);

    const promptMessagesText = promptMessages.map((m) => m.text).join("\n");

    return `${promptMessagesText} ${text}`;
  }

  async processPageText(
    text: string,
    subProblemIndex: number | undefined,
    url: string,
    type:
      | IEngineWebPageTypes
      | PSEvidenceWebPageTypes
      | PSRootCauseWebPageTypes,
    entityIndex: number | undefined,
    policy: PSPolicy | undefined = undefined
  ): Promise<void | PSRefinedRootCause[]> {
    this.logger.debug(
      `Processing page text ${text.slice(
        0,
        150
      )} for ${url} for ${type} search results ${subProblemIndex} sub problem index`
    );

    try {
      const textAnalysis = await this.getTextAnalysis(text);

      if (textAnalysis) {
        textAnalysis.url = url;
        this.collectedWebPages.push(textAnalysis);

        this.logger.debug(
          `Saving text analysis ${JSON.stringify(textAnalysis, null, 2)}`
        );
      } else {
        this.logger.warn(`No text analysis for ${url}`);
      }
    } catch (e: any) {
      this.logger.error(`Error in processPageText`);
      this.logger.error(e.stack || e);
    }
  }

  async getAndProcessPage(
    subProblemIndex: number | undefined,
    url: string,
    browserPage: Page,
    type:
      | IEngineWebPageTypes
      | PSEvidenceWebPageTypes
      | PSRootCauseWebPageTypes,
    entityIndex: number | undefined
  ) {
    if (url.toLowerCase().endsWith(".pdf")) {
      await this.getAndProcessPdf(subProblemIndex, url, type, entityIndex);
    } else {
      await this.getAndProcessHtml(
        subProblemIndex,
        url,
        browserPage,
        type,
        entityIndex
      );
    }
    return true;
  }

  async scan(
    listOfUrls: string[],
    jsonSchemaForResults: string,
    scanSystemPrompt: string | undefined = undefined,
    progressFunction: Function | undefined = undefined
  ) {
    this.jsonSchemaForResults = jsonSchemaForResults;
    this.systemPromptOverride = scanSystemPrompt;
    this.progressFunction = progressFunction;

    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.getSolutionsPagesAnalysisModel.temperature,
      maxTokens: IEngineConstants.getSolutionsPagesAnalysisModel.maxOutputTokens,
      modelName: IEngineConstants.getSolutionsPagesAnalysisModel.name,
      verbose: IEngineConstants.getSolutionsPagesAnalysisModel.verbose,
    });


    this.logger.info("Web Pages Scanner");

    this.totalPagesSave = 0;

    const browser = await puppeteer.launch({ headless: "new" });
    this.logger.debug("Launching browser");

    const browserPage = await browser.newPage();
    browserPage.setDefaultTimeout(IEngineConstants.webPageNavTimeout);
    browserPage.setDefaultNavigationTimeout(IEngineConstants.webPageNavTimeout);

    await browserPage.setUserAgent(IEngineConstants.currentUserAgent);

    for (let i = 0; i < listOfUrls.length; i++) {
      if (this.progressFunction) {
        this.progressFunction(`${i+1}/${listOfUrls.length}`);
      }
      await this.getAndProcessPage(
        5021,
        listOfUrls[i],
        browserPage,
        "news",
        undefined
      );
    }

    await browser.close();

    this.logger.info("Browser closed");
    this.logger.info(`Saved ${this.totalPagesSave} pages`);
    this.logger.info("Get Web Pages Processor Complete");

    return this.collectedWebPages;
  }
}
