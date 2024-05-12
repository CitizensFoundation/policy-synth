import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
export declare class PsEngineerProgrammingImplementationAgent extends PsEngineerBaseProgrammingAgent {
    actionPlan: PsEngineerCodingActionPlanItem[];
    havePrintedFirstUserDebugMessage: boolean;
    get codingSystemPrompt(): string;
    codingUserPrompt(action: PsEngineerCodingActionPlanItem, curentFileToUpdateContents: string | undefined): string;
    implementAction(action: PsEngineerCodingActionPlanItem): Promise<string>;
    sortActionPlan(actionPlan: PsEngineerCodingActionPlanItem[]): void;
    implementCodingActionPlan(actionPlan: PsEngineerCodingActionPlanItem[]): Promise<void>;
    deleteDependency(dependencyName: string): void;
    changeDependency(dependencyName: string, version: string): void;
}
//# sourceMappingURL=implementationAgent.d.ts.map