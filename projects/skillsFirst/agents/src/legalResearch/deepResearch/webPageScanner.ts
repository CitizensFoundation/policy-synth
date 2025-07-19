import { HTTPResponse, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import { PdfReader } from "pdfreader";
import axios from "axios";
import pLimit from "p-limit";

import { createGzip, gunzipSync, gzipSync } from "zlib";
import { promisify } from "util";
import { writeFile, readFile, existsSync } from "fs";

import { BaseGetWebPagesOperationsAgent } from "@policysynth/agents/deepResearch/getWebPagesOperations.js";
import { PsConstants } from "@policysynth/agents/constants.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelSize,
  PsAiModelType,
} from "@policysynth/agents/aiModelTypes.js";
import { GetWebPagesBaseAgent } from "@policysynth/agents/deepResearch/getWebPagesBase.js";

export class WebPageScanner extends GetWebPagesBaseAgent {
  declare memory: JobDescriptionMemoryData;
  scanType?: DeepResearchWebResearchTypes;
  instructions: string;
  systemMessage: string;

  totalPagesSave: number = 0;

  collectedWebPages: any[] = [];

  override get modelTemperature(): number { return 0.0; }

  urlToCrawl: string | undefined = undefined;

  constructor(
    agent: PsAgent,
    memory: JobDescriptionMemoryData,
    startProgress: number,
    endProgress: number,
    instructions: string,
    systemMessage: string
  ) {
    super(agent, memory, startProgress, endProgress);
    this.instructions = instructions;
    this.systemMessage = systemMessage;
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

  renderDeepScanningPrompt(text: string) {
    const systemMessage = `Your task is to analyze the provided text context and determine if it contains a clear and explicit degree requirement for the job title.
    Follow the user <Instruction> in detail.`

    ;
    this.logger.debug("Rendering Deep Scanning Prompt:" + systemMessage);

    return [
      systemMessage,
      this.createHumanMessage(
        `<TextContext>:
        ${text}
        </TextContext>

        <Instructions>:
        ${this.systemMessage}
        </Instructions>

        Important, only output JSON, nothing else.

        JSON Output:
        `
      ),
    ];
  }

  async processPageAnalysis(text: string) {
    const minTextLengthForScanning = 1000;

    if (text.length > minTextLengthForScanning) {
      this.logger.info("Get AI Analysis");
      const messages = this.renderDeepScanningPrompt(text);

      if (process.env.PS_DEBUG_AI_MESSAGES) {
        console.log(`getAIAnalysis messages: ${JSON.stringify(messages, null, 2)}`);
      }

      const analysis = (await this.callModel(
        PsAiModelType.TextReasoning,
        PsAiModelSize.Medium,
        messages
      )) as any;

      console.log(
        `getAIAnalysis analysis: ${JSON.stringify(analysis, null, 2)}`
      );
      return analysis;
    } else {
      return [];
    }
  }

  async scan(
    listOfUrls: string[],
    scanType: DeepResearchWebResearchTypes,
    urlToCrawl: string | undefined = undefined
  ) {
    this.scanType = scanType;
    this.urlToCrawl = urlToCrawl;

    this.logger.info(`Web Pages Scanner: ${listOfUrls.length}`);

    // Deduplicate URLs
    listOfUrls = Array.from(new Set(listOfUrls));
    this.logger.info(`Web Pages Scanner after dedup: ${listOfUrls.length}`);

    // If we have a custom URL to crawl, prioritize it
    if (this.urlToCrawl) {
      this.logger.info(`Custom URL to Crawl: ${this.urlToCrawl}`);
      listOfUrls = listOfUrls.filter((url) => url !== this.urlToCrawl);
      listOfUrls = [this.urlToCrawl, ...listOfUrls];
    }

    this.totalPagesSave = 0;
    this.collectedWebPages = [];

    const MAX_URLS_TO_FETCH_PARALLEL = 10;
    const limit = pLimit(
      process.env.MAX_WEBRESEARCH_URLS_TO_FETCH_PARALLEL
        ? parseInt(process.env.MAX_WEBRESEARCH_URLS_TO_FETCH_PARALLEL)
        : MAX_URLS_TO_FETCH_PARALLEL
    );

    let completedUrls = 0;

    const tasks = listOfUrls.map((url, i) =>
      limit(async () => {
        const progress = Math.round(((i + 1) / listOfUrls.length) * 100);
        await this.updateRangedProgress(progress, `Scanning (${i + 1}/${listOfUrls.length}) ${url}`);

        this.logger.info(`${i + 1}/${listOfUrls.length}`);
        this.logger.info(`------> Searching ${url} <------`);

        let content;
        try {
          content = await this.getAndProcessPage(
            url,
            "markdown",
            this.urlToCrawl
          );

          if (!content) {
            this.logger.error(`Error processing page no content ${url}`);
            return;
          }
        } catch (error) {
          this.logger.error(`Error processing page ${url} ${error}`);
          return;
        }

        // Handle array of content or single content
        const contentsToProcess = Array.isArray(content) ? content : [content];

        for (const contentItem of contentsToProcess) {
          const aiAnalysisObject = await this.processPageAnalysis(contentItem);
          if (!aiAnalysisObject) {
            this.logger.error(`Error processing page ${url} no aiAnalysisObject`);
            continue;
          }
          aiAnalysisObject.fromUrl = url;
          this.collectedWebPages.push(aiAnalysisObject);
          this.totalPagesSave++;
        }

        completedUrls++;
        await this.updateRangedProgress(progress, `Scanned (${completedUrls}/${listOfUrls.length}) ${url}`);
      })
    );

    // Run all tasks in parallel with concurrency limit
    await Promise.all(tasks);

    this.logger.info(`Saved ${this.totalPagesSave} pages`);
    this.logger.info("Get Web Pages Processor Complete");

    await this.saveMemory();

    return this.collectedWebPages;
  }
}
