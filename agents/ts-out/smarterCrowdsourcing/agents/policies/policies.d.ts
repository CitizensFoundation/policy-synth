import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
import { CreateSeedPoliciesProcessor } from "./create/createSeedPolicies.js";
import { CreatePolicyImagesProcessor } from "./create/createPolicyImages.js";
import { SearchWebForEvidenceProcessor } from "./web/searchWebForEvidence.js";
import { GetEvidenceWebPagesProcessor } from "./web/getEvidenceWebPages.js";
import { RankWebEvidenceProcessor } from "./ranking/rankWebEvidence.js";
import { RateWebEvidenceProcessor } from "./ranking/rateWebEvidence.js";
import { CreateEvidenceSearchQueriesAgent } from "./create/createEvidenceSearchQueries.js";
export declare class PoliciesAgent extends PolicySynthAgentQueue {
    memory: PsSmarterCrowdsourcingMemoryData;
    get agentQueueName(): "smarter_crowdsourcing_policies";
    process(): Promise<void>;
    get processors(): ({
        processor: typeof CreateSeedPoliciesProcessor;
        weight: number;
    } | {
        processor: typeof CreatePolicyImagesProcessor;
        weight: number;
    } | {
        processor: typeof CreateEvidenceSearchQueriesAgent;
        weight: number;
    } | {
        processor: typeof SearchWebForEvidenceProcessor;
        weight: number;
    } | {
        processor: typeof GetEvidenceWebPagesProcessor;
        weight: number;
    } | {
        processor: typeof RankWebEvidenceProcessor;
        weight: number;
    } | {
        processor: typeof RateWebEvidenceProcessor;
        weight: number;
    })[];
}
//# sourceMappingURL=policies.d.ts.map