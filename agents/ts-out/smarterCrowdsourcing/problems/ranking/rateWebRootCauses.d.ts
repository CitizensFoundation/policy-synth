import { BaseSmarterCrowdsourcingAgent } from "../../baseAgent.js";
import { RootCauseWebPageVectorStore } from "../../../vectorstore/rootCauseWebPage.js";
export declare class RateWebRootCausesProcessor extends BaseSmarterCrowdsourcingAgent {
    rootCauseWebPageVectorStore: RootCauseWebPageVectorStore;
    simplifyRootCauseType(rootCauseType: string): string;
    renderProblemPrompt(rawWebData: PSRootCauseRawWebPageData, rootCausesToRank: string[], rootCauseType: keyof PSRootCauseRawWebPageData): Promise<PsModelMessage[]>;
    rateWebRootCauses(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rateWebRootCauses.d.ts.map