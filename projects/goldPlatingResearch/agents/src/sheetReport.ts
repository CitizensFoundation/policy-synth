import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { PsBaseSheetConnector } from "@policysynth/agents/connectors/base/baseSheetConnector";

interface ArticleWithRanking extends LawArticle {
  source: "law" | "regulation";
  eloRating: number;
}

export class XlsReportAgent extends PolicySynthAgent {
  declare memory: GoldPlatingMemoryData;
  private sheetsConnector: PsBaseSheetConnector;

  constructor(
    agent: PsAgent,
    memory: GoldPlatingMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.sheetsConnector = PsConnectorFactory.getConnector(
      this.agent,
      this.memory,
      PsConnectorClassTypes.Document,
      false
    ) as PsBaseSheetConnector;

    if (!this.sheetsConnector) {
      throw new Error("Google Sheets connector not found");
    }
  }

  async processItem(researchItem: GoldplatingResearchItem): Promise<void> {
    await this.updateRangedProgress(0, "Starting XLS report generation");

    const rankedArticles = this.collectAndRankArticles(researchItem);
    await this.generateReport(researchItem, rankedArticles);

    await this.updateRangedProgress(100, "XLS report generation completed");
  }

  private collectAndRankArticles(
    researchItem: GoldplatingResearchItem
  ): ArticleWithRanking[] {
    let articles: ArticleWithRanking[] = [];

    if (researchItem.nationalLaw) {
      articles.push(
        ...researchItem.nationalLaw.law.articles
          .filter((article) => article.research?.possibleGoldPlating)
          .map((article) => ({
            ...article,
            source: "law" as const,
            eloRating: article.eloRating || 0,
          }))
      );
    }

    if (researchItem.nationalRegulation) {
      researchItem.nationalRegulation.forEach(regulation => {
        articles.push(
          ...regulation.articles
            .filter((article) => article.research?.possibleGoldPlating)
            .map((article) => ({
              ...article,
              source: "regulation" as const,
              eloRating: article.eloRating || 0,
            }))
        );
      });
    }

    return articles.sort((a, b) => b.eloRating - a.eloRating);
  }

  private async generateReport(
    researchItem: GoldplatingResearchItem,
    rankedArticles: ArticleWithRanking[]
  ): Promise<void> {
    const summarySheet = this.generateSummarySheet(rankedArticles);
    const detailedFindingsSheet =
      this.generateDetailedFindingsSheet(rankedArticles);

    await this.sheetsConnector.updateSheet([
      ...summarySheet,
      [], // Empty row for separation
      ...detailedFindingsSheet,
    ]);
  }

  private generateSummarySheet(
    rankedArticles: ArticleWithRanking[]
  ): string[][] {
    return [
      ["Gold-Plating Analysis Report - Executive Summary"],
      [
        "Total instances of potential gold-plating:",
        rankedArticles.length.toString(),
      ],
      [""],
      ["Top 5 Most Significant Instances:"],
      ["Rank", "Source", "Article Number", "ELO Rating", "Description"],
      ...rankedArticles
        .slice(0, 5)
        .map((article, index) => [
          (index + 1).toString(),
          article.source,
          article.number,
          article.eloRating.toString(),
          article.research?.description || "N/A",
        ]),
    ];
  }

  private generateDetailedFindingsSheet(
    rankedArticles: ArticleWithRanking[]
  ): string[][] {
    const headers = [
      "Rank",
      "Source",
      "Article Number",
      "ELO Rating",
      "Text",
      "Description",
      "Reason for Gold-Plating",
      "Recommendation",
      "Detailed Rules",
      "Expanded Scope",
      "Exemptions Not Utilized",
      "Stricter National Laws",
      "Disproportionate Penalties",
      "Earlier Implementation",
      "Conclusion",
    ];

    const rows = rankedArticles.map((article, index) => [
      (index + 1).toString(),
      article.source,
      article.number,
      article.eloRating.toString(),
      article.text,
      article.research?.description || "N/A",
      article.research?.reasonForGoldPlating || "N/A",
      article.research?.recommendation || "N/A",
      article.research?.results.detailedRules || "N/A",
      article.research?.results.expandedScope || "N/A",
      article.research?.results.exemptionsNotUtilized || "N/A",
      article.research?.results.stricterNationalLaws || "N/A",
      article.research?.results.disproportionatePenalties || "N/A",
      article.research?.results.earlierImplementation || "N/A",
      article.research?.results.conclusion || "N/A",
    ]);

    return [["Detailed Findings"], headers, ...rows];
  }
}
