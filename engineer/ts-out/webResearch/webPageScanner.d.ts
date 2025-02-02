import { GetWebPagesBaseAgent } from "@policysynth/agents/webResearch/getWebPagesBase.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
/**
 * Possible types of web research this agent performs
 */
export type PsEngineerWebResearchTypes = "documentation" | "codeExamples" | "solutionsForErrors";
/**
 * WebPageScanner merges the logic from your older “WebPageScanner” example
 * but uses the structure from your first snippet (PolicySynthAgent-based).
 */
export declare class WebPageScanner extends GetWebPagesBaseAgent {
    memory: PsEngineerMemoryData;
    scanType?: PsEngineerWebResearchTypes;
    instructions: string;
    collectedWebPages: any[];
    totalPagesSave: number;
    /**
     * We override the modelTemperature from the base agent if needed
     */
    get modelTemperature(): number;
    get maxModelTokensOut(): number;
    get reasoningEffort(): "low" | "medium" | "high";
    constructor(agent: PsAgent, memory: PsEngineerMemoryData, startProgress: number, endProgress: number, instructions: string);
    /**
     * A helper to sanitize text (kept from your old snippet).
     */
    sanitizeInput(text: string): string;
    /**
     * Render the scanning prompt, adjusting based on the scanType
     */
    renderScanningPrompt(text: string): PsModelMessage[];
    /**
     * This is analogous to processPageAnalysis in your first snippet:
     * it calls the model with the scanning prompt.
     */
    processPageAnalysis(text: string): Promise<any>;
    /**
     * For each page, decide if it's PDF or HTML, fetch text, then do AI analysis
     */
    analyzeSinglePage(url: string): Promise<void>;
    /**
     * Main scanning method — uses concurrency with p-limit (like your first snippet).
     */
    scan(listOfUrls: string[], scanType: PsEngineerWebResearchTypes, currentCountStatus: {
        currentCount: number;
        totalCount: number;
    }): Promise<{
        fromUrl: string;
        analysis: string;
    }[]>;
}
//# sourceMappingURL=webPageScanner.d.ts.map