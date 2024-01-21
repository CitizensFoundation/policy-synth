import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Base } from "../../base.js";
export declare class PsBaseValidationAgent extends Base {
    name: string;
    options: PsBaseValidationAgentOptions;
    constructor(name: string, options?: PsBaseValidationAgentOptions);
    set nextAgent(agent: PsValidationAgent);
    protected renderPrompt(): Promise<(HumanMessage | SystemMessage)[]>;
    runValidationLLM(): Promise<PsValidationAgentResult>;
    execute(): Promise<PsValidationAgentResult>;
    protected beforeExecute(): Promise<void>;
    protected performExecute(): Promise<PsValidationAgentResult>;
    protected afterExecute(result: PsValidationAgentResult): Promise<void>;
}
//# sourceMappingURL=baseValidationAgent.d.ts.map