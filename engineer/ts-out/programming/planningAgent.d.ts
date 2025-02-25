import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
export declare class PsEngineerProgrammingPlanningAgent extends PsEngineerBaseProgrammingAgent {
    havePrintedDebugPrompt: boolean;
    planningModelSize: PsAiModelSize;
    get maxThinkingTokens(): number;
    /**
     * System prompt for generating a coding plan (no actual code).
     * Consolidates repeated instructions into global constraints and success criteria.
     */
    planSystemPrompt(): string;
    /**
     * User prompt that provides context for generating the coding plan.
     */
    getUserPlanPrompt(reviewLog: string): string;
    /**
     * System prompt for reviewing the proposed coding plan.
     */
    reviewSystemPrompt(): string;
    /**
     * User prompt providing the plan for the model to review.
     */
    getUserReviewPrompt(codingPlan: string): string;
    /**
     * System prompt for reviewing the action plan.
     */
    actionPlanReviewSystemPrompt(): string;
    /**
     * User prompt for the action plan review step.
     */
    getUserActionPlanReviewPrompt(actionPlan: PsEngineerCodingActionPlanItem[]): string;
    /**
     * System prompt for generating the action plan (JSON array).
     */
    getActionPlanSystemPrompt(): string;
    /**
     * User prompt that triggers creation of an action plan in JSON format
     * following the coding plan that was already approved or generated.
     */
    getUserActionPlanPrompt(codingPlan: string, reviewLog: string): string;
    /**
     * Orchestrates retrieval + review of the coding plan.
     */
    private getCodingPlan;
    /**
     * Orchestrates the retrieval of the action plan (JSON array).
     */
    getActionPlan(currentErrors?: string | undefined): Promise<PsEngineerCodingActionPlanItem[] | undefined>;
}
//# sourceMappingURL=planningAgent.d.ts.map