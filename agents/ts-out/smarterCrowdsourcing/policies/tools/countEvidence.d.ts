import { BaseProblemSolvingAgent } from "../../../base/baseProblemSolvingAgent.js";
import { EvidenceWebPageVectorStore } from "../../../vectorstore/evidenceWebPage.js";
export declare class CountWebEvidenceProcessor extends BaseProblemSolvingAgent {
    evidenceWebPageVectorStore: EvidenceWebPageVectorStore;
    countAll(policy: PSPolicy, subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=countEvidence.d.ts.map