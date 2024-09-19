import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
export declare class PsEngineerProgrammingPlanningAgent extends PsEngineerBaseProgrammingAgent {
    havePrintedDebugPrompt: boolean;
    planSystemPrompt(): string;
    getUserPlanPrompt(reviewLog: string): string;
    reviewSystemPrompt(): string;
    getUserReviewPrompt(codingPlan: string): string;
    actionPlanReviewSystemPrompt(): string;
    getUserActionPlanReviewPrompt(actionPlan: PsEngineerCodingActionPlanItem[]): string;
    getActionPlanSystemPrompt(): string;
    getUserActionPlanPrompt(codingPlan: string, reviewLog: string): string;
    private getCodingPlan;
    getActionPlan(currentErrors?: string | undefined): Promise<PsEngineerCodingActionPlanItem[] | undefined>;
}
//# sourceMappingURL=planningAgent.d.ts.map