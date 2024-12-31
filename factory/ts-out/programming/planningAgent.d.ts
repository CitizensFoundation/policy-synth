import { PsAgentFactoryBaseProgrammingAgent } from "./baseAgent.js";
export declare class PsAgentFactoryProgrammingPlanningAgent extends PsAgentFactoryBaseProgrammingAgent {
    havePrintedDebugPrompt: boolean;
    planSystemPrompt(): string;
    getUserPlanPrompt(reviewLog: string): string;
    reviewSystemPrompt(): string;
    getUserReviewPrompt(codingPlan: string): string;
    actionPlanReviewSystemPrompt(): string;
    getUserActionPlanReviewPrompt(actionPlan: PsAgentFactoryCodingActionPlanItem[]): string;
    getActionPlanSystemPrompt(): string;
    getUserActionPlanPrompt(codingPlan: string, reviewLog: string): string;
    private getCodingPlan;
    getActionPlan(currentErrors?: string | undefined): Promise<PsAgentFactoryCodingActionPlanItem[] | undefined>;
}
//# sourceMappingURL=planningAgent.d.ts.map