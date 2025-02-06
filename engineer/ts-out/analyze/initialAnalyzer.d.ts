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
    analyzeFilesForInitialTextReview(filePaths: string[], fileType: string): Promise<PsInitialCodeAnalysisTextReview[]>;
    finalizeFileAnalysis(textReviews: {
        fileName: string;
        initialCodeAnalysisForTask: string;
    }[], fileType: string): Promise<PsCodeAnalyzeResults[]>;
    /**
     * Reads the specified list of file paths from disk, returning a combined string
     * of the contents for reference. (Used for assembling context in memory.)
     */
    getFilesContents(analysisResults: PsCodeAnalyzeResults[]): string;
    analyzeAndSetup(): Promise<void>;
}
//# sourceMappingURL=initialAnalyzer.d.ts.map