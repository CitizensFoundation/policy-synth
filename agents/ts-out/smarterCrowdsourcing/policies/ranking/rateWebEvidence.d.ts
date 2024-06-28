import { BaseSmarterCrowdsourcingAgent } from "../../scBaseAgent.js";
import { EvidenceWebPageVectorStore } from "../../../vectorstore/evidenceWebPage.js";
export declare class RateWebEvidenceProcessor extends BaseSmarterCrowdsourcingAgent {
    evidenceWebPageVectorStore: EvidenceWebPageVectorStore;
    modelTemperature: number;
    simplifyEvidenceType(evidenceType: string): string;
    renderProblemPrompt(subProblemIndex: number | null, policy: PSPolicy, rawWebData: PSEvidenceRawWebPageData, evidenceToRank: string[], evidenceType: keyof PSEvidenceRawWebPageData): Promise<PsModelMessage[]>;
    rateWebEvidence(policy: PSPolicy, subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rateWebEvidence.d.ts.map