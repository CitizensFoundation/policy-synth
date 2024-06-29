import { CreateSubProblemsProcessor } from "./create/createSubProblems.js";
import { CreateEntitiesProcessor } from "./create/createEntities.js";
import { RankEntitiesProcessor } from "./ranking/rankEntities.js";
import { RankSubProblemsProcessor } from "./ranking/rankSubProblems.js";
import { CreateSubProblemImagesProcessor } from "./create/createSubProblemImages.js";
import { CreateProblemStatementImageProcessor } from "./create/createProblemStatementImage.js";
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
            { processor: CreateProblemStatementImageProcessor, weight: 10 },
            { processor: CreateSubProblemsProcessor, weight: 15 },
            { processor: CreateEntitiesProcessor, weight: 10 },
            { processor: RankEntitiesProcessor, weight: 10 },
            { processor: RankSubProblemsProcessor, weight: 10 },
            { processor: CreateSubProblemImagesProcessor, weight: 15 },
            //{ processor: CreateSearchQueriesProcessor, weight: 10 },
            //{ processor: RankSearchQueriesProcessor, weight: 10 }, // SOLUTIONS
        ];
    }
}
//# sourceMappingURL=problemsAgent.js.map