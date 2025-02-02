import { PsAiModelType, PsAiModelSize, } from "@policysynth/agents/aiModelTypes.js";
import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
export class PsEngineerProgrammingPlanningAgent extends PsEngineerBaseProgrammingAgent {
    havePrintedDebugPrompt = false;
    planSystemPrompt() {
        return `You are an expert software engineering analyzer.

    <ImportantInstructions>
    1. Review the provided <Context> and <Task> information.
    2. Consider the overall task title, description, and instructions.
    3. Create a detailed, step-by-step explaination of a coding plan that specifies the code changes needed in text to accomplish the overall task.
    4. Do not write code in the plan rather focus on the programming strategy, a high-level plan for the changes needed for each file.
    5. Do not include test or documentation tasks, we do that seperatly, focus on the programming changes.
    6. We always create or modify typescript .ts files no other file types.
    7. Prefer classes rather than exported functions in files.
    8. Never suggesting importing typedefs those are always automatically imported from the d.ts files
    ${this.currentErrors
            ? `9. You have already built the project, but it's not compiling due to errors from recent changes. The coding plan should focus on fixing those errors in the files you've been changing.
           10. Do not attempt to refactor or fix unrelated files; keep the plan focused on the known errors.`
            : ``}</ImportantInstructions>
    `;
    }
    getUserPlanPrompt(reviewLog) {
        return `${this.renderDefaultTaskAndContext()}

    ${this.renderCurrentErrorsAndOriginalFiles()}

    ${reviewLog
            ? `Take note --> <ReviewOnYourLastAttemptAtCreatingPlan>${reviewLog}</ReviewOnYourLastAttemptAtCreatingPlan>`
            : ``}

    ${this.renderCodingRules()}

    Do not output actual code just a detailed plan of the changes needed to the code.

    Let's think step by step.

    Your coding plan:
    `;
    }
    reviewSystemPrompt() {
        return `You are an expert software engineering analyzer.

    Instructions:
    1. Review the proposed coding plan.
    2. Assess its feasibility, correctness, and completeness.
    3. Provide feedback if you find critical issues or approve the plan if it meets the criteria with the words "Coding plan looks good".
    4. Never create any documentation tasks for the code, that is already done automatically through a seperate process.
    5. We always create and modify typescript .ts files.
    6. There should not be much actual code rather a high-level plan for the changes needed for each file and each task.
    7. The coding plan does not have to include every detail, the goal is to provide a high-level plan for the changes needed for each file and each task.
    8. The plan should not suggest importing typedefs from files those are always automatically imported from the d.ts files
    ${this.currentErrors
            ? `9. You have already built the project, but it's not compiling due to errors from recent changes. Focus the plan on only those files with errors.
           10. Don't fix or change anything else if not required.`
            : ``}
    Important: If the plan is good only output "Coding plan looks good" or "No changes needed to this code".
    `;
    }
    getUserReviewPrompt(codingPlan) {
        return `${this.renderDefaultTaskAndContext()}

    ${this.renderCurrentErrorsAndOriginalFiles()}

  Proposed coding plan:
  ${codingPlan}

  Your text based review:
    `;
    }
    actionPlanReviewSystemPrompt() {
        return `You are an expert software engineering planner.

    Instructions:
    1. Review the proposed action plan.
    2. Assess its feasibility, correctness, and completeness.
    3. Provide detailed feedback if you find issues or approve the plan if it meets the criteria with the words "Action plan looks good".
    4. Plan should not include any code documentation tasks, that is already done automatically, focus on the programming changes.
    5. For new files you are adding or have created, output "add" in the fileAction field.
    6. For files you are changing there should be "change" in the fileAction JSON field.
    7. If you are deleting a file there should be "delete" in the fileAction JSON field.
    ${this.currentErrors
            ? `8.  You have already built the project, but it's not compiling due to recent changes. Focus the plan on fixing the known errors.`
            : ``}
    Important: If the action plan is good, with no major issues, only output "Action plan looks good", nothing else.
    `;
    }
    getUserActionPlanReviewPrompt(actionPlan) {
        return `${this.renderDefaultTaskAndContext()}

    Proposed coding action plan:
    ${JSON.stringify(actionPlan, null, 2)}

    Your text based review:
    `;
    }
    getActionPlanSystemPrompt() {
        return `You are an expert software engineering planner that specialises in creating coding action plans.

    Instructions:
    1. Review the provided <Context> and <Task> information.
    2. Review the coding plan and create a detailed coding action plan in JSON for implementing the changes.
    3. We always create and modify typescript .ts files no .js files in the plan.
    4. For new files you are adding or have created, output "add" in the fileAction field.
    5. For files you are changing output "change" in the fileAction JSON field.
    6. If you are deleting a file output "delete" in the fileAction JSON field.
    7. Put a full detailed description from the coding plan in the codingTaskFullDescription field.
    ${this.currentErrors
            ? `8.  Since you already tried building and have errors, for files you recently created, maintain "add" action only if truly new. If it's an existing file, use "change".`
            : ``}
    Expected JSON Array Output:
    [
      {
        "fullPathToNewOrUpdatedFile": string,
        "codingTaskTitle": string,
        "codingTaskStepsWithDetailedDescription": string[],
        "fileAction": "add" | "change" | "delete"
      }
    ]
    `;
    }
    getUserActionPlanPrompt(codingPlan, reviewLog) {
        return `${this.renderDefaultTaskAndContext()}

      ${reviewLog
            ? `Take note --> <ReviewOnYourLastAttemptAtCreatingCodingActionPlan>${reviewLog}</ReviewOnYourLastAttemptAtCreatingCodingActionPlan>`
            : ``}

      Coding plan to use for your Coding Action Plan:
      ${codingPlan}

      Let's think step by step.

      Your action plan in JSON array:
    `;
    }
    /**
     * Orchestrates the retrieval + review of the coding plan.
     */
    async getCodingPlan() {
        let planReady = false;
        let planRetries = 0;
        let reviewRetries = 0;
        const maxReviewsRetries = 10;
        let reviewLog = "";
        let codingPlan;
        while (!planReady && planRetries < this.maxRetries) {
            console.log(`Getting coding plan attempt ${planRetries + 1}`);
            if (!this.havePrintedDebugPrompt) {
                console.log(`PLANNING PROMPT: ${this.getUserPlanPrompt(reviewLog)}`);
                this.havePrintedDebugPrompt = true;
            }
            // -- Call the model with the new approach
            const planResponse = await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Medium, [
                this.createSystemMessage(this.planSystemPrompt()),
                this.createHumanMessage(this.getUserPlanPrompt(reviewLog)),
            ], false // not streaming
            );
            // Convert the plan response into a string if needed
            if (planResponse) {
                if (typeof planResponse === "string") {
                    codingPlan = planResponse;
                }
                else {
                    // If it came back as JSON, convert to string
                    codingPlan = JSON.stringify(planResponse, null, 2);
                }
            }
            if (codingPlan) {
                console.log(`Coding plan received:\n${codingPlan}`);
                // Now we review the coding plan
                if (reviewRetries < maxReviewsRetries) {
                    const reviewResponse = await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Medium, [
                        this.createSystemMessage(this.reviewSystemPrompt()),
                        this.createHumanMessage(this.getUserReviewPrompt(codingPlan)),
                    ], false // not streaming
                    );
                    let review = "";
                    if (reviewResponse) {
                        if (typeof reviewResponse === "string") {
                            review = reviewResponse;
                        }
                        else {
                            review = JSON.stringify(reviewResponse, null, 2);
                        }
                    }
                    console.log(`\n\nReview received: ${review}\n\n`);
                    if (review.includes("Coding plan looks good") ||
                        review.includes("No changes needed to this code")) {
                        planReady = true;
                        console.log("Coding plan approved");
                    }
                    else {
                        reviewLog = review + `\n`;
                        planRetries++;
                        reviewRetries++;
                    }
                }
                else {
                    console.warn("Max review retries reached, continuing without review");
                    planReady = true;
                }
            }
            else {
                console.error("No plan received");
                planRetries++;
            }
        }
        return codingPlan;
    }
    /**
     * Orchestrates the retrieval of the action plan (JSON array).
     */
    async getActionPlan(currentErrors = undefined) {
        let planReady = false;
        let planRetries = 0;
        let reviewLog = "";
        let actionPlan;
        this.setCurrentErrors(currentErrors);
        const codingPlan = await this.getCodingPlan();
        if (!codingPlan) {
            console.error("No coding plan received; cannot produce action plan.");
            return;
        }
        while (!planReady && planRetries < this.maxRetries) {
            console.log(`Getting action plan attempt ${planRetries + 1}`);
            const actionPlanResponse = await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Small, [
                this.createSystemMessage(this.getActionPlanSystemPrompt()),
                this.createHumanMessage(this.getUserActionPlanPrompt(codingPlan, reviewLog)),
            ], false // can be true if you prefer streaming
            );
            // Parse the action plan response into PsEngineerCodingActionPlanItem[]
            if (actionPlanResponse) {
                let planStr = "";
                if (typeof actionPlanResponse === "string") {
                    planStr = actionPlanResponse;
                }
                else {
                    planStr = JSON.stringify(actionPlanResponse, null, 2);
                }
                try {
                    actionPlan = JSON.parse(planStr);
                }
                catch (err) {
                    console.error("Error parsing action plan JSON:", err);
                }
                if (actionPlan) {
                    console.log(`Action plan received: ${JSON.stringify(actionPlan, null, 2)}`);
                    // Review the action plan
                    const actionPlanReviewResponse = await this.callModel(PsAiModelType.TextReasoning, PsAiModelSize.Small, [
                        this.createSystemMessage(this.actionPlanReviewSystemPrompt()),
                        this.createHumanMessage(this.getUserActionPlanReviewPrompt(actionPlan)),
                    ], false);
                    let review = "";
                    if (actionPlanReviewResponse) {
                        if (typeof actionPlanReviewResponse === "string") {
                            review = actionPlanReviewResponse;
                        }
                        else {
                            review = JSON.stringify(actionPlanReviewResponse, null, 2);
                        }
                    }
                    console.log(`\n\nCoding Action Plan Review received: ${review}\n\n`);
                    if (review.includes("Action plan looks good")) {
                        planReady = true;
                        console.log("Action plan approved");
                    }
                    else {
                        reviewLog = review + `\n`;
                        planRetries++;
                    }
                }
                else {
                    planRetries++;
                }
            }
            else {
                console.error("No action plan received");
                planRetries++;
            }
        }
        // If we got a final actionPlan, mark them as notStarted
        actionPlan?.forEach((action) => {
            action.status = "notStarted";
        });
        // Mark newly added files in memory
        actionPlan?.forEach((action) => {
            if (action.fileAction === "add") {
                if (!this.memory.currentFilesBeingAdded) {
                    this.memory.currentFilesBeingAdded = [];
                }
                this.memory.currentFilesBeingAdded.push(this.removeWorkspacePathFromFileIfNeeded(action.fullPathToNewOrUpdatedFile));
            }
        });
        // If we are changing a file that we previously had as "add", revert to "add"
        actionPlan?.forEach((action) => {
            const shortPath = this.removeWorkspacePathFromFileIfNeeded(action.fullPathToNewOrUpdatedFile);
            if (action.fileAction === "change") {
                if (this.memory.currentFilesBeingAdded?.includes(shortPath)) {
                    action.fileAction = "add";
                    console.log(`Changing action back to add: ${shortPath}`);
                }
            }
        });
        return actionPlan;
    }
}
//# sourceMappingURL=planningAgent.js.map