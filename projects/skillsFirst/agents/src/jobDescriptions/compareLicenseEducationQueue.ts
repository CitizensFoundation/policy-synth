import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { CompareLicenseEducationAgent } from "./compareLicenseEducationAgent.js";

export class CompareLicenseEducationQueue extends PolicySynthAgentQueue {
  declare memory: LicenseEducationComparisonMemory;

  get agentQueueName(): string {
    return "LICENSE_EDUCATION_COMPARISON";
  }

  get processors() {
    return [
      {
        processor: CompareLicenseEducationAgent,
        weight: 100,
      },
    ];
  }

  forceMemoryRestart = false;

  async setupMemoryIfNeeded(agentId: number) {
    const psAgent = await this.getOrCreatePsAgent(agentId);
    this.logger.info(`Setting up memory for agent ${psAgent.id}`);

    let agentMemory = this.agentMemoryMap.get(agentId);
    if (!agentMemory) {
      agentMemory = { agentId: psAgent.id } as LicenseEducationComparisonMemory;
      this.agentMemoryMap.set(agentId, agentMemory);
    } else {
      this.logger.info(`Memory already set up for agent ${psAgent.id}: `);
    }
  }
}
