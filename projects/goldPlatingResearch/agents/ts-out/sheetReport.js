import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
export class XlsReportAgent extends PolicySynthAgent {
    sheetsConnector;
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.sheetsConnector = PsConnectorFactory.getConnector(this.agent, this.memory, PsConnectorClassTypes.Spreadsheet, false);
        if (!this.sheetsConnector) {
            throw new Error("Google Sheets connector not found");
        }
    }
    async processItem(researchItem) {
        await this.updateRangedProgress(0, "Starting XLS report generation");
        const rankedArticles = this.collectAndRankArticles(researchItem);
        await this.generateReport(researchItem, rankedArticles);
        await this.updateRangedProgress(100, "XLS report generation completed");
    }
    collectAndRankArticles(researchItem) {
        let articles = [];
        if (researchItem.nationalLaw) {
            articles.push(...researchItem.nationalLaw.law.articles
                .filter((article) => article.research?.possibleGoldPlating)
                .map((article) => ({
                ...article,
                source: "law",
                eloRating: article.eloRating || 0,
            })));
        }
        if (researchItem.nationalRegulation) {
            researchItem.nationalRegulation.forEach((regulation) => {
                articles.push(...regulation.articles
                    .filter((article) => article.research?.possibleGoldPlating)
                    .map((article) => ({
                    ...article,
                    source: "regulation",
                    eloRating: article.eloRating || 0,
                })));
            });
        }
        return articles.sort((a, b) => b.eloRating - a.eloRating);
    }
    async generateReport(researchItem, rankedArticles) {
        const summarySheet = this.generateSummarySheet(rankedArticles);
        const detailedFindingsSheet = this.generateDetailedFindingsSheet(rankedArticles);
        const allData = [
            ...summarySheet,
            [], // Empty row for separation
            ...detailedFindingsSheet,
        ];
        try {
            // Update the sheet using updateRange method
            const sanitizedData = this.sanitizeData(allData);
            await this.sheetsConnector.updateRange("A1", sanitizedData);
            console.log("Report generated and uploaded to Google Sheets successfully.");
        }
        catch (error) {
            console.error("Error updating Google Sheet:", error);
            throw error;
        }
    }
    generateSummarySheet(rankedArticles) {
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
    sanitizeData(data) {
        return data.map(row => row.map(cell => {
            if (typeof cell === 'object' && cell !== null) {
                return JSON.stringify(cell);
            }
            return String(cell);
        }));
    }
    generateDetailedFindingsSheet(rankedArticles) {
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
//# sourceMappingURL=sheetReport.js.map