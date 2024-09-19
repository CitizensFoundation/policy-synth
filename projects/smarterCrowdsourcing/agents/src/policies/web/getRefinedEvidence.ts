import { Page, Browser } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { GetEvidenceWebPagesAgent } from "./getEvidenceWebPages.js";
import {
  PsAiModelSize,
  PsAiModelType,
} from "@policysynth/agents/aiModelTypes.js";
import { CreateEvidenceSearchQueriesAgent } from "../create/createEvidenceSearchQueries.js";

//@ts-ignore
puppeteer.use(StealthPlugin());

export class GetRefinedEvidenceAgent extends GetEvidenceWebPagesAgent {
  renderEvidenceScanningPrompt(
    subProblemIndex: number,
    policy: PSPolicy,
    type: PSEvidenceWebPageTypes,
    text: string
  ) {
    return [
      this.createSystemMessage(
        `You are an expert in analyzing policy evidence from the web.

        Important Instructions:
        1. Examine the "<websiteContent>" for evidence, if any, for the specified policy proposal.
        2. Output scores in the ranges of 0-100.
        3. Keep all texts clear and simple.
        4. relevanceToPolicyProposal should outline how the evidence found in the text is relevant to the policy proposal.
        5. mostRelevantParagraphs should be direct quotes from the most relevant and important paragraphs, in relation to the policy proposal, found in the websiteContent>.
        6. Instead of referring to "The text" refer to "The website", if needed.
        7. Always output your results in the following JSON format without any explainations:
        {
          relevanceToPolicyProposal: string;
          mostRelevantParagraphs: string[];
          summary: string;
          mostImportantPolicyEvidenceInTextContext: string[];
          prosForPolicyFoundInTextContext: string[],
          consForPolicyFoundInTextContext: string[],
          whatPolicyNeedsToImplementInResponseToEvidence: string[];
          risksForPolicy: string[];
          evidenceAcademicSources: string[];
          evidenceOrganizationSources: string[];
          evidenceHumanSources: string[];
          confidenceScore: number;
          relevanceToTypeScore: number;
          relevanceScore: number;
          qualityScore: number;
          contentPublishingYear: number;
          hasPotentialRelevantEvidence: boolean;
        }`
      ),
      this.createHumanMessage(
        `
        ${this.renderSubProblem(subProblemIndex, true)}

        Policy Proposal:
        ${policy.title}
        ${policy.description}

        Policy Evidence Type: ${type}

        <websiteContent>
        ${text}
        </websiteContent>

        JSON Output:
        `
      ),
    ];
  }

  async getEvidenceTextAnalysis(
    subProblemIndex: number,
    policy: PSPolicy,
    type: PSEvidenceWebPageTypes,
    text: string
  ) {
    try {
      const { totalTokenCount, promptTokenCount } =
        await this.getEvidenceTokenCount(text, subProblemIndex, policy, type);

      this.logger.debug(
        `Total token count: ${totalTokenCount} Prompt token count: ${JSON.stringify(
          promptTokenCount
        )}`
      );

      let textAnalysis: PSRefinedPolicyEvidence;

      if (this.tokenInLimit < totalTokenCount) {
        const maxTokenLengthForChunk =
          this.tokenInLimit - promptTokenCount - 64;

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

          let nextAnalysis = await this.getRefinedEvidenceTextAIAnalysis(
            subProblemIndex,
            policy,
            type,
            currentText
          );

          if (nextAnalysis) {
            if (t == 0) {
              textAnalysis = nextAnalysis;
            } else {
              textAnalysis = this.mergeRefinedAnalysisData(
                textAnalysis!,
                nextAnalysis
              ) as PSRefinedPolicyEvidence;
            }

            this.logger.debug(
              `Refined evidence text analysis (${t}): ${JSON.stringify(
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
        textAnalysis = await this.getRefinedEvidenceTextAIAnalysis(
          subProblemIndex,
          policy,
          type,
          text
        );
        this.logger.debug(
          `Text analysis ${JSON.stringify(textAnalysis, null, 2)}`
        );
      }

      return textAnalysis!;
    } catch (error) {
      this.logger.error(`Error in getTextAnalysis: ${error}`);
      throw error;
    }
  }

  async getRefinedEvidenceTextAIAnalysis(
    subProblemIndex: number,
    policy: PSPolicy,
    type: PSEvidenceWebPageTypes,
    text: string
  ) {
    this.logger.info("Get Refined Evidence AI Analysis");
    const messages = this.renderEvidenceScanningPrompt(
      subProblemIndex,
      policy,
      type,
      text
    );

    const analysis = (await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      messages,
      true,
      true
    )) as PSRefinedPolicyEvidence;

    return analysis;
  }

  mergeRefinedAnalysisData(
    data1: PSRefinedPolicyEvidence,
    data2: PSRefinedPolicyEvidence
  ): PSRefinedPolicyEvidence {
    return {
      mostRelevantParagraphs: [
        ...(data1.mostRelevantParagraphs || []),
        ...(data2.mostRelevantParagraphs || []),
      ],

      whatPolicyNeedsToImplementInResponseToEvidence: [
        ...(data1.whatPolicyNeedsToImplementInResponseToEvidence || []),
        ...(data2.whatPolicyNeedsToImplementInResponseToEvidence || []),
      ],

      mostImportantPolicyEvidenceInTextContext: [
        ...(data1.mostImportantPolicyEvidenceInTextContext || []),
        ...(data2.mostImportantPolicyEvidenceInTextContext || []),
      ],

      evidenceAcademicSources: [
        ...(data1.evidenceAcademicSources || []),
        ...(data2.evidenceAcademicSources || []),
      ],

      evidenceOrganizationSources: [
        ...(data1.evidenceOrganizationSources || []),
        ...(data2.evidenceOrganizationSources || []),
      ],

      evidenceHumanSources: [
        ...(data1.evidenceHumanSources || []),
        ...(data2.evidenceHumanSources || []),
      ],

      prosForPolicyFoundInTextContext: [
        ...(data1.prosForPolicyFoundInTextContext || []),
        ...(data2.prosForPolicyFoundInTextContext || []),
      ],

      consForPolicyFoundInTextContext: [
        ...(data1.consForPolicyFoundInTextContext || []),
        ...(data2.consForPolicyFoundInTextContext || []),
      ],

      risksForPolicy: [
        ...(data1.risksForPolicy || []),
        ...(data2.risksForPolicy || []),
      ],

      hasPotentialRelevantEvidence: data1.hasPotentialRelevantEvidence || data2.hasPotentialRelevantEvidence,

      relevanceToPolicyProposal: data1.relevanceToPolicyProposal,
      relevanceToTypeScore: data1.relevanceToTypeScore,
      confidenceScore: data1.confidenceScore,
      relevanceScore: data1.relevanceScore,
      qualityScore: data1.qualityScore,
      contentPublishingYear: data1.contentPublishingYear,
      totalScore: data1.totalScore,
      summary: data1.summary,
      hasBeenRefined: true,
    };
  }

  async processPageText(
    text: string,
    subProblemIndex: number | undefined,
    url: string,
    type: PsWebPageTypes | PSEvidenceWebPageTypes,
    entityIndex: number | undefined,
    policy: PSPolicy
  ) {
    this.logger.debug(
      `Processing page text ${text.slice(
        0,
        150
      )} for ${url} for ${type} search results ${subProblemIndex} sub problem index`
    );

    try {
      const refinedAnalysis = (await this.getEvidenceTextAnalysis(
        subProblemIndex!,
        policy!,
        type as PSEvidenceWebPageTypes,
        text
      )) as unknown as PSRefinedPolicyEvidence;

      if (refinedAnalysis) {
        this.logger.debug(
          `Saving refined analysis ${JSON.stringify(refinedAnalysis, null, 2)}`
        );

        refinedAnalysis.hasBeenRefined = true;
        refinedAnalysis.url = url;
        refinedAnalysis.type = type as PSEvidenceWebPageTypes;

        try {
          if (!policy.webEvidence) {
            policy.webEvidence = [];
          }

          if (refinedAnalysis.hasPotentialRelevantEvidence) {
            policy.webEvidence.push(refinedAnalysis);
          } else {
            this.logger.info(`No potential relevant evidence for ${url}`);
            this.logger.info(JSON.stringify(refinedAnalysis, null, 2));
          }

          this.totalPagesSave += 1;
          this.logger.info(`Total ${this.totalPagesSave} saved pages`);

          await this.saveMemory();
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

  async getAndProcessEvidencePage(
    subProblemIndex: number,
    url: string,
    browserPage: Page,
    type: PSEvidenceWebPageTypes,
    policy: PSPolicy
  ) {
    if (url.toLowerCase().endsWith(".pdf")) {
      try {
        await this.getAndProcessPdf(
          subProblemIndex,
          url,
          type,
          undefined,
          policy
        );
      } catch (error: any) {
        this.logger.error(`Error in getAndProcessPdf: ${error}`);
      }
    } else {
      try {
        await this.getAndProcessHtml(
          subProblemIndex,
          url,
          browserPage,
          type,
          undefined,
          policy
        );
      } catch (error: any) {
        this.logger.error(`Error in getAndProcessHtml: ${error}`);
      }
    }

    return true;
  }

  async refineWebEvidence(
    policyIn: PSPolicy,
    subProblemIndex: number,
    page: Page
  ) {
    const limit = 10;
    const resetWebEvidence = false;

    try {
      const subProblem = this.memory.subProblems[subProblemIndex];

      const policies =
        subProblem.policies?.populations[
          subProblem.policies!.populations.length - 1
        ];

      if (policies) {
        for (
          let policyIndex = 0;
          policyIndex < policies.length;
          policyIndex++
        ) {
          this.logger.info(
            `Getting evidence web pages for policy ${policyIndex}/${
              policies.length
            } of sub problem ${subProblemIndex} (${this.lastPopulationIndex(
              subProblemIndex
            )})`
          );

          const policy = policies[policyIndex];

          if (resetWebEvidence) {
            policy.webEvidence = [];
          }


        for (const searchResultType of CreateEvidenceSearchQueriesAgent.evidenceWebPageTypesArray) {
          // First check if policy.webEvidence contains any evidence of searchResultType
          if (
            policy.webEvidence &&
            policy.webEvidence.some(
              (evidence) => evidence.type === searchResultType
            )
          ) {
            this.logger.info(
              `Skipping searchResultType ${searchResultType} as policy.webEvidence already contains evidence of this type`
            );
            continue;
          }

          const urlsToGet = policy.evidenceSearchResults![searchResultType];

          if (urlsToGet) {
            const random = Math.random();
            let filteredUrlsToGet: PsSearchResultItem[];

            if (random < 0.95) {
              // 95% chance, filter out items with originalPosition less than 5
              this.logger.debug(
                `---------------------> Filtering out items with originalPosition less than 3`
              );
              filteredUrlsToGet = urlsToGet.filter(
                (item) => item.originalPosition <= 3
              );
            } else {
              // 5% chance, filter out items with originalPosition greater than 5
              this.logger.debug(
                `Filtering out items with originalPosition greater than 5`
              );
              filteredUrlsToGet = urlsToGet.filter(
                (item) => item.originalPosition >= 7
              );
            }

            this.logger.info(`========================================================================================== > > > Count of urls to get: ${filteredUrlsToGet.length}`);

            for (let i = 0; i < filteredUrlsToGet.length; i++) {
              await this.getAndProcessEvidencePage(
                subProblemIndex,
                filteredUrlsToGet[i].url,
                page,
                searchResultType,
                policy
              );
            }
          } else {
            console.error(
              `No urls to get for ${searchResultType} for policy ${policyIndex} of sub problem ${subProblemIndex} (${this.lastPopulationIndex(
                subProblemIndex
              )})`
            );
          }
        }
      }

        await this.saveMemory();
      }
    } catch (error: any) {
      this.logger.error(error.stack || error);
      throw error;
    }
  }

  async processSubProblems(browser: Browser) {
    const subProblemsLimit = Math.min(
      this.memory.subProblems.length,
      this.maxSubProblems
    );

    const skipSubProblemsIndexes: number[] = [];

    const currentGeneration = 0;

    const subProblemsPromises = Array.from(
      { length: subProblemsLimit },
      async (_, subProblemIndex) => {
        this.logger.info(
          `Refining evidence for sub problem ${subProblemIndex}`
        );
        const newPage = await browser.newPage();
        newPage.setDefaultTimeout(this.webPageNavTimeout);
        newPage.setDefaultNavigationTimeout(this.webPageNavTimeout);

        await newPage.setUserAgent(this.currentUserAgent);
        const subProblem = this.memory.subProblems[subProblemIndex];
        if (!skipSubProblemsIndexes.includes(subProblemIndex)) {
          if (
            subProblem.policies &&
            subProblem.policies.populations &&
            subProblem.policies.populations.length > 0
          ) {
            const policies = subProblem.policies.populations[currentGeneration];
            for (
              let p = 0;
              p < Math.min(policies.length, this.maxTopPoliciesToProcess);
              p++
            ) {
              const policy = policies[p];
              try {
                await this.refineWebEvidence(policy, subProblemIndex, newPage);
                this.logger.debug(
                  `Finished ranking sub problem ${subProblemIndex} for policy ${policy}`
                );
              } catch (error: any) {
                this.logger.error(error.stack || error);
                throw error;
              }
            }
          }
        } else {
          this.logger.info(`Skipping sub problem ${subProblemIndex}`);
        }
      }
    );

    await Promise.all(subProblemsPromises);
    this.logger.info("Finished rating all web evidence");
  }

  async getAllPages() {
    const browser = await puppeteer.launch({ headless: true });
    this.logger.debug("Launching browser");

    const browserPage = await browser.newPage();
    browserPage.setDefaultTimeout(this.webPageNavTimeout);
    browserPage.setDefaultNavigationTimeout(this.webPageNavTimeout);

    await browserPage.setUserAgent(this.currentUserAgent);

    await this.processSubProblems(browser);

    await this.saveMemory();

    await browser.close();

    this.logger.info("Browser closed");
  }

  async process() {
    this.logger.info("Refined Evidence Web Pages Agent");
    super.process();

    await this.getAllPages();

    this.logger.info(`Refined ${this.totalPagesSave} pages`);
    this.logger.info("Refine Evidence Web Pages Agent Complete");
  }
}
