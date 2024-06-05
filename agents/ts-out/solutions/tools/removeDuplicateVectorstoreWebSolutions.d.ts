import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { WebPageVectorStore } from "../../vectorstore/webPage.js";
export declare class RemoveDuplicateWebSolutions extends BaseProblemSolvingAgent {
    webPageVectorStore: WebPageVectorStore;
    allUrls: Set<string>;
    duplicateUrls: string[];
    constructor(memory: PsBaseMemoryData);
    removeDuplicates(subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=removeDuplicateVectorstoreWebSolutions.d.ts.map