import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { EducationRequirementsBarrierDeepResearchAgent } from "./educationRequirementsBarrierDeepResearchAgent.js";

export class EducationRequirementsDeepResearchQueue extends PolicySynthAgentQueue {
  declare memory: JobDescriptionMemoryData;

  get agentQueueName(): string {
    return "EDUCATION_REQUIREMENTS_DEEP_RESEARCH";
  }

  get processors() {
    return [
      {
        processor: EducationRequirementsBarrierDeepResearchAgent,
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
      agentMemory = { agentId: psAgent.id };
      this.agentMemoryMap.set(agentId, agentMemory);
    } else {
      this.logger.info(
        `Memory already set up for agent ${psAgent.id}: `
      );
    }
  }
}
