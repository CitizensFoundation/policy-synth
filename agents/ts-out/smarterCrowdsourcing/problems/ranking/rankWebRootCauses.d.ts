import { BaseSmarterCrowdsourcingAgent } from "../../baseAgent.js";
import { RootCauseWebPageVectorStore } from "../../../vectorstore/rootCauseWebPage.js";
export declare class RankWebRootCausesProcessor extends BaseSmarterCrowdsourcingAgent {
    rootCauseWebPageVectorStore: RootCauseWebPageVectorStore;
    renderProblemPrompt(rootCausesToRank: string[], rootCauseType: keyof PSRootCauseRawWebPageData): Promise<PsModelMessage[]>;
    rankWebRootCauses(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankWebRootCauses.d.ts.map