import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { IEngineConstants } from "../../constants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import ioredis from "ioredis";
import { GetWebPagesProcessor } from "../../solutions/web/getWebPages.js";
import { RootCauseWebPageVectorStore } from "../../vectorstore/rootCauseWebPage.js";
import { CreateRootCausesSearchQueriesProcessor } from "../create/createRootCauseSearchQueries.js";
const redis = new ioredis(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
//@ts-ignore
puppeteer.use(StealthPlugin());
const onlyCheckWhatNeedsToBeScanned = true;
class RootCauseTypeLookup {
    static rootCauseTypeMapping = {
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
        //TODO: Figure this out better than doubling up on socialRootCause
        adminSubmitted: "allPossibleSocialRootCausesIdentifiedInTextContext",
    };
    static getPropertyName(rootCauseType) {
        return this.rootCauseTypeMapping[rootCauseType];
    }
}
export class GetRootCausesWebPagesProcessor extends GetWebPagesProcessor {
    rootCauseWebPageVectorStore = new RootCauseWebPageVectorStore();
    hasPrintedPrompt = false;
    renderRootCauseScanningPrompt(type, text) {
        return [
            new SystemMessage(`You are an expert in analyzing root causes for a particular problem statement:

        Important Instructions:
        1. Examine the "<text context>" and analyze it for root causes that relate to the specified problem statement and root cause type.
        2. Always output your results in the following JSON format:
         [
            {
              rootCauseDescription: string;
              rootCauseTitle: string;
              whyRootCauseIsImportant: string;
              rootCauseRelevanceToTypeScore: number;
              rootCauseRelevanceScore: number;
              rootCauseQualityScore: number;
              rootCauseConfidenceScore: number;
            }
          ]
        3. rootCauseDescription should describe each root cause in one clear paragraph
        4. Never use acronyms in rootCauseDescription even if they are used in the text context
        5. Never use the words "is a root cause" in the rootCauseDescription
        6. Output scores in the ranges of 0-100.
        `),
            new HumanMessage(`
        ${this.renderProblemStatement()}

        Root Cause Type: ${type}

        General information about what we are looking for:
        ${this.memory.customInstructions.createSubProblems}

        <text context>
        ${text}
        </text context>

        Let's think step by step.

        JSON Output:
        `),
        ];
    }
    async getRootCauseTokenCount(text, type) {
        const emptyMessages = this.renderRootCauseScanningPrompt(type, "");
        const promptTokenCount = await this.chat.getNumTokensFromMessages(emptyMessages);
        const textForTokenCount = new HumanMessage(text);
        const textTokenCount = await this.chat.getNumTokensFromMessages([
            textForTokenCount,
        ]);
        const totalTokenCount = promptTokenCount.totalCount +
            textTokenCount.totalCount +
            IEngineConstants.getPageAnalysisModel.maxOutputTokens;
        return { totalTokenCount, promptTokenCount };
    }
    async getRootCauseTextAnalysis(type, text, url) {
        try {
            const { totalTokenCount, promptTokenCount } = await this.getRootCauseTokenCount(text, type);
            this.logger.debug(`Total token count: ${totalTokenCount} Prompt token count: ${JSON.stringify(promptTokenCount)}`);
            this.logger.debug(`Searching ${url}...`);
            let textAnalysis;
            if (IEngineConstants.getPageAnalysisModel.tokenLimit < totalTokenCount) {
                const maxTokenLengthForChunk = IEngineConstants.getPageAnalysisModel.tokenLimit -
                    promptTokenCount.totalCount -
                    512;
                this.logger.debug(`Splitting text into chunks of ${maxTokenLengthForChunk} tokens`);
                const splitText = this.splitText(text, maxTokenLengthForChunk, undefined);
                this.logger.debug(`Got ${splitText.length} splitTexts`);
                for (let t = 0; t < splitText.length; t++) {
                    const currentText = splitText[t];
                    let nextAnalysis = await this.getRootCauseAIAnalysis(type, currentText);
                    if (nextAnalysis) {
                        for (let rootCause of nextAnalysis) {
                            this.logger.debug(`Root Cause: ${JSON.stringify(rootCause, null, 2)}`);
                            if (rootCause.rootCauseTitle && rootCause.rootCauseDescription) {
                                this.memory.subProblems.push({
                                    title: rootCause.rootCauseTitle,
                                    description: rootCause.rootCauseDescription,
                                    whyIsSubProblemImportant: rootCause.whyRootCauseIsImportant,
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
                            }
                            else {
                                this.logger.warn(`No title or description found for ${JSON.stringify(rootCause, null, 2)}`);
                            }
                        }
                    }
                    else {
                        this.logger.error(`Error getting AI analysis for text ${currentText}`);
                    }
                }
            }
            else {
                textAnalysis = await this.getRootCauseAIAnalysis(type, text);
                for (let rootCause of textAnalysis) {
                    this.logger.debug(`Root Cause: ${JSON.stringify(rootCause, null, 2)}`);
                    if (rootCause.rootCauseTitle && rootCause.rootCauseDescription) {
                        this.memory.subProblems.push({
                            title: rootCause.rootCauseTitle,
                            description: rootCause.rootCauseDescription,
                            whyIsSubProblemImportant: rootCause.whyRootCauseIsImportant,
                            fromSearchType: type,
                            fromUrl: url,
                            relevanceToTypeScore: rootCause.rootCauseRelevanceToTypeScore,
                            relevanceScore: rootCause.rootCauseRelevanceScore,
                            qualityScore: rootCause.rootCauseQualityScore,
                            confidenceScore: rootCause.rootCauseConfidenceScore,
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
                    }
                    else {
                        this.logger.warn(`No title or description found for ${JSON.stringify(rootCause, null, 2)}`);
                    }
                }
                //this.logger.debug(
                //  `Text analysis ${JSON.stringify(textAnalysis, null, 2)}`
                //);
            }
            return textAnalysis;
        }
        catch (error) {
            this.logger.error(`Error in getTextAnalysis: ${error}`);
            throw error;
        }
    }
    async getRootCauseAIAnalysis(type, text) {
        this.logger.info("Get Root Cause AI Analysis");
        const messages = this.renderRootCauseScanningPrompt(type, text);
        if (!this.hasPrintedPrompt) {
            console.log(JSON.stringify(messages, null, 2));
            this.hasPrintedPrompt = true;
        }
        const analysis = (await this.callLLM("web-get-root-causes-pages", IEngineConstants.getPageAnalysisModel, messages, true, true));
        return analysis;
    }
    mergeAnalysisData(data1, data2) {
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
                ...(data1.allPossibleEnvironmentalRootCausesIdentifiedInTextContext ||
                    []),
                ...(data2.allPossibleEnvironmentalRootCausesIdentifiedInTextContext ||
                    []),
            ],
            allPossibleLegalRootCausesIdentifiedInTextContext: [
                ...(data1.allPossibleLegalRootCausesIdentifiedInTextContext || []),
                ...(data2.allPossibleLegalRootCausesIdentifiedInTextContext || []),
            ],
            allPossibleTechnologicalRootCausesIdentifiedInTextContext: [
                ...(data1.allPossibleTechnologicalRootCausesIdentifiedInTextContext ||
                    []),
                ...(data2.allPossibleTechnologicalRootCausesIdentifiedInTextContext ||
                    []),
            ],
            allPossibleGeopoliticalRootCausesIdentifiedInTextContext: [
                ...(data1.allPossibleGeopoliticalRootCausesIdentifiedInTextContext ||
                    []),
                ...(data2.allPossibleGeopoliticalRootCausesIdentifiedInTextContext ||
                    []),
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
                ...(data1.allPossibleRootCausesCaseStudiesIdentifiedInTextContext ||
                    []),
                ...(data2.allPossibleRootCausesCaseStudiesIdentifiedInTextContext ||
                    []),
            ],
            rootCauseRelevanceToProblemStatement: data1.rootCauseRelevanceToProblemStatement,
            rootCauseRelevanceToProblemStatementScore: data1.rootCauseRelevanceToProblemStatementScore ||
                data2.rootCauseRelevanceToProblemStatementScore,
            rootCauseRelevanceToTypeScore: data1.rootCauseRelevanceToTypeScore ||
                data2.rootCauseRelevanceToTypeScore,
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
    async processPageText(text, subProblemIndex = undefined, url, type, entityIndex, policy = undefined) {
        this.logger.debug(`Processing page text ${text.slice(0, 150)} for ${url} for ${type} search results`);
        try {
            const textAnalysis = (await this.getRootCauseTextAnalysis(type, text, url));
            if (textAnalysis) {
                textAnalysis.url = url;
                textAnalysis.searchType = type;
                textAnalysis.groupId = this.memory.groupId;
                textAnalysis.communityId = this.memory.communityId;
                textAnalysis.domainId = this.memory.domainId;
                this.logger.debug(`Saving text analysis ${JSON.stringify(textAnalysis, null, 2)}`);
                try {
                    await this.rootCauseWebPageVectorStore.postWebPage(textAnalysis);
                    this.totalPagesSave += 1;
                    this.logger.info(`Total ${this.totalPagesSave} saved pages`);
                }
                catch (e) {
                    this.logger.error(`Error posting web page for url ${url}`);
                    this.logger.error(e);
                    this.logger.error(e.stack);
                }
            }
            else {
                this.logger.warn(`No text analysis for ${url}`);
            }
        }
        catch (e) {
            this.logger.error(`Error in processPageText`);
            this.logger.error(e.stack || e);
        }
    }
    async getAndProcessRootCausePage(url, browserPage, type) {
        if (url ==
            "https://www.oecd.org/pisa/PISA%202018%20Insights%20and%20Interpretations%20FINAL%20PDF.pdf") {
            this.logger.info("Skipping the current url:" + url);
            return true;
        }
        let hasPage = undefined;
        if (onlyCheckWhatNeedsToBeScanned) {
            try {
                this.logger.info("Checking if a page exists " + url);
                hasPage = await this.rootCauseWebPageVectorStore.webPageExist(this.memory.groupId, url, type);
                if (hasPage) {
                    this.logger.warn(`Already have scanned ${type} / ${url}`);
                }
                else {
                    this.logger.warn(`Need to scan ${type} / ${url}`);
                }
            }
            catch (e) {
                this.logger.error("Error with try in getAndProcessRootCausePage");
                this.logger.error(e);
            }
        }
        if (!hasPage) {
            if (url.toLowerCase().endsWith(".pdf")) {
                await this.getAndProcessPdf(undefined, url, type, undefined);
            }
            else {
                await this.getAndProcessHtml(undefined, url, browserPage, type, undefined);
            }
        }
        return true;
    }
    async processRootCauses(browser) {
        const problemStatement = this.memory.problemStatement;
        const newPage = await browser.newPage();
        newPage.setDefaultTimeout(IEngineConstants.webPageNavTimeout);
        newPage.setDefaultNavigationTimeout(IEngineConstants.webPageNavTimeout);
        await newPage.setUserAgent(IEngineConstants.currentUserAgent);
        for (const searchResultType of CreateRootCausesSearchQueriesProcessor.rootCauseWebPageTypesArray) {
            let urlsToGet = problemStatement.rootCauseSearchResults[searchResultType];
            if (urlsToGet) {
                urlsToGet = urlsToGet.slice(0, Math.floor(urlsToGet.length *
                    IEngineConstants.maxRootCausePercentOfSearchResultWebPagesToGet));
                for (let i = 0; i < urlsToGet.length; i++) {
                    await this.getAndProcessRootCausePage(urlsToGet[i].url, newPage, searchResultType);
                }
            }
            else {
                console.error(`No urls to get for ${searchResultType} (${this.lastPopulationIndex})`);
            }
            await this.saveMemory();
        }
        await newPage.close();
        this.logger.info("Finished and closed page for current problem");
    }
    async getAllPages() {
        const browser = await puppeteer.launch({ headless: true });
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
//# sourceMappingURL=getRootCausesWebPages.js.map