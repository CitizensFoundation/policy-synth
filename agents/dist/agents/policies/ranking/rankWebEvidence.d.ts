import { BaseProcessor } from "../../baseProcessor.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { EvidenceWebPageVectorStore } from "../../vectorstore/evidenceWebPage.js";
export declare class RankWebEvidenceProcessor extends BaseProcessor {
    evidenceWebPageVectorStore: EvidenceWebPageVectorStore;
    renderProblemPrompt(subProblemIndex: number | null, policy: PSPolicy, evidenceToRank: string[], evidenceType: keyof PSEvidenceRawWebPageData): Promise<(SystemMessage | HumanMessage)[]>;
    rankWebEvidence(policy: PSPolicy, subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankWebEvidence.d.ts.map