import { PolicySynthSimpleAgentBase } from "../base/simpleAgent.js";
export declare class PsBaseValidationAgent extends PolicySynthSimpleAgentBase {
    name: string;
    options: PsBaseValidationAgentOptions;
    maxModelTokensOut: number;
    modelTemperature: number;
    constructor(name: string, options?: PsBaseValidationAgentOptions);
    set nextAgent(agent: PsValidationAgent);
    protected renderPrompt(): Promise<PsModelMessage[]>;
    runValidationLLM(): Promise<PsValidationAgentResult>;
    execute(): Promise<PsValidationAgentResult>;
    protected beforeExecute(): Promise<void>;
    protected performExecute(): Promise<PsValidationAgentResult>;
    protected afterExecute(result: PsValidationAgentResult): Promise<void>;
}
//# sourceMappingURL=baseValidationAgent.d.ts.map