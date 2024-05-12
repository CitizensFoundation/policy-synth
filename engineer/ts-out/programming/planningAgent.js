import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { IEngineConstants } from "@policysynth/agents/constants.js";
import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
export class PsEngineerProgrammingPlanningAgent extends PsEngineerBaseProgrammingAgent {
    havePrintedDebugPrompt = false;
    planSystemPrompt() {
        return `You are an expert software engineering analyzer.

    Instructions:
    1. Review the provided <Context> and <Task> information.
    2. Consider the overall task title, description, and instructions.
    3. Create a detailed, step-by-step coding plan that specifies the code changes needed to accomplish the task.
    4. Do not include test or documentation tasks, we do that seperatly, focus on the programming changes.
    5. We always create and modify typescript .ts files.

    Expected Output:
    Provide a detailed step-by-step plan in natural language or pseudo-code, explaining the changes to be made, why they are necessary, and how they should be implemented.
    `;
    }
    getUserPlanPrompt(reviewLog) {
        return `${this.renderDefaultTaskAndContext()}

    ${reviewLog
            ? `Take note --> <ReviewOnYourLastAttemptAtCreatingPlan>${reviewLog}</ReviewOnYourLastAttemptAtCreatingPlan>`
            : ``}

    Your coding plan:
    `;
    }
    reviewSystemPrompt() {
        return `You are an expert software engineering analyzer.

    Instructions:
    1. Review the proposed coding plan.
    2. Assess its feasibility, correctness, and completeness.
    3. Provide detailed feedback if you find issues or approve the plan if it meets the criteria with the words "Coding plan looks good".
    4. Plan should not include documentation tasks, that is already done automatically, focus on the programming changes.
    5. We always create and modify typescript .ts files.
    7. If the plan is good only output "Coding plan looks good" or "No changes needed to this code".
    `;
    }
    getUserReviewPrompt(codingPlan) {
        return `${this.renderDefaultTaskAndContext()}

  Proposed coding plan:
  ${codingPlan}

  Please review the coding plan for feasibility, correctness, and completeness. Provide detailed feedback on each step of the plan or confirm its readiness for implementation. Mention specific areas for improvement if any.
    `;
    }
    actionPlanReviewSystemPrompt() {
        return `You are an expert software engineering planner.

    Instructions:
    1. Review the proposed action plan.
    2. Assess its feasibility, correctness, and completeness.
    3. Provide detailed feedback if you find issues or approve the plan if it meets the criteria with the words "Action plan looks good".
    4. Plan should not include documentation tasks, that is already done automatically, focus on the programming changes.
    5. If the plan is good only output "Action plan looks good".
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
    4. If you are adding a new file always output "add" in the fileAction field if you are changing an existing file output "change" and if you are deleting a file output "delete" in the fileAction JSON field.

    Expected JSON Array Output:
    [
      {
        fullPathToNewOrUpdatedFile: string;
        codingTaskTitle: string;
        codingTaskFullDescription: string;
        fileAction: "add" | "change" | "delete";
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

      Your action plan in JSON array:
    `;
    }
    async getCodingPlan() {
        let planReady = false;
        let planRetries = 0;
        let reviewLog = "";
        let codingPlan;
        while (!planReady && planRetries < this.maxRetries) {
            console.log(`Getting coding plan attempt ${planRetries + 1}`);
            if (!this.havePrintedDebugPrompt) {
                console.log(`PLANNING PROMPT: ${this.getUserPlanPrompt(reviewLog)}`);
                this.havePrintedDebugPrompt = true;
            }
            codingPlan = await this.callLLM("engineering-agent", IEngineConstants.engineerModel, [
                new SystemMessage(this.planSystemPrompt()),
                new HumanMessage(this.getUserPlanPrompt(reviewLog)),
            ], false);
            if (codingPlan) {
                console.log(`Coding plan received: ${codingPlan}`);
                const review = await this.callLLM("engineering-agent", IEngineConstants.engineerModel, [
                    new SystemMessage(this.reviewSystemPrompt()),
                    new HumanMessage(this.getUserReviewPrompt(codingPlan)),
                ], false);
                console.log(`\n\nReview received: ${review}\n\n`);
                if ((review && review.indexOf("Coding plan looks good") > -1) ||
                    review.indexOf("No changes needed to this code") > -1) {
                    planReady = true;
                    console.log("Coding plan approved");
                }
                else {
                    reviewLog = review + `\n`;
                    planRetries++;
                }
            }
            else {
                console.error("No plan received");
                planRetries++;
            }
        }
        return codingPlan;
    }
    async getActionPlan() {
        let planReady = false;
        let planRetries = 0;
        let reviewLog = "";
        let actionPlan;
        const codingPlan = await this.getCodingPlan();
        if (codingPlan) {
            while (!planReady && planRetries < this.maxRetries) {
                console.log(`Getting action plan attempt ${planRetries + 1}`);
                actionPlan = await this.callLLM("engineering-agent", IEngineConstants.engineerModel, [
                    new SystemMessage(this.getActionPlanSystemPrompt()),
                    new HumanMessage(this.getUserActionPlanPrompt(codingPlan, reviewLog)),
                ], true);
                if (actionPlan) {
                    console.log(`Action plan received: ${JSON.stringify(actionPlan, null, 2)}`);
                    const review = await this.callLLM("engineering-agent", IEngineConstants.engineerModel, [
                        new SystemMessage(this.actionPlanReviewSystemPrompt()),
                        new HumanMessage(this.getUserActionPlanReviewPrompt(actionPlan)),
                    ], false);
                    console.log(`\n\Coding Action Plan Review received: ${review}\n\n`);
                    if (review && review.indexOf("Action plan looks good") > -1) {
                        planReady = true;
                        console.log("Action plan approved");
                    }
                    else {
                        reviewLog = review + `\n`;
                        planRetries++;
                    }
                }
                else {
                    console.error("No action plan received");
                    planRetries++;
                }
            }
            actionPlan?.forEach((action) => {
                action.status = "notStarted";
            });
            return actionPlan;
        }
        else {
            console.error("No coding plan received");
            return;
        }
    }
}
//# sourceMappingURL=planningAgent.js.map