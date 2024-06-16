import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { WebPageVectorStore } from "../../vectorstore/webPage.js";
export declare class RemoveDuplicateWebSolutions extends BaseProblemSolvingAgent {
    webPageVectorStore: WebPageVectorStore;
    allUrls: Set<string>;
    duplicateUrls: string[];
    renderMessages(solutions: PsSolution[]): (HumanMessage | SystemMessage)[];
    dedup(solutions: PsSolution[]): Promise<PsSolution[]>;
    processSubProblems(): Promise<void>;
    copyEntitySolutionsToSubProblem(subProblemIndex: number): Promise<void>;
    processProblemStatement(): Promise<void>;
    processAll(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=dedupWebSolutions.d.ts.map