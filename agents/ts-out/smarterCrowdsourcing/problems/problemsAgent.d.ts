import { PolicySynthOperationsAgent } from "../../base/baseOperationsAgent.js";
import { Job } from "bullmq";
export declare class ProblemsAgent extends PolicySynthOperationsAgent {
    memory: PsSmarterCrowdsourcingMemoryData;
    job: Job;
    process(): Promise<void>;
    processRootCauses(): Promise<void>;
    processProblemsFlow(): Promise<void>;
    setup(): Promise<void>;
}
//# sourceMappingURL=problemsAgent.d.ts.map