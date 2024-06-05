import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { WebPageVectorStore } from "../../vectorstore/webPage.js";
export declare class RemoveDuplicateWebSolutions extends BaseProblemSolvingAgent {
    webPageVectorStore: WebPageVectorStore;
    allUrls: Set<string>;
    duplicateUrls: string[];
    constructor(memory: PsBaseMemoryData);
    processSubProblems(): Promise<void>;
    copyEntitySolutionsToSubProblem(subProblemIndex: number): Promise<void>;
    processProblemStatement(): Promise<void>;
    processAll(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=dedupWebSolutions.d.ts.map