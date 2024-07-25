import { HTTPResponse, Page, Browser } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { PdfReader } from "pdfreader";
import axios from "axios";
import crypto from "crypto";

import { createGzip, gunzipSync, gzipSync } from "zlib";
import { promisify } from "util";
import { writeFile, readFile, existsSync, mkdirSync, statSync } from "fs";
import { join } from "path";

const gzip = promisify(createGzip);
const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

import { htmlToText } from "html-to-text";

import { PolicySynthAgent } from "../base/agent.js";
import { PsAiModelSize, PsAiModelType } from "../aiModelTypes.js";

//@ts-ignore
puppeteer.use(StealthPlugin());

const onlyCheckWhatNeedsToBeScanned = false;

export class BaseGetWebPagesOperationsAgent extends PolicySynthAgent {
  urlsScanned = new Set<string>();

  totalPagesSave = 0;

  maxModelTokensOut = 4096;
  modelTemperature = 0.0;

  renderScanningPrompt(
    problemStatement: string,
    text: string,
    subProblemIndex?: number,
    entityIndex?: number
  ) {
    return [
      this.createSystemMessage(
        `Your are an AI expert in analyzing text for practical solutions to difficult problems:

        Important Instructions:
        1. Examine the <TextContext> and determine how it relates to the problem statement and any specified sub problem.
        2. Identify all solutions or components of solutions in the <TextContext> and output in a JSON array.
        3. Always output all your found solutions in this JSON Array format:
        [
          {
            title: string;
            description: string;
            relevanceToProblem: string;
            mainBenefitOfSolutionComponent: string;
            mainObstacleToSolutionComponentAdoption: string;
            mainBenefitOfSolution: string;
            mainObstacleToSolutionAdoption: string;
            contacts?: string[];
          }
        ]
        4. If you find importantant contacts connected to the solutions add them to the optional contacts array.
        5. Never offer explainations only output JSON.
        6. Output the data part of the JSON in English.
        7. It is very important for society that you find the best solutions to those problems.
        `
      ),
      this.createHumanMessage(
        `
        Problem Statement:
        ${problemStatement}

        <TextContext>
        ${text}
        </TextContext>

        Take a deep breath and pay attention to details.

        JSON Output:
        `
      ),
    ];
  }

  async getTokenCount(text: string, subProblemIndex: number | undefined) {
    const emptyMessages = this.renderScanningPrompt("", "", subProblemIndex);

    const promptTokenCount = await this.getTokensFromMessages(emptyMessages);

    const textForTokenCount = this.createHumanMessage(text);

    const textTokenCount = await this.getTokensFromMessages([
      textForTokenCount,
    ]);

    const totalTokenCount =
      promptTokenCount + textTokenCount + this.maxModelTokensOut || 4096;

    return { totalTokenCount, promptTokenCount };
  }

  getAllTextForTokenCheck(text: string, subProblemIndex: number | undefined) {
    const promptMessages = this.renderScanningPrompt("", "", subProblemIndex);

    const promptMessagesText = promptMessages.map((m) => m.message).join("\n");

    return `${promptMessagesText} ${text}`;
  }

  isWithinTokenLimit(allText: string, maxChunkTokenCount: number): boolean {
    const words = allText.split(/\s+/);
    const estimatedTokenCount = words.length * 1.35;

    return estimatedTokenCount <= maxChunkTokenCount;
  }

  splitText(
    fullText: string,
    maxChunkTokenCount: number,
    subProblemIndex: number | undefined
  ): string[] {
    const chunks: string[] = [];
    const elements = fullText.split("\n");
    let currentChunk = "";

    const addElementToChunk = (element: string) => {
      const potentialChunk =
        (currentChunk !== "" ? currentChunk + "\n" : "") + element;

      if (
        !this.isWithinTokenLimit(
          this.getAllTextForTokenCheck(potentialChunk, subProblemIndex),
          maxChunkTokenCount
        )
      ) {
        // If currentChunk is not empty, add it to chunks and start a new chunk with the element
        if (currentChunk !== "") {
          chunks.push(currentChunk);
          currentChunk = element;
        } else {
          // If currentChunk is empty, it means that the element is too large to fit in a chunk
          // In this case, split the element further.
          if (element.includes(" ")) {
            // If the element is a sentence, split it by words
            const words = element.split(" ");
            for (let word of words) {
              addElementToChunk(word);
            }
          } else {
            // If the element is a single word that exceeds maxChunkTokenCount, add it as is
            chunks.push(element);
          }
        }
      } else {
        currentChunk = potentialChunk;
      }
    };

    for (let element of elements) {
      // Before adding an element to a chunk, check its size
      if (
        !this.isWithinTokenLimit(
          this.getAllTextForTokenCheck(element, subProblemIndex),
          maxChunkTokenCount
        )
      ) {
        // If the element is too large, split it by sentences
        const sentences = element.match(/[^.!?]+[.!?]+/g) || [element];
        for (let sentence of sentences) {
          addElementToChunk(sentence);
        }
      } else {
        addElementToChunk(element);
      }
    }

    // Push any remaining text in currentChunk to chunks
    if (currentChunk !== "") {
      chunks.push(currentChunk);
    }

    this.logger.debug(`Split text into ${chunks.length} chunks`);

    return chunks;
  }

  async getAIAnalysis(
    text: string,
    subProblemIndex?: number,
    entityIndex?: number
  ) {
    this.logger.info("Get AI Analysis");
    const messages = this.renderScanningPrompt(
      "",
      text,
      subProblemIndex,
      entityIndex
    );

    const analysis = (await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      messages,
      true
    )) as any; //TODO: Use <T>

    return analysis;
  }

  async getTextAnalysis(
    text: string,
    subProblemIndex?: number,
    entityIndex?: number
  ) {
    try {
      const { totalTokenCount, promptTokenCount } = await this.getTokenCount(
        text,
        subProblemIndex
      );

      this.logger.debug(
        `Total token count: ${totalTokenCount} Prompt token count: ${JSON.stringify(
          promptTokenCount
        )}`
      );

      let textAnalysis: any[]; //TODO: Use <T>

      if (
        8000 < //TODO: Get from model config
        totalTokenCount
      ) {
        const maxTokenLengthForChunk =
          8000 - //TODO: Get from model config
          promptTokenCount -
          128;

        this.logger.debug(
          `Splitting text into chunks of ${maxTokenLengthForChunk} tokens`
        );

        const splitText = this.splitText(
          text,
          maxTokenLengthForChunk,
          subProblemIndex
        );

        this.logger.debug(`Got ${splitText.length} splitTexts`);

        for (let t = 0; t < splitText.length; t++) {
          const currentText = splitText[t];

          let nextAnalysis = (await this.getAIAnalysis(
            currentText,
            subProblemIndex,
            entityIndex
          )) as unknown as any[]; //TODO: Use <T>

          if (nextAnalysis) {
            if (t == 0) {
              textAnalysis = nextAnalysis;
            } else {
              textAnalysis = [...textAnalysis!, ...nextAnalysis];
            }

            this.logger.debug(
              `Refined text analysis (${t}): ${JSON.stringify(
                textAnalysis,
                null,
                2
              )}`
            );
          } else {
            this.logger.error(
              `Error getting AI analysis for text ${currentText}`
            );
          }
        }
      } else {
        textAnalysis = (await this.getAIAnalysis(
          text,
          subProblemIndex
        )) as unknown as any[]; //TODO: Use <T>
        this.logger.debug(
          `Text analysis ${JSON.stringify(textAnalysis, null, 2)}`
        );
      }

      return textAnalysis! as any[]; //TODO: Use <T>
    } catch (error) {
      this.logger.error(`Error in getTextAnalysis: ${error}`);
      throw error;
    }
  }

  async processPageText(
    text: string,
    subProblemIndex: number | undefined,
    url: string,
    type: any, //TODO: Use <T>
    entityIndex: number | undefined,
    policy: any | undefined = undefined
  ): Promise<void | any[]> {
    //TODO: Use <T>
    this.logger.debug(
      `Processing page text ${text.slice(
        0,
        150
      )} for ${url} for ${type} search results ${subProblemIndex} sub problem index`
    );

    if (this.urlsScanned.has(url)) {
      this.logger.warn(`Already scanned ${url}, skipping`);
      return;
    } else {
      this.urlsScanned.add(url);
    }

    try {
      const textAnalysisItems = (await this.getTextAnalysis(
        text,
        subProblemIndex,
        entityIndex
      )) as any[]; //TODO: Use <T>

      if (textAnalysisItems && textAnalysisItems.length > 0) {
        const textAnalysis = textAnalysisItems[0] as any; //TODO: Use <T>
        textAnalysis.fromUrl = url;
        textAnalysis.fromSearchType = type as any; //TODO: Use <T>

        if (
          Array.isArray(textAnalysis.contacts) &&
          textAnalysis.contacts.length > 0
        ) {
          if (
            typeof textAnalysis.contacts[0] === "object" &&
            textAnalysis.contacts[0] !== null
          ) {
            textAnalysis.contacts = textAnalysis.contacts.map((contact: any) =>
              JSON.stringify(contact)
            );
          }
        }

        this.logger.debug(
          `Saving text analysis ${JSON.stringify(textAnalysis, null, 2)}`
        );

        try {
          this.logger.info(`Posting web page for url ${url}`);
          if (subProblemIndex === undefined) {
            //
          } else {
            //
          }
          this.totalPagesSave += 1;
          this.logger.info(`Total ${this.totalPagesSave} saved pages`);
        } catch (e: any) {
          this.logger.error(`Error posting web page for url ${url}`);
          this.logger.error(e);
          this.logger.error(e.stack);
        }

        await this.saveMemory();
      } else {
        this.logger.warn(`No text analysis for ${url}`);
      }
    } catch (e: any) {
      this.logger.error(`Error in processPageText`);
      this.logger.error(e.stack || e);
    }
  }

  generateFileName(url: string) {
    // Use SHA-256 hash function
    const hash = crypto.createHash("sha256");
    hash.update(url);
    // Generate hash and convert it to a hexadecimal string
    const hashedFileName = hash.digest("hex");
    return hashedFileName + ".gz";
  }

  //TODO: Use arxiv API as seperate datasource, use other for non arxiv papers
  // https://github.com/hwchase17/langchain/blob/master/langchain/document_loaders/arxiv.py
  // https://info.arxiv.org/help/api/basics.html
  async getAndProcessPdf(
    subProblemIndex: number | undefined,
    url: string,
    type: any, //TODO: Use <T>
    entityIndex: number | undefined,
    policy: any | undefined = undefined
  ) {
    return new Promise<void>(async (resolve, reject) => {
      this.logger.info("getAndProcessPdf");

      //TODO: Get PdfReader working with those (or use another library)
      const brokenPdfUrls = [
        "https://www.hi.is/sites/default/files/bgisla/hi_2018_final_minna.pdf",
        "https://www.umbodsmadur.is/asset/10316/skyrsla-umbodsmanns-althingis-1995.pdf",
        "https://www.umbodsmadur.is/asset/10314/skyrsla-umbodsmanns-althingis-1992.pdf",
        "https://www.umbodsmadur.is/asset/10319/skyrsla-umbodsmanns-althingis-2007.pdf",
        "https://www.umbodsmadur.is/asset/10311/skyrsla-umbodsmanns-althingis-2006.pdf",
        "https://www.althingi.is/altext/erindi/153/153-692.pdf",
        "https://www.asi.is/media/315571/skyrsla-forseta-asi-2018.pdf",
        "https://www.althingi.is/altext/althingistidindi/L061/061_thing_1942-1943_A_thingskjol.pdf",
        "https://skemman.is/bitstream/1946/13459/1/SusanEftirProfdom.pdf",
        "https://www.stjornarradid.is/media/menntamalaraduneyti-media/media/ritogskyrslur/tomstund.pdf",
        "https://skemman.is/bitstream/1946/24768/1/Dr.%20G.%20Sunna%20Gestsd%C3%B3ttir.pdf",
        "https://www.althingi.is/altext/erindi/153/153-4952.pdf",
        "https://www.althingi.is/altext/althingistidindi/L076/076_thing_1956-1957_umraedur_D.pdf",
      ];

      if (brokenPdfUrls.includes(url)) {
        this.logger.warn(`Skipping broken PDF ${url}`);
        resolve();
        return;
      }

      try {
        let finalText = "";
        let pdfBuffer;

        const directoryPath = `webPagesCache/${`webResearchId${subProblemIndex}`}`;
        let fileName;
        if (encodeURIComponent(url).length > 230) {
          this.logger.debug(`URL too long, generating hash for filename`);
          fileName = this.generateFileName(url);
        } else {
          fileName = encodeURIComponent(url) + ".gz";
        }

        const fullPath = join(directoryPath, fileName);

        // Create the directory if it doesn't exist
        if (!existsSync(directoryPath)) {
          mkdirSync(directoryPath, { recursive: true });
        }

        if (existsSync(fullPath) && statSync(fullPath).isFile()) {
          this.logger.info("Got cached PDF for: " + url);
          const cachedPdf = await readFileAsync(fullPath);
          pdfBuffer = gunzipSync(cachedPdf);
        } else {
          const sleepingForMs = 25 + Math.random() * 100; //TODO: get from agent config

          this.logger.info(`Fetching PDF ${url} in ${sleepingForMs} ms`);

          await new Promise((r) => setTimeout(r, sleepingForMs));

          const axiosResponse = await axios.get(url, {
            responseType: "arraybuffer",
          });

          pdfBuffer = axiosResponse.data;

          if (pdfBuffer) {
            this.logger.debug(`Caching PDF response`);
            const gzipData = gzipSync(pdfBuffer);
            await writeFileAsync(fullPath, gzipData);
            this.logger.debug("Have cached PDF response");
          }
        }

        if (pdfBuffer) {
          //this.logger.debug(pdfBuffer.toString().slice(0, 100));
          try {
            new PdfReader({ debug: false }).parseBuffer(
              pdfBuffer,
              async (err: any, item: any) => {
                if (err) {
                  this.logger.error(`Error parsing PDF ${url}`);
                  this.logger.error(err);
                  resolve();
                } else if (!item) {
                  finalText = finalText.replace(/(\r\n|\n|\r){3,}/gm, "\n\n");
                  /*this.logger.debug(
                    `Got final PDF text: ${
                      finalText ? finalText.slice(0, 100) : ""
                    }`
                  );*/
                  await this.processPageText(
                    finalText,
                    subProblemIndex,
                    url,
                    type,
                    entityIndex,
                    policy
                  );
                  resolve();
                } else if (item.text) {
                  finalText += item.text + " ";
                }
              }
            );
          } catch (e) {
            this.logger.error(`No PDF buffer`);
            this.logger.error(e);
            resolve();
          }
        } else {
          this.logger.error(`No PDF buffer`);
          resolve();
        }
      } catch (e) {
        this.logger.error(`Error in get pdf`);
        this.logger.error(e);
        resolve();
      }
    });
  }

  async getAndProcessHtml(
    subProblemIndex: number | undefined,
    url: string,
    browserPage: Page,
    type: any,
    entityIndex: number | undefined,
    policy: any | undefined = undefined
  ) {
    try {
      let finalText, htmlText;

      this.logger.debug(`Getting HTML for ${url}`);

      const directoryPath = `webPagesCache/${`webResearchId${subProblemIndex}`}`;

      const brokenHtmlUrls = ["https://cs.hi.is/python/ord.txt"];

      if (brokenHtmlUrls.includes(url)) {
        this.logger.warn(`Skipping broken HTML ${url}`);
        return;
      }

      let fileName;
      if (encodeURIComponent(url).length > 230) {
        this.logger.debug(`URL too long, generating hash for filename`);
        fileName = this.generateFileName(url);
      } else {
        fileName = encodeURIComponent(url) + ".gz";
      }

      const fullPath = join(directoryPath, fileName);

      // Create the directory if it doesn't exist
      if (!existsSync(directoryPath)) {
        mkdirSync(directoryPath, { recursive: true });
      }

      if (existsSync(fullPath) && statSync(fullPath).isFile()) {
        this.logger.info("Got cached HTML");
        const cachedData = await readFileAsync(fullPath);
        htmlText = gunzipSync(cachedData).toString();
      } else {
        const sleepingForMs = 25 + Math.random() * 100; //TODO: get from agent config

        this.logger.info(`Fetching HTML page ${url} in ${sleepingForMs} ms`);

        await new Promise((r) => setTimeout(r, sleepingForMs));

        const response = await browserPage.goto(url, {
          waitUntil: "networkidle0",
        });
        if (response) {
          htmlText = await response.text();
          if (htmlText) {
            this.logger.debug(`Caching response`);
            const gzipData = gzipSync(Buffer.from(htmlText));
            await writeFileAsync(fullPath, gzipData);
          }
        }
      }

      if (htmlText) {
        finalText = htmlToText(htmlText, {
          wordwrap: false,
          selectors: [
            {
              selector: "a",
              format: "skip",
              options: {
                ignoreHref: true,
              },
            },
            {
              selector: "img",
              format: "skip",
            },
            {
              selector: "form",
              format: "skip",
            },
            {
              selector: "nav",
              format: "skip",
            },
          ],
        });

        finalText = finalText.replace(/(\r\n|\n|\r){3,}/gm, "\n\n");

        //this.logger.debug(`Got HTML text: ${finalText}`);
        await this.processPageText(
          finalText,
          subProblemIndex,
          url,
          type,
          entityIndex,
          policy
        );
      } else {
        this.logger.error(`No HTML text found for ${url}`);
      }
    } catch (e: any) {
      this.logger.error(`Error in get html`);
      this.logger.error(e.stack || e);
    }
  }

  async getAndProcessPage(
    subProblemIndex: number | undefined,
    url: string,
    browserPage: Page,
    type: any, //TODO: Use <T>
    entityIndex: number | undefined
  ) {
    if (onlyCheckWhatNeedsToBeScanned) {
      //TODO: TBD
    } else {
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
    }

    return true;
  }

  getUrlsToFetch(allPages: PsSearchResultItem[]): string[] {
    let outArray: PsSearchResultItem[] = [];

    outArray = allPages.slice(
      0,
      Math.floor(
        allPages.length * 0.4 //TODO: Get from agent config
      )
    );

    // Map to URLs and remove duplicates
    const urlsToGet: string[] = Array.from(
      outArray
        .map((p) => p.url)
        .reduce((unique, item) => unique.add(item), new Set())
    ) as string[];

    this.logger.debug(
      `Got ${urlsToGet.length} URLs to fetch ${JSON.stringify(
        urlsToGet,
        null,
        2
      )}`
    );

    return urlsToGet;
  }

  async getAllPages() {
    const browser = await puppeteer.launch({ headless: true });
    this.logger.debug("Launching browser");

    const browserPage = await browser.newPage();
    browserPage.setDefaultTimeout(30); //TODO: Get from agent config
    browserPage.setDefaultNavigationTimeout(30); //TODO: Get from agent config

    //await browserPage.setUserAgent(""); //TODO: Get from agent config

    await this.saveMemory();

    await this.saveMemory();

    const searchQueryTypes = [
      "general",
      "scientific",
      "openData",
      "news",
    ] as const;

    const processPromises = searchQueryTypes.map(async (searchQueryType) => {
      const newPage = await browser.newPage();
      newPage.setDefaultTimeout(30); //TODO: Get from agent config
      newPage.setDefaultNavigationTimeout(30); //TODO: Get from agent config

      //await newPage.setUserAgent(""); //TODO: Get from agent config

      //

      await newPage.close();
      this.logger.info(`Closed page for ${searchQueryType} search results`);
    });

    await Promise.all(processPromises);

    await this.saveMemory();

    await browser.close();

    this.logger.info("Browser closed");
  }

  async process() {
    this.logger.info("Get Web Pages Agent");

    this.totalPagesSave = 0;

    await this.getAllPages();

    this.logger.info(`Saved ${this.totalPagesSave} pages`);
    this.logger.info("Get Web Pages Agent Complete");
  }
}
