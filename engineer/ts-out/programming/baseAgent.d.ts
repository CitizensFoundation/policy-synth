import { Project } from "ts-morph";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsEngineerAgentBase } from "../agentBase.js";
export declare abstract class PsEngineerBaseProgrammingAgent extends PsEngineerAgentBase {
    memory: PsEngineerMemoryData;
    documentationFilesInContextContent: string | undefined | null;
    currentFileContents: string | undefined | null;
    likelyToChangeFilesContents: string | undefined | null;
    typeDefFilesToKeepInContextContent: string | undefined | null;
    codeFilesToKeepInContextContent: string | undefined | null;
    maxRetries: number;
    currentErrors: string | undefined | null;
    previousCurrentErrors: string | undefined | null;
    tsMorphProject: Project | undefined;
    get maxModelTokensOut(): number;
    get modelTemperature(): number;
    get reasoningEffort(): "low" | "medium" | "high";
    /**
     * Adapted constructor: now uses PolicySynthAgent’s constructor signature.
     */
    constructor(agent: PsAgent, memory: PsEngineerMemoryData, startProgress: number | undefined, endProgress: number | undefined, { typeDefFilesToKeepInContextContent, codeFilesToKeepInContextContent, documentationFilesInContextContent, likelyToChangeFilesContents, tsMorphProject, }: {
        typeDefFilesToKeepInContextContent?: string | null;
        codeFilesToKeepInContextContent?: string | null;
        documentationFilesInContextContent?: string | null;
        likelyToChangeFilesContents?: string | null;
        tsMorphProject?: Project;
    });
    /**
     * A concise set of global constraints and guidelines that apply to all prompts.
     */
    renderGlobalConstraints(): string;
    /**
     * Additional coding guidelines that also appear in the original code.
     */
    renderCodingRules(): string;
    /**
     * Success Criteria for different phases of the conversation:
     *   - plan: A bullet-point plan (no actual code).
     *   - review: Checking the plan for correctness or needed fixes.
     *   - actionPlan: Output a JSON array specifying file changes.
     *   - actionReview: Checking the action plan for correctness or needed fixes.
     */
    renderSuccessCriteria(context: "plan" | "review" | "actionPlan" | "actionReview"): string;
    updateMemoryWithFileContents(fileName: string, content: string): void;
    setOriginalFileIfNeeded(fileName: string, content: string): void;
    getCompletedFileContent(): string | string[];
    setCurrentErrors(errors: string | undefined): void;
    renderCurrentErrorsAndOriginalFiles(): string;
    removeWorkspacePathFromFileIfNeeded(filePath: string): string;
    renderDefaultTaskAndContext(limited?: boolean): string;
    renderProjectDescription(): string;
    renderOriginalFiles(): string;
    loadFileContents(fileName: string): string | null;
    getFileContentsWithFileName(results: PsCodeAnalyzeResults[], xmlTagName: string): string;
}
//# sourceMappingURL=baseAgent.d.ts.map