import { BaseProcessor } from "../../baseProcessor.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { WebPageVectorStore } from "../../vectorstore/webPage.js";
export declare class RankWebSolutionsProcessor extends BaseProcessor {
    webPageVectorStore: WebPageVectorStore;
    renderProblemPrompt(solutionsToRank: string[], subProblemIndex: number | null): Promise<(HumanMessage | SystemMessage)[]>;
    rankWebSolutions(subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankWebSolutions.d.ts.map