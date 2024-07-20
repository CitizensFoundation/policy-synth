import { BaseSmarterCrowdsourcingAgent } from "../../base/scBaseAgent.js";
import { EvidenceWebPageVectorStore } from "../../vectorstore/evidenceWebPage.js";
export declare class CountWebEvidenceAgent extends BaseSmarterCrowdsourcingAgent {
    evidenceWebPageVectorStore: EvidenceWebPageVectorStore;
    countAll(policy: PSPolicy, subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=countEvidence.d.ts.map