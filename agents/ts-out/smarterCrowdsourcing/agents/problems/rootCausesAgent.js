import { CreateRootCausesSearchQueriesAgent } from "./create/createRootCauseSearchQueries.js";
import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
import { PsClassScAgentType } from "../base/agentTypes.js";
import { emptySmarterCrowdsourcingMemory } from "../base/emptyMemory.js";
export class RootCausesAgentQueue extends PolicySynthAgentQueue {
    async process() {
        await this.processAllAgents();
        ;
    }
    get agentQueueName() {
        return PsClassScAgentType.SMARTER_CROWDSOURCING_ROOT_CAUSES;
    }
    async setupMemoryIfNeeded() {
        if (!this.memory || !this.memory.subProblems) {
            this.memory = emptySmarterCrowdsourcingMemory(this.agent.group_id, this.agent.id);
            await this.saveMemory();
        }
    }
    get processors() {
        return [
            { processor: CreateRootCausesSearchQueriesAgent, weight: 10 },
            /* { processor: RankRootCausesSearchQueriesAgent, weight: 10 },
             { processor: SearchWebForRootCausesAgent, weight: 10 },
             { processor: RankRootCausesSearchResultsAgent, weight: 30 },
             { processor: GetRootCausesWebPagesAgent, weight: 40 },*/
        ];
    }
}
//# sourceMappingURL=rootCausesAgent.js.map