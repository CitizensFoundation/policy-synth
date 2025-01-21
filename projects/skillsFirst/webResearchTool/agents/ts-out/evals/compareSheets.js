import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { GoogleSheetsJobDescriptionImportAgent } from "./googleSheetsJobDescriptionImportAgent";
import { PsAiModelType, PsAiModelSize, } from "@policysynth/agents/aiModelTypes.js";
/**
 * The main agent that compares multiple sheets of job descriptions
 * and attempts to resolve conflicts using an LLM.
 */
export class GoogleSheetsComparisonAgent extends PolicySynthAgent {
    // Configuration: list of sheet names to compare
    sheetNames = [];
    constructor(agent, memory, startProgress, endProgress, sheetNames // e.g. ["ModelA_Analysis", "ModelB_Analysis", ...]
    ) {
        super(agent, memory, startProgress, endProgress);
        this.sheetNames = sheetNames;
    }
    /**
     * Main process method:
     *   1) read from each sheet
     *   2) compare relevant fields
     *   3) for each difference, invoke the LLM to pick the correct value
     *   4) produce a final "resolved" set of differences
     */
    async process() {
        await this.updateRangedProgress(0, "Starting comparison of multiple sheets");
        // 1. For each sheet name, import the job descriptions into memory
        const allImportedData = {};
        for (let i = 0; i < this.sheetNames.length; i++) {
            const sn = this.sheetNames[i];
            const importAgent = new GoogleSheetsJobDescriptionImportAgent(this.agent, this.memory, 0, 0, sn);
            const imported = await importAgent.importJobDescriptions();
            allImportedData[sn] = imported.jobDescriptions || [];
            this.logger.info(`Imported ${allImportedData[sn].length} job descriptions from sheet "${sn}".`);
        }
        // 2. Collect all unique titleCodes to compare across sheets
        const allTitleCodes = new Set();
        for (const sn of this.sheetNames) {
            allImportedData[sn].forEach((jd) => {
                if (jd.titleCode)
                    allTitleCodes.add(jd.titleCode);
            });
        }
        // 3. For each titleCode, gather the corresponding rows from each sheet
        //    Compare each relevant field. If any differ, note them in 'differences'.
        const differences = [];
        let count = 0;
        const total = allTitleCodes.size;
        for (const titleCode of allTitleCodes) {
            count++;
            await this.updateRangedProgress((count / total) * 50, `Comparing row ${count} of ${total}`);
            // Gather the JobDescription objects from each sheet that has this titleCode
            const rowDataPerSheet = {};
            for (const sn of this.sheetNames) {
                const match = allImportedData[sn].find((d) => d.titleCode === titleCode);
                if (match)
                    rowDataPerSheet[sn] = match;
            }
            // If only one sheet has this titleCode, there's nothing to compare.
            // (Optionally, you could note that it’s "missing" in other sheets.)
            if (Object.keys(rowDataPerSheet).length <= 1) {
                continue;
            }
            // Decide which fields you want to compare.
            // For more thorough comparisons, flatten or recursively compare objects.
            // We'll do a simple top-level approach here.
            const fieldsToCheck = [
                "name",
                "bargainUnit",
                "error",
                "notes",
                // You could add nested fields like "degreeAnalysis.needsCollegeDegree"
                // in a custom flattening approach, or do it by direct property references.
            ];
            // Compare each field
            for (const field of fieldsToCheck) {
                const allValues = new Set();
                const sheetValuePairs = [];
                for (const sn of this.sheetNames) {
                    const jd = rowDataPerSheet[sn];
                    if (!jd)
                        continue;
                    const rawVal = jd[field];
                    const valStr = rawVal === undefined ? undefined : String(rawVal);
                    allValues.add(valStr);
                    sheetValuePairs.push({ sheetName: sn, value: valStr });
                }
                // If more than one distinct value, we have a difference
                if (allValues.size > 1) {
                    differences.push({
                        titleCode,
                        field,
                        values: sheetValuePairs,
                    });
                }
            }
        }
        // 4. For each difference, let the LLM try to resolve which value is correct.
        let diffCount = 0;
        for (const diff of differences) {
            diffCount++;
            await this.updateRangedProgress(50 + (diffCount / differences.length) * 25, `Resolving differences ${diffCount} of ${differences.length}`);
            // Try to retrieve the original job description from memory
            // (assuming your memory has some 'jobDescriptions' array).
            const originalJD = this.memory.jobDescriptions?.find((jd) => jd.titleCode === diff.titleCode);
            // If we can't find the original, we can fallback to a minimal prompt or skip.
            if (!originalJD) {
                this.logger.warn(`No original job description found in memory for titleCode=${diff.titleCode}. Skipping LLM resolution.`);
                continue;
            }
            try {
                const { resolvedValue, explanation } = await this.resolveDifferenceWithLLM(originalJD, diff);
                diff.resolvedValue = resolvedValue;
                diff.resolutionExplanation = explanation;
                this.logger.info(`titleCode=${diff.titleCode}, field=${diff.field}, resolvedValue="${resolvedValue}"`);
            }
            catch (err) {
                this.logger.error(`Error resolving difference for titleCode=${diff.titleCode}, field=${diff.field}: ${err.message}`);
            }
        }
        // 5. After all differences are processed, log final stats
        this.logger.info(`Total differences found: ${differences.length}`);
        this.logger.info(`Differences with LLM resolutions: ${differences.filter((d) => d.resolvedValue).length}`);
        // If you want to store `differences` in your memory or produce a final report, do so here:
        // this.memory.sheetDifferences = differences;
        await this.updateRangedProgress(100, "Comparison and resolution completed");
    }
    /**
     * Uses the LLM to determine the best/correct value for the specified difference.
     * We supply it with:
     *   1) The original job description text
     *   2) The field in question
     *   3) The different candidate values from each sheet
     * We'll ask the LLM to either pick the best single value or say "Cannot determine".
     */
    async resolveDifferenceWithLLM(originalJD, diff) {
        // Prepare a system prompt.
        // Make sure you’re not injecting user-supplied text as code – sanitize if needed.
        const systemPrompt = `
You are an expert in job description analysis.

We have the following original job description text:
-----------------
${originalJD.text}
-----------------

We also have a mismatch in one of its fields, "${diff.field}",
across multiple sheets that attempted to parse or interpret this job description.

TitleCode: ${diff.titleCode}

Candidate values:
${diff.values
            .map((pair) => `- From sheet "${pair.sheetName}": ${pair.value ?? "(empty)"}`)
            .join("\n")}

Your task:
1) Pick the single best candidate value for the field "${diff.field}" based on the original text and the likely correct interpretation.
2) Provide a short, single-line explanation (why that value is correct).

Output your answer as JSON exactly in the format:

\`\`\`json
{
  "resolvedValue": "<the single best value>",
  "explanation": "<one short sentence explaining your choice>"
}
\`\`\`
If you truly cannot decide, say:
\`\`\`json
{
  "resolvedValue": "Cannot determine",
  "explanation": "There is no basis to choose any value from the text."
}
\`\`\`
    `.trim();
        // Call the LLM
        const messages = [this.createSystemMessage(systemPrompt)];
        // You could adjust model size or temperature here if desired.
        const results = await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Medium, messages, true);
        return {
            resolvedValue: results.resolvedValue || "Cannot determine",
            explanation: results.explanation || "No explanation provided",
        };
    }
}
//# sourceMappingURL=compareSheets.js.map