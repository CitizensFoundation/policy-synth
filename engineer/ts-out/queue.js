/*******************************************************
 * engineerQueue.ts
 *
 * A new queue class for our Engineer Agent,
 * similar to how the exampleOfUpdateAgentCode uses a queue.
 *******************************************************/
import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { PsEngineerAgent } from "./agent.js"; // (Renamed from old 'agent.js' to 'engineerAgent.ts')
export class PsEngineerAgentQueue extends PolicySynthAgentQueue {
    get agentQueueName() {
        return "ENGINEER_AGENT_QUEUE";
    }
    get processors() {
        return [
            {
                processor: PsEngineerAgent,
                weight: 100,
            },
        ];
    }
    forceMemoryRestart = true;
    async setupMemoryIfNeeded(agentId) {
        const psAgent = await this.getOrCreatePsAgent(agentId);
        this.logger.info(`Setting up memory for agent ${psAgent.id}`);
        let agentMemory = this.agentMemoryMap.get(agentId);
        if (this.forceMemoryRestart || !agentMemory) {
            agentMemory = { agentId: psAgent.id };
            this.agentMemoryMap.set(agentId, agentMemory);
        }
        else {
            this.logger.info(`Memory already set up for agent ${psAgent.id}: ${JSON.stringify(agentMemory)}`);
        }
    }
}
//# sourceMappingURL=queue.js.map