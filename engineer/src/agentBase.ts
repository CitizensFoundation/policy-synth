import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";

export abstract class PsEngineerAgentBase extends PolicySynthAgent {
  declare memory: PsEngineerMemoryData;

  currentStartTime: Date | undefined;

  startTiming() {
    this.currentStartTime = new Date();
  }

  async addTimingResult(agentName: string) {
    const timeEnd = new Date();
    const timeTakenInSeconds = (timeEnd.getTime() - this.currentStartTime!.getTime()) / 1000;

    this.memory.timingResults.push({
      agentName,
      totalTimeInSeconds: timeTakenInSeconds,
    });

    await this.saveMemory();
  }
}
