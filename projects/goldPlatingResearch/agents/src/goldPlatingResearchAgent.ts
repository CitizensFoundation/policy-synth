import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PsAgentClassCategories } from "@policysynth/agents/agentCategories.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { WebScanningAgent } from "./webScanning.js";
import { TextCleaningAgent } from "./textCleaning.js";
import { ArticleExtractionAgent } from "./extractArticles.js";
import { GoldPlatingSearchAgent } from "./researchArticles.js";
import { SupportTextReviewAgent } from "./reviewAgent.js";
import { FoundGoldPlatingRankingAgent } from "./rankResults.js";
import { GoogleDocsReportAgent } from "./docReport.js";
import { XlsReportAgent } from "./sheetReport.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";

const disableScanning = true;
const skipFullTextProcessing = true;
const skipArticleExtraction = true;

export class GoldPlatingResearchAgent extends PolicySynthAgent {
  declare memory: GoldPlatingMemoryData;

  private static readonly GOLDPLATING_AGENT_CLASS_BASE_ID =
    "a05a9cd8-4d4e-4b30-9a28-613a5f09402e";
  private static readonly GOLDPLATING_AGENT_CLASS_VERSION = 3;
  constructor(
    agent: PsAgent,
    memory: GoldPlatingMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
  }

  async process() {
    await this.updateRangedProgress(0, "Starting Gold-plating Research");

    for (const researchItem of this.memory.researchItems) {
      await this.processResearchItem(researchItem);
    }

    await this.updateRangedProgress(100, "Gold-plating Research Completed");
    await this.setCompleted("Task Completed");
  }

  private async processResearchItem(researchItem: GoldplatingResearchItem) {
    // 1. Download laws and regulations
    const webScanningAgent = new WebScanningAgent(
      this.agent,
      this.memory,
      0,
      10
    );

    if (!disableScanning) {
      await webScanningAgent.processItem(researchItem);
    }

    await this.saveMemory();
    this.logger.debug(JSON.stringify(this.memory, null, 2));

    // 2. Clean and process National laws and regulations
    await this.cleanAndProcessNationalLawsAndRegulations(researchItem);

    await this.saveMemory();
    this.logger.debug(JSON.stringify(this.memory, null, 2));

    // 3. Compare and search for gold-plating
    const goldPlatingSearchAgent = new GoldPlatingSearchAgent(
      this.agent,
      this.memory,
      40,
      60
    );
    await goldPlatingSearchAgent.processItem(researchItem);

    await this.saveMemory();
    this.logger.debug(JSON.stringify(this.memory, null, 2));

    // 4. Review support text for possible gold-plating
    const supportTextReviewAgent = new SupportTextReviewAgent(
      this.agent,
      this.memory,
      60,
      70
    );

    await this.saveMemory();
    await supportTextReviewAgent.processItem(researchItem);

    this.logger.debug(JSON.stringify(this.memory, null, 2));

    // 5. Rank found gold-plating
    const foundGoldPlatingRankingAgent = new FoundGoldPlatingRankingAgent(
      this.agent,
      this.memory,
      70,
      80
    );

    await foundGoldPlatingRankingAgent.processItem(researchItem);

    await this.saveMemory();
    this.logger.debug(JSON.stringify(this.memory, null, 2));

    // 6. Generate reports
    const googleDocsReportAgent = new GoogleDocsReportAgent(
      this.agent,
      this.memory,
      80,
      90
    );

    this.logger.debug(JSON.stringify(this.memory, null, 2));

    await this.saveMemory();
    await googleDocsReportAgent.processItem(researchItem);

    const xlsReportAgent = new XlsReportAgent(this.agent, this.memory, 90, 100);
    await xlsReportAgent.processItem(researchItem);
    await this.saveMemory();
  }

  private async cleanAndProcessNationalLawsAndRegulations(
    researchItem: GoldplatingResearchItem
  ) {
    const textCleaningAgent = new TextCleaningAgent(
      this.agent,
      this.memory,
      10,
      20
    );
    const articleExtractionAgent = new ArticleExtractionAgent(
      this.agent,
      this.memory,
      20,
      40
    );

    if (researchItem.nationalLaw) {
      if (!skipFullTextProcessing) {
        researchItem.nationalLaw.law.fullText =
          await textCleaningAgent.processItem(
            researchItem.nationalLaw.law.fullText
          );
      }

      if (!skipArticleExtraction) {
        researchItem.nationalLaw.law.articles =
        await articleExtractionAgent.processItem(
          researchItem.nationalLaw.law.fullText,
          "law"
        );
      }

      if (researchItem.nationalLaw.supportArticleText) {
        if (!skipFullTextProcessing) {
          researchItem.nationalLaw.supportArticleText.fullText =
            await textCleaningAgent.processItem(
              researchItem.nationalLaw.supportArticleText.fullText
            );
        }

        if (!skipArticleExtraction) {
          researchItem.nationalLaw.supportArticleText.articles =
          await articleExtractionAgent.processItem(
            researchItem.nationalLaw.supportArticleText.fullText,
            "lawSupportArticle"
          );

        }
      }
    }

    if (!skipArticleExtraction) {
      if (researchItem.nationalRegulation) {
        for (const regulation of researchItem.nationalRegulation) {
          /*regulation.fullText = await textCleaningAgent.processItem(
            regulation.fullText
          );*/
          regulation.articles = await articleExtractionAgent.processItem(
            regulation.fullText,
            "regulation"
          );
        }
      }
    }
  }

  static getAgentClass(): PsAgentClassCreationAttributes {
    return {
      class_base_id: this.GOLDPLATING_AGENT_CLASS_BASE_ID,
      user_id: 0,
      name: "Gold-plating Research Agent",
      version: this.GOLDPLATING_AGENT_CLASS_VERSION,
      available: true,
      configuration: {
        category: PsAgentClassCategories.LegalResearch,
        subCategory: "goldPlatingResearch",
        hasPublicAccess: false,
        description:
          "An agent for conducting gold-plating research on laws and regulations",
        queueName: "GOLDPLATING_RESEARCH",
        imageUrl:
          "https://aoi-storage-production.citizens.is/dl/3071cb4af1d0891e2f14c576a795cfa1--retina-1.png",
        iconName: "goldplating_research",
        capabilities: ["research", "analysis", "legal"],
        requestedAiModelSizes: ["small", "medium", "large"] as PsAiModelSize[],
        defaultStructuredQuestions: [], // Add default questions if needed
        supportedConnectors: [
          "docs",
          "collaboration",
          "notificationsAndChat",
        ] as PsConnectorClassTypes[],
        questions: this.getConfigurationQuestions(),
      },
    };
  }

  static getConfigurationQuestions(): YpStructuredQuestionData[] {
    return [
      {
        uniqueId: "maxArticlesToAnalyze",
        type: "textField",
        subType: "number",
        value: 100,
        maxLength: 4,
        required: true,
        text: "Maximum number of articles to analyze per law/regulation",
      },
      // Add more configuration questions as needed
    ];
  }
}
