import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
export declare class PsEngineerProgrammingImplementationAgent extends PsEngineerBaseProgrammingAgent {
    havePrintedFirstUserDebugMessage: boolean;
    get codingSystemPrompt(): string;
    renderTaskContext(fileName: string, currentActions: PsEngineerCodingActionPlanItem[], completedActions: PsEngineerCodingActionPlanItem[], futureActions: PsEngineerCodingActionPlanItem[], currentFileToUpdateContents: string | undefined | null, reviewCount: number, reviewLog: string): string;
    codingUserPrompt(fileName: string, fileAction: PsEngineerFileActions, currentActions: PsEngineerCodingActionPlanItem[], currentFileToUpdateContents: string | undefined | null, completedActions: PsEngineerCodingActionPlanItem[], futureActions: PsEngineerCodingActionPlanItem[], reviewCount: number, reviewLog: string): string;
    reviewSystemPrompt(): string;
    getUserReviewPrompt(codeToReview: string, fileName: string, currentActions: PsEngineerCodingActionPlanItem[], currentFileToUpdateContents: string | undefined | null, completedActions: PsEngineerCodingActionPlanItem[], futureActions: PsEngineerCodingActionPlanItem[], reviewCount: number, reviewLog: string): string;
    implementFileActions(fileName: string, fileAction: PsEngineerFileActions, completedActions: PsEngineerCodingActionPlanItem[], currentActions: PsEngineerCodingActionPlanItem[], futureActions: PsEngineerCodingActionPlanItem[]): Promise<string>;
    implementCodingActionPlan(actionPlan: PsEngineerCodingActionPlanItem[]): Promise<void>;
    deleteDependency(dependencyName: string): void;
    changeDependency(dependencyName: string, version: string): void;
}
//# sourceMappingURL=implementationAgent.d.ts.map