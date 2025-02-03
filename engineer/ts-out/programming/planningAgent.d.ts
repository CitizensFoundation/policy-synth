import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
export declare class PsEngineerProgrammingPlanningAgent extends PsEngineerBaseProgrammingAgent {
    havePrintedDebugPrompt: boolean;
    planningModelSize: PsAiModelSize;
    planSystemPrompt(): string;
    getUserPlanPrompt(reviewLog: string): string;
    reviewSystemPrompt(): string;
    getUserReviewPrompt(codingPlan: string): string;
    actionPlanReviewSystemPrompt(): string;
    getUserActionPlanReviewPrompt(actionPlan: PsEngineerCodingActionPlanItem[]): string;
    getActionPlanSystemPrompt(): string;
    getUserActionPlanPrompt(codingPlan: string, reviewLog: string): string;
    /**
     * Orchestrates the retrieval + review of the coding plan.
     */
    private getCodingPlan;
    /**
     * Orchestrates the retrieval of the action plan (JSON array).
     */
    getActionPlan(currentErrors?: string | undefined): Promise<PsEngineerCodingActionPlanItem[] | undefined>;
}
//# sourceMappingURL=planningAgent.d.ts.map