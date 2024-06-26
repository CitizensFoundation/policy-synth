import { BaseSmarterCrowdsourcingAgent } from "../../baseAgent.js";
import { EvidenceWebPageVectorStore } from "../../../vectorstore/evidenceWebPage.js";
export declare class CountWebEvidenceProcessor extends BaseSmarterCrowdsourcingAgent {
    evidenceWebPageVectorStore: EvidenceWebPageVectorStore;
    countAll(policy: PSPolicy, subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=countEvidence.d.ts.map