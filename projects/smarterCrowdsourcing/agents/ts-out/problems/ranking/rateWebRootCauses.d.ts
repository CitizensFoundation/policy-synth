import { ProblemsSmarterCrowdsourcingAgent } from "../../base/scBaseProblemsAgent.js";
import { RootCauseWebPageVectorStore } from "../../vectorstore/rootCauseWebPage.js";
export declare class RateWebRootCausesAgent extends ProblemsSmarterCrowdsourcingAgent {
    rootCauseWebPageVectorStore: RootCauseWebPageVectorStore;
    simplifyRootCauseType(rootCauseType: string): string;
    renderProblemPrompt(rawWebData: PSRootCauseRawWebPageData, rootCausesToRank: string[], rootCauseType: keyof PSRootCauseRawWebPageData): Promise<PsModelMessage[]>;
    rateWebRootCauses(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rateWebRootCauses.d.ts.map