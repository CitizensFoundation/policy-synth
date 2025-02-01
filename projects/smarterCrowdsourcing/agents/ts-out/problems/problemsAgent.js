import { CreateSubProblemsAgent } from "./create/createSubProblems.js";
import { CreateEntitiesAgent } from "./create/createEntities.js";
import { RankEntitiesAgent } from "./ranking/rankEntities.js";
import { RankSubProblemsAgent } from "./ranking/rankSubProblems.js";
import { CreateSubProblemImagesAgent } from "./create/createSubProblemImages.js";
import { CreateProblemStatementImageAgent } from "./create/createProblemStatementImage.js";
import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { PsClassScAgentType } from "../base/agentTypes.js";
import { emptySmarterCrowdsourcingMemory } from "../base/emptyMemory.js";
export class ProblemsAgentQueue extends PolicySynthAgentQueue {
    get agentQueueName() {
        return PsClassScAgentType.SMARTER_CROWDSOURCING_PROBLEMS_PREPERATION;
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
            { processor: CreateProblemStatementImageAgent, weight: 10 },
            { processor: CreateSubProblemsAgent, weight: 10 },
            { processor: CreateEntitiesAgent, weight: 5 },
            { processor: RankEntitiesAgent, weight: 5 },
            { processor: RankSubProblemsAgent, weight: 50 },
            { processor: CreateSubProblemImagesAgent, weight: 20 }
        ];
    }
}
//# sourceMappingURL=problemsAgent.js.map