  // agentQueue.ts

import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { JobDescriptionRewriterAgent } from "./rewriterAgent.js";

export class JobDescriptionRewriterQueue extends PolicySynthAgentQueue {
  declare memory: JobDescriptionMemoryData;

  get agentQueueName(): string {
    return "JOB_DESCRIPTION_REWRITING";
  }

  get processors() {
    return [
      {
        processor: JobDescriptionRewriterAgent,
        weight: 100,
      }
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
