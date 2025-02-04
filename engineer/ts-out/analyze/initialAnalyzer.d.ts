import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsEngineerAgentBase } from "../agentBase.js";
export declare class PsEngineerInitialAnalyzer extends PsEngineerAgentBase {
    memory: PsEngineerMemoryData;
    get maxModelTokensOut(): number;
    get modelTemperature(): number;
    get reasoningEffort(): "low" | "medium" | "high";
    constructor(agent: PsAgent, memory: PsEngineerMemoryData, startProgress: number, endProgress: number);
    readNpmDependencies(): any;
    get analyzeSystemPrompt(): string;
    analyzeUserPrompt(allNpmPackageDependencies: string[], allDocumentationFiles: string[]): string;
    getFilesContents(filePaths: string[]): string;
    /**
     * A generalized method that filters a list of files by relevance
     * using an LLM. By default, if the LLM output does not explicitly
     * say "Not Relevant", the file is retained ("err on the side of including").
     *
     * @param filePaths - The files to be evaluated
     * @param userTaskInstructions - The high-level instructions / context for relevance
     * @param typeLabel - A label to include in logs or prompts (e.g. "documentation", "type definitions", "code")
     * @param systemPromptOverload - Optional system prompt override
     * @param userPromptOverload - Optional user prompt override
     * @returns A Promise resolving to an array of relevant file paths
     */
    filterFilesByRelevance(filePaths: string[], userTaskInstructions: string, typeLabel: string, systemPromptOverload?: string, userPromptOverload?: string): Promise<string[]>;
    analyzeAndSetup(): Promise<void>;
}
//# sourceMappingURL=initialAnalyzer.d.ts.map