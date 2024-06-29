import { CreateSubProblemsAgent } from "./create/createSubProblems.js";
import { CreateEntitiesAgent } from "./create/createEntities.js";
import { RankEntitiesAgent } from "./ranking/rankEntities.js";
import { RankSubProblemsAgent } from "./ranking/rankSubProblems.js";
import { CreateSubProblemImagesAgent } from "./create/createSubProblemImages.js";
import { CreateProblemStatementImageAgent } from "./create/createProblemStatementImage.js";
import { PolicySynthAgentQueue } from "../../../base/operationsAgentQueue.js";
export class ProblemsAgent extends PolicySynthAgentQueue {
    job;
    get agentQueueName() {
        return PsClassScAgentType.SMARTER_CROWDSOURCING_PROBLEMS_PREPERATION;
    }
    async process() {
        await this.processAllAgents();
        ;
    }
    get processors() {
        return [
            { processor: CreateProblemStatementImageAgent, weight: 10 },
            { processor: CreateSubProblemsAgent, weight: 15 },
            { processor: CreateEntitiesAgent, weight: 10 },
            { processor: RankEntitiesAgent, weight: 10 },
            { processor: RankSubProblemsAgent, weight: 10 },
            { processor: CreateSubProblemImagesAgent, weight: 15 },
            //{ processor: CreateSearchQueriesAgent, weight: 10 },
            //{ processor: RankSearchQueriesAgent, weight: 10 }, // SOLUTIONS
        ];
    }
}
//# sourceMappingURL=problemsAgent.js.map