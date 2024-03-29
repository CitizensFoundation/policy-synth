import { BaseProlemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
export declare class AnalyseExternalSolutions extends BaseProlemSolvingAgent {
    folderPath: string;
    renderAnalysisPrompt(solutionDescription: string, requirement: string): Promise<(SystemMessage | HumanMessage)[]>;
    compareSolutionToExternal(solutionDescription: string, requirement: string): Promise<IEngineExternalSolutionAnalysisResults>;
    analyze(): Promise<void>;
    toCSV(analysisResult: IEngineExternalSolutionAnalysis): string;
    processAnalysis(folderPath: string): Promise<void>;
    saveCSV(analysisResults: IEngineExternalSolutionAnalysis[]): Promise<void>;
}
//# sourceMappingURL=analyseExternalSolutions.d.ts.map