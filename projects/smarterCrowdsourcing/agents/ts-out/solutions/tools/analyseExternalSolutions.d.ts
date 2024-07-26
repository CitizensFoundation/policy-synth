import { SolutionsEvolutionSmarterCrowdsourcingAgent } from "../../base/scBaseSolutionsEvolutionAgent.js";
export declare class AnalyseExternalSolutions extends SolutionsEvolutionSmarterCrowdsourcingAgent {
    folderPath: string;
    renderAnalysisPrompt(solutionDescription: string, requirement: string): Promise<PsModelMessage[]>;
    compareSolutionToExternal(solutionDescription: string, requirement: string): Promise<PsExternalSolutionAnalysisResults>;
    analyze(): Promise<void>;
    toCSV(analysisResult: PsExternalSolutionAnalysis): string;
    processAnalysis(folderPath: string): Promise<void>;
    saveCSV(analysisResults: PsExternalSolutionAnalysis[]): Promise<void>;
}
//# sourceMappingURL=analyseExternalSolutions.d.ts.map