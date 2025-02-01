/*******************************************************
 * engineerQueue.ts
 *
 * A new queue class for our Engineer Agent,
 * similar to how the exampleOfUpdateAgentCode uses a queue.
 *******************************************************/
import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { PsEngineerAgent } from "./agent.js";
export declare class PsEngineerAgentQueue extends PolicySynthAgentQueue {
    memory: PsEngineerMemoryData;
    get agentQueueName(): string;
    get processors(): {
        processor: typeof PsEngineerAgent;
        weight: number;
    }[];
    forceMemoryRestart: boolean;
    setupMemoryIfNeeded(agentId: number): Promise<void>;
}
//# sourceMappingURL=queue.d.ts.map