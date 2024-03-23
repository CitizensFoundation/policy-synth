import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class AnalyseExternalSolutions extends BaseProblemSolvingAgent {
    folderPath: string;
    renderAnalysisPrompt(solutionDescription: string, requirement: string): Promise<(HumanMessage | SystemMessage)[]>;
    compareSolutionToExternal(solutionDescription: string, requirement: string): Promise<IEngineExternalSolutionAnalysisResults>;
    analyze(): Promise<void>;
    toCSV(analysisResult: IEngineExternalSolutionAnalysis): string;
    processAnalysis(folderPath: string): Promise<void>;
    saveCSV(analysisResults: IEngineExternalSolutionAnalysis[]): Promise<void>;
}
//# sourceMappingURL=analyseExternalSolutions.d.ts.map