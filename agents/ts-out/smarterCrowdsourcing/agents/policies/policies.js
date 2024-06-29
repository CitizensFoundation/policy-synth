import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
import { CreateSeedPoliciesProcessor } from "./create/createSeedPolicies.js";
import { CreatePolicyImagesProcessor } from "./create/createPolicyImages.js";
import { SearchWebForEvidenceProcessor } from "./web/searchWebForEvidence.js";
import { GetEvidenceWebPagesProcessor } from "./web/getEvidenceWebPages.js";
import { RankWebEvidenceProcessor } from "./ranking/rankWebEvidence.js";
import { RateWebEvidenceProcessor } from "./ranking/rateWebEvidence.js";
import { GetRefinedEvidenceProcessor } from "./web/getRefinedEvidence.js";
import { GetMetaDataForTopWebEvidenceProcessor } from "./web/getMetaDataForTopWebEvidence.js";
import { CreateEvidenceSearchQueriesAgent } from "./create/createEvidenceSearchQueries.js";
export class PoliciesAgent extends PolicySynthAgentQueue {
    get agentQueueName() {
        return PsClassScAgentType.SMARTER_CROWDSOURCING_POLICIES;
    }
    async process() {
        await this.processAllAgents();
    }
    get processors() {
        return [
            { processor: CreateSeedPoliciesProcessor, weight: 15 },
            { processor: CreatePolicyImagesProcessor, weight: 10 },
            { processor: CreateEvidenceSearchQueriesAgent, weight: 10 },
            { processor: SearchWebForEvidenceProcessor, weight: 15 },
            { processor: GetEvidenceWebPagesProcessor, weight: 15 },
            { processor: RankWebEvidenceProcessor, weight: 10 },
            { processor: RateWebEvidenceProcessor, weight: 10 },
            { processor: GetRefinedEvidenceProcessor, weight: 10 },
            { processor: GetMetaDataForTopWebEvidenceProcessor, weight: 10 },
        ];
    }
}
//# sourceMappingURL=policies.js.map