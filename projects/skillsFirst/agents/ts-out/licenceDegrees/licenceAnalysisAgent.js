import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAiModelSize, } from "@policysynth/agents/aiModelTypes.js";
import { PsAgentClassCategories } from "@policysynth/agents/agentCategories.js";
import { DegreeRequirementAnalyzerAgent } from "./requirementAnalyzer.js";
import { SheetsLicenseDegreeImportAgent } from "./importSheet.js";
import { SheetsLicenseDegreeExportAgent } from "./exportSheet.js";
import { FirecrawlScrapeAndCrawlerAgent, } from "./firecrawlExtractor.js";
export class JobTitleLicenseDegreeAnalysisAgent extends PolicySynthAgent {
    static LICENSE_DEGREE_ANALYSIS_AGENT_CLASS_BASE_ID = "a1b19c4b-79b1-491a-ba32-5fa4c9f74f1c";
    static LICENSE_DEGREE_ANALYSIS_AGENT_CLASS_VERSION = 1;
    constructor(agent, memory, start, end) {
        super(agent, memory, start, end);
        this.memory = memory;
    }
    // ↓ add this property if you like to keep the importer around
    sheetImporter;
    async loadSpreadsheet() {
        this.sheetImporter ??= new SheetsLicenseDegreeImportAgent(this.agent, this.memory, this.startProgress, this.endProgress, this.memory.worksheetName // falls back to “Sheet1”
        );
        this.logger.debug(`Importing license degree rows from ${this.memory.worksheetName}`);
        this.memory.jobLicenceTypesForLicenceAnalysis =
            await this.sheetImporter.importLicenseDegreeRows();
    }
    async process() {
        await this.loadSpreadsheet();
        await this.saveMemory();
        this.logger.debug(JSON.stringify(this.memory.jobLicenceTypesForLicenceAnalysis, null, 2));
        const total = this.memory.jobLicenceTypesForLicenceAnalysis.length;
        this.logger.debug(`Total job titles: ${total}`);
        for (let i = 0; i < total; i++) {
            const row = this.memory.jobLicenceTypesForLicenceAnalysis[i];
            this.logger.debug(`Analyzing ${JSON.stringify(row, null, 2)}`);
            await this.updateRangedProgress(Math.floor((i / total) * 90), `Analyzing ${row.licenseType} (${i + 1}/${total})`);
            // ─── NEW: analyse up‑to three sources in one shot ───────────────────────
            const licenseResults = await this.processLicense(row);
            row.analysisResults = licenseResults;
            await this.saveMemory();
        }
        if (this.memory.jobLicenceTypesForLicenceAnalysis?.length) {
            const exporter = new SheetsLicenseDegreeExportAgent(this.agent, this.memory, this.startProgress, this.endProgress, this.memory.worksheetName ?? "License Degree Analysis" // optional override
            );
            await exporter.processJsonData({
                agentId: this.agent.id,
                analysisResults: this.memory.jobLicenceTypesForLicenceAnalysis,
            });
        }
        await this.updateRangedProgress(100, "Completed all job titles");
    }
    /**
     * Analyse up‑to three sources for a single licence:
     *   • any “Licenses & Permits” URL that came from the sheet
     *   • any “o3 deep search” URL that came from the sheet
     *   • ⸻plus⸻ one authoritative URL we always try to discover ourselves
     *
     * For every usable URL we:
     *   1. pull the requirements text
     *   2. run the DegreeRequirementAnalyzer
     *   3. return an array of results (max 3 per row)
     */
    async processLicense(row) {
        // ────────────────────────────────────────────────────────────────────────────
        // 1️⃣  Collect unique URLs from the sheet (0‑2 entries)
        // ────────────────────────────────────────────────────────────────────────────
        const urls = [];
        if (row.licenseLink)
            urls.push(row.licenseLink.trim());
        if (row.deepResearchLinks) {
            if (row.deepResearchLinks.includes(",")) {
                const links = row.deepResearchLinks.split(",").map((l) => l.trim());
                urls.push(...links);
            }
            else {
                urls.push(row.deepResearchLinks.trim());
            }
        }
        // ────────────────────────────────────────────────────────────────────────────
        // 3️⃣  Extract + analyse each source in turn
        // ────────────────────────────────────────────────────────────────────────────
        const results = [];
        for (const src of urls) {
            try {
                // Pull requirements text
                let pagesToAnalyze = [];
                if (src) {
                    const extractor = new FirecrawlScrapeAndCrawlerAgent(this.agent, this.memory, this.startProgress, this.endProgress, row.licenseType);
                    pagesToAnalyze = await extractor.scrapeUrl(src, ["markdown"], 3, true);
                }
                for (const page of pagesToAnalyze) {
                    // Run the degree‑requirement analysis
                    const analyzer = new DegreeRequirementAnalyzerAgent(this.agent, this.memory, this.startProgress, this.endProgress);
                    const res = (await analyzer.analyze(page.content, row.licenseType, src));
                    res.licenseType = row.licenseType;
                    res.sourceUrl = page.url;
                    if ("error" in res)
                        throw new Error(res.error);
                    results.push(res);
                }
            }
            catch (e) {
                this.logger.error(`Error analysing source “${src}”: ${e}`);
            }
        }
        return results;
    }
    // Registration metadata so the class can be instantiated by Policy Synth
    static getAgentClass() {
        return {
            class_base_id: this.LICENSE_DEGREE_ANALYSIS_AGENT_CLASS_BASE_ID,
            user_id: 0,
            name: "License Degree Analysis Agent",
            version: this.LICENSE_DEGREE_ANALYSIS_AGENT_CLASS_VERSION,
            available: true,
            configuration: {
                category: PsAgentClassCategories.HRManagement,
                subCategory: "jobTitleAnalysis",
                hasPublicAccess: false,
                description: "An agent for analyzing job titles and license degrees",
                queueName: "JOB_TITLE_LICENSE_DEGREE_ANALYSIS",
                imageUrl: "https://aoi-storage-production.citizens.is/dl/b0235e4818d5c15a4b9f4d5ac59eb749--retina-1.png",
                iconName: "job_title_license_degree_analysis",
                capabilities: ["analysis", "text processing"],
                requestedAiModelSizes: [
                    PsAiModelSize.Small,
                    PsAiModelSize.Medium,
                    PsAiModelSize.Large,
                ],
                defaultStructuredQuestions: [
                    {
                        uniqueId: "numJobDescriptions",
                        type: "textField",
                        subType: "number",
                        value: 10,
                        maxLength: 4,
                        required: true,
                        text: "Number of job descriptions to analyze",
                    },
                ],
                supportedConnectors: [],
                questions: this.getConfigurationQuestions(),
            },
        };
    }
    static getConfigurationQuestions() {
        return [];
    }
}
//# sourceMappingURL=licenceAnalysisAgent.js.map