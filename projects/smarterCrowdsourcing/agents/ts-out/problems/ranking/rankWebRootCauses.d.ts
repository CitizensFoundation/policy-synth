import { ProblemsSmarterCrowdsourcingAgent } from "../../base/scBaseProblemsAgent.js";
import { RootCauseWebPageVectorStore } from "../../vectorstore/rootCauseWebPage.js";
export declare class RankWebRootCausesAgent extends ProblemsSmarterCrowdsourcingAgent {
    rootCauseWebPageVectorStore: RootCauseWebPageVectorStore;
    renderProblemPrompt(rootCausesToRank: string[], rootCauseType: keyof PSRootCauseRawWebPageData): Promise<PsModelMessage[]>;
    rankWebRootCauses(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankWebRootCauses.d.ts.map