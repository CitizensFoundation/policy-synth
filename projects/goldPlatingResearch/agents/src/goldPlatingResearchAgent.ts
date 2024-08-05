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

export class GoldPlatingResearchAgent extends PolicySynthAgentQueue {
  declare memory: GoldPlatingMemoryData;

  private static readonly GOLDPLATING_AGENT_CLASS_BASE_ID = "a1c2l3a4-f516n72-48e9a0e-a152c394-a5f6e7a819";
  private static readonly GOLDPLATING_AGENT_CLASS_VERSION = 1;

  get agentQueueName(): string {
    return "GOLDPLATING_RESEARCH";
  }

  get processors() {
    return [
      {
        processor: GoldPlatingResearchAgent,
        weight: 100,
      },
    ];
  }

  async setupMemoryIfNeeded(): Promise<void> {
    if (!this.memory) {
      this.memory = { researchItems: [] } as GoldPlatingMemoryData;
    }
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
    const webScanningAgent = new WebScanningAgent(this.agent, this.memory, 0, 10);
    await webScanningAgent.processItem(researchItem);

    // 2. Clean and process National laws and regulations
    await this.cleanAndProcessNationalLawsAndRegulations(researchItem);

    // 3. Compare and search for gold-plating
    const goldPlatingSearchAgent = new GoldPlatingSearchAgent(this.agent, this.memory, 40, 60);
    await goldPlatingSearchAgent.processItem(researchItem);

    // 4. Review support text for possible gold-plating
    const supportTextReviewAgent = new SupportTextReviewAgent(this.agent, this.memory, 60, 70);
    await supportTextReviewAgent.processItem(researchItem);

    // 5. Rank found gold-plating
    const foundGoldPlatingRankingAgent = new FoundGoldPlatingRankingAgent(this.agent, this.memory, 70, 80);
    await foundGoldPlatingRankingAgent.processItem(researchItem);

    // 6. Generate reports
    const googleDocsReportAgent = new GoogleDocsReportAgent(this.agent, this.memory, 80, 90);
    await googleDocsReportAgent.processItem(researchItem);

    const xlsReportAgent = new XlsReportAgent(this.agent, this.memory, 90, 100);
    await xlsReportAgent.processItem(researchItem);

    await this.saveMemory();
  }

  private async cleanAndProcessNationalLawsAndRegulations(researchItem: GoldplatingResearchItem) {
    const textCleaningAgent = new TextCleaningAgent(this.agent, this.memory, 10, 20);
    const articleExtractionAgent = new ArticleExtractionAgent(this.agent, this.memory, 20, 40);

    if (researchItem.nationalLaw) {
      researchItem.nationalLaw.law.fullText = await textCleaningAgent.processItem(researchItem.nationalLaw.law.fullText);
      researchItem.nationalLaw.law.articles = await articleExtractionAgent.processItem(researchItem.nationalLaw.law.fullText, 'law');

      if (researchItem.nationalLaw.supportArticleText) {
        researchItem.nationalLaw.supportArticleText.fullText = await textCleaningAgent.processItem(researchItem.nationalLaw.supportArticleText.fullText);
        researchItem.nationalLaw.supportArticleText.articles = await articleExtractionAgent.processItem(researchItem.nationalLaw.supportArticleText.fullText, 'law');
      }
    }

    if (researchItem.nationalRegulation) {
      researchItem.nationalRegulation.fullText = await textCleaningAgent.processItem(researchItem.nationalRegulation.fullText);
      researchItem.nationalRegulation.articles = await articleExtractionAgent.processItem(researchItem.nationalRegulation.fullText, 'regulation');
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
        description: "An agent for conducting gold-plating research on laws and regulations",
        queueName: "GOLDPLATING_RESEARCH",
        imageUrl: "https://example.com/goldplating-agent-image.png",
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