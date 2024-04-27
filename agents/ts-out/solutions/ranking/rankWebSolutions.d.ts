import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { WebPageVectorStore } from "../../vectorstore/webPage.js";
export declare class RankWebSolutionsProcessor extends BaseProblemSolvingAgent {
    webPageVectorStore: WebPageVectorStore;
    allUrls: Set<string>;
    duplicateUrls: string[];
    renderProblemPrompt(solutionsToRank: string[], subProblemIndex: number | null): Promise<(SystemMessage | HumanMessage)[]>;
    rankWebSolutions(subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankWebSolutions.d.ts.map