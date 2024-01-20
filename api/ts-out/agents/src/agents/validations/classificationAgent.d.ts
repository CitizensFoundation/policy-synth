import { PsBaseValidationAgent } from "./baseValidationAgent.js";
export declare class PsClassificationAgent extends PsBaseValidationAgent {
    private routes;
    constructor(name: string, options?: PsBaseValidationAgentOptions);
    addRoute(classification: string, agent: PsValidationAgent): void;
    protected performExecute(): Promise<PsValidationAgentResult>;
    protected afterExecute(result: PsValidationAgentResult): Promise<void>;
}
//# sourceMappingURL=classificationAgent.d.ts.map