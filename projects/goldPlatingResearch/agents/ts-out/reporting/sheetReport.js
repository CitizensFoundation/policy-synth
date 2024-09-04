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
        const notJustifiedGoldPlating = this.collectArticles(researchItem, "notJustifiedGoldPlating");
        const justifiedGoldPlating = this.collectArticles(researchItem, "justifiedGoldPlating");
        await this.generateReport(researchItem, notJustifiedGoldPlating, justifiedGoldPlating);
        await this.updateRangedProgress(100, "XLS report generation completed");
    }
    collectArticles(researchItem, collectionType) {
        const rankableArticles = [];
        const addArticles = (articles) => {
            articles
                .filter((article) => collectionType == "justifiedGoldPlating"
                ? article.research?.likelyJustified === true
                : article.research?.likelyJustified === false)
                .forEach((article) => {
                rankableArticles.push(article);
            });
        };
        if (researchItem.nationalLaw) {
            addArticles(researchItem.nationalLaw.law.articles);
            researchItem.nationalLaw.law.articles.forEach((article) => {
                article.source = "law";
            });
        }
        if (researchItem.nationalRegulation) {
            researchItem.nationalRegulation.forEach((regulation) => {
                addArticles(regulation.articles);
                regulation.articles.forEach((article) => {
                    article.source = "regulation";
                });
            });
        }
        return rankableArticles.sort((a, b) => (b.eloRating || 0) - (a.eloRating || 0));
    }
    async generateReport(researchItem, notJustifiedGoldPlating, justifiedGoldPlating) {
        const summarySheet = this.generateSummarySheet(researchItem, notJustifiedGoldPlating);
        const notJustifiedGoldPlatingRows = this.generateDetailedFindingsSheet(notJustifiedGoldPlating);
        const justifiedGoldPlatingRows = this.generateDetailedFindingsSheet(justifiedGoldPlating);
        const allData = [
            ...summarySheet,
            [], // Tóm röð til að aðgreina
            ["Gullhúðun án réttlætingar"],
            ...notJustifiedGoldPlatingRows,
            [], // Tóm röð til að aðgreina
            ["Líklega réttlætanleg gullhúðun"],
            ...justifiedGoldPlatingRows,
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
    generateSummarySheet(researchItem, rankedArticles) {
        return [
            [`Rannsókn á gullhúðun fyrir ${researchItem.name}`],
            [
                "",
                "",
                "Heildarfjöldi dæma um gullhúðun án réttlætingar:",
                rankedArticles.length.toString(),
            ],
            [""],
            ["Topp 5 dæmi:"],
            ["Röð", "Heimild", "Greinanúmer", "ELO mat", "Lýsing", "Vefslóð"],
            ...rankedArticles
                .slice(0, 5)
                .map((article, index) => [
                (index + 1).toString(),
                this.translateSource(article.source),
                article.number.toString(),
                (article.eloRating || 0).toString(),
                article.researchNationalLanguageTranslation?.description || "N/A",
                article.research?.url || "N/A",
            ]),
        ];
    }
    sanitizeData(data) {
        return data.map((row) => row.map((cell) => {
            if (typeof cell === "object" && cell !== null) {
                return JSON.stringify(cell);
            }
            return String(cell);
        }));
    }
    generateDetailedFindingsSheet(rankedArticles) {
        const headers = [
            "Röð",
            "Tegund",
            "Greinanúmer",
            "ELO mat",
            "Texti",
            "Lýsing",
            "Vefslóð",
            "Réttlæting",
            "Töluliðir úr tilskipun ESB",
            "Möguleg ástæða",
            "Nánari reglur",
            "Víkkun á gildissviði",
            "Úrlausnir sem ekki voru nýttar",
            "Strangari landslög",
            "Óhóflegar refsingar",
            "Fyrri innleiðing",
            "Mögulegar ástæður",
            "Möguleg skýring (frá greinargerð)",
            "Viðeigandi úrdráttur úr tilskipun ESB",
            "Ensk þýðing á grein",
        ];
        const rows = rankedArticles.map((article, index) => [
            (index + 1).toString(),
            this.translateSource(article.source),
            article.number.toString(),
            (article.eloRating || 0).toString(),
            article.text,
            article.researchNationalLanguageTranslation?.description || "N/A",
            article.research?.url || "N/A",
            article.researchNationalLanguageTranslation?.justification || "N/A",
            article.research?.results.euDirectiveArticlesNumbers?.join(", ") || "N/A",
            article.researchNationalLanguageTranslation?.results.possibleReasons ||
                "N/A",
            article.researchNationalLanguageTranslation?.results.detailedRules ||
                "N/A",
            article.researchNationalLanguageTranslation?.results.expandedScope ||
                "N/A",
            article.researchNationalLanguageTranslation?.results
                .exemptionsNotUtilized || "N/A",
            article.researchNationalLanguageTranslation?.results
                .stricterNationalLaws || "N/A",
            article.researchNationalLanguageTranslation?.results
                .disproportionatePenalties || "N/A",
            article.researchNationalLanguageTranslation?.results
                .earlierImplementation || "N/A",
            article.researchNationalLanguageTranslation?.results.possibleReasons ||
                "N/A",
            article.researchNationalLanguageTranslation?.supportTextExplanation ||
                "N/A",
            article.research?.euLawExtract || "N/A",
            article.research?.englishTranslationOfIcelandicArticle || "N/A",
        ]);
        return [[""], headers, ...rows];
    }
    translateSource(source) {
        switch (source) {
            case "law":
                return "lög";
            case "regulation":
                return "reglugerð";
            default:
                return source;
        }
    }
}
//# sourceMappingURL=sheetReport.js.map