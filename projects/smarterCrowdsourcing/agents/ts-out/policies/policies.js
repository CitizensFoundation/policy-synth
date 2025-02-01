import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { PsClassScAgentType } from "../base/agentTypes.js";
import { emptySmarterCrowdsourcingMemory } from "../base/emptyMemory.js";
import { PoliciesSheetsExportAgent } from "./export/evidenceSheets.js";
export class PoliciesAgentQueue extends PolicySynthAgentQueue {
    get agentQueueName() {
        return PsClassScAgentType.SMARTER_CROWDSOURCING_POLICIES;
    }
    async setupMemoryIfNeeded(agentId) {
        if (!this.memory || !this.memory.subProblems) {
            this.logger.info(`Setting up memory for agent ${agentId}`);
            const psAgent = await this.getOrCreatePsAgent(agentId);
            this.memory = emptySmarterCrowdsourcingMemory(psAgent.group_id, psAgent.id);
        }
    }
    get processors() {
        return [
            //  { processor: CreateSeedPoliciesAgent, weight: 15 },
            //  { processor: CreatePolicyImagesAgent, weight: 10 },
            //  { processor: CreateEvidenceSearchQueriesAgent, weight: 10 },
            //  { processor: SearchWebForEvidenceAgent, weight: 15 },
            // { processor: GetEvidenceWebPagesAgent, weight: 15 },
            // { processor: RankWebEvidenceAgent, weight: 10 },
            // { processor: RateWebEvidenceAgent, weight: 10 },
            //  { processor: GetRefinedEvidenceAgent, weight: 10 },
            { processor: PoliciesSheetsExportAgent, weight: 10 },
            // { processor: GetMetaDataForTopWebEvidenceAgent, weight: 10 },
        ];
    }
}
//# sourceMappingURL=policies.js.map