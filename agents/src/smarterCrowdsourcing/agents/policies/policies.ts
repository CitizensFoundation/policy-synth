import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
import { CreateSeedPoliciesAgent } from "./create/createSeedPolicies.js";
import { CreatePolicyImagesAgent } from "./create/createPolicyImages.js";
import { SearchWebForEvidenceAgent } from "./web/searchWebForEvidence.js";
import { GetEvidenceWebPagesAgent } from "./web/getEvidenceWebPages.js";
import { RankWebEvidenceAgent } from "./ranking/rankWebEvidence.js";
import { RateWebEvidenceAgent } from "./ranking/rateWebEvidence.js";
import { GetRefinedEvidenceAgent } from "./web/getRefinedEvidence.js";
import { GetMetaDataForTopWebEvidenceAgent } from "./web/getMetaDataForTopWebEvidence.js";
import { CreateEvidenceSearchQueriesAgent } from "./create/createEvidenceSearchQueries.js";

export class PoliciesAgent extends PolicySynthAgentQueue {
  declare memory: PsSmarterCrowdsourcingMemoryData;

  get agentQueueName() {
    return PsClassScAgentType.SMARTER_CROWDSOURCING_POLICIES;
  }

  async process() {
    await this.processAllAgents();
  }

  get processors() {
    return [
      { processor: CreateSeedPoliciesAgent, weight: 15 },
      { processor: CreatePolicyImagesAgent, weight: 10 },
      { processor: CreateEvidenceSearchQueriesAgent, weight: 10 },
      { processor: SearchWebForEvidenceAgent, weight: 15 },
      { processor: GetEvidenceWebPagesAgent, weight: 15 },
      { processor: RankWebEvidenceAgent, weight: 10 },
      { processor: RateWebEvidenceAgent, weight: 10 },
      { processor: GetRefinedEvidenceAgent, weight: 10 },
      { processor: GetMetaDataForTopWebEvidenceAgent, weight: 10 },
    ];
  }
}