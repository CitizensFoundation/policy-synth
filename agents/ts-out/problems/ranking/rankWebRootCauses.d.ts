import { BaseProlemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { RootCauseWebPageVectorStore } from "../../vectorstore/rootCauseWebPage.js";
export declare class RankWebRootCausesProcessor extends BaseProlemSolvingAgent {
    rootCauseWebPageVectorStore: RootCauseWebPageVectorStore;
    renderProblemPrompt(rootCausesToRank: string[], rootCauseType: keyof PSRootCauseRawWebPageData): Promise<(HumanMessage | SystemMessage)[]>;
    rankWebRootCauses(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankWebRootCauses.d.ts.map