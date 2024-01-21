import { BaseProcessor } from "../../baseProcessor.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { RootCauseWebPageVectorStore } from "../../vectorstore/rootCauseWebPage.js";
export declare class RankWebRootCausesProcessor extends BaseProcessor {
    rootCauseWebPageVectorStore: RootCauseWebPageVectorStore;
    renderProblemPrompt(rootCausesToRank: string[], rootCauseType: keyof PSRootCauseRawWebPageData): Promise<(SystemMessage | HumanMessage)[]>;
    rankWebRootCauses(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankWebRootCauses.d.ts.map