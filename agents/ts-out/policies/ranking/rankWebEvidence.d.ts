import { BaseProblemSolvingAgent } from "../../base/baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { EvidenceWebPageVectorStore } from "../../vectorstore/evidenceWebPage.js";
export declare class RankWebEvidenceProcessor extends BaseProblemSolvingAgent {
    evidenceWebPageVectorStore: EvidenceWebPageVectorStore;
    renderProblemPrompt(subProblemIndex: number | null, policy: PSPolicy, evidenceToRank: string[], evidenceType: keyof PSEvidenceRawWebPageData): Promise<(SystemMessage | HumanMessage)[]>;
    rankWebEvidence(policy: PSPolicy, subProblemIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankWebEvidence.d.ts.map