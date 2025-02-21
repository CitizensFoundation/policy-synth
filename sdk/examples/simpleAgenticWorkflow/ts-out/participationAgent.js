/**
 * participationAgent.ts
 *
 * Main agent orchestrating the entire flow:
 *  1) Read data from Yrpri connector
 *  2) Analyze each item for theme & sentiment
 *  3) Generate a summary report of all data
 *  4) Export items (with analysis) to Google Sheets
 *  5) Export the summary report to Google Docs
 */
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
// Make sure PsAgentClassCreationAttributes is imported from the correct place:
import { PsAgentClassCategories } from "@policysynth/agents/agentCategories.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { AnalyzeItemThemesAndSentimentAgent } from "./subAgents/analyzeItemThemesAndSentimentAgent.js";
import { GenerateFullReportAgent } from "./subAgents/generateFullReportAgent.js";
import { SheetsExportParticipationDataAgent } from "./subAgents/sheetsExportParticipationDataAgent.js";
import { DocsExportParticipationDataAgent } from "./subAgents/docsExportParticipationDataAgent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
/**
 * The main agent to orchestrate the entire flow.
 */
export class ParticipationDataAnalysisAgent extends PolicySynthAgent {
    /**
     * -------------------------------------------------------------------
     *  Static Agent Info & Configuration (UUID, version, user-facing Qs)
     * -------------------------------------------------------------------
     */
    /**
     * A unique ID to identify the base class of this agent.
     * Replace with your own stable UUID so that the system can version-control
     * the agent’s class definition.
     */
    static PARTICIPATION_DATA_AGENT_CLASS_BASE_ID = "7bee275a-077b-40da-8f33-a4d8c647edc3";
    /**
     * Increment this whenever you introduce a new version of your agent’s logic.
     */
    static PARTICIPATION_DATA_AGENT_CLASS_VERSION = 1;
    /**
     * Return all metadata needed for the system to register/use this agent class.
     * This follows the same pattern you see in your “DetailedCompetitionAgent” example.
     */
    static getAgentClass() {
        return {
            class_base_id: this.PARTICIPATION_DATA_AGENT_CLASS_BASE_ID,
            user_id: 0,
            name: "Participation Data Analysis",
            version: this.PARTICIPATION_DATA_AGENT_CLASS_VERSION,
            available: true,
            configuration: {
                category: PsAgentClassCategories.DataAnalysis, // Use a suitable category
                subCategory: "participationInsights",
                hasPublicAccess: false,
                description: "An agent for analyzing participation data from Yrpri, applying theme & sentiment analysis, and exporting results.",
                queueName: "PARTICIPATION_DATA_ANALYSIS",
                imageUrl: "https://assets.evoly.ai/ypGenAi/domain/1/4170a8c1-0d30-4d8e-b9a1-0b782c557cb1.png",
                iconName: "participation_data",
                capabilities: ["analysis", "export", "reporting"],
                // The model sizes your agent might request
                requestedAiModelSizes: [
                    PsAiModelSize.Small,
                    PsAiModelSize.Medium,
                    PsAiModelSize.Large
                ],
                // Provide default structured questions for your Yrpri data (like your example)
                defaultStructuredQuestions: this.getDefaultStructuredQuestions(),
                supportedConnectors: [
                    PsConnectorClassTypes.IdeasCollaboration,
                    PsConnectorClassTypes.Document,
                    PsConnectorClassTypes.Spreadsheet
                ],
                // Any extra questions you'd like the user to configure for your agent
                questions: this.getExtraConfigurationQuestions()
            }
        };
    }
    /**
     * If you have additional configuration questions (like “Minimum endorsements”
     * in your competition agent), define them here.
     */
    static getExtraConfigurationQuestions() {
        return [
            {
                uniqueId: "analysisDepth",
                type: "textField",
                subType: "number",
                value: 3,
                maxLength: 3,
                required: true,
                text: "Analysis Depth"
            }
        ];
    }
    /**
     * Default structured question format (mirrors how your example sets it up),
     * so that if your Yrpri connector is using `structuredAnswersJson`,
     * it will know what fields to store/expect.
     */
    static getDefaultStructuredQuestions() {
        return [
            {
                type: "textFieldLong",
                text: "Title",
                maxLength: 1000,
                uniqueId: "title"
            },
            {
                type: "textArea",
                text: "Statement",
                maxLength: 5000,
                uniqueId: "statement"
            },
            {
                type: "textFieldLong",
                text: "Region",
                maxLength: 1000,
                uniqueId: "region"
            },
            {
                type: "textFieldLong",
                text: "Profession",
                maxLength: 1000,
                uniqueId: "profession"
            },
            {
                type: "textFieldLong",
                text: "Theme (Analysis)",
                maxLength: 1000,
                uniqueId: "analysisTheme",
                hiddenToUser: true
            },
            {
                type: "textFieldLong",
                text: "Sentiment (Analysis)",
                maxLength: 1000,
                uniqueId: "analysisSentiment",
                hiddenToUser: true
            }
        ];
    }
    /**
     * -------------------------
     * Constructor & Class Setup
     * -------------------------
     */
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
    }
    getAnswerValue(structuredAnswers, uniqueId) {
        const answer = structuredAnswers.find((ans) => ans.uniqueId === uniqueId);
        console.log(`-----------------------------------> Answer: ${JSON.stringify(answer, null, 2)}`);
        return answer?.value;
    }
    translateStructuredAnswersToItem(structuredAnswers, itemName) {
        const item = {
            title: this.getAnswerValue(structuredAnswers, "title") || "",
            statement: this.getAnswerValue(structuredAnswers, "statement") || "",
            region: this.getAnswerValue(structuredAnswers, "region") || "",
            profession: this.getAnswerValue(structuredAnswers, "profession") || ""
        };
        return item;
    }
    /**
     * -------------------------
     * Main Orchestration Method
     * -------------------------
     *
     *  1) Load data from Yrpri connector
     *  2) Analyze items (sub-agent)
     *  3) Generate summary (sub-agent)
     *  4) Export to Sheets
     *  5) Export to Docs
     */
    async process() {
        // 1) Load data from Yrpri connector
        await this.updateRangedProgress(0, "Loading data from Yrpri connector");
        const yrpriConnectorIn = PsConnectorFactory.getConnector(this.agent, this.memory, PsConnectorClassTypes.IdeasCollaboration, true);
        if (!yrpriConnectorIn) {
            throw new Error("Yrpri (IdeasCollaboration) connector not configured.");
        }
        // Example: read all items from a group.
        // In practice, you'd use connector-specific methods to fetch ideas/posts,
        // possibly returning structuredAnswersJson or a similar shape.
        const groupId = parseInt(yrpriConnectorIn.getConfig("groupId", "0"), 10);
        if (!groupId) {
            throw new Error("Yrpri groupId not set.");
        }
        // Hypothetical method: getGroupPosts(...)
        // Suppose it returns array of objects with { title, statement, region, profession }
        const rawPosts = await yrpriConnectorIn.getGroupPosts(groupId);
        this.logger.debug(JSON.stringify(rawPosts, null, 2));
        this.memory.participationDataItems = [];
        for (const post of rawPosts) {
            const item = this.translateStructuredAnswersToItem(post.public_data.structuredAnswersJson, post.name);
            this.memory.participationDataItems.push(item);
        }
        await this.saveMemory();
        // 2) Analyze themes and sentiment for each data item
        const analyzeAgent = new AnalyzeItemThemesAndSentimentAgent(this.agent, this.memory, 0, 40);
        await analyzeAgent.process();
        await this.saveMemory();
        // 3) Generate a single summary (markdown)
        const reportAgent = new GenerateFullReportAgent(this.agent, this.memory, 40, 60);
        await reportAgent.process();
        await this.saveMemory();
        // 4) Export to Google Sheets
        const sheetsAgent = new SheetsExportParticipationDataAgent(this.agent, this.memory, 60, 80, "Sheet1" // The sheet name or tab name
        );
        await sheetsAgent.process();
        // 5) Export the summary report to Google Docs
        const docsAgent = new DocsExportParticipationDataAgent(this.agent, this.memory, 80, 100);
        await docsAgent.process();
        // Mark done
        await this.setCompleted("Participation data analysis completed");
    }
}
//# sourceMappingURL=participationAgent.js.map