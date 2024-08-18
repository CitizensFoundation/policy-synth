import { HTTPResponse, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import { PdfReader } from "pdfreader";
import axios from "axios";

import { BaseGetWebPagesOperationsAgent } from "@policysynth/agents/webResearch/getWebPagesOperations.js";
import { PsConstants } from "@policysynth/agents/constants.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelSize,
  PsAiModelType,
} from "@policysynth/agents/aiModelTypes.js";

export class WebScanningAgent extends BaseGetWebPagesOperationsAgent {
  declare memory: GoldPlatingMemoryData;

  modelSize: PsAiModelSize = PsAiModelSize.Small;

  constructor(
    agent: PsAgent,
    memory: GoldPlatingMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
  }

  async processItem(researchItem: GoldplatingResearchItem): Promise<void> {
    const urlsToScan = this.collectUrls(researchItem);
    await this.scan(urlsToScan);
    this.updateResearchItem(researchItem);
  }

  private collectUrls(researchItem: GoldplatingResearchItem): string[] {
    const urls: string[] = [];

    if (researchItem.nationalLaw) {
      urls.push(researchItem.nationalLaw.law.url);
      if (researchItem.nationalLaw.supportArticleText) {
        urls.push(researchItem.nationalLaw.supportArticleText.url);
      }
    }

    if (researchItem.nationalRegulation) {
      urls.push(...researchItem.nationalRegulation.map((reg) => reg.url));
    }

    if (researchItem.euDirective) {
      urls.push(researchItem.euDirective.url);
    }

    if (researchItem.euRegulation) {
      urls.push(researchItem.euRegulation.url);
    }

    return urls;
  }

  async scan(listOfUrls: string[]): Promise<void> {
    this.logger.info("Web Pages Scanner");

    this.totalPagesSave = 0;

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
    this.logger.debug("Launching browser");

    const browserPage = await browser.newPage();
    browserPage.setDefaultTimeout(PsConstants.webPageNavTimeout);
    browserPage.setDefaultNavigationTimeout(PsConstants.webPageNavTimeout);

    await browserPage.setUserAgent(PsConstants.currentUserAgent);

    for (let i = 0; i < listOfUrls.length; i++) {
      this.logger.info(`${i + 1}/${listOfUrls.length}`);
      this.logger.info(`------> Scanning ${listOfUrls[i]} <------`);

      const progress = Math.round(((i + 1) / listOfUrls.length) * 100);
      await this.updateRangedProgress(progress, `Scanning ${listOfUrls[i]}`);

      await this.getAndProcessPage(
        undefined,
        listOfUrls[i],
        browserPage,
        "law",
        undefined
      );
    }

    await browser.close();

    this.logger.info("Browser closed");
    this.logger.info(`Saved ${this.totalPagesSave} pages`);
    this.logger.info("Web Pages Scanner Complete");
  }

  async getAndProcessPage(
    subProblemIndex: number | undefined,
    url: string,
    browserPage: Page,
    type: any,
    entityIndex: number | undefined
  ) {
    if (
      url.toLowerCase().endsWith(".pdf") ||
      url.indexOf("files.reglugerd.is") > -1
    ) {
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

  async processPageText(
    text: string,
    subProblemIndex: number | undefined,
    url: string,
    type: any,
    entityIndex: number | undefined,
    policy: any | undefined = undefined
  ): Promise<void> {
    this.logger.debug(`Processing page text ${text.slice(0, 150)} for ${url}`);

    // Store the text in memory for later use
    if (!this.memory.scannedPages) {
      this.memory.scannedPages = {};
    }
    this.memory.scannedPages[url] = text;
  }

  private updateResearchItem(researchItem: GoldplatingResearchItem): void {
    if (!this.memory.scannedPages) {
      this.logger.warn("No scanned pages found in memory");
      return;
    }

    if (researchItem.nationalLaw) {
      researchItem.nationalLaw.law.fullText =
        this.memory.scannedPages[researchItem.nationalLaw.law.url] || "";
      if (researchItem.nationalLaw.supportArticleText) {
        researchItem.nationalLaw.supportArticleText.fullText =
          this.memory.scannedPages[
            researchItem.nationalLaw.supportArticleText.url
          ] || "";
      }
    }

    if (researchItem.nationalRegulation) {
      researchItem.nationalRegulation.forEach((regulation) => {
        regulation.fullText = this.memory.scannedPages![regulation.url] || "";
      });
    }

    if (researchItem.euDirective) {
      researchItem.euDirective.fullText =
        this.memory.scannedPages[researchItem.euDirective.url] || "";
    }

    if (researchItem.euRegulation) {
      researchItem.euRegulation.fullText =
        this.memory.scannedPages[researchItem.euRegulation.url] || "";
    }
  }
}
