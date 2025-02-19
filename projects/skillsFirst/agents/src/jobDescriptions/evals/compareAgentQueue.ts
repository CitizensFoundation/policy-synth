// agentQueue.ts

import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { SheetsComparisonAgent } from "./compareSheets.js";

export class JobDescriptionCompareSheetsQueue extends PolicySynthAgentQueue {
  declare memory: JobDescriptionMemoryData;

  get agentQueueName(): string {
    return "JOB_DESCRIPTION_COMPARE_SHEETS";
  }

  get processors() {
    return [
      {
        processor: SheetsComparisonAgent,
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
        `Memory already set up for agent ${psAgent.id}: ` +
          JSON.stringify(agentMemory)
      );
    }
  }
}
