import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { CreateSeedPoliciesAgent } from "./create/createSeedPolicies.js";
import { CreatePolicyImagesAgent } from "./create/createPolicyImages.js";
import { SearchWebForEvidenceAgent } from "./web/searchWebForEvidence.js";
import { GetEvidenceWebPagesAgent } from "./web/getEvidenceWebPages.js";
import { RankWebEvidenceAgent } from "./ranking/rankWebEvidence.js";
import { RateWebEvidenceAgent } from "./ranking/rateWebEvidence.js";
import { CreateEvidenceSearchQueriesAgent } from "./create/createEvidenceSearchQueries.js";
export declare class PoliciesAgentQueue extends PolicySynthAgentQueue {
    memory: PsSmarterCrowdsourcingMemoryData;
    get agentQueueName(): "smarter_crowdsourcing_policies";
    setupMemoryIfNeeded(): Promise<void>;
    process(): Promise<void>;
    get processors(): ({
        processor: typeof CreateSeedPoliciesAgent;
        weight: number;
    } | {
        processor: typeof CreatePolicyImagesAgent;
        weight: number;
    } | {
        processor: typeof CreateEvidenceSearchQueriesAgent;
        weight: number;
    } | {
        processor: typeof SearchWebForEvidenceAgent;
        weight: number;
    } | {
        processor: typeof GetEvidenceWebPagesAgent;
        weight: number;
    } | {
        processor: typeof RankWebEvidenceAgent;
        weight: number;
    } | {
        processor: typeof RateWebEvidenceAgent;
        weight: number;
    })[];
}
//# sourceMappingURL=policies.d.ts.map