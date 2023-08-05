import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { IEngineConstants } from "../../../constants.js";
import { PdfReader } from "pdfreader";
import axios from "axios";
import { createGzip, gunzipSync, gzipSync } from "zlib";
import { promisify } from "util";
import { writeFile, readFile, existsSync } from "fs";
const gzip = promisify(createGzip);
const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);
import { htmlToText } from "html-to-text";
import { BaseProcessor } from "../baseProcessor.js";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { WebPageVectorStore } from "../vectorstore/webPage.js";
import ioredis from "ioredis";
const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
//@ts-ignore
puppeteer.use(StealthPlugin());
export class GetWebPagesProcessor extends BaseProcessor {
    webPageVectorStore = new WebPageVectorStore();
    renderScanningPrompt(problemStatement, text, subProblemIndex) {
        return [
            new SystemChatMessage(`Your are an AI expert in analyzing textual data:

        Important Instructions:
        1. Examine the "Text context" and determine how it relates to the problem statement and any specified sub-problems.
        2. Identify any solutions in the "Text Context" and include them in the 'solutionsIdentifiedInTextContext' JSON array.
        3. Include any paragraphs with potential solutions to the problem statement and sub problem from the "Text Context" in the 'mostRelevantParagraphs' JSON array.
        4. Only use solutions found within the "Text Context" - do not create your own solutions.
        5. Never store citations or references in the 'mostRelevantParagraphs' array.
        6. Add any contacts you find in the "Text Context" to the 'contacts' JSON array.
        7. Never output in markdown format.
        8. Never include references as part of the 'mostRelevantParagraphs' array.
        9. Always output your results in the JSON format with no additional explanation.
        10. Think step-by-step.

        Examples:

        Problem Statement:
        Obesity in children in many countries is increasing.

        Text context:
        Childhood Overweight & Obesity
        Print
        Childhood obesity is a serious health problem in the United States where 1 in 5 children and adolescents are affected. Some groups of children are more affected than others, but all children are at risk of gaining weight that is higher than what is considered healthy.

        Obesity is complex. Many factors can contribute to excess weight gain including behavior, genetics and taking certain medications. But societal and community factors also matter: child care and school environments, neighborhood design, access to healthy, affordable foods and beverages, and access to safe and convenient places for physical activity affect our ability to make healthy choices.

        Every child deserves a healthy start in life. Learn what parents and caregivers can to do help prevent obesity at home, how healthcare systems can help families prevent and manage childhood obesity, and what strategies communities can use to support a healthy, active lifestyle for all.

        Childhood Obesity Facts
        How many children in the United States have obesity?

        Defining Childhood Overweight & Obesity
        How is childhood obesity measured?

        Causes and Consequences
        What contributes to childhood obesity? What are the health risks?

        Clinical Guidelines
        Resources for clinicians and healthcare providers on childhood obesity. Also see CDC’s Clinical Growth Charts.

        Child and Teen BMI Calculator
        Use this calculator for children aged 2 through 19 years old.

        JSON Output:
        [
          {
            "summary": "Childhood obesity in the United States, affecting 1 in 5 children, is thoroughly examined in the given discourse. It articulates obesity as a multifaceted problem with numerous contributors such as behavior, genetics, medication, and societal and community influences. The importance of the roles parents, caregivers, healthcare systems, and communities play in both preventing and managing childhood obesity is emphasized within the discussion.",
            "relevanceToProblem": "Direct correlation to the problem statement is seen in the discourse's exploration of childhood obesity, its roots, and potential mitigations.",
            "mostRelevantParagraphs": [
              "Childhood obesity is a serious health problem in the United States where 1 in 5 children and adolescents are affected. Some groups of children are more affected than others, but all children are at risk of gaining weight that is higher than what is considered healthy.",
              "Obesity is complex. Many factors can contribute to excess weight gain including behavior, genetics and taking certain medications. But societal and community factors also matter: child care and school environments, neighborhood design, access to healthy, affordable foods and beverages, and access to safe and convenient places for physical activity affect our ability to make healthy choices.",
              "Every child deserves a healthy start in life. Learn what parents and caregivers can to do help prevent obesity at home, how healthcare systems can help families prevent and manage childhood obesity, and what strategies communities can use to support a healthy, active lifestyle for all.",
            ],
            "solutionsIdentifiedInTextContext": [
              "Parents and caregivers can help prevent obesity at home",
              "Healthcare systems can help families prevent and manage childhood obesity",
              "Communities can use strategies to support a healthy, active lifestyle for all"
            ],
            contacts: []
          }
        ]

        Problem Statement:
        Prototype robotic prosthetic leg batteries are not lasting long enough.

        Sub Problem:
        Larger batteries are too heavy.

        Text context:
        Predicting the impact of formation protocols on
        battery lifetime immediately after manufacturing
        Andrew Weng1,*, Peyman Mohtat1
        , Peter M. Attia2
        , Valentin Sulzer1
        , Suhak Lee1
        , Greg
        Less3
        , and Anna Stefanopoulou1
        1Department of Mechanical Engineering, University of Michigan, Ann Arbor, MI 48109, USA
        2Department of Materials Science and Engineering, Stanford University, Stanford, CA 94305, USA
        3University of Michigan Battery Lab, Ann Arbor, MI 48105, USA
        *
        Lead Contact and Corresponding Author (asweng@umich.edu)
        Summary
        Increasing the speed of battery formation can significantly lower lithium-ion battery manufacturing costs. However, adopting
        faster formation protocols in practical manufacturing settings is challenging due to a lack of inexpensive, rapid diagnostic
        signals that can inform possible impacts to long-term battery lifetime. This work identifies the cell resistance measured at low
        states of charge as an early-life diagnostic feature for screening new formation protocols. We show that this signal correlates to
        cycle life and improves the accuracy of data-driven battery lifetime prediction models. The signal is obtainable at the end of
        the manufacturing line, takes seconds to acquire, and does not require specialized test equipment. We explore a physical
        connection between this resistance signal and the quantity of lithium consumed during formation, suggesting that the signal
        may be broadly applicable for evaluating any manufacturing process change that could impact the total lithium consumed
        during formation.

        3 Conclusion
        In this work, we demonstrated that low-SOC resistance (RLS) correlates to cycle life across two different battery
        formation protocols. As a predictive feature, RLS provided higher prediction accuracy compared to conventional
        measures of formation quality such as Coulombic efficiency as well as state-of-the art predictive features based
        on changes in discharge voltage curves. RLS is measurable at the end of the manufacturing line using ordinary
        battery test equipment and can be measured within seconds. Changes in RLS are attributed to differences in the
        amount of lithium consumed to the SEI during formation, where a decrease in RLS indicates that more lithium is
        consumed. For more information: Robert Bjarnason with email robert@citizens.is

        References
        1
        Australian Trade and Investment Commission, The Lithium-Ion Battery Value Chain: New Economy Opportunities
        for Australia, tech. rep. (2018), p. 56.
        2
        Benchmark Minerals Intelligence, EV Battery arms race enters new gear with 115 megafactories, Europe sees
        most rapid growth, 2019.

        JSON Output:
        {
          "summary": "Faster formation protocols bear potential to augment the lifetime of lithium-ion batteries. Notably, cell resistance, especially at low states of charge, emerges as a predictive feature for battery lifespan. It's indicative of the amount of lithium utilized during formation, serving as a yardstick for assessing alterations in the manufacturing process that might impact battery life.",
          "relevanceToProblem": "The discussion around the influence of formation protocols on battery lifespan is directly pertinent to the challenge of ensuring the batteries in prototype robotic prosthetic legs last longer.",
          "mostRelevantParagraphs": [
            "In this work, we demonstrated that low-SOC resistance (RLS) correlates to cycle life across two different battery formation protocols. As a predictive feature, RLS provided higher prediction accuracy compared to conventional measures of formation quality such as Coulombic efficiency as well as state-of-the art predictive features based on changes in discharge voltage curves. RLS is measurable at the end of the manufacturing line using ordinary battery test equipment and can be measured within seconds. Changes in RLS are attributed to differences in the amount of lithium consumed to the SEI during formation, where a decrease in RLS indicates that more lithium is consumed."
          ],
          "solutionsIdentifiedInTextContext": [
            "Adopting faster formation protocols and using the cell resistance measured at low states of charge as an early-life diagnostic feature for screening new formation protocols."
          ],
          "contacts": [
            "Robert Bjarnason, robert@citizens.is"
          ]
        }
        `),
            new HumanChatMessage(`
        Problem Statement:
        ${problemStatement.description}

        ${subProblemIndex !== undefined
                ? `
                ${this.renderSubProblem(subProblemIndex)}
              `
                : ``}

        Text Context:
        ${text}

        JSON Output:
        `),
        ];
    }
    async getTokenCount(text, subProblemIndex) {
        const emptyMessages = this.renderScanningPrompt(this.memory.problemStatement, "", subProblemIndex);
        const promptTokenCount = await this.chat.getNumTokensFromMessages(emptyMessages);
        const textForTokenCount = new HumanChatMessage(text);
        const textTokenCount = await this.chat.getNumTokensFromMessages([
            textForTokenCount,
        ]);
        const totalTokenCount = promptTokenCount.totalCount +
            textTokenCount.totalCount +
            IEngineConstants.getPageAnalysisModel.maxOutputTokens;
        return { totalTokenCount, promptTokenCount };
    }
    mergeAnalysisData(data1, data2) {
        return {
            mostRelevantParagraphs: [
                ...(data1.mostRelevantParagraphs || []),
                ...(data2.mostRelevantParagraphs || []),
            ],
            solutionsIdentifiedInTextContext: [
                ...(data1.solutionsIdentifiedInTextContext || []),
                ...(data2.solutionsIdentifiedInTextContext || []),
            ],
            relevanceToProblem: data1.relevanceToProblem,
            tags: [...(data1.tags || []), ...(data2.tags || [])],
            entities: [...(data1.entities || []), ...(data2.entities || [])],
            contacts: [...(data1.contacts || []), ...(data2.contacts || [])],
            summary: data1.summary,
            url: data1.url,
            searchType: data1.searchType,
            subProblemIndex: data1.subProblemIndex,
            groupId: data1.groupId,
            communityId: data1.communityId,
            domainId: data1.domainId,
        };
    }
    async splitText(fullText, maxChunkTokenCount, subProblemIndex) {
        const chunks = [];
        const elements = fullText.split("\n");
        let currentChunk = "";
        const addElementToChunk = async (element) => {
            const potentialChunk = (currentChunk !== "" ? currentChunk + "\n" : "") + element;
            const tokenCount = await this.getTokenCount(potentialChunk, subProblemIndex);
            if (tokenCount.totalTokenCount > maxChunkTokenCount) {
                // If currentChunk is not empty, add it to chunks and start a new chunk with the element
                if (currentChunk !== "") {
                    chunks.push(currentChunk);
                    currentChunk = element;
                }
                else {
                    // If currentChunk is empty, it means that the element is too large to fit in a chunk
                    // In this case, split the element further.
                    if (element.includes(" ")) {
                        // If the element is a sentence, split it by words
                        const words = element.split(" ");
                        for (let word of words) {
                            await addElementToChunk(word);
                        }
                    }
                    else {
                        // If the element is a single word that exceeds maxChunkTokenCount, add it as is
                        chunks.push(element);
                    }
                }
            }
            else {
                currentChunk = potentialChunk;
            }
        };
        for (let element of elements) {
            // Before adding an element to a chunk, check its size
            if ((await this.getTokenCount(element, subProblemIndex)).totalTokenCount >
                maxChunkTokenCount) {
                // If the element is too large, split it by sentences
                const sentences = element.match(/[^.!?]+[.!?]+/g) || [element];
                for (let sentence of sentences) {
                    await addElementToChunk(sentence);
                }
            }
            else {
                await addElementToChunk(element);
            }
        }
        // Push any remaining text in currentChunk to chunks
        if (currentChunk !== "") {
            chunks.push(currentChunk);
        }
        this.logger.debug(`Split text into ${chunks.length} chunks`);
        return chunks;
    }
    async getAIAnalysis(text, subProblemIndex) {
        this.logger.info("Get AI Analysis");
        const messages = this.renderScanningPrompt(this.memory.problemStatement, text, subProblemIndex);
        const analysis = (await this.callLLM("web-get-pages", IEngineConstants.getPageAnalysisModel, messages));
        return analysis;
    }
    async getTextAnalysis(text, subProblemIndex) {
        try {
            const { totalTokenCount, promptTokenCount } = await this.getTokenCount(text, subProblemIndex);
            this.logger.debug(`Total token count: ${totalTokenCount} Prompt token count: ${JSON.stringify(promptTokenCount)}`);
            let textAnalysis;
            if (IEngineConstants.getPageAnalysisModel.tokenLimit < totalTokenCount) {
                const maxTokenLengthForChunk = IEngineConstants.getPageAnalysisModel.tokenLimit -
                    promptTokenCount.totalCount -
                    128;
                this.logger.debug(`Splitting text into chunks of ${maxTokenLengthForChunk} tokens`);
                const splitText = await this.splitText(text, maxTokenLengthForChunk, subProblemIndex);
                this.logger.debug(`Got ${splitText.length} splitTexts`);
                for (let t = 0; t < splitText.length; t++) {
                    const currentText = splitText[t];
                    let nextAnalysis = await this.getAIAnalysis(currentText, subProblemIndex);
                    if (t == 0) {
                        textAnalysis = nextAnalysis;
                    }
                    else {
                        textAnalysis = this.mergeAnalysisData(textAnalysis, nextAnalysis);
                    }
                    this.logger.debug(`Refined text analysis (${t}): ${JSON.stringify(textAnalysis, null, 2)}`);
                }
            }
            else {
                textAnalysis = await this.getAIAnalysis(text, subProblemIndex);
                this.logger.debug(`Text analysis ${JSON.stringify(textAnalysis, null, 2)}`);
            }
            return textAnalysis;
        }
        catch (error) {
            this.logger.error(`Error in getTextAnalysis: ${error}`);
            throw error;
        }
    }
    async processPageText(text, subProblemIndex, url, type) {
        this.logger.debug(`Processing page text ${text.slice(0, 150)} for ${url} for ${type} search results ${subProblemIndex} sub problem index`);
        const textAnalysis = await this.getTextAnalysis(text, subProblemIndex);
        textAnalysis.url = url;
        textAnalysis.subProblemIndex = subProblemIndex;
        textAnalysis.searchType = type;
        textAnalysis.groupId = this.memory.groupId;
        textAnalysis.communityId = this.memory.communityId;
        textAnalysis.domainId = this.memory.domainId;
        if (Array.isArray(textAnalysis.contacts) &&
            textAnalysis.contacts.length > 0) {
            if (typeof textAnalysis.contacts[0] === "object" &&
                textAnalysis.contacts[0] !== null) {
                textAnalysis.contacts = textAnalysis.contacts.map((contact) => JSON.stringify(contact));
            }
        }
        this.logger.debug(`Saving text analysis ${JSON.stringify(textAnalysis, null, 2)}`);
        try {
            await this.webPageVectorStore.postWebPage(textAnalysis);
        }
        catch (e) {
            this.logger.error(`Error posting web page`);
            this.logger.error(e);
            this.logger.error(e.stack);
        }
    }
    //TODO: Use arxiv API as seperate datasource, use other for non arxiv papers
    // https://github.com/hwchase17/langchain/blob/master/langchain/document_loaders/arxiv.py
    // https://info.arxiv.org/help/api/basics.html
    async getAndProcessPdf(subProblemIndex, url, type) {
        return new Promise(async (resolve, reject) => {
            this.logger.info("getAndProcessPdf");
            try {
                let finalText = "";
                let pdfBuffer;
                const filePath = `webPagesCache/${this.memory.groupId}/${encodeURIComponent(url)}.gz`;
                if (existsSync(filePath)) {
                    this.logger.info("Got cached PDF");
                    const cachedPdf = await readFileAsync(filePath);
                    pdfBuffer = gunzipSync(cachedPdf);
                }
                else {
                    const sleepingForMs = IEngineConstants.minSleepBeforeBrowserRequest +
                        Math.random() *
                            IEngineConstants.maxAdditionalRandomSleepBeforeBrowserRequest;
                    this.logger.info(`Fetching PDF ${url} in ${sleepingForMs} ms`);
                    await new Promise((r) => setTimeout(r, sleepingForMs));
                    const axiosResponse = await axios.get(url, {
                        responseType: "arraybuffer",
                    });
                    pdfBuffer = axiosResponse.data;
                    if (pdfBuffer) {
                        this.logger.debug(`Caching PDF response`);
                        const gzipData = gzipSync(pdfBuffer);
                        await writeFileAsync(filePath, gzipData);
                        this.logger.debug("Have cached PDF response");
                    }
                }
                if (pdfBuffer) {
                    this.logger.debug(pdfBuffer.toString().slice(0, 100));
                    try {
                        new PdfReader({}).parseBuffer(pdfBuffer, async (err, item) => {
                            if (err) {
                                this.logger.error(`Error parsing PDF ${url}`);
                                this.logger.error(err);
                                resolve();
                            }
                            else if (!item) {
                                finalText = finalText.replace(/(\r\n|\n|\r){3,}/gm, "\n\n");
                                this.logger.debug(`Got final PDF text: ${finalText ? finalText.slice(0, 100) : ""}`);
                                await this.processPageText(finalText, subProblemIndex, url, type);
                                resolve();
                            }
                            else if (item.text) {
                                finalText += item.text + " ";
                            }
                        });
                    }
                    catch (e) {
                        this.logger.error(`No PDF buffer`);
                        this.logger.error(e);
                        resolve();
                    }
                }
                else {
                    this.logger.error(`No PDF buffer`);
                    resolve();
                }
            }
            catch (e) {
                this.logger.error(`Error in get pdf`);
                this.logger.error(e);
                resolve();
            }
        });
    }
    async getAndProcessHtml(subProblemIndex, url, browserPage, type) {
        try {
            let finalText, htmlText;
            this.logger.debug(`Getting HTML for ${url}`);
            const filePath = `webPagesCache/${this.memory.groupId}/${encodeURIComponent(url)}.gz`;
            if (existsSync(filePath)) {
                this.logger.info("Got cached HTML");
                const cachedData = await readFileAsync(filePath);
                htmlText = gunzipSync(cachedData).toString();
            }
            else {
                const sleepingForMs = IEngineConstants.minSleepBeforeBrowserRequest +
                    Math.random() *
                        IEngineConstants.maxAdditionalRandomSleepBeforeBrowserRequest;
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
                        await writeFileAsync(filePath, gzipData);
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
                await this.processPageText(finalText, subProblemIndex, url, type);
            }
            else {
                this.logger.error(`No HTML text found for ${url}`);
            }
        }
        catch (e) {
            this.logger.error(`Error in get html`);
            this.logger.error(e);
        }
    }
    async getAndProcessPage(subProblemIndex, url, browserPage, type) {
        if (url.toLowerCase().endsWith(".pdf")) {
            await this.getAndProcessPdf(subProblemIndex, url, type);
        }
        else {
            await this.getAndProcessHtml(subProblemIndex, url, browserPage, type);
        }
        return true;
    }
    async processSubProblems(searchQueryType, browserPage) {
        for (let s = 0; s <
            Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems); s++) {
            this.logger.info(`Fetching pages for ${this.memory.subProblems[s].title} for ${searchQueryType} search results`);
            const urlsToGet = this.getUrlsToFetch(this.memory.subProblems[s].searchResults.pages[searchQueryType]);
            for (let i = 0; i < urlsToGet.length; i++) {
                await this.getAndProcessPage(s, urlsToGet[i], browserPage, searchQueryType);
            }
            this.memory.subProblems[s].haveScannedWeb = true;
            await this.processEntities(s, searchQueryType, browserPage);
            await this.saveMemory();
        }
    }
    async processEntities(subProblemIndex, searchQueryType, browserPage) {
        for (let e = 0; e <
            Math.min(this.memory.subProblems[subProblemIndex].entities.length, IEngineConstants.maxTopEntitiesToSearch); e++) {
            const currentEntity = this.memory.subProblems[subProblemIndex].entities[e];
            this.logger.info(`Fetching pages for Entity ${currentEntity.name} for ${this.memory.subProblems[subProblemIndex].title} for ${searchQueryType} search results`);
            const urlsToGet = this.getUrlsToFetch(this.memory.subProblems[subProblemIndex].entities[e].searchResults
                .pages[searchQueryType]);
            for (let i = 0; i < urlsToGet.length; i++) {
                await this.getAndProcessPage(subProblemIndex, urlsToGet[i], browserPage, searchQueryType);
            }
            this.memory.subProblems[subProblemIndex].entities[e].haveScannedWeb =
                true;
        }
    }
    getUrlsToFetch(allPages) {
        let outArray = [];
        outArray = outArray.concat(allPages.filter((page) => page.originalPosition <=
            IEngineConstants.maxWebPagesToGetByTopSearchPosition));
        outArray = outArray.concat(allPages.slice(0, IEngineConstants.maxTopWebPagesToGet));
        // Map to URLs and remove duplicates
        const urlsToGet = Array.from(outArray
            .map((p) => p.url)
            .reduce((unique, item) => unique.add(item), new Set()));
        this.logger.debug(`Got ${urlsToGet.length} URLs to fetch ${JSON.stringify(urlsToGet, null, 2)}`);
        return urlsToGet;
    }
    async processProblemStatement(searchQueryType, browserPage) {
        this.logger.info(`Ranking Problem Statement for ${searchQueryType} search results`);
        const urlsToGet = this.getUrlsToFetch(this.memory.problemStatement.searchResults.pages[searchQueryType]);
        this.logger.debug(`Got ${urlsToGet.length} URLs`);
        for (let i = 0; i < urlsToGet.length; i++) {
            await this.getAndProcessPage(undefined, urlsToGet[i], browserPage, searchQueryType);
        }
        this.memory.problemStatement.haveScannedWeb = true;
    }
    async getAllCustomSearchUrls(browserPage) {
        for (let subProblemIndex = 0; subProblemIndex <
            Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems); subProblemIndex++) {
            const customUrls = this.memory.subProblems[subProblemIndex].customSearchUrls;
            if (customUrls) {
                for (let i = 0; i < customUrls.length; i++) {
                    this.logger.debug(`Getting custom URL ${customUrls[i]}`);
                    await this.getAndProcessPage(subProblemIndex, customUrls[i], browserPage, "general");
                }
            }
            else {
                this.logger.info(`No custom URLs for sub problem ${subProblemIndex}`);
            }
        }
    }
    async getAllPages() {
        puppeteer.launch({ headless: "new" }).then(async (browser) => {
            this.logger.debug("Launching browser");
            const browserPage = await browser.newPage();
            await browserPage.setUserAgent(IEngineConstants.currentUserAgent);
            await this.getAllCustomSearchUrls(browserPage);
            for (const searchQueryType of [
                "general",
                "scientific",
                "openData",
                "news",
            ]) {
                await this.processSubProblems(searchQueryType, browserPage);
                await this.processProblemStatement(searchQueryType, browserPage);
            }
            await this.saveMemory();
            await browser.close();
        });
    }
    async process() {
        this.logger.info("Get Web Pages Processor");
        super.process();
        this.chat = new ChatOpenAI({
            temperature: IEngineConstants.getPageAnalysisModel.temperature,
            maxTokens: IEngineConstants.getPageAnalysisModel.maxOutputTokens,
            modelName: IEngineConstants.getPageAnalysisModel.name,
            verbose: IEngineConstants.getPageAnalysisModel.verbose,
        });
        await this.getAllPages();
        await this.saveMemory();
        this.logger.info("Get Web Pages Processor Complete");
    }
}
