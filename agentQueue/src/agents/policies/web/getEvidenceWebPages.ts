import { HTTPResponse, Page } from "puppeteer";
import puppeteer, { Browser } from "puppeteer-extra";
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
import { BaseProcessor } from "../../baseProcessor.js";

import weaviate, { WeaviateClient } from "weaviate-ts-client";

import { HumanChatMessage, SystemChatMessage } from "langchain/schema";

import { ChatOpenAI } from "langchain/chat_models/openai";

import { isWithinTokenLimit } from "gpt-tokenizer";

import { WebPageVectorStore } from "../../vectorstore/webPage.js";

import ioredis from "ioredis";
import { GetWebPagesProcessor } from "../../solutions/web/getWebPages.js";

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

//@ts-ignore
puppeteer.use(StealthPlugin());

const onlyCheckWhatNeedsToBeScanned = false;

export class GetEvidenceWebPagesProcessor extends GetWebPagesProcessor {

  renderCommonPrefixPrompt() {
    return `
    Your are an expert in analyzing textual data:

    Important Instructions:
    `
  }

  renderCommonPostfixPrompt() {
    return `
    - Only use information found within the "Text Context" - do not create your own data.
    - Never output in markdown format.
    - Never include references or citations as part of the 'allMostRelevantParagraphs' array.
    - Always output your results in the JSON format with no additional explanation.
    - Let's think step-by-step.
    `
  }

  renderCommonEvidence(type: PSEvidenceWebPageTypes, nameOfColumn: string) {
    return `
    1. Examine the "Text context" and determine how it relates to the problem and the specified policy proposal.
    2. Identify any specific raw ${type} in the "Text Context" and include them in the 'possibleRawEvidenceIdentifiedInTextContext' JSON array. We will analyse this later.
    3. Include any paragraphs with potential ${type} also in the  the "Text Context" in the 'mostRelevantParagraphs' JSON array.
    `
  }

  renderPositiveEvidenceOneShot() {
    return `
      Example:

      Problem:
      Ineffectiveness of Democratic Institutions
      Democratic institutions are consistently failing to deliver on policy expectations, leading to public disapproval.

      Policy Proposal:
      Public-Friendly Open Data Platform
      Create an intuitively navigable, comprehensive platform that renders government data comprehensible and accessible to the general public, thereby fostering transparency and enhancing democratic trust.

      Web page type: positiveEvidence

      Text context:
      Open data portals
      Open data portals facilitate access to and reuse of public sector information. They can help encourage cross-border use of reusable data in Europe.

          Laptop with a book behind it

      © iStock by Getty Images -940972538 Bet_Noire

      Open data portals are web-based interfaces designed to make it easier to find reusable information. Like library catalogues, they contain metadata records of datasets published for reuse, mostly relating to information in the form of raw, numerical data rather than textual documents.

      In combination with specific search functionalities, they facilitate finding datasets of interest. Application programming interfaces (APIs) are often available as well, offering direct and automated access to data for software applications.

      Open data portals are an important element of most open data initiatives and are mainly used by public administrations at European, national and local level in EU countries. Notable examples of Open Data portals maintained by public administrations in Europe are:

      opendata.paris.fr
      www.data.gouv.fr
      www.dati.piemonte.it
      www.dati.gov.it
      www.data.overheid.nl
      While supporting policy development by offering easy access to published data, open data portals can also work as a catalyst triggering the publication of more and better quality data. For administrations obliged or willing to disseminate their data, they offer the advantage of providing public access without the need to reply to individual requests for access to data. And, more and more companies are opening up some of their data for developers to reuse.

      The European Commission offers an open data portal for any type of information held by the Commission and other EU institutions and bodies. The European Union's Open Data Portal has been in operation since December 2012.

      The European Data Portal
      The European Commission has funded the European Data Portal through the Connecting Europe Facility programme. The portal is a pan-European repository of public sector information open for reuse in the EU. It offers a training centre on how to reuse open data and a database of success stories from European and international re-users.

      The principal function of the European Data Portal is to provide a single point of access in all 24 EU official languages for data published by public administrations at all levels of government in Europe (EU countries, countries of the European Economic Area and certain other European countries).

      In order to foster comparability of data published across borders, it presents metadata references in a common format (Data Catalog Vocabulary application profile for data portals in Europe), using resource description framework (RDF) technology.  It provides translations of metadata descriptions in all 24 languages using machine-translation technology.

      The portal complements national, regional and thematic open data portals, and the EU's Open Data Portal. Each of these portals target relevant user audiences, offering tailored content. This infrastructure will stimulate cross-border use of reusable information in Europe by improving the findability of data across countries and supporting the development of data applications and products including data from different countries.

              JSON Output:
        {
        "summary": "Open data portals are web-based platforms that make public sector information easily accessible and reusable, primarily in the form of raw, numerical data. These platforms support policy development, catalyze the publication of high-quality data, and offer public access without individual data access requests. The European Commission offers an open data portal which provides a single point of access for data from various European public administrations.",
        "mostRelevantParagraphs": [
          "Open data portals facilitate access to and reuse of public sector information. They can help encourage cross-border use of reusable data in Europe.",
          "Open data portals are web-based interfaces designed to make it easier to find reusable information. Like library catalogues, they contain metadata records of datasets published for reuse, mostly relating to information in the form of raw, numerical data rather than textual documents.",
          "In combination with specific search functionalities, they facilitate finding datasets of interest. Application programming interfaces (APIs) are often available as well, offering direct and automated access to data for software applications.",
          "Open data portals are an important element of most open data initiatives and are mainly used by public administrations at European, national and local level in EU countries. Notable examples of Open Data portals maintained by public administrations in Europe are:",
          "While supporting policy development by offering easy access to published data, open data portals can also work as a catalyst triggering the publication of more and better quality data. For administrations obliged or willing to disseminate their data, they offer the advantage of providing public access without the need to reply to individual requests for access to data. And, more and more companies are opening up some of their data for developers to reuse.",
          "The European Commission offers an open data portal for any type of information held by the Commission and other EU institutions and bodies. The European Union's Open Data Portal has been in operation since December 2012.",
          "The principal function of the European Data Portal is to provide a single point of access in all 24 EU official languages for data published by public administrations at all levels of government in Europe (EU countries, countries of the European Economic Area and certain other European countries)."
        ],
        "possibleRawEvidenceIdentifiedInTextContext": [
          "Open data portals facilitate access to and reuse of public sector information.",
          "Open data portals are an important element of most open data initiatives.",
          "The European Commission offers an open data portal for any type of information held by the Commission and other EU institutions and bodies.",
          "The European Union's Open Data Portal has been in operation since December 2012.",
          "While supporting policy development by offering easy access to published data, open data portals can also work as a catalyst triggering the publication of more and better quality data.",
          "For administrations obliged or willing to disseminate their data, they offer the advantage of providing public access without the need to reply to individual requests for access to data.",
          "The European Commission has funded the European Data Portal through the Connecting Europe Facility programme."
        ],
        "relevanceToPolicyProposal": "The text provides insights into the potential effectiveness and importance of open data portals as a tool to increase transparency and trust in democratic institutions. Open data portals can simplify the process of accessing public sector data and encourage cross-border usage, making government data comprehensible and accessible. As mentioned in the policy proposal, an intuitively navigable and comprehensive platform that renders government data comprehensible and accessible can foster transparency and enhance democratic trust, and the provided text supports this claim."
      }
    `
  }

  renderScanningPrompt(
    problemStatement: IEngineProblemStatement,
    text: string,
    subProblemIndex?: number
  ) {
    return [
      new SystemChatMessage(
        `Your are an AI expert in analyzing textual data:

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
        `
      ),
      new HumanChatMessage(
        `
        Problem Statement:
        ${problemStatement.description}

        ${
          subProblemIndex !== undefined
            ? `
                ${this.renderSubProblem(subProblemIndex)}
              `
            : ``
        }

        Text Context:
        ${text}

        JSON Output:
        `
      ),
    ];
  }


  mergeAnalysisData(
    data1: IEngineWebPageAnalysisData | PSEvidenceRawWebPageData,
    data2: IEngineWebPageAnalysisData | PSEvidenceRawWebPageData
  ): IEngineWebPageAnalysisData | PSEvidenceRawWebPageData {
    data1 = data1 as PSEvidenceRawWebPageData;
    data2 = data2 as PSEvidenceRawWebPageData;
    return {
      mostRelevantParagraphs: [
        ...(data1.mostRelevantParagraphs || []),
        ...(data2.mostRelevantParagraphs || []),
      ],
      possibleRawEvidenceIdentifiedInTextContext: [
        ...(data1.possibleRawEvidenceIdentifiedInTextContext || []),
        ...(data2.possibleRawEvidenceIdentifiedInTextContext || []),
      ],

      possibleRawCaseStudiesIdentifiedInTextContext: [
        ...(data1.possibleRawCaseStudiesIdentifiedInTextContext || []),
        ...(data2.possibleRawCaseStudiesIdentifiedInTextContext || []),
      ],
      possibleRawHistoricalContextIdentifiedInTextContext: [
        ...(data1.possibleRawHistoricalContextIdentifiedInTextContext || []),
        ...(data2.possibleRawHistoricalContextIdentifiedInTextContext || []),
      ],
      possibleRawStakeholderOpinionsIdentifiedInTextContext: [
        ...(data1.possibleRawStakeholderOpinionsIdentifiedInTextContext || []),
        ...(data2.possibleRawStakeholderOpinionsIdentifiedInTextContext || []),
      ],
      possibleRawExpertOpinionsIdentifiedInTextContext: [
        ...(data1.possibleRawExpertOpinionsIdentifiedInTextContext || []),
        ...(data2.possibleRawExpertOpinionsIdentifiedInTextContext || []),
      ],
      possibleRawPublicOpinionsIdentifiedInTextContext: [
        ...(data1.possibleRawPublicOpinionsIdentifiedInTextContext || []),
        ...(data2.possibleRawPublicOpinionsIdentifiedInTextContext || []),
      ],
      possibleRawImplementationFeasibilityIdentifiedInTextContext: [
        ...(data1.possibleRawImplementationFeasibilityIdentifiedInTextContext || []),
        ...(data2.possibleRawImplementationFeasibilityIdentifiedInTextContext || []),
      ],
      possibleRawGlobalPerspectiveIdentifiedInTextContext: [
        ...(data1.possibleRawGlobalPerspectiveIdentifiedInTextContext || []),
        ...(data2.possibleRawGlobalPerspectiveIdentifiedInTextContext || []),
      ],
      possibleRawLocalPerspectiveIdentifiedInTextContext: [
        ...(data1.possibleRawLocalPerspectiveIdentifiedInTextContext || []),
        ...(data2.possibleRawLocalPerspectiveIdentifiedInTextContext || []),
      ],
      possibleRawShortTermImpactIdentifiedInTextContext: [
        ...(data1.possibleRawShortTermImpactIdentifiedInTextContext || []),
        ...(data2.possibleRawShortTermImpactIdentifiedInTextContext || []),
      ],
      possibleRawLongTermImpactIdentifiedInTextContext: [
        ...(data1.possibleRawLongTermImpactIdentifiedInTextContext || []),
        ...(data2.possibleRawLongTermImpactIdentifiedInTextContext || []),
      ],
      possibleRawEthicalConsiderationsIdentifiedInTextContext: [
        ...(data1.possibleRawEthicalConsiderationsIdentifiedInTextContext || []),
        ...(data2.possibleRawEthicalConsiderationsIdentifiedInTextContext || []),
      ],
      relevanceToPolicyProposal: data1.relevanceToPolicyProposal,
      tags: [...(data1.tags || []), ...(data2.tags || [])],
      entities: [...(data1.entities || []), ...(data2.entities || [])],
      contacts: [...(data1.contacts || []), ...(data2.contacts || [])],
      summary: data1.summary,
      url: data1.url,
      searchType: data1.searchType,
      subProblemIndex: data1.subProblemIndex,
      entityIndex: data1.entityIndex,
      groupId: data1.groupId,
      communityId: data1.communityId,
      domainId: data1.domainId,
    };
  }

  get maxWebPagesToGetByTopSearchPosition() {
    return IEngineConstants.maxEvidenceWebPagesToGetByTopSearchPosition;
  }


  async processPageText(
    text: string,
    subProblemIndex: number | undefined,
    url: string,
    type: IEngineWebPageTypes,
    entityIndex: number | undefined
  ) {
    this.logger.debug(
      `Processing page text ${text.slice(
        0,
        150
      )} for ${url} for ${type} search results ${subProblemIndex} sub problem index`
    );

    try {
      const textAnalysis = await this.getTextAnalysis(text, subProblemIndex);

      if (textAnalysis) {
        textAnalysis.url = url;
        textAnalysis.subProblemIndex = subProblemIndex;
        textAnalysis.entityIndex = entityIndex;
        textAnalysis.searchType = type;
        textAnalysis.groupId = this.memory.groupId;
        textAnalysis.communityId = this.memory.communityId;
        textAnalysis.domainId = this.memory.domainId;

        if (
          Array.isArray(textAnalysis.contacts) &&
          textAnalysis.contacts.length > 0
        ) {
          if (
            typeof textAnalysis.contacts[0] === "object" &&
            textAnalysis.contacts[0] !== null
          ) {
            textAnalysis.contacts = textAnalysis.contacts.map((contact) =>
              JSON.stringify(contact)
            );
          }
        }

        this.logger.debug(
          `Saving text analysis ${JSON.stringify(textAnalysis, null, 2)}`
        );

        try {
          await this.webPageVectorStore.postWebPage(textAnalysis);
          this.totalPagesSave += 1;
          this.logger.info(`Total ${this.totalPagesSave} saved pages`);
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

  get maxTopWebPagesToGet() {
    return IEngineConstants.maxTopWebPagesToGet;
  }

  async getAndProcessPage(
    subProblemIndex: number | undefined,
    url: string,
    browserPage: Page,
    type: IEngineWebPageTypes,
    entityIndex: number | undefined
  ) {
    if (onlyCheckWhatNeedsToBeScanned) {
      const hasPage = await this.webPageVectorStore.webPageExist(
        this.memory.groupId,
        url,
        type,
        subProblemIndex,
        entityIndex
      );
      if (hasPage) {
        this.logger.warn(
          `Already have scanned ${type} / ${subProblemIndex} / ${entityIndex} ${url}`
        );
      } else {
        this.logger.warn(
          `Need to scan ${type} / ${subProblemIndex} / ${entityIndex} ${url}`
        );
      }
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

  async processSubProblems(browser: Browser) {
    const searchQueryTypes = [
      "general",
      "scientific",
      "openData",
      "news",
    ] as const;
    const promises = [];

    for (
      let s = 0;
      s <
      Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems);
      s++
    ) {
      promises.push(
        (async () => {
          const newPage = await browser.newPage();
          newPage.setDefaultTimeout(IEngineConstants.webPageNavTimeout);
          newPage.setDefaultNavigationTimeout(
            IEngineConstants.webPageNavTimeout
          );

          await newPage.setUserAgent(IEngineConstants.currentUserAgent);

          for (const searchQueryType of searchQueryTypes) {
            this.logger.info(
              `Fetching pages for ${this.memory.subProblems[s].title} for ${searchQueryType} search results`
            );

            const urlsToGet = this.getUrlsToFetch(
              this.memory.subProblems[s].searchResults!.pages[searchQueryType]
            );

            for (let i = 0; i < urlsToGet.length; i++) {
              await this.getAndProcessPage(
                s,
                urlsToGet[i],
                newPage,
                searchQueryType,
                undefined
              );
            }

            this.memory.subProblems[s].haveScannedWeb = true;

            await this.saveMemory();
          }

          await newPage.close();

          this.logger.info(
            `Finished and closed page for ${this.memory.subProblems[s].title}`
          );
        })()
      );
    }

    await Promise.all(promises);
  }


  async getAllPages() {
    const browser = await puppeteer.launch({ headless: "new" });
    this.logger.debug("Launching browser");

    const browserPage = await browser.newPage();
    browserPage.setDefaultTimeout(IEngineConstants.webPageNavTimeout);
    browserPage.setDefaultNavigationTimeout(IEngineConstants.webPageNavTimeout);

    await browserPage.setUserAgent(IEngineConstants.currentUserAgent);

    //await this.processSubProblems(browser);

    //await this.saveMemory();

    //await this.getAllCustomSearchUrls(browserPage);

    //await this.saveMemory();

    const searchQueryTypes = [
      "general",
      "scientific",
      "openData",
      "news",
    ] as const;

    const processPromises = searchQueryTypes.map(async (searchQueryType) => {
      const newPage = await browser.newPage();
      newPage.setDefaultTimeout(IEngineConstants.webPageNavTimeout);
      newPage.setDefaultNavigationTimeout(IEngineConstants.webPageNavTimeout);

      await newPage.setUserAgent(IEngineConstants.currentUserAgent);

      await this.processProblemStatement(
        searchQueryType as IEngineWebPageTypes,
        newPage
      );

      await newPage.close();
      this.logger.info(`Closed page for ${searchQueryType} search results`);
    });

    await Promise.all(processPromises);

    await this.saveMemory();

    await browser.close();

    this.logger.info("Browser closed");
  }

  async process() {
    this.logger.info("Get Evidence Web Pages Processor");
    //super.process();

    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.getPageAnalysisModel.temperature,
      maxTokens: IEngineConstants.getPageAnalysisModel.maxOutputTokens,
      modelName: IEngineConstants.getPageAnalysisModel.name,
      verbose: IEngineConstants.getPageAnalysisModel.verbose,
    });

    await this.getAllPages();

    this.logger.info(`Saved ${this.totalPagesSave} pages`);
    this.logger.info("Get Evidence Web Pages Processor Complete");
  }
}
