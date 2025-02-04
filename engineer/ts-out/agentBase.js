import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
export class PsEngineerAgentBase extends PolicySynthAgent {
    currentStartTime;
    startTiming() {
        this.currentStartTime = new Date();
    }
    async addTimingResult(agentName) {
        const timeEnd = new Date();
        const timeTakenInSeconds = (timeEnd.getTime() - this.currentStartTime.getTime()) / 1000;
        this.memory.timingResults.push({
            agentName,
            totalTimeInSeconds: timeTakenInSeconds,
        });
        await this.saveMemory();
    }
}
//# sourceMappingURL=agentBase.js.map