/**
 * subAgents/analyzeItemThemesAndSentimentAgent.ts
 *
 * Sub-agent #1: Analyzes each participation data item for theme & sentiment.
 */
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAiModelType, PsAiModelSize, } from "@policysynth/agents/aiModelTypes.js";
export class AnalyzeItemThemesAndSentimentAgent extends PolicySynthAgent {
    get reasoningEffort() {
        return "low";
    }
    get modelTemperature() {
        return 0.0;
    }
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
    }
    /**
     * Analyzes each item in memory.participationDataItems for:
     *  - Theme classification
     *  - Sentiment analysis
     */
    async process() {
        const items = this.memory.participationDataItems || [];
        const total = items.length;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            // Simple system prompt example
            const systemPrompt = `You are an expert data analyst.
Given a short text, determine:
1) The theme of the text (make the themes for fun similar as high tech as themes in in Star Trek).
2) A one word sentiment analysis, e.g. "Positive", "Negative", "Neutral", or "Mixed".

Return JSON only:
{
  "theme": "...",
  "sentimentAnalysis": "..."
}`;
            const userPrompt = `Title: ${item.title}
Statement: ${item.statement}
Region: ${item.region}
Profession: ${item.profession}

Please identify the main theme and sentiment and output only the JSON:`;
            // Call the model
            const messages = [
                this.createSystemMessage(systemPrompt),
                this.createHumanMessage(userPrompt),
            ];
            this.logger.debug(JSON.stringify(messages, null, 2));
            // We'll use a small or medium text reasoning model
            let analysisResult;
            try {
                analysisResult = await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Medium, messages, true);
            }
            catch (err) {
                // fallback if JSON parse fails or model call fails
                analysisResult = { theme: "Unknown", sentimentAnalysis: "Unknown" };
            }
            // Save the analysis
            item.analysis = {
                theme: analysisResult.theme,
                sentimentAnalysis: analysisResult.sentimentAnalysis,
            };
            // Update progress
            const progress = ((i + 1) / total) * 100;
            await this.updateRangedProgress(progress, `Analyzed item ${i + 1} of ${total}`);
        }
        // done
        await this.setCompleted("Analysis of themes & sentiment completed");
    }
}
//# sourceMappingURL=analyzeItemThemesAndSentimentAgent.js.map