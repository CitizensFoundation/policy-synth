import { BaseSmarterCrowdsourcingAgent } from "../../base/scBaseAgent.js";
import { EvidenceWebPageVectorStore } from "../../vectorstore/evidenceWebPage.js";
export declare class RankWebEvidenceAgent extends BaseSmarterCrowdsourcingAgent {
    evidenceWebPageVectorStore: EvidenceWebPageVectorStore;
    modelTemperature: number;
    renderProblemPrompt(subProblemIndex: number | null, policy: PSPolicy, evidenceToRank: string[], evidenceType: keyof PSEvidenceRawWebPageData): Promise<PsModelMessage[]>;
    rankWebEvidence(policy: PSPolicy, subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankWebEvidence.d.ts.map