import { BaseProcessor } from "../../baseProcessor.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { EvidenceWebPageVectorStore } from "../../vectorstore/evidenceWebPage.js";
export declare class RateWebEvidenceProcessor extends BaseProcessor {
    evidenceWebPageVectorStore: EvidenceWebPageVectorStore;
    simplifyEvidenceType(evidenceType: string): string;
    renderProblemPrompt(subProblemIndex: number | null, policy: PSPolicy, rawWebData: PSEvidenceRawWebPageData, evidenceToRank: string[], evidenceType: keyof PSEvidenceRawWebPageData): Promise<(SystemMessage | HumanMessage)[]>;
    rateWebEvidence(policy: PSPolicy, subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rateWebEvidence.d.ts.map