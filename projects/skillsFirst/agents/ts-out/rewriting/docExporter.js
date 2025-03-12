import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
export class JobDescriptionPairExporter extends PolicySynthAgent {
    docsConnector;
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
        this.docsConnector = PsConnectorFactory.getConnector(this.agent, this.memory, PsConnectorClassTypes.Document, false);
        if (!this.docsConnector) {
            throw new Error("Google Docs connector not found");
        }
    }
    async formatJobDescriptionText(text) {
        const systemPrompt = "Please output the job description text with linebreaks formatted that is easy to read. \n" +
            "Do not use markdown, just use linebreaks. \n" +
            "Please remove any html or css artifacts but nothing else. \n" +
            "Do not change anything and output everything (except html and css)!";
        const messages = [
            this.createSystemMessage(systemPrompt),
            this.createHumanMessage(text),
        ];
        let resultText;
        try {
            resultText = await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, messages, false);
        }
        catch (error) {
            throw error;
        }
        return resultText;
    }
    async exportPairs() {
        await this.updateRangedProgress(0, "Starting Job Description Pair Export");
        const mem = this.memory;
        let content = "Job Description Pair Export Report\n\n";
        content += `Total Job Descriptions Processed: ${mem.jobDescriptions.length}\n\n`;
        for (const jd of mem.rewrittenJobDescriptions) {
            // Only include job descriptions that have a rewritten version.
            if (!jd.rewrittenText)
                continue;
            let category = "no classification";
            if (Array.isArray(jd.occupationalCategory) &&
                jd.occupationalCategory.length > 0) {
                const mainCat = jd.occupationalCategory[0].mainCategory;
                // Ensure mainCategory is a non-empty string
                if (mainCat && mainCat.trim() !== "") {
                    category = mainCat.toLowerCase();
                }
            }
            const formattedOriginalJobDescriptionText = await this.formatJobDescriptionText(jd.text);
            content += `Job Name: ${jd.name}\n`;
            content += `Title Code: ${jd.titleCode}\n`;
            content += `Category: ${category}\n\n`;
            content += `Link: ${jd.url}\n\n`;
            // Add reading level meta data.
            if (jd.readingLevelGradeAnalysis) {
                content += `Reading Level: ${jd.readingLevelGradeAnalysis.readabilityLevel}\n`;
            }
            else if (jd.readabilityAnalysisTextTSNPM) {
                content += `Reading Level (Flesch-Kincaid Grade): ${jd.readabilityAnalysisTextTSNPM.fleschKincaidGrade}\n`;
            }
            else {
                content += "Reading Level: N/A\n";
            }
            // Add maximum education requirement meta data from degree analysis.
            if (jd.degreeAnalysis && jd.degreeAnalysis.maximumDegreeRequirement) {
                content += `Maximum Education Requirement: ${jd.degreeAnalysis.maximumDegreeRequirement}\n`;
            }
            else {
                content += "Maximum Education Requirement: N/A\n";
            }
            content += "\n--- Original Job Description ---\n";
            content += formattedOriginalJobDescriptionText + "\n\n";
            content += "--- Rewritten Job Description ---\n";
            content += jd.rewrittenText + "\n";
            content += "---------------------------------------\n\n\n\n";
        }
        await this.docsConnector.updateDocument(content);
        await this.updateRangedProgress(100, "Job Description Pair Export completed");
    }
}
//# sourceMappingURL=docExporter.js.map