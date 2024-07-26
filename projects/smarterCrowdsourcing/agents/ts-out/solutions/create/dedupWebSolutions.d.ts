import { SolutionsEvolutionSmarterCrowdsourcingAgent } from "../../base/scBaseSolutionsEvolutionAgent.js";
import { WebPageVectorStore } from "../../vectorstore/webPage.js";
export declare class RemoveDuplicateWebSolutions extends SolutionsEvolutionSmarterCrowdsourcingAgent {
    webPageVectorStore: WebPageVectorStore;
    allUrls: Set<string>;
    duplicateUrls: string[];
    renderMessages(solutions: PsSolution[]): PsModelMessage[];
    dedup(solutions: PsSolution[]): Promise<PsSolution[]>;
    processSubProblems(): Promise<void>;
    copyEntitySolutionsToSubProblem(subProblemIndex: number): Promise<void>;
    processProblemStatement(): Promise<void>;
    processAll(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=dedupWebSolutions.d.ts.map