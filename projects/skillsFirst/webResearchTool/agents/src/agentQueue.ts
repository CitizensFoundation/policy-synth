// agentQueue.ts

import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { JobDescriptionAnalysisAgent } from "./jobDescriptionAgent.js";

export class JobDescriptionAnalysisQueue extends PolicySynthAgentQueue {
  declare memory: JobDescriptionMemoryData;

  get agentQueueName(): string {
    return "JOB_DESCRIPTION_ANALYSIS";
  }

  get processors() {
    return [
      {
        processor: JobDescriptionAnalysisAgent,
        weight: 100,
      },
    ];
  }

  forceMemoryRestart = false;

  async setupMemoryIfNeeded(): Promise<void> {
    if (!this.memory || !this.memory.jobDescriptions) {
      this.logger.info(`Setting up memory for agent ${this.agent.id}`);
      this.memory = {
        agentId: this.agent.id,
        jobDescriptions: [],
      } as JobDescriptionMemoryData;
    } else {
      this.logger.info(`Memory already set up for agent ${this.agent.id}`);
    }
  }
}
