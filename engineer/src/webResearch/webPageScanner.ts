import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { HTTPResponse, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import { PdfReader } from "pdfreader";
import axios from "axios";

import { createGzip, gunzipSync, gzipSync } from "zlib";
import { promisify } from "util";
import { writeFile, readFile, existsSync } from "fs";

import { GetWebPagesProcessor } from "@policysynth/agents/solutions/web/getWebPages.js";
import { PsConstants } from "@policysynth/agents/constants.js";

const gzip = promisify(createGzip);
const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

export class WebPageScanner extends GetWebPagesProcessor {
  declare memory: PsEngineerMemoryData;
  scanType?: PsEngineerWebResearchTypes;
  instructions: string;

  collectedWebPages: any[] = [];

  constructor(memory: PsEngineerMemoryData, instructions: string) {
    super(undefined as any, memory);
    this.instructions = instructions;
  }

  sanitizeInput(text: string): string {
    try {
      // Encode the text as UTF-8 and then decode it back to string
      const buffer = Buffer.from(text, "utf8");
      const decodedText = buffer.toString("utf8");
      return decodedText;
    } catch (error) {
      console.error("Error sanitizing input text:", error);
      return ""; // Return an empty string or handle the error as needed
    }
  }

  renderScanningPrompt(
    problemStatement: PsProblemStatement,
    text: string,
    subProblemIndex?: number,
    entityIndex?: number
  ) {
    let systemMessage = new SystemMessage("");
    if (this.scanType == "documentation") {
      systemMessage = new SystemMessage(
        `Your are an expert in extracing documentation from web pages for a given task and npm modules:

        Important Instructions:
        1. Examine the <TextContext> and copy all documentation highly relevant to the task provided by the user.
        2. Just copy highly relevant documentation from the <TextContext> word by word do not add anything except formating.
        3. If no highly relevant, to the user provided task, documentation is found, output: No relevant documentation found.
        4. Output in Markdown format otherwise.
`
      );
    } else if (this.scanType == "codeExamples") {
      systemMessage = new SystemMessage(
        `Your are an expert in extracing source code examples from web pages for a given task and npm modules:

          Important Instructions:
          1. Examine the <TextContext> and output all source code examples that are highly relvant to the task provided by the user.
          2. Just copy highly relevant source code examples from the <TextContext> word by word do not add anything except formating.
          3. If no relevant, to the user provided task, source code examples are found, output: No relevant source code examples found.
          4. Output in Markdown format otherwise.`
      );
    } else if (this.scanType == "solutionsForErrors") {
      systemMessage = new SystemMessage(
        `Your are an expert in extracing solutions to errors from web pages for a given task and npm modules:

          Important Instructions:
          1. Examine the <TextContext> and <UserErrors> output all potential solutions to the users errors highly relvant to the task provided by the user.
          2. Just copy potential solutions to the users errors from the <TextContext> word by word do not add anything except formating.
          3. If no relevant, to the user provided task, source code examples are found, output: No solutions to errors found.
          4. Output in Markdown format otherwise.`
      );
    } else {
      console.error(`Unknown scan type ${this.scanType}`);
      throw new Error(`Unknown scan type ${this.scanType}`);
    }

    return [
      systemMessage,
      new HumanMessage(
        `<TextContext>:
        ${text}
        </TextContext>

        The overall task we are gathering practical information about: ${
          this.memory.taskTitle
        }
        Overall task we are researching description: ${
          this.memory.taskDescription
        }
        Overall task we are researching instructions (not for you to follow now, just FYI): ${
          this.memory.taskInstructions
        }

        All likely npm package.json dependencies:
        ${this.memory.likelyRelevantNpmPackageDependencies.join("\n")}

        All likely typescript files in workspace likely to change:
        ${this.memory.existingTypeScriptFilesLikelyToChange.join("\n")}

        Important instructions: ${this.instructions}

        Markdown Output:
        `
      ),
    ];
  }

  async getTokenCount(text: string, subProblemIndex: number | undefined) {
    const words = text.split(" ");
    const tokenCount = words.length * 1.25;
    const promptTokenCount = { totalCount: 500, countPerMessage: [] };
    const totalTokenCount =
      tokenCount +
      500 +
      PsConstants.getSolutionsPagesAnalysisModel.maxOutputTokens;

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

    const analysis = (await this.callLLM(
      "web-get-pages",
      PsConstants.getSolutionsPagesAnalysisModel,
      messages,
      false,
      true
    )) as any;

    console.log(`getAIAnalysis analysis: ${JSON.stringify(analysis, null, 2)}`);
    return analysis;
  }

  getAllTextForTokenCheck(text: string, subProblemIndex: number | undefined) {
    const promptMessages = this.renderScanningPrompt("" as any, "", -1);

    const promptMessagesText = promptMessages!.map((m) => m.text).join("\n");

    return `${promptMessagesText} ${text}`;
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
        this.collectedWebPages.push(textAnalysis);

        this.logger.debug(`Saving text analysis ${textAnalysis}`);
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
      | PsWebPageTypes
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

  async scan(listOfUrls: string[], scanType: PsEngineerWebResearchTypes) {
    this.scanType = scanType;

    this.chat = new ChatOpenAI({
      temperature: 0.0,
      maxTokens: 4096,
      modelName: "gpt-4o",
      verbose: true,
    });

    this.logger.info("Web Pages Scanner");

    this.totalPagesSave = 0;

    const browser = await puppeteer.launch({ headless: true });
    this.logger.debug("Launching browser");

    const browserPage = await browser.newPage();
    browserPage.setDefaultTimeout(PsConstants.webPageNavTimeout);
    browserPage.setDefaultNavigationTimeout(PsConstants.webPageNavTimeout);

    await browserPage.setUserAgent(PsConstants.currentUserAgent);

    if (this.memory.docsSiteToScan) {
      listOfUrls = [...listOfUrls, ...this.memory.docsSiteToScan];
      console.log(`Adding docsSiteToScan ${this.memory.docsSiteToScan}`);
    }

    for (let i = 0; i < listOfUrls.length; i++) {
      this.logger.info(`${i + 1}/${listOfUrls.length}`);
      this.logger.info(`------> Searching ${listOfUrls[i]} <------`);

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
