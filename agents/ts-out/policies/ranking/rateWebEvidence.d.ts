import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { EvidenceWebPageVectorStore } from "../../vectorstore/evidenceWebPage.js";
export declare class RateWebEvidenceProcessor extends BaseProblemSolvingAgent {
    evidenceWebPageVectorStore: EvidenceWebPageVectorStore;
    simplifyEvidenceType(evidenceType: string): string;
    renderProblemPrompt(subProblemIndex: number | null, policy: PSPolicy, rawWebData: PSEvidenceRawWebPageData, evidenceToRank: string[], evidenceType: keyof PSEvidenceRawWebPageData): Promise<(HumanMessage | SystemMessage)[]>;
    rateWebEvidence(policy: PSPolicy, subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rateWebEvidence.d.ts.map