import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { CreateSeedPoliciesAgent } from "./create/createSeedPolicies.js";
import { CreatePolicyImagesAgent } from "./create/createPolicyImages.js";
import { SearchWebForEvidenceAgent } from "./web/searchWebForEvidence.js";
import { GetEvidenceWebPagesAgent } from "./web/getEvidenceWebPages.js";
import { RankWebEvidenceAgent } from "./ranking/rankWebEvidence.js";
import { RateWebEvidenceAgent } from "./ranking/rateWebEvidence.js";
import { GetRefinedEvidenceAgent } from "./web/getRefinedEvidence.js";
import { GetMetaDataForTopWebEvidenceAgent } from "./web/getMetaDataForTopWebEvidence.js";
import { CreateEvidenceSearchQueriesAgent } from "./create/createEvidenceSearchQueries.js";
import { PsClassScAgentType } from "../base/agentTypes.js";
import { emptySmarterCrowdsourcingMemory } from "../base/emptyMemory.js";
import { PoliciesSheetsExportAgent } from "./export/evidenceSheets.js";

export class PoliciesAgentQueue extends PolicySynthAgentQueue {
  declare memory: PsSmarterCrowdsourcingMemoryData;

  get agentQueueName() {
    return PsClassScAgentType.SMARTER_CROWDSOURCING_POLICIES;
  }

  async setupMemoryIfNeeded() {
    if (!this.memory || !this.memory.subProblems) {
      this.memory = emptySmarterCrowdsourcingMemory(this.agent.group_id, this.agent.id);
      await this.saveMemory();
    }
  }

  async process() {
    await this.processAllAgents();
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