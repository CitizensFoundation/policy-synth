import { HTTPResponse, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";

import { BaseGetWebPagesAgent } from "./getWebPages.js";

export class WebPageScanner extends BaseGetWebPagesAgent {
  jsonSchemaForResults: string | undefined;
  systemPromptOverride: string | undefined;
  collectedWebPages: any[] = [];

  progressFunction: Function | undefined;

  constructor(memory: PsSimpleAgentMemoryData) {
    super(memory);
  }

  renderScanningPrompt(
    problemStatement: string,
    text: string,
    subProblemIndex?: number,
    entityIndex?: number
  ) {
    return [
      this.createSystemMessage(
        this.systemPromptOverride ||
          `Your are an AI expert in researching website data:

        Important Instructions:
        1. Examine the "Text context" and determine how it relates to the problem statement and any specified sub problem.
        2. Think step-by-step.
        3. Use this JSON schema to output your results:
          ${this.jsonSchemaForResults}
        `
      ),
      this.createHumanMessage(
        `
        Text Context:
        ${text}

        JSON Output:
        `
      ),
    ];
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
      messages,
      true
    ) as any; //TODO: Use <T>

    console.log(`getAIAnalysis analysis: ${JSON.stringify(analysis, null, 2)}`);
    return analysis;
  }

  getAllTextForTokenCheck(text: string, subProblemIndex: number | undefined) {
    const promptMessages = this.renderScanningPrompt("" as any, "", -1);

    const promptMessagesText = promptMessages.map((m) => m.message).join("\n");

    return `${promptMessagesText} ${text}`;
  }

  async processPageText(
    text: string,
    subProblemIndex: number | undefined,
    url: string,
    type: any, //TODO: Use <T>
    entityIndex: number | undefined,
    policy: any | undefined = undefined
  ): Promise<void | any[]> { //TODO: Use <T>
    this.logger.debug(
      `Processing page text ${text.slice(
        0,
        150
      )} for ${url} for ${type} search results ${subProblemIndex} sub problem index`
    );

    try {
      const textAnalysis = await this.getTextAnalysis(text) as any; //TODO: Use <T>;

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
    type: any, //TODO: Use <T>;,
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

    this.logger.info("Web Pages Scanner");

    this.totalPagesSave = 0;

    const browser = await puppeteer.launch({ headless: true });
    this.logger.debug("Launching browser");

    const browserPage = await browser.newPage();
    browserPage.setDefaultTimeout(30); //TODO: Get from agent config
    browserPage.setDefaultNavigationTimeout(30); //TODO: Get from agent config

    //await browserPage.setUserAgent(""); //TODO: Get from agent config

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
    this.logger.info("Get Web Pages Agent Complete");

    return this.collectedWebPages;
  }
}
