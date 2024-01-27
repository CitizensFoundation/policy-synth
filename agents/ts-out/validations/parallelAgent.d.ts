import { PsBaseValidationAgent } from "./baseValidationAgent.js";
export declare class PsParallelValidationAgent extends PsBaseValidationAgent {
    private agents;
    constructor(name: string, options: PsBaseValidationAgentOptions | undefined, agents: PsBaseValidationAgent[]);
    execute(): Promise<PsValidationAgentResult>;
    private aggregateResults;
}
//# sourceMappingURL=parallelAgent.d.ts.map