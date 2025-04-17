// agentQueue.ts
import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { JobTitleLicenseDegreeAnalysisAgent } from "./licenceAnalysisAgent.js";
export class JobTitleLicenseDegreeAnalysisQueue extends PolicySynthAgentQueue {
    get agentQueueName() {
        return "JOB_TITLE_LICENSE_DEGREE_ANALYSIS";
    }
    get processors() {
        return [
            {
                processor: JobTitleLicenseDegreeAnalysisAgent,
                weight: 100,
            }
        ];
    }
    forceMemoryRestart = false;
    async setupMemoryIfNeeded(agentId) {
        const psAgent = await this.getOrCreatePsAgent(agentId);
        this.logger.info(`Setting up memory for agent ${psAgent.id}`);
        let agentMemory = this.agentMemoryMap.get(agentId);
        if (!agentMemory) {
            agentMemory = { agentId: psAgent.id };
            this.agentMemoryMap.set(agentId, agentMemory);
        }
        else {
            this.logger.info(`Memory already set up for agent ${psAgent.id}: `);
        }
    }
}
//# sourceMappingURL=licenceAnalysisQueue.js.map