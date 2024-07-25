import { SearchWebAgent } from "../../solutions/web/searchWeb.js";
export declare class SearchWebForEvidenceAgent extends SearchWebAgent {
    searchCounter: number;
    searchWeb(policy: PSPolicy, subProblemIndex: number, policyIndex: number): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=searchWebForEvidence.d.ts.map