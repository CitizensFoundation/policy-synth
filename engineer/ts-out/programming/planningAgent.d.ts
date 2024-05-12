import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
export declare class PsEngineerProgrammingPlanningAgent extends PsEngineerBaseProgrammingAgent {
    havePrintedDebugPrompt: boolean;
    planSystemPrompt(currentErrors: string | undefined): string;
    getUserPlanPrompt(reviewLog: string, currentErrors: string | undefined): string;
    reviewSystemPrompt(currentErrors: string | undefined): string;
    getUserReviewPrompt(codingPlan: string, currentErrors: string | undefined): string;
    actionPlanReviewSystemPrompt(): string;
    getUserActionPlanReviewPrompt(actionPlan: PsEngineerCodingActionPlanItem[]): string;
    getActionPlanSystemPrompt(): string;
    getUserActionPlanPrompt(codingPlan: string, reviewLog: string): string;
    getCodingPlan(currentErrors?: string | undefined): Promise<string | undefined>;
    getActionPlan(currentErrors?: string | undefined): Promise<PsEngineerCodingActionPlanItem[] | undefined>;
}
//# sourceMappingURL=planningAgent.d.ts.map