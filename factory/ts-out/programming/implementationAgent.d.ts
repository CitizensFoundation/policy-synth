import { PsAgentFactoryBaseProgrammingAgent } from "./baseAgent.js";
export declare class PsAgentFactoryProgrammingImplementationAgent extends PsAgentFactoryBaseProgrammingAgent {
    havePrintedFirstUserDebugMessage: boolean;
    codingSystemPrompt(currentErrors: string | undefined): string;
    renderTaskContext(fileName: string, currentActions: PsAgentFactoryCodingActionPlanItem[], completedActions: PsAgentFactoryCodingActionPlanItem[], futureActions: PsAgentFactoryCodingActionPlanItem[], currentFileToUpdateContents: string | undefined | null, reviewCount: number, reviewLog: string): string;
    codingUserPrompt(fileName: string, fileAction: PsAgentFactoryFileActions, currentActions: PsAgentFactoryCodingActionPlanItem[], currentFileToUpdateContents: string | undefined | null, completedActions: PsAgentFactoryCodingActionPlanItem[], futureActions: PsAgentFactoryCodingActionPlanItem[], reviewCount: number, reviewLog: string): string;
    reviewSystemPrompt(): string;
    getUserReviewPrompt(codeToReview: string, fileName: string, currentActions: PsAgentFactoryCodingActionPlanItem[], currentFileToUpdateContents: string | undefined | null, completedActions: PsAgentFactoryCodingActionPlanItem[], futureActions: PsAgentFactoryCodingActionPlanItem[], reviewCount: number, reviewLog: string): string;
    implementFileActions(fileName: string, fileAction: PsAgentFactoryFileActions, completedActions: PsAgentFactoryCodingActionPlanItem[], currentActions: PsAgentFactoryCodingActionPlanItem[], futureActions: PsAgentFactoryCodingActionPlanItem[], currentErrors: string | undefined): Promise<string>;
    implementCodingActionPlan(actionPlan: PsAgentFactoryCodingActionPlanItem[], currentErrors: string | undefined): Promise<void>;
    deleteDependency(dependencyName: string): void;
    changeDependency(dependencyName: string, version: string): void;
}
//# sourceMappingURL=implementationAgent.d.ts.map