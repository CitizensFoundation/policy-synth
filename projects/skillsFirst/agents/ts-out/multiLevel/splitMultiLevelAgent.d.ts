import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
/**
 * SplitMultiLevelJobDescriptionAgent uses an LLM prompt to detect and split a job description
 * into separate sub-levels (e.g., "Level 1", "Level 2", etc.). The output is a JSON array
 * of objects where each object contains the level number and the corresponding text.
 */
export declare class SplitMultiLevelJobDescriptionAgent extends PolicySynthAgent {
    memory: JobDescriptionMemoryData;
    modelSize: PsAiModelSize;
    modelType: PsAiModelType;
    get maxModelTokensOut(): number;
    get modelTemperature(): number;
    get reasoningEffort(): "low" | "medium" | "high";
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number);
    /**
     * Processes the provided job description and returns an array of splits.
     *
     * The expected output from the LLM is a JSON array of objects, each with:
     *  - "level": number (e.g., 1, 2, etc.)
     *  - "text": string (the text for that level)
     *
     * If no level markers are found, the agent returns a single object with level 1.
     */
    processJobDescription(jobDescription: JobDescription): Promise<{
        level: number;
        text: string;
    }[]>;
}
//# sourceMappingURL=splitMultiLevelAgent.d.ts.map