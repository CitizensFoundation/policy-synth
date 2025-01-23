import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { SheetsJobDescriptionImportAgent } from "../imports/sheetsImport.js";
import { PsAiModelType, PsAiModelSize, } from "@policysynth/agents/aiModelTypes.js";
import { PsAgentClassCategories } from "@policysynth/agents/agentCategories.js";
/**
 * The main agent that compares multiple sets of job descriptions
 * imported from all spreadsheet connectors
 * and attempts to mark which connectors are correct on mismatched fields.
 */
export class SheetsComparisonAgent extends PolicySynthAgent {
    static JOB_DESCRIPTION_COMPARE_SHEETS_AGENT_CLASS_BASE_ID = "fefe1e19-aefa-4636-bcbd-f4adc17bbad4";
    static JOB_DESCRIPTION_COMPARE_SHEETS_AGENT_CLASS_VERSION = 1;
    get reasoningEffort() {
        return "high";
    }
    /**
     * A structure to track how many times each connector is chosen as correct
     * for each field. Shape is:
     *
     *  winsCount = {
     *    [connectorName]: { [fieldName]: number }
     *  }
     */
    winsCount = {};
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
    }
    static getAgentClass() {
        return {
            class_base_id: this.JOB_DESCRIPTION_COMPARE_SHEETS_AGENT_CLASS_BASE_ID,
            user_id: 0,
            name: "Job Description Compare Sheets Agent",
            version: this.JOB_DESCRIPTION_COMPARE_SHEETS_AGENT_CLASS_VERSION,
            available: true,
            configuration: {
                category: PsAgentClassCategories.DataAnalysis,
                subCategory: "jobDescriptionCompareSheets",
                hasPublicAccess: false,
                description: "An agent for comparing job descriptions across all available spreadsheet connectors",
                queueName: "JOB_DESCRIPTION_COMPARE_SHEETS",
                imageUrl: "https://aoi-storage-production.citizens.is/ypGenAi/community/1/71844202-56ce-4139-88e2-1cfcab0dd59f.png",
                iconName: "job_description_compare_sheets",
                capabilities: ["analysis", "text processing"],
                requestedAiModelSizes: [
                    PsAiModelSize.Small,
                    PsAiModelSize.Medium,
                    PsAiModelSize.Large,
                ],
                defaultStructuredQuestions: [
                    {
                        uniqueId: "maxNumSheets",
                        type: "textField",
                        subType: "number",
                        value: 10,
                        maxLength: 4,
                        required: true,
                        text: "Maximum number of connectors to compare",
                    },
                ],
                supportedConnectors: [],
                questions: this.getConfigurationQuestions(),
            },
        };
    }
    /**
     * Returns a list of questions (configuration fields) for this agent.
     */
    static getConfigurationQuestions() {
        return [
            // How many job descriptions to process
            {
                uniqueId: "numJobDescriptions",
                type: "textField",
                subType: "number",
                value: 10,
                maxLength: 4,
                required: true,
                text: "Number of job descriptions to analyze",
            },
        ];
    }
    // Decide which fields you want to compare
    fieldsToCheck = [
        "degreeAnalysis.needsCollegeDegree",
        "degreeAnalysis.degreeRequirementStatus.isDegreeMandatory",
        "degreeAnalysis.degreeRequirementStatus.hasAlternativeQualifications",
        "degreeAnalysis.degreeRequirementStatus.multipleQualificationPaths",
        "degreeAnalysis.degreeRequirementStatus.isDegreeAbsolutelyRequired",
        "degreeAnalysis.degreeRequirementStatus.substitutionPossible",
        "degreeAnalysis.professionalLicenseRequirement.isLicenseRequired",
        "degreeAnalysis.professionalLicenseRequirement.includesDegreeRequirement",
        "readingLevelUSGradeAnalysisP2.usGradeLevelReadability",
        "readingLevelUSGradeAnalysisP2.difficultPassages"
    ];
    getNestedValue(obj, path) {
        return path.split('.').reduce((acc, key) => acc?.[key], obj);
    }
    /**
     * Main process method:
     *  1) Import job descriptions from *all* spreadsheet connectors
     *  2) Compare relevant fields across connectors
     *  3) For each difference, invoke the LLM to see which connectors are correct
     *  4) Track "wins" for all correct connectors
     */
    async process() {
        await this.updateRangedProgress(0, "Starting comparison from all connectors");
        // 1) Import from ALL spreadsheet connectors
        const importAgent = new SheetsJobDescriptionImportAgent(this.agent, this.memory, 0, 0);
        const allImportedResults = await importAgent.importJobDescriptionsFromAllConnectors();
        // The result is an array of { jobDescriptions: JobDescription[], connectorName: string }
        const allImportedData = {};
        for (const result of allImportedResults) {
            const connectorName = result.connectorName ?? "UnnamedConnector";
            const data = result.jobDescriptions || [];
            allImportedData[connectorName] = data;
            this.logger.info(`Imported ${data.length} job descriptions from connector "${connectorName}".`);
        }
        // 2) Collect all unique titleCodes across all connectors
        const allTitleCodes = new Set();
        for (const connectorName of Object.keys(allImportedData)) {
            allImportedData[connectorName].forEach((jd) => {
                if (jd.titleCode)
                    allTitleCodes.add(jd.titleCode);
            });
        }
        // 3) Compare each relevant field for each titleCode across the connectors
        const differences = [];
        let count = 0;
        const total = allTitleCodes.size;
        for (const titleCode of allTitleCodes) {
            count++;
            await this.updateRangedProgress((count / total) * 50, `Comparing row ${count} of ${total}`);
            // Gather the JobDescription objects from each connector that has this titleCode
            const rowDataPerConnector = {};
            for (const connectorName of Object.keys(allImportedData)) {
                const match = allImportedData[connectorName].find((d) => d.titleCode === titleCode);
                if (match) {
                    rowDataPerConnector[connectorName] = match;
                }
            }
            // If only one connector has this titleCode, there's no conflict to compare
            if (Object.keys(rowDataPerConnector).length <= 1) {
                continue;
            }
            // Compare each field
            for (const field of this.fieldsToCheck) {
                const allValues = new Set();
                const connectorValuePairs = [];
                for (const connectorName of Object.keys(rowDataPerConnector)) {
                    const jd = rowDataPerConnector[connectorName];
                    if (!jd)
                        continue;
                    const rawVal = this.getNestedValue(jd, field);
                    const valStr = rawVal === undefined ? undefined : String(rawVal);
                    allValues.add(valStr);
                    connectorValuePairs.push({ connectorName, value: valStr });
                    //this.logger.info(`Field: ${field}, Value: ${valStr}`);
                }
                // If more than one distinct value, we have a difference
                if (allValues.size > 1) {
                    differences.push({
                        titleCode,
                        field,
                        values: connectorValuePairs,
                    });
                }
            }
        }
        // 4) For each difference, let the LLM tell us which connectors' values are correct
        let diffCount = 0;
        for (const diff of differences) {
            diffCount++;
            await this.updateRangedProgress(50 + (diffCount / differences.length) * 25, `Resolving differences ${diffCount} of ${differences.length}`);
            const originalJD = this.memory.jobDescriptions?.find((jd) => jd.titleCode === diff.titleCode);
            if (!originalJD) {
                this.logger.warn(`No original job description in memory for titleCode=${diff.titleCode}. Skipping LLM resolution.`);
                continue;
            }
            try {
                const { correctConnectorNames, explanation } = await this.resolveDifferenceWithLLM(originalJD, diff);
                // Store results
                diff.correctConnectorNames = correctConnectorNames;
                diff.resolutionExplanation = explanation;
                // Increment a "correctness" counter for *each* correct connector
                if (correctConnectorNames.length > 0) {
                    for (const connector of correctConnectorNames) {
                        this.incrementWinCounter(connector, diff.field);
                    }
                    this.logger.info(`titleCode=${diff.titleCode}, field=${diff.field}, correct connectors: ${correctConnectorNames.join(", ")}`);
                }
                else {
                    this.logger.info(`titleCode=${diff.titleCode}, field=${diff.field}, LLM could not determine any correct connectors`);
                }
            }
            catch (err) {
                this.logger.error(`Error resolving difference for titleCode=${diff.titleCode}, field=${diff.field}: ${err.message}`);
            }
        }
        // After all differences are processed, log final stats
        this.logger.info(`Total differences found: ${differences.length}`);
        const differencesWithResolution = differences.filter((d) => d.correctConnectorNames).length;
        this.logger.info(`Differences with LLM identifying correctness: ${differencesWithResolution}`);
        // Finally, log or store the "winsCount" stats by connector & field
        this.logger.info("Final correctness counts by connector & field:");
        for (const connector of Object.keys(this.winsCount)) {
            const fieldCounts = this.winsCount[connector];
            this.logger.info(`Connector: ${connector}`);
            for (const field of Object.keys(fieldCounts)) {
                this.logger.info(`   Field "${field}": ${fieldCounts[field]} correct`);
            }
        }
        const tableData = differences.map((diff) => {
            return {
                titleCode: diff.titleCode,
                field: diff.field,
                // Join connector:value pairs for quick reference
                parsedValues: diff.values
                    .map((v) => `${v.connectorName}=${v.value ?? "(empty)"}`)
                    .join("; "),
                correctConnectors: diff.correctConnectorNames?.join(", ") || "",
                explanation: diff.resolutionExplanation || "",
            };
        });
        // If your runtime supports console.table, you can do:
        // console.table(tableData);
        // Otherwise, you can print manually:
        this.logger.info("Differences Table:");
        for (const row of tableData) {
            this.logger.info(`• titleCode=${row.titleCode}, field="${row.field}", values=[${row.parsedValues}], correct=[${row.correctConnectors}], explanation="${row.explanation}"`);
        }
        // Optionally store or export differences and the aggregated wins
        // this.memory.sheetDifferences = differences;
        // this.memory.sheetWinsCount = this.winsCount;
        await this.updateRangedProgress(100, "Comparison and resolution completed");
    }
    /**
     * Increment the counter for a given connector and field.
     */
    incrementWinCounter(connectorName, field) {
        if (!this.winsCount[connectorName]) {
            this.winsCount[connectorName] = {};
        }
        if (!this.winsCount[connectorName][field]) {
            this.winsCount[connectorName][field] = 0;
        }
        this.winsCount[connectorName][field]++;
    }
    /**
     * Uses the LLM to determine which connectors are correct for the specified difference.
     */
    async resolveDifferenceWithLLM(originalJD, diff) {
        const systemPrompt = `<JobDescription>
${originalJD.text}
</JobDescription>

<TitleCode>
${diff.titleCode}
</TitleCode>

You are an expert in job description analysis.

We have a mismatch in the field
<FieldWithMismatch>
${diff.field}
</FieldWithMismatch>

<CandidateValues>
${diff.values
            .map((pair) => `<ValueFromConnector name="${pair.connectorName}">${pair.value ?? "(empty)"}</ValueFromConnector>\n`)
            .join("\n")}
</CandidateValues>

Your task:
1) For each connector, decide if the candidate value is correct or incorrect
   based on the original text and the likely correct interpretation.
2) Any number of connectors can be correct (including zero or all).
3) Provide a short, single-line explanation.

Output your answer **exactly** as JSON in the format:

\`\`\`json
{
  "field": "<field name>",
  "correctConnectors": [
    {
      "connectorName": "<connector A>",
      "fieldValue": "<value from connector A>"
    },
    {
      "connectorName": "<connector B>",
      "fieldValue": "<value from connector B>"
    }
  ],
  "incorrectConnectors": [
    {
      "connectorName": "<connector C>",
      "fieldValue": "<value from connector C>"
    }
  ],
  "explanation": "<one short sentence explaining your choice>"
}
\`\`\`

If you cannot determine correctness for any connector, output an empty array:
\`\`\`json
{
  "field": "<field name>",
  "correctConnectorNames": [],
  "incorrectConnectors": [],
  "explanation": "Cannot determine correctness for any connector."
}
\`\`\`
`.trim();
        const messages = [this.createSystemMessage(systemPrompt)];
        //this.logger.debug(JSON.stringify(messages, null, 2));
        const result = (await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Medium, messages, true));
        this.logger.info(`Result: ${JSON.stringify(result, null, 2)}`);
        // Provide safe defaults
        return result;
    }
}
//# sourceMappingURL=compareSheets.js.map