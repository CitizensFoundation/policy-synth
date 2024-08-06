import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsGoogleDocsConnector } from "@policysynth/agents/connectors/documents/googleDocsConnector.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";

interface ArticleWithRanking extends LawArticle {
  source: "law" | "regulation";
  eloRating: number;
}

export class GoogleDocsReportAgent extends PolicySynthAgent {
  declare memory: GoldPlatingMemoryData;
  private docsConnector: PsGoogleDocsConnector;

  constructor(
    agent: PsAgent,
    memory: GoldPlatingMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.docsConnector = PsConnectorFactory.getConnector(
      this.agent,
      this.memory,
      PsConnectorClassTypes.Document,
      false
    ) as PsGoogleDocsConnector;

    if (!this.docsConnector) {
      throw new Error("Google Docs connector not found");
    }
  }

  async processItem(researchItem: GoldplatingResearchItem): Promise<void> {
    await this.updateRangedProgress(
      0,
      "Starting Google Docs report generation"
    );

    const rankedArticles = this.collectAndRankArticles(researchItem);
    const reportContent = this.generateReportContent(
      researchItem,
      rankedArticles
    );

    await this.docsConnector.updateDocument(reportContent);

    await this.updateRangedProgress(
      100,
      "Google Docs report generation completed"
    );
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

  private generateReportContent(
    researchItem: GoldplatingResearchItem,
    rankedArticles: ArticleWithRanking[]
  ): string {
    let content = "";

    content += "Gold-Plating Analysis Report\n\n";

    content += "Executive Summary\n\n";
    content += this.generateExecutiveSummary(rankedArticles);

    content += "\nDetailed Findings\n\n";
    content += this.generateDetailedFindings(rankedArticles);

    content += "\nConclusion\n\n";
    content += this.generateConclusion(rankedArticles);

    return content;
  }

  private generateExecutiveSummary(
    rankedArticles: ArticleWithRanking[]
  ): string {
    let summary = `This report summarizes the findings of a gold-plating analysis conducted on national laws and regulations in relation to EU directives. A total of ${rankedArticles.length} instances of potential gold-plating were identified and ranked based on their severity and importance.\n\n`;

    summary += "Top 5 Most Significant Instances:\n\n";
    rankedArticles.slice(0, 5).forEach((article, index) => {
      summary += `${index + 1}. ${
        article.source.charAt(0).toUpperCase() + article.source.slice(1)
      } Article ${article.number}\n`;
      summary += `   ELO Rating: ${article.eloRating}\n`;
      summary += `   Description: ${
        article.research?.description || "N/A"
      }\n\n`;
    });

    return summary;
  }

  private generateDetailedFindings(
    rankedArticles: ArticleWithRanking[]
  ): string {
    let findings = "";

    rankedArticles.forEach((article, index) => {
      findings += `${index + 1}. ${
        article.source.charAt(0).toUpperCase() + article.source.slice(1)
      } Article ${article.number}\n`;
      findings += `ELO Rating: ${article.eloRating}\n`;
      findings += `Text: ${article.text}\n`;
      findings += `Reason for Gold-Plating: ${
        article.research?.reasonForGoldPlating || "N/A"
      }\n`;
      findings += `Recommendation: ${
        article.research?.recommendation || "N/A"
      }\n\n`;

      findings += "Research Results:\n";
      if (article.research?.results) {
        const results = article.research.results;
        console.log(JSON.stringify(results, null, 2));
        console.log(JSON.stringify(article, null, 2));
        findings += `- Detailed Rules: ${results.detailedRules}\n`;
        findings += `- Expanded Scope: ${results.expandedScope}\n`;
        findings += `- Exemptions Not Utilized: ${results.exemptionsNotUtilized}\n`;
        findings += `- Stricter National Laws: ${results.stricterNationalLaws}\n`;
        findings += `- Disproportionate Penalties: ${results.disproportionatePenalties}\n`;
        findings += `- Earlier Implementation: ${results.earlierImplementation}\n`;
        findings += `- Conclusion: ${results.conclusion}\n`;
      }

      findings += "\n";
    });

    return findings;
  }

  private generateConclusion(rankedArticles: ArticleWithRanking[]): string {
    return `The analysis identified ${rankedArticles.length} instances of potential gold-plating in national laws and regulations. These instances vary in severity and potential impact, with the most significant cases requiring immediate attention and possible revision. It is recommended that policymakers review these findings and consider appropriate actions to align national legislation more closely with EU directives while maintaining necessary national adaptations.`;
  }
}
